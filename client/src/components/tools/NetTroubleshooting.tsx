import { useState } from "react";
import { TROUBLE_OUTPUT, TROUBLE_TOOLS, type TroubleScenarioId, type TroubleTool } from "../../netTroubleshootData";
import { shuffle } from "../../random";
import { LessonLink } from "./netSecShared";

// Support tickets with a hidden cause. Run tools (their output is real, captured from a lab
// network with that fault), then name the cause. Ordering the tools bottom-up is the habit
// being taught.

interface Diagnosis {
  id: TroubleScenarioId;
  label: string;
  evidence: string;
}

const DIAGNOSES: Diagnosis[] = [
  {
    id: "link",
    label: "No link: cable, Wi-Fi or switch port",
    evidence:
      "ip -br addr says DOWN and ip route marks the routes linkdown. Nothing above layer 1 can work, so every other tool fails too. Check the cable, the switch port's lights, or whether Wi-Fi is connected.",
  },
  {
    id: "gateway",
    label: "Default gateway not answering",
    evidence:
      "The link is UP, but ping to 192.168.10.1 gets no replies and ip neigh shows the gateway INCOMPLETE: ARP for it never got an answer. Pings to anything remote fail with \"Destination Host Unreachable\" reported by the PC itself, traceroute shows only stars, and DNS fails because the DNS server is remote too.",
  },
  {
    id: "dns",
    label: "DNS server not answering",
    evidence:
      "Ping to the server's IP address works and traceroute reaches it, so routing is fine. nslookup times out (\"no servers could be reached\") and curl fails at \"Resolving\". Users say \"the internet is down\" because everything uses names.",
  },
  {
    id: "firewall",
    label: "Firewall dropping the web port",
    evidence:
      "Name lookup works, ping and traceroute reach the server, ss on the server shows it listening on port 80, yet curl waits and then times out. Silence on one port while ICMP works is the signature of a DROP rule in between.",
  },
  {
    id: "service",
    label: "Web service not running",
    evidence:
      "Everything reaches the server, but curl fails instantly (after 1 ms) with \"Couldn't connect\": the server answered with a reset because nothing listens on port 80. ss on the server confirms port 80 is missing from the list.",
  },
  {
    id: "ok",
    label: "Network is fine",
    evidence: "Every layer answers: link up, gateway replies, DNS resolves, the path is two hops, and curl gets 200 OK. Time to look at the application or the user's browser.",
  },
];

const LAYER_HINT: Record<TroubleTool, string> = {
  addr: "link and address",
  route: "routes",
  neigh: "ARP",
  pinggw: "local network",
  pingsrv: "routing",
  nslookup: "DNS",
  trace: "path",
  curl: "the application port",
  ss: "the service",
};

const TOOL_LABEL: Record<TroubleTool, string> = {
  addr: "ip addr",
  route: "ip route",
  neigh: "ip neigh",
  pinggw: "ping gateway",
  pingsrv: "ping server IP",
  nslookup: "nslookup",
  trace: "traceroute",
  curl: "curl",
  ss: "ss on the server",
};

const SYMPTOMS: Record<TroubleScenarioId, string> = {
  ok: "\"The plant portal is broken for me.\"",
  dns: "\"Nothing works. Teams, the portal, websites, all of it.\"",
  firewall: "\"The portal just spins and never loads. It worked yesterday.\"",
  service: "\"The portal says it can't connect, straight away.\"",
  gateway: "\"I can't get to anything off this floor.\"",
  link: "\"My PC says no network.\"",
};

export function NetTroubleshooting() {
  const [queue, setQueue] = useState<TroubleScenarioId[]>(() => shuffle(DIAGNOSES.map((d) => d.id)));
  const [ran, setRan] = useState<TroubleTool[]>([]);
  const [guess, setGuess] = useState<TroubleScenarioId | null>(null);
  const [solved, setSolved] = useState({ right: 0, total: 0 });
  const scenario = queue[0];
  const answer = DIAGNOSES.find((d) => d.id === scenario)!;

  function run(t: TroubleTool) {
    if (!ran.includes(t)) setRan([...ran, t]);
  }

  function choose(id: TroubleScenarioId) {
    if (guess) return;
    setGuess(id);
    setSolved((s) => ({ right: s.right + (id === scenario ? 1 : 0), total: s.total + 1 }));
  }

  function nextTicket() {
    const rest = queue.slice(1);
    setQueue(rest.length > 0 ? rest : shuffle(DIAGNOSES.map((d) => d.id)));
    setRan([]);
    setGuess(null);
  }

  return (
    <div className="tool-widget">
      <div className="drill-card">
        <p className="drill-progress">
          Ticket {solved.total + (guess ? 0 : 1)} · solved {solved.right} of {solved.total}
        </p>
        <p className="drill-statement">
          From the PC at 192.168.10.25: {SYMPTOMS[scenario]} The portal is http://portal.example.net (server 203.0.113.10, behind the router 192.168.10.1).
        </p>
        <p className="gate-note">Run tools, bottom of the stack first. Each output is real, captured from a lab network with this ticket's fault.</p>
        <div className="sql-presets">
          {TROUBLE_TOOLS.map((t) => (
            <button key={t.id} className={ran.includes(t.id) ? "active" : ""} onClick={() => run(t.id)} title={LAYER_HINT[t.id]}>
              {TOOL_LABEL[t.id]}
            </button>
          ))}
        </div>
        {ran.map((t) => (
          <div key={t} className="ns-terminal">
            <pre className="algo-code ns-term-pre">
              <span className="ns-prompt">$ </span>
              {TROUBLE_TOOLS.find((x) => x.id === t)!.command}
              {"\n"}
              {TROUBLE_OUTPUT[scenario][t]}
            </pre>
          </div>
        ))}

        <h3>What's wrong?</h3>
        <div className="drill-options">
          {DIAGNOSES.map((d) => {
            const cls = guess === null ? "" : d.id === scenario ? "correct" : d.id === guess ? "wrong" : "dim";
            return (
              <button key={d.id} className={`drill-option ${cls}`} disabled={guess !== null} onClick={() => choose(d.id)}>
                {d.label}
              </button>
            );
          })}
        </div>
        {guess && (
          <div className="drill-feedback">
            <p className={guess === scenario ? "constraint-ok" : "constraint-fail"}>
              {guess === scenario ? "Right" : `It was: ${answer.label}`}
              {ran.length === 0 ? ", though you didn't run anything to prove it." : `, using ${ran.length} tool${ran.length === 1 ? "" : "s"}.`}
            </p>
            <p>{answer.evidence}</p>
            <button onClick={nextTicket} autoFocus>
              Next ticket
            </button>
          </div>
        )}
      </div>

      <div className="crypto-section">
        <h3>The same tools on Windows</h3>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Linux</th>
                <th>Windows</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>My address, mask, gateway, DNS?</td>
                <td className="mono">ip addr, ip route, resolvectl status</td>
                <td className="mono">ipconfig /all</td>
              </tr>
              <tr>
                <td>Is it reachable?</td>
                <td className="mono">ping</td>
                <td className="mono">ping</td>
              </tr>
              <tr>
                <td>Which way do packets go?</td>
                <td className="mono">traceroute, tracepath, mtr</td>
                <td className="mono">tracert, pathping</td>
              </tr>
              <tr>
                <td>What does this name resolve to?</td>
                <td className="mono">dig, nslookup</td>
                <td className="mono">nslookup, Resolve-DnsName</td>
              </tr>
              <tr>
                <td>Is the port open?</td>
                <td className="mono">curl, nc -zv host 443</td>
                <td className="mono">Test-NetConnection host -Port 443</td>
              </tr>
              <tr>
                <td>What's listening, what's connected?</td>
                <td className="mono">ss -tulpn</td>
                <td className="mono">netstat -ano</td>
              </tr>
              <tr>
                <td>Who's on my LAN segment?</td>
                <td className="mono">ip neigh</td>
                <td className="mono">arp -a</td>
              </tr>
              <tr>
                <td>Does the web request work?</td>
                <td className="mono">curl -v</td>
                <td className="mono">curl.exe -v</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="gate-note">
          A ping that fails proves little on its own: many firewalls block ICMP on purpose, so test the actual port too. Background on each layer:{" "}
          <LessonLink id="net-routing-gateways">routing</LessonLink>, <LessonLink id="net-arp-switching">ARP</LessonLink>,{" "}
          <LessonLink id="dns-and-http">DNS</LessonLink> and <LessonLink id="net-firewalls-ports">firewalls</LessonLink>.
        </p>
      </div>
    </div>
  );
}
