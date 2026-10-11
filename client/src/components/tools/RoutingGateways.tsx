import { useState } from "react";
import { ipToString, maskFromPrefix, networkOf, parseCidr, parseIp, sameSubnet } from "../../netMath";
import { LessonLink, Quiz, Terminal, type QuizItem } from "./netSecShared";

// A host deciding "local or via the gateway?", then a router picking a route by longest
// prefix match. Everything is computed from the addresses, so edited values behave for real.

interface Route {
  dest: string; // CIDR
  via: string | null; // next hop, null = directly connected
  dev: string;
  note: string;
}

const ROUTER_TABLE: Route[] = [
  { dest: "192.168.10.0/24", via: null, dev: "eth0", note: "office LAN, directly connected" },
  { dest: "192.168.20.0/24", via: null, dev: "eth1", note: "production LAN, directly connected" },
  { dest: "10.50.0.0/16", via: "10.0.0.1", dev: "eth2", note: "plant 2, over the site-to-site VPN" },
  { dest: "10.50.8.0/24", via: "192.168.20.254", dev: "eth1", note: "test lab behind a lab router" },
  { dest: "0.0.0.0/0", via: "10.0.0.1", dev: "eth2", note: "default route: everything else to the firewall" },
];

interface Preset {
  id: string;
  label: string;
  dest: string;
  prefix?: number;
  gateway?: string;
}

const PRESETS: Preset[] = [
  { id: "local", label: "Printer on the same LAN", dest: "192.168.10.80" },
  { id: "vlan", label: "HMI on the production LAN", dest: "192.168.20.40" },
  { id: "plant2", label: "Server at plant 2", dest: "10.50.3.7" },
  { id: "lab", label: "Lab PC (longest prefix wins)", dest: "10.50.8.9" },
  { id: "internet", label: "A public DNS server", dest: "8.8.8.8" },
  { id: "mask", label: "PC with a /16 mask by mistake", dest: "192.168.20.40", prefix: 16 },
  { id: "nogw", label: "PC with no gateway set", dest: "8.8.8.8", gateway: "" },
  { id: "badgw", label: "Gateway typed wrong", dest: "8.8.8.8", gateway: "192.168.1.1" },
];

const PC_IP = "192.168.10.25";

type Step = { title: string; detail: string; ok: boolean | null };

function trace(dest: string, prefix: number, gateway: string): Step[] {
  const steps: Step[] = [];
  const pc = parseIp(PC_IP)!;
  const d = parseIp(dest);
  if (d === null) return [{ title: "Destination", detail: "Not a valid IPv4 address.", ok: false }];
  const local = sameSubnet(pc, d, prefix);
  const mask = ipToString(maskFromPrefix(prefix));
  steps.push({
    title: "1. The PC compares networks",
    detail: `Its own address ${PC_IP} AND mask ${mask} = ${ipToString(networkOf(pc, prefix))}. The destination ${dest} AND ${mask} = ${ipToString(
      networkOf(d, prefix),
    )}. ${local ? "Same network: deliver directly." : "Different network: send it to the default gateway."}`,
    ok: null,
  });
  if (local) {
    const reallyLocal = sameSubnet(pc, d, 24);
    steps.push({
      title: "2. ARP for the destination itself",
      detail: reallyLocal
        ? `The PC broadcasts "who has ${dest}?" on the LAN. The device answers with its MAC address and the packet goes straight to it through the switch. No router involved.`
        : `The PC broadcasts "who has ${dest}?", but ${dest} is really on another LAN behind the router, so nobody on this segment answers. The ARP request times out and the connection fails, even though the network is fine. A wrong mask makes remote hosts look local.`,
      ok: reallyLocal,
    });
    return steps;
  }
  if (gateway.trim() === "") {
    steps.push({
      title: "2. Look for a default gateway",
      detail: "There isn't one. With no route for this destination the PC gives up at once. Linux ping prints \"connect: Network is unreachable\"; Windows ping usually reports \"transmit failed. General failure.\" Local devices still work, which is the clue.",
      ok: false,
    });
    return steps;
  }
  const gw = parseIp(gateway);
  if (gw === null || !sameSubnet(pc, gw, prefix)) {
    steps.push({
      title: "2. ARP for the gateway",
      detail: `The gateway ${gateway} isn't on the PC's own subnet, so the PC can't reach it with ARP. A gateway must always be an address on your local network; this is usually a typo or a PC moved between networks with a static address.`,
      ok: false,
    });
    return steps;
  }
  if (gateway.trim() !== "192.168.10.1") {
    steps.push({
      title: "2. ARP for the gateway",
      detail: `Nothing answers at ${gateway}: the router is 192.168.10.1. Traffic off the LAN goes nowhere.`,
      ok: false,
    });
    return steps;
  }
  steps.push({
    title: "2. ARP for the gateway, not the destination",
    detail: `The PC learns the router's MAC for 192.168.10.1 and sends the frame to that MAC. The IP packet inside still says destination ${dest}: the gateway is only the next hop.`,
    ok: true,
  });
  const matches = ROUTER_TABLE.map((r) => ({ r, c: parseCidr(r.dest)! })).filter((x) => sameSubnet(d, x.c.ip, x.c.prefix));
  const best = matches.sort((a, b) => b.c.prefix - a.c.prefix)[0];
  steps.push({
    title: "3. The router looks up the destination",
    detail: `${matches.length} route${matches.length === 1 ? "" : "s"} match ${dest}: ${matches
      .map((m) => m.r.dest)
      .join(", ")}. The most specific (longest prefix) wins: ${best.r.dest}, ${best.r.note}.`,
    ok: true,
  });
  steps.push({
    title: "4. Forward one hop",
    detail: best.r.via
      ? `The router lowers the packet's TTL by one and sends it out ${best.r.dev} to the next hop ${best.r.via}, which repeats the same lookup with its own table.`
      : `The destination is on a directly connected network (${best.r.dev}), so the router ARPs for ${dest} there and delivers it.`,
    ok: true,
  });
  return steps;
}

const QUIZ: QuizItem[] = [
  {
    q: "A PC is 10.1.4.20/24 with gateway 10.1.4.1. It sends a packet to 10.1.5.9. Which MAC address goes in the Ethernet frame?",
    options: ["10.1.5.9's MAC", "The gateway's MAC", "The broadcast MAC ff:ff:ff:ff:ff:ff"],
    answer: 1,
    why: "10.1.5.9 is on a different /24, so the frame goes to the gateway's MAC. The IP header still carries 10.1.5.9 as the destination; MAC addresses change at every hop, IP addresses don't (unless NAT rewrites them).",
  },
  {
    q: "A router has routes for 10.0.0.0/8, 10.20.0.0/16 and 10.20.30.0/24. Where does a packet for 10.20.30.40 go?",
    options: ["10.0.0.0/8", "10.20.0.0/16", "10.20.30.0/24", "The default route"],
    answer: 2,
    why: "All three match, and the router always picks the longest prefix (the most specific route). Order in the table doesn't matter.",
  },
  {
    q: "Users can open file shares on their own LAN but nothing on the internet or other sites. Ping to the gateway fails. Most likely cause?",
    options: ["DNS is down", "The default gateway (router interface) is down or misconfigured", "The PC's network cable is unplugged"],
    answer: 1,
    why: "Local traffic never touches the gateway, so it keeps working. Everything off the LAN needs the gateway. An unplugged cable would break the local shares too, and DNS problems wouldn't stop a ping to the gateway's IP.",
  },
  {
    q: "What does the route 0.0.0.0/0 match?",
    options: ["Nothing; it's a placeholder", "Only 0.0.0.0", "Every IPv4 address"],
    answer: 2,
    why: "A /0 has no network bits, so every address matches. As the shortest possible prefix it only wins when nothing more specific does: that's the default route.",
  },
  {
    q: "Every router along a path decrements a packet's TTL by one. Why?",
    options: ["To measure latency", "So a packet caught in a routing loop dies instead of circling forever", "To encrypt the header"],
    answer: 1,
    why: "When TTL reaches 0 the router drops the packet and sends an ICMP \"time exceeded\" back. traceroute uses exactly that: TTL 1, 2, 3 and so on, and each router that answers reveals itself.",
  },
];

export function RoutingGateways() {
  const [presetId, setPresetId] = useState("plant2");
  const [dest, setDest] = useState("10.50.3.7");
  const [prefix, setPrefix] = useState(24);
  const [gateway, setGateway] = useState("192.168.10.1");
  const steps = trace(dest, prefix, gateway);
  const d = parseIp(dest);

  function choose(p: Preset) {
    setPresetId(p.id);
    setDest(p.dest);
    setPrefix(p.prefix ?? 24);
    setGateway(p.gateway ?? "192.168.10.1");
  }

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>Send a packet from the office PC</h3>
        <div className="sql-presets">
          {PRESETS.map((p) => (
            <button key={p.id} className={p.id === presetId ? "active" : ""} onClick={() => choose(p)}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="tool-inputs">
          <label>
            PC address
            <input type="text" value={`${PC_IP}/${prefix}`} readOnly aria-readonly />
          </label>
          <label>
            PC mask (prefix)
            <input type="number" min={8} max={30} value={prefix} onChange={(e) => setPrefix(Math.max(8, Math.min(30, Number(e.target.value) || 24)))} />
          </label>
          <label>
            Default gateway
            <input type="text" value={gateway} placeholder="(none)" onChange={(e) => setGateway(e.target.value)} />
          </label>
          <label>
            Destination
            <input type="text" value={dest} onChange={(e) => setDest(e.target.value)} />
          </label>
        </div>
        <ol className="auth-stages">
          {steps.map((s) => (
            <li key={s.title} className={`auth-stage ${s.ok === false ? "auth-fail" : s.ok ? "auth-pass" : ""}`}>
              <span className="auth-icon">{s.ok === false ? "✗" : s.ok ? "✓" : "?"}</span>
              <div>
                <strong>{s.title}</strong>
                <p>{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="crypto-section">
        <h3>The router's table</h3>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Destination</th>
                <th>Next hop</th>
                <th>Interface</th>
                <th>Matches?</th>
                <th>What it is</th>
              </tr>
            </thead>
            <tbody>
              {ROUTER_TABLE.map((r) => {
                const c = parseCidr(r.dest)!;
                const m = d !== null && sameSubnet(d, c.ip, c.prefix);
                return (
                  <tr key={r.dest} className={m ? "cm-row-on" : ""}>
                    <td className="mono">{r.dest}</td>
                    <td className="mono">{r.via ?? "connected"}</td>
                    <td className="mono">{r.dev}</td>
                    <td>{d === null ? "" : m ? `yes, /${c.prefix}` : "no"}</td>
                    <td>{r.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="crypto-section">
        <h3>Your own routing table</h3>
        <Terminal
          command="ip route"
          output={"default via 192.0.2.1 dev eth0 \n192.0.2.0/24 dev eth0 proto kernel scope link src 192.0.2.2 "}
          source="Real output from the Linux container this lesson was written in. Two routes: its own /24 is directly connected (scope link), and everything else goes to the default gateway 192.0.2.1."
        />
        <Terminal
          command="ip neigh"
          output="192.0.2.1 dev eth0 lladdr 02:fc:00:00:00:05 REACHABLE "
          source="Same machine: the ARP cache holds just one entry, the gateway's MAC, because every packet off the LAN is sent to it."
        />
        <p className="gate-note">
          On Windows, <code>ipconfig</code> shows the address, mask and default gateway, and <code>route print</code> shows the full table. How ARP finds MAC addresses is
          covered in <LessonLink id="net-arp-switching">MAC Addresses, ARP and Switches</LessonLink>.
        </p>
      </div>

      <Quiz items={QUIZ} title="Check yourself" />
    </div>
  );
}
