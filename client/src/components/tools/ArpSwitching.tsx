import { useState } from "react";
import { LessonLink, Quiz, Terminal, type QuizItem } from "./netSecShared";

// Four hosts on one switch. Pinging fills ARP caches and the switch's MAC address table,
// frame by frame, and shows which ports each frame was sent out of.

interface Host {
  name: string;
  ip: string;
  mac: string;
  port: number;
}

const HOSTS: Host[] = [
  { name: "A", ip: "10.1.1.10", mac: "02:00:00:00:00:0a", port: 1 },
  { name: "B", ip: "10.1.1.20", mac: "02:00:00:00:00:0b", port: 2 },
  { name: "C", ip: "10.1.1.30", mac: "02:00:00:00:00:0c", port: 3 },
  { name: "D", ip: "10.1.1.40", mac: "02:00:00:00:00:0d", port: 4 },
];
const BROADCAST = "ff:ff:ff:ff:ff:ff";

type Arp = Record<string, Record<string, string>>; // host name -> ip -> mac
type MacTable = Record<string, number>; // mac -> port

interface Frame {
  from: string;
  to: string;
  what: string;
  outPorts: number[];
  how: string;
  bad?: boolean;
}

const host = (name: string) => HOSTS.find((h) => h.name === name)!;
const byMac = (mac: string) => HOSTS.find((h) => h.mac === mac);

// The switch: learn the source port, then forward to the known port or flood.
function switchFrame(table: MacTable, srcMac: string, dstMac: string, inPort: number, what: string): { table: MacTable; frame: Frame } {
  const learned = { ...table, [srcMac]: inPort };
  const others = HOSTS.map((h) => h.port).filter((p) => p !== inPort);
  let outPorts: number[];
  let how: string;
  if (dstMac === BROADCAST) {
    outPorts = others;
    how = "broadcast: flooded out of every other port";
  } else if (learned[dstMac] !== undefined) {
    outPorts = [learned[dstMac]];
    how = `known MAC: sent only out of port ${learned[dstMac]}`;
  } else {
    outPorts = others;
    how = "unknown MAC: flooded out of every other port";
  }
  const newly = table[srcMac] === undefined ? ` Switch learns ${srcMac} is on port ${inPort}.` : "";
  return { table: learned, frame: { from: srcMac, to: dstMac, what, outPorts, how: how + "." + newly } };
}

const QUIZ: QuizItem[] = [
  {
    q: "A switch receives a frame for a destination MAC that isn't in its MAC address table yet. What does it do?",
    options: ["Drops it", "Floods it out of every port except the one it came in on", "Sends it to the default gateway"],
    answer: 1,
    why: "Flooding guarantees delivery while the switch is still learning. When the reply comes back, the switch learns where that MAC lives and stops flooding.",
  },
  {
    q: "Which of these does ARP do?",
    options: ["Finds the MAC address for an IP address on the local network", "Finds the IP address for a host name", "Assigns IP addresses"],
    answer: 0,
    why: "ARP answers \"who has 10.1.1.20?\" on the local segment. DNS turns names into IP addresses, and DHCP hands out IP addresses.",
  },
  {
    q: "A PC sends a packet to a server on another network. Whose MAC address does it ARP for?",
    options: ["The server's", "Its default gateway's", "Nobody's; routers don't use MAC addresses"],
    answer: 1,
    why: "ARP only works on the local segment. For anything off the subnet the PC ARPs for the gateway and hands the frame to it.",
  },
  {
    q: "Why can ARP spoofing work at all?",
    options: ["ARP replies aren't authenticated, so hosts believe whoever answers", "Switches forward ARP to the internet", "MAC addresses are secret"],
    answer: 0,
    why: "Any host can claim any IP. Managed switches defend against it with Dynamic ARP Inspection, and encryption (TLS) makes intercepted traffic useless even if it happens.",
  },
];

export function ArpSwitching() {
  const [from, setFrom] = useState("A");
  const [to, setTo] = useState("B");
  const [arp, setArp] = useState<Arp>({ A: {}, B: {}, C: {}, D: {} });
  const [table, setTable] = useState<MacTable>({});
  const [frames, setFrames] = useState<Frame[]>([]);
  const [lastPorts, setLastPorts] = useState<number[]>([]);

  function ping() {
    if (from === to) return;
    const s = host(from);
    const t = host(to);
    let tbl = table;
    const caches: Arp = { ...arp, [from]: { ...arp[from] }, [to]: { ...arp[to] } };
    const out: Frame[] = [];
    let dstMac = caches[from][t.ip];
    if (!dstMac) {
      const req = switchFrame(tbl, s.mac, BROADCAST, s.port, `ARP request: who has ${t.ip}? Tell ${s.ip}`);
      tbl = req.table;
      out.push(req.frame);
      caches[to][s.ip] = s.mac; // the target learns the asker for free
      const rep = switchFrame(tbl, t.mac, s.mac, t.port, `ARP reply: ${t.ip} is at ${t.mac}`);
      tbl = rep.table;
      out.push(rep.frame);
      caches[from][t.ip] = t.mac;
      dstMac = t.mac;
    }
    const real = byMac(dstMac)!;
    const req = switchFrame(tbl, s.mac, dstMac, s.port, `IPv4 ${s.ip} > ${t.ip}: ICMP echo request`);
    tbl = req.table;
    if (real.name !== t.name) {
      req.frame.bad = true;
      req.frame.what += ` (but ${dstMac} is ${real.name}, so ${real.name} gets it)`;
    }
    out.push(req.frame);
    if (real.name === t.name) {
      const rep = switchFrame(tbl, t.mac, s.mac, t.port, `IPv4 ${t.ip} > ${s.ip}: ICMP echo reply`);
      tbl = rep.table;
      out.push(rep.frame);
    }
    setArp(caches);
    setTable(tbl);
    setFrames((f) => [...out, ...f].slice(0, 24));
    setLastPorts(out.flatMap((f) => f.outPorts));
  }

  // C claims B's IP address in an unsolicited ARP reply to A.
  function spoof() {
    const c = host("C");
    const a = host("A");
    const res = switchFrame(table, c.mac, a.mac, c.port, `Forged ARP reply: 10.1.1.20 is at ${c.mac}`);
    res.frame.bad = true;
    setArp({ ...arp, A: { ...arp.A, "10.1.1.20": c.mac } });
    setTable(res.table);
    setFrames((f) => [res.frame, ...f].slice(0, 24));
    setLastPorts(res.frame.outPorts);
  }

  return (
    <div className="tool-widget">
      <div className="auth-pickers">
        <label>
          From
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            {HOSTS.map((h) => (
              <option key={h.name} value={h.name}>
                {h.name} ({h.ip})
              </option>
            ))}
          </select>
        </label>
        <label>
          Ping
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            {HOSTS.map((h) => (
              <option key={h.name} value={h.name}>
                {h.name} ({h.ip})
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="darr-actions">
        <button onClick={ping} disabled={from === to}>
          Send ping
        </button>
        <button onClick={spoof}>C spoofs B to A</button>
        <button
          onClick={() => {
            setArp({ A: {}, B: {}, C: {}, D: {} });
            setTable({});
            setFrames([]);
            setLastPorts([]);
          }}
        >
          Reset everything
        </button>
      </div>

      <div className="ns-switch" aria-label="Switch ports">
        {HOSTS.map((h) => (
          <div key={h.name} className={`ns-port ${lastPorts.includes(h.port) ? "ns-port-on" : ""}`}>
            <span className="ns-port-num">port {h.port}</span>
            <strong>{h.name}</strong>
            <span className="mono ns-small">{h.ip}</span>
            <span className="mono ns-small">{h.mac}</span>
          </div>
        ))}
      </div>
      <p className="gate-note">Highlighted ports are the ones the last ping's frames went out of.</p>

      <div className="ns-two-col">
        <div>
          <h3>Switch MAC address table</h3>
          <table className="bigo-table">
            <tbody>
              {Object.keys(table).length === 0 && (
                <tr>
                  <td>empty: the switch hasn't seen any frames yet</td>
                </tr>
              )}
              {Object.entries(table).map(([mac, port]) => (
                <tr key={mac}>
                  <td className="mono">{mac}</td>
                  <td>port {port}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h3>ARP caches</h3>
          <table className="bigo-table">
            <tbody>
              {HOSTS.map((h) => (
                <tr key={h.name}>
                  <td>{h.name}</td>
                  <td className="mono ns-small">
                    {Object.entries(arp[h.name]).length === 0
                      ? "empty"
                      : Object.entries(arp[h.name]).map(([ip, mac]) => (
                          <div key={ip} className={byMac(mac)?.ip !== ip ? "constraint-fail" : ""}>
                            {ip} is at {mac}
                          </div>
                        ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {frames.length > 0 && (
        <div className="crypto-section">
          <h3>Frames, newest first</h3>
          <ol className="auth-stages">
            {frames.map((f, i) => (
              <li key={i} className={`auth-stage ${f.bad ? "auth-fail" : ""}`}>
                <div>
                  <strong className="mono ns-small">
                    {f.from} &gt; {f.to}
                  </strong>
                  <p>{f.what}</p>
                  <p className="status-text">
                    {f.how} Out of port{f.outPorts.length === 1 ? "" : "s"} {f.outPorts.join(", ")}.
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="crypto-section">
        <h3>The same thing on real Linux</h3>
        <p className="gate-note">
          Three network namespaces (isolated network stacks) joined by a Linux bridge, which is a software switch. Host 1 is 10.1.1.10, host 2 is 10.1.1.20 and
          host 3 is 10.1.1.30, with the same MAC addresses as above. Host 1 pings host 2 while host 2 and host 3 capture everything they receive.
        </p>
        <Terminal
          command="tcpdump -n -e -i e2     # on host 2, the target"
          output={`02:00:00:00:00:0a > ff:ff:ff:ff:ff:ff, ethertype ARP (0x0806), length 42: Request who-has 10.1.1.20 tell 10.1.1.10, length 28
02:00:00:00:00:0b > 02:00:00:00:00:0a, ethertype ARP (0x0806), length 42: Reply 10.1.1.20 is-at 02:00:00:00:00:0b, length 28
02:00:00:00:00:0a > 02:00:00:00:00:0b, ethertype IPv4 (0x0800), length 98: 10.1.1.10 > 10.1.1.20: ICMP echo request, id 9122, seq 1, length 64
02:00:00:00:00:0b > 02:00:00:00:00:0a, ethertype IPv4 (0x0800), length 98: 10.1.1.20 > 10.1.1.10: ICMP echo reply, id 9122, seq 1, length 64`}
        />
        <Terminal
          command="tcpdump -n -e -i e3     # on host 3, a bystander"
          output="02:00:00:00:00:0a > ff:ff:ff:ff:ff:ff, ethertype ARP (0x0806), length 42: Request who-has 10.1.1.20 tell 10.1.1.10, length 28"
        />
        <Terminal
          command="bridge fdb show br br0 | grep -v permanent     # the switch's MAC table afterwards"
          output={"02:00:00:00:00:0a dev p1 master br0 \n02:00:00:00:00:0b dev p2 master br0 "}
        />
        <Terminal
          command="ip neigh     # on host 1"
          output="10.1.1.20 dev e1 lladdr 02:00:00:00:00:0b REACHABLE "
          source="Real captures, timestamps removed. Host 3 saw only the broadcast ARP request: once the bridge had learned both MAC addresses, the ping went only to host 2's port."
        />
        <p className="gate-note">
          Switches that split one physical switch into several separate networks are next: <LessonLink id="net-vlans">VLANs</LessonLink>.
        </p>
      </div>

      <Quiz items={QUIZ} title="Check yourself" />
    </div>
  );
}
