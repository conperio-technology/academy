import { useState } from "react";
import { LessonLink, Quiz, Terminal, type QuizItem } from "./netSecShared";

// A home or small-site router doing port address translation: outbound connections create
// NAT table entries, replies match them, and unsolicited inbound packets only get in through
// a port forwarding rule (and not at all from behind carrier-grade NAT).

interface Inside {
  name: string;
  ip: string;
}

const INSIDE: Inside[] = [
  { name: "Laptop", ip: "192.168.1.20" },
  { name: "Phone", ip: "192.168.1.21" },
  { name: "NAS (file server)", ip: "192.168.1.50" },
];

const DESTS = [
  { label: "a website, 203.0.113.80:443", ip: "203.0.113.80", port: 443 },
  { label: "a DNS server, 198.51.100.53:53", ip: "198.51.100.53", port: 53 },
  { label: "an SSH server, 203.0.113.22:22", ip: "203.0.113.22", port: 22 },
];

interface NatEntry {
  insideIp: string;
  insidePort: number;
  outsidePort: number;
  remote: string;
}

interface Forward {
  outsidePort: number;
  insideIp: string;
  insidePort: number;
}

interface LogLine {
  text: string;
  bad?: boolean;
}

const QUIZ: QuizItem[] = [
  {
    q: "Fifty PCs in an office share one public IP address. How does the router know which PC a reply belongs to?",
    options: ["It asks each PC", "Its NAT table maps each public source port to the inside address and port that opened the connection", "Replies are broadcast to every PC"],
    answer: 1,
    why: "This is port address translation (PAT, or NAT overload). Each outbound connection gets a row; the reply's destination port picks the row.",
  },
  {
    q: "You set up a port forward for a camera, but it still can't be reached from outside. The router's WAN address is 100.80.12.4. Why?",
    options: ["The camera is off", "100.64.0.0/10 is carrier-grade NAT: your ISP has another NAT in front of you that you can't configure", "Port forwarding needs IPv6"],
    answer: 1,
    why: "With CGNAT your router isn't on the internet directly. Use a VPN or a cloud relay instead, or ask the ISP for a public address (often a paid option).",
  },
  {
    q: "Is NAT a firewall?",
    options: ["Yes, a complete one", "It blocks unsolicited inbound connections as a side effect, but it doesn't inspect or filter outbound traffic and isn't a security policy", "No, it lets everything in"],
    answer: 1,
    why: "NAT exists to share addresses. The \"nothing gets in unless asked\" effect is real but accidental; a stateful firewall states the rules on purpose, in both directions.",
  },
  {
    q: "Which is the safer way to give a technician remote access to a machine on site?",
    options: ["Forward port 3389 (Remote Desktop) to the machine", "A VPN or a managed remote access gateway with MFA, no forwarded ports", "Forward port 3389 but use a long password"],
    answer: 1,
    why: "Exposed RDP is scanned constantly and a common way into networks for ransomware groups. Keep services behind a VPN with MFA and leave the port closed.",
  },
];

export function NatPortForwarding() {
  const [from, setFrom] = useState(0);
  const [dest, setDest] = useState(0);
  const [table, setTable] = useState<NatEntry[]>([]);
  const [forwards, setForwards] = useState<Forward[]>([]);
  const [cgnat, setCgnat] = useState(false);
  const [log, setLog] = useState<LogLine[]>([]);
  const [nextPort, setNextPort] = useState(51514);
  const [inPort, setInPort] = useState(8443);

  const publicIp = cgnat ? "100.72.15.9" : "198.51.100.7";

  function outbound(forcePort?: number) {
    const h = INSIDE[from];
    const d = DESTS[dest];
    const srcPort = forcePort ?? nextPort;
    setNextPort((p) => p + 137);
    // Keep the original port when free (Linux does), otherwise pick another.
    let outPort = srcPort;
    while (table.some((e) => e.outsidePort === outPort)) outPort += 1;
    const entry: NatEntry = { insideIp: h.ip, insidePort: srcPort, outsidePort: outPort, remote: `${d.ip}:${d.port}` };
    setTable((t) => [entry, ...t].slice(0, 8));
    const lines: LogLine[] = [
      { text: `${h.name} sends ${h.ip}:${srcPort} → ${d.ip}:${d.port}.` },
      {
        text:
          outPort === srcPort
            ? `Router rewrites the source to ${publicIp}:${outPort} (same port, it was free) and adds a NAT table row.`
            : `Port ${srcPort} is already in use on ${publicIp} by another device, so the router rewrites the source to ${publicIp}:${outPort}. This is why it's called port address translation.`,
      },
      { text: `The server sees the connection coming from ${publicIp}:${outPort}. It never sees ${h.ip}.` },
      { text: `Reply ${d.ip}:${d.port} → ${publicIp}:${outPort} matches the row, so the router rewrites the destination back to ${h.ip}:${srcPort}.` },
    ];
    if (cgnat) lines.splice(2, 0, { text: `Your ISP's carrier-grade NAT does the same again, swapping ${publicIp} for one of its public addresses.` });
    setLog(lines);
  }

  function inbound() {
    const lines: LogLine[] = [{ text: `Someone on the internet sends a new connection (a TCP SYN) to ${cgnat ? "your public address" : `${publicIp}:${inPort}`}.` }];
    if (cgnat) {
      lines.push({
        text: `It arrives at the ISP's carrier-grade NAT, which has no row and no forwarding rule for you. Dropped. Your own router never sees it, whatever rules you set.`,
        bad: true,
      });
      setLog(lines);
      return;
    }
    const fw = forwards.find((f) => f.outsidePort === inPort);
    if (fw) {
      const h = INSIDE.find((i) => i.ip === fw.insideIp)!;
      lines.push({ text: `A port forwarding rule matches: ${publicIp}:${inPort} → ${fw.insideIp}:${fw.insidePort}.` });
      lines.push({ text: `The router rewrites the destination and passes it to the ${h.name}. Now anyone on the internet can try to log in to it, so it had better be patched and use strong authentication.` });
    } else {
      lines.push({ text: `No NAT row matches (nobody inside started this) and no forwarding rule exists for port ${inPort}. Dropped.`, bad: true });
    }
    setLog(lines);
  }

  const hasNasForward = forwards.some((f) => f.outsidePort === 8443);

  return (
    <div className="tool-widget">
      <div className="ns-nat-diagram">
        <div className="ns-nat-side">
          <h3>Inside, 192.168.1.0/24</h3>
          {INSIDE.map((h) => (
            <div key={h.ip} className="mono ns-small">
              {h.name}: {h.ip}
            </div>
          ))}
        </div>
        <div className="ns-nat-router">
          <strong>Router</strong>
          <span className="mono ns-small">LAN 192.168.1.1</span>
          <span className="mono ns-small">WAN {publicIp}</span>
        </div>
        <div className="ns-nat-side">
          <h3>Internet</h3>
          {DESTS.map((d) => (
            <div key={d.ip} className="mono ns-small">
              {d.ip}:{d.port}
            </div>
          ))}
        </div>
      </div>

      <div className="crypto-section">
        <h3>Outbound: someone inside starts a connection</h3>
        <div className="auth-pickers">
          <label>
            Device
            <select value={from} onChange={(e) => setFrom(Number(e.target.value))}>
              {INSIDE.map((h, i) => (
                <option key={h.ip} value={i}>
                  {h.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Connects to
            <select value={dest} onChange={(e) => setDest(Number(e.target.value))}>
              {DESTS.map((d, i) => (
                <option key={d.ip} value={i}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="darr-actions">
          <button onClick={() => outbound()}>Connect</button>
          <button onClick={() => outbound(table[0]?.insidePort ?? 51514)} disabled={table.length === 0}>
            Connect, reusing the last source port
          </button>
        </div>
      </div>

      <div className="crypto-section">
        <h3>Inbound: someone outside starts a connection</h3>
        <div className="tool-inputs">
          <label>
            To public port
            <input type="number" min={1} max={65535} value={inPort} onChange={(e) => setInPort(Math.max(1, Math.min(65535, Number(e.target.value) || 1)))} />
          </label>
        </div>
        <div className="darr-actions">
          <button onClick={inbound}>Send it</button>
          <button
            onClick={() =>
              setForwards((f) => (hasNasForward ? f.filter((x) => x.outsidePort !== 8443) : [...f, { outsidePort: 8443, insideIp: "192.168.1.50", insidePort: 443 }]))
            }
          >
            {hasNasForward ? "Remove the port forward" : "Add a port forward: 8443 → NAS 192.168.1.50:443"}
          </button>
        </div>
        <label className="tool-checkbox">
          <input type="checkbox" checked={cgnat} onChange={(e) => setCgnat(e.target.checked)} /> The ISP uses carrier-grade NAT (router's WAN address is in
          100.64.0.0/10)
        </label>
      </div>

      {log.length > 0 && (
        <ol className="auth-stages">
          {log.map((l, i) => (
            <li key={i} className={`auth-stage ${l.bad ? "auth-fail" : ""}`}>
              <span className="auth-icon">{l.bad ? "✗" : i + 1}</span>
              <div>
                <p>{l.text}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="ns-two-col">
        <div>
          <h3>NAT table</h3>
          <div className="cm-scroll">
            <table className="bigo-table">
              <thead>
                <tr>
                  <th>Inside</th>
                  <th>Public</th>
                  <th>Remote</th>
                </tr>
              </thead>
              <tbody>
                {table.length === 0 && (
                  <tr>
                    <td colSpan={3}>empty</td>
                  </tr>
                )}
                {table.map((e, i) => (
                  <tr key={i}>
                    <td className="mono ns-small">
                      {e.insideIp}:{e.insidePort}
                    </td>
                    <td className="mono ns-small">
                      {publicIp}:{e.outsidePort}
                    </td>
                    <td className="mono ns-small">{e.remote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h3>Port forwarding rules</h3>
          <table className="bigo-table">
            <tbody>
              {forwards.length === 0 && (
                <tr>
                  <td>none</td>
                </tr>
              )}
              {forwards.map((f) => (
                <tr key={f.outsidePort}>
                  <td className="mono ns-small">
                    :{f.outsidePort} → {f.insideIp}:{f.insidePort}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="crypto-section">
        <h3>Real NAT on Linux</h3>
        <p className="gate-note">
          A test network built from Linux network namespaces: a PC at 192.168.10.25, a router doing NAT (an iptables MASQUERADE rule) with outside address
          203.0.113.1, and a web server at 203.0.113.10.
        </p>
        <Terminal command="iptables -t nat -A POSTROUTING -o r1 -j MASQUERADE     # on the router" output="" />
        <Terminal
          command="conntrack -L -p tcp     # the router's NAT table after the PC fetched a page"
          output="tcp      6 119 TIME_WAIT src=192.168.10.25 dst=203.0.113.10 sport=40932 dport=80 src=203.0.113.10 dst=203.0.113.1 sport=80 dport=40932 [ASSURED] mark=0 use=1"
        />
        <Terminal
          command="python3 -m http.server 80     # the web server's access log"
          output={'203.0.113.1 - - [10/Oct/2026 20:19:21] "GET / HTTP/1.1" 200 -'}
          source="Real output. The conntrack row holds both directions: the original (PC to server) and the expected reply (server to 203.0.113.1). The server only ever saw the router's address, and Linux kept the PC's source port 40932 because it was free."
        />
      </div>

      <Quiz items={QUIZ} title="Check yourself" />
      <p className="gate-note">
        NAT decides where packets go; a firewall decides whether they may: <LessonLink id="net-firewalls-ports">Firewalls and Ports</LessonLink>.
      </p>
    </div>
  );
}
