import { useMemo, useState } from "react";
import { inCidr, parseIp } from "../../netMath";
import { shuffle } from "../../random";
import { LessonLink, Terminal } from "./netSecShared";

// Part 1: an ordered rule list in front of a production network. First match wins, and a
// stateful firewall lets replies back in without a rule. Part 2: the port numbers worth
// knowing, with a generated quiz.

interface Rule {
  id: string;
  action: "allow" | "deny";
  proto: "tcp" | "udp" | "icmp" | "any";
  src: string; // CIDR
  dst: string; // CIDR
  port: number | null; // destination port, null = any
  note: string;
}

const START_RULES: Rule[] = [
  { id: "r1", action: "allow", proto: "tcp", src: "192.168.10.0/24", dst: "192.168.20.40/32", port: 443, note: "office browsers to the HMI's web page" },
  { id: "r2", action: "allow", proto: "tcp", src: "192.168.10.15/32", dst: "192.168.20.0/24", port: 502, note: "SCADA server polls PLCs (Modbus TCP)" },
  { id: "r3", action: "deny", proto: "tcp", src: "0.0.0.0/0", dst: "0.0.0.0/0", port: 502, note: "nobody else speaks Modbus to anything" },
  { id: "r4", action: "allow", proto: "icmp", src: "192.168.10.0/24", dst: "192.168.20.0/24", port: null, note: "ping from the office, for troubleshooting" },
];

interface TestPacket {
  label: string;
  proto: "tcp" | "udp" | "icmp";
  src: string;
  sport: number | null;
  dst: string;
  port: number | null;
  reply?: boolean; // part of a connection that was allowed in the other direction
}

const PACKETS: TestPacket[] = [
  { label: "Office PC opens the HMI page", proto: "tcp", src: "192.168.10.21", sport: 51514, dst: "192.168.20.40", port: 443 },
  { label: "HMI's reply to that office PC", proto: "tcp", src: "192.168.20.40", sport: 443, dst: "192.168.10.21", port: 51514, reply: true },
  { label: "SCADA server polls a PLC", proto: "tcp", src: "192.168.10.15", sport: 40112, dst: "192.168.20.10", port: 502 },
  { label: "Office PC talks Modbus to a PLC", proto: "tcp", src: "192.168.10.21", sport: 51600, dst: "192.168.20.10", port: 502 },
  { label: "Office PC pings a PLC", proto: "icmp", src: "192.168.10.21", sport: null, dst: "192.168.20.10", port: null },
  { label: "Office PC opens Remote Desktop to the engineering PC", proto: "tcp", src: "192.168.10.21", sport: 51700, dst: "192.168.20.30", port: 3389 },
  { label: "Guest Wi-Fi phone scans for Modbus", proto: "tcp", src: "192.168.30.101", sport: 44000, dst: "192.168.20.10", port: 502 },
];

function matches(r: Rule, p: TestPacket): boolean {
  const ip = (s: string) => parseIp(s)!;
  return (
    (r.proto === "any" || r.proto === p.proto) &&
    inCidr(ip(p.src), r.src) &&
    inCidr(ip(p.dst), r.dst) &&
    (r.port === null || r.port === p.port)
  );
}

interface Port {
  port: string;
  proto: string;
  service: string;
  note: string;
}

const PORTS: Port[] = [
  { port: "20, 21", proto: "TCP", service: "FTP", note: "File transfer with the password in plain text. Prefer SFTP (over SSH, port 22)." },
  { port: "22", proto: "TCP", service: "SSH", note: "Encrypted remote shell for Linux and network gear; SFTP and scp use it too." },
  { port: "23", proto: "TCP", service: "Telnet", note: "Remote shell with no encryption. Still found on old switches and industrial devices." },
  { port: "25", proto: "TCP", service: "SMTP", note: "Mail between mail servers." },
  { port: "53", proto: "UDP and TCP", service: "DNS", note: "Name lookups. UDP normally, TCP for large answers and zone transfers." },
  { port: "67, 68", proto: "UDP", service: "DHCP", note: "67 is the server, 68 the client." },
  { port: "80", proto: "TCP", service: "HTTP", note: "Unencrypted web; these days mostly just redirects to 443." },
  { port: "102", proto: "TCP", service: "Siemens S7 (ISO-TSAP)", note: "Programming and data access for Siemens S7 PLCs." },
  { port: "123", proto: "UDP", service: "NTP", note: "Time sync. Wrong clocks break certificates, Kerberos logins and log timelines." },
  { port: "161, 162", proto: "UDP", service: "SNMP", note: "Monitoring network devices (161) and traps they send (162)." },
  { port: "389, 636", proto: "TCP", service: "LDAP, LDAPS", note: "Directory lookups (Active Directory). 636 is the TLS version." },
  { port: "443", proto: "TCP (and UDP)", service: "HTTPS", note: "Encrypted web and most APIs. UDP 443 is HTTP/3 over QUIC." },
  { port: "445", proto: "TCP", service: "SMB", note: "Windows file shares. Never expose to the internet: WannaCry spread through it." },
  { port: "502", proto: "TCP", service: "Modbus TCP", note: "Industrial protocol with no authentication: anyone who can reach it can write registers." },
  { port: "514", proto: "UDP", service: "Syslog", note: "Classic log shipping from devices to a log server." },
  { port: "1433", proto: "TCP", service: "Microsoft SQL Server", note: "Databases belong behind the app, not reachable from user networks." },
  { port: "1883, 8883", proto: "TCP", service: "MQTT", note: "Publish/subscribe messaging for IoT and IIoT. 8883 is MQTT over TLS." },
  { port: "3306", proto: "TCP", service: "MySQL / MariaDB", note: "" },
  { port: "3389", proto: "TCP and UDP", service: "RDP", note: "Windows Remote Desktop. Exposed RDP is a top ransomware entry point." },
  { port: "4840", proto: "TCP", service: "OPC UA", note: "Modern industrial data exchange, with built-in security modes." },
  { port: "5432", proto: "TCP", service: "PostgreSQL", note: "" },
  { port: "44818", proto: "TCP and UDP", service: "EtherNet/IP (CIP)", note: "Rockwell/Allen-Bradley explicit messaging; cyclic I/O uses UDP 2222." },
  { port: "51820", proto: "UDP", service: "WireGuard", note: "Default port for the WireGuard VPN." },
];

const QUIZ_SIZE = 6;

function makePortQuiz() {
  return shuffle(PORTS.filter((p) => !p.port.includes(","))).slice(0, QUIZ_SIZE).map((p) => {
    const wrong = shuffle(PORTS.filter((x) => x.port !== p.port && !x.port.includes(","))).slice(0, 3);
    return { p, options: shuffle([p, ...wrong]).map((x) => x.port) };
  });
}

export function FirewallsPorts() {
  const [rules, setRules] = useState<Rule[]>(START_RULES);
  const [disabled, setDisabled] = useState<string[]>([]);
  const [defaultDeny, setDefaultDeny] = useState(true);
  const [stateful, setStateful] = useState(true);
  const [quiz, setQuiz] = useState(makePortQuiz);
  const [picked, setPicked] = useState<Record<number, string>>({});

  const active = rules.filter((r) => !disabled.includes(r.id));
  const results = useMemo(
    () =>
      PACKETS.map((p) => {
        if (stateful && p.reply) {
          const fwd: TestPacket = { ...PACKETS[0] };
          const first = active.find((r) => matches(r, fwd));
          const allowedOut = first ? first.action === "allow" : !defaultDeny;
          return allowedOut
            ? { allowed: true, why: "Matches an established connection in the state table, so it's allowed without a rule." }
            : { allowed: false, why: "No connection was allowed out, so there's no state entry; and no rule allows it." };
        }
        const idx = active.findIndex((r) => matches(r, p));
        if (idx >= 0) return { allowed: active[idx].action === "allow", why: `Rule ${rules.indexOf(active[idx]) + 1}: ${active[idx].note}.` };
        return {
          allowed: !defaultDeny,
          why: `No rule matches, so the default policy applies: ${defaultDeny ? "deny" : "allow"}.${p.reply && !stateful ? " A stateless filter judges every packet alone, so replies need their own rule." : ""}`,
        };
      }),
    [active, rules, defaultDeny, stateful],
  );

  function move(i: number, d: -1 | 1) {
    const j = i + d;
    if (j < 0 || j >= rules.length) return;
    const copy = [...rules];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setRules(copy);
  }

  const score = quiz.filter((q, i) => picked[i] === q.p.port).length;

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>Rules on the firewall in front of production (192.168.20.0/24)</h3>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>#</th>
                <th>On</th>
                <th>Action</th>
                <th>Proto</th>
                <th>From</th>
                <th>To</th>
                <th>Port</th>
                <th>Why</th>
                <th>Order</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r, i) => (
                <tr key={r.id} className={disabled.includes(r.id) ? "ns-off" : ""}>
                  <td className="mono">{i + 1}</td>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Rule ${i + 1} enabled`}
                      checked={!disabled.includes(r.id)}
                      onChange={(e) => setDisabled(e.target.checked ? disabled.filter((x) => x !== r.id) : [...disabled, r.id])}
                    />
                  </td>
                  <td className={r.action === "allow" ? "constraint-ok" : "constraint-fail"}>{r.action}</td>
                  <td className="mono ns-small">{r.proto}</td>
                  <td className="mono ns-small">{r.src === "0.0.0.0/0" ? "any" : r.src}</td>
                  <td className="mono ns-small">{r.dst === "0.0.0.0/0" ? "any" : r.dst}</td>
                  <td className="mono ns-small">{r.port ?? "any"}</td>
                  <td className="ns-small">{r.note}</td>
                  <td className="ns-nowrap">
                    <button className="ns-mini" aria-label={`Move rule ${i + 1} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                      ↑
                    </button>
                    <button className="ns-mini" aria-label={`Move rule ${i + 1} down`} disabled={i === rules.length - 1} onClick={() => move(i, 1)}>
                      ↓
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td className="mono">*</td>
                <td></td>
                <td className={defaultDeny ? "constraint-fail" : "constraint-ok"}>{defaultDeny ? "deny" : "allow"}</td>
                <td colSpan={6} className="ns-small">
                  default policy: whatever no rule matched
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <label className="tool-checkbox">
          <input type="checkbox" checked={defaultDeny} onChange={(e) => setDefaultDeny(e.target.checked)} /> Default deny (allowlist)
        </label>
        <label className="tool-checkbox">
          <input type="checkbox" checked={stateful} onChange={(e) => setStateful(e.target.checked)} /> Stateful: remember allowed connections and let their replies back
        </label>
        <p className="gate-note">Try moving rule 3 above rule 2, switching off rule 2, turning off stateful, or switching to default allow.</p>
        <ol className="auth-stages">
          {PACKETS.map((p, i) => (
            <li key={p.label} className={`auth-stage ${results[i].allowed ? "auth-pass" : "auth-fail"}`}>
              <span className="auth-icon">{results[i].allowed ? "✓" : "✗"}</span>
              <div className="ns-min0">
                <strong>{p.label}</strong>
                <p className="mono ns-small">
                  {p.proto} {p.src}
                  {p.sport ? `:${p.sport}` : ""} → {p.dst}
                  {p.port ? `:${p.port}` : ""}
                </p>
                <p>
                  {results[i].allowed ? "Allowed. " : "Blocked. "}
                  {results[i].why}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="crypto-section">
        <h3>Drop or reject: what the client sees</h3>
        <p className="gate-note">A real Linux router in a lab network, with a web server behind it. First a DROP rule for port 80:</p>
        <Terminal
          command="iptables -A FORWARD -p tcp --dport 80 -j DROP"
          output={`$ curl -sS --max-time 5 http://portal.example.net/
curl: (28) Connection timed out after 5002 milliseconds
$ ping -c 2 portal.example.net
64 bytes from portal.example.net (203.0.113.10): icmp_seq=1 ttl=63 time=0.238 ms
64 bytes from portal.example.net (203.0.113.10): icmp_seq=2 ttl=63 time=0.049 ms
$ iptables -L FORWARD -n -v --line-numbers
Chain FORWARD (policy ACCEPT 12 packets, 926 bytes)
num   pkts bytes target     prot opt in     out     source               destination
1        5   300 DROP       6    --  *      *       0.0.0.0/0            0.0.0.0/0            tcp dpt:80`}
        />
        <Terminal
          command="iptables -A FORWARD -p tcp --dport 80 -j REJECT --reject-with tcp-reset     # instead"
          output={`$ curl -sS --max-time 5 http://portal.example.net/
curl: (7) Failed to connect to portal.example.net port 80 after 1 ms: Couldn't connect to server`}
          source="Real output. DROP: silence, so the client keeps retrying until it gives up (the rule's packet counter shows the retries), while ping still works because only TCP port 80 is blocked. REJECT: an instant refusal, the same error as a port where nothing is listening. Column 'prot 6' is TCP's protocol number."
        />
        <p className="gate-note">
          A timeout usually means something dropped the packet (a firewall, or a route to nowhere). An instant &quot;connection refused&quot; means the machine
          answered: either nothing listens on that port or a firewall rejected it. That difference is a big clue in the{" "}
          <LessonLink id="net-troubleshooting">troubleshooting toolkit</LessonLink>.
        </p>
      </div>

      <div className="crypto-section">
        <h3>What's listening on a machine</h3>
        <Terminal
          command="ss -tlnp     # TCP, listening, numeric, with process"
          output={`State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess
LISTEN 0      5       203.0.113.10:80        0.0.0.0:*    users:(("python3",pid=8678,fd=3))
LISTEN 0      32      203.0.113.10:53        0.0.0.0:*    users:(("dnsmasq",pid=8719,fd=5))`}
        />
        <Terminal
          command="ss -tn     # on the client, during a connection"
          output={`State Recv-Q Send-Q Local Address:Port  Peer Address:PortProcess
ESTAB 0      0      192.168.10.25:40936 203.0.113.10:80`}
          source="Real output from the lab web server and its client. The server listens on well-known ports 80 and 53; the client's side of the connection uses a random ephemeral port (40936). On Windows, netstat -ano shows the same, with process IDs."
        />
      </div>

      <div className="crypto-section">
        <h3>Ports worth knowing</h3>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Port</th>
                <th>Protocol</th>
                <th>Service</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {PORTS.map((p) => (
                <tr key={p.port}>
                  <td className="mono">{p.port}</td>
                  <td className="ns-small">{p.proto}</td>
                  <td>{p.service}</td>
                  <td className="ns-small">{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="gate-note">
          Ports 0 to 1023 are the well-known ports; servers listen on these. Clients use a temporary ephemeral port for their side (Linux picks from 32768 to 60999 by
          default; Windows from 49152 to 65535).
        </p>
      </div>

      <div className="crypto-section">
        <h3>Port quiz</h3>
        <ol className="cm-quiz">
          {quiz.map((q, i) => (
            <li key={`${q.p.port}-${i}`}>
              <p>Which port does {q.p.service} use?</p>
              <div className="sql-presets">
                {q.options.map((o) => (
                  <button
                    key={o}
                    className={picked[i] === o ? (o === q.p.port ? "active" : "cm-wrong") : ""}
                    onClick={() => setPicked({ ...picked, [i]: o })}
                  >
                    {o}
                  </button>
                ))}
              </div>
              {picked[i] !== undefined && (
                <p className={picked[i] === q.p.port ? "constraint-ok" : "constraint-fail"}>
                  {picked[i] === q.p.port ? "Right. " : `No: ${q.p.service} is ${q.p.proto} ${q.p.port}. `}
                  {q.p.note}
                </p>
              )}
            </li>
          ))}
        </ol>
        <p className="gate-note">
          {Object.keys(picked).length > 0 && `${score} of ${quiz.length} right. `}
          <button
            className="link-button"
            onClick={() => {
              setQuiz(makePortQuiz());
              setPicked({});
            }}
          >
            New questions
          </button>
        </p>
      </div>
    </div>
  );
}
