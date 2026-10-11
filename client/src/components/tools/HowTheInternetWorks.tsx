import { useMemo, useState } from "react";
import { openLesson } from "../../api";

// Part 1: a request's trip from a laptop to a web server and back, one stop at a time.
// Part 2: a message cut into packets that arrive out of order and are put back together.

interface Stop {
  name: string;
  short: string;
  what: string;
}

const STOPS: Stop[] = [
  { name: "Your laptop", short: "Laptop", what: "You type example.com. The browser needs the server's IP address first, so it asks DNS (the Domain Name System), the internet's phone book. The answer, such as 203.0.113.10, is usually cached for a while so the next visit skips this." },
  { name: "Home router", short: "Router", what: "Your Wi-Fi router joins your home network to the internet. Devices at home have private addresses (192.168.x.x); the router swaps in the one public address your ISP gave it (NAT, network address translation) and sends each packet on." },
  { name: "Your ISP", short: "ISP", what: "Your internet service provider runs the network your home connects to. Its routers read each packet's destination address and pick the next hop toward it, using routing tables they share with neighbouring networks." },
  { name: "Internet backbone", short: "Backbone", what: "High-capacity fibre links between big networks, cities and continents (including cables on the sea floor). A packet typically crosses 10 to 20 routers in total. Packets of one message can take different paths and arrive out of order." },
  { name: "Data center", short: "Data center", what: "The packets reach the network that owns 203.0.113.10, often a cloud data center. A load balancer there picks one of many identical servers to handle the request." },
  { name: "Web server", short: "Server", what: "TCP on the server puts the packets back in order and asks again for any that were lost. Port 443 tells the machine which program they're for (the HTTPS web server). It reads the HTTP request, GET /, builds the page and replies \"200 OK\" with the HTML." },
  { name: "Back to you", short: "Back", what: "The response is cut into packets and makes the same kind of trip in reverse. Your browser reassembles them, reads the HTML, and repeats the process for every image, stylesheet and script the page needs, usually reusing the open connection. All of this takes well under a second." },
];

const PACKET_SIZE = 8;

function shuffled<T>(items: T[], seed: number): T[] {
  const a = [...items];
  let x = seed * 9301 + 49297;
  for (let i = a.length - 1; i > 0; i--) {
    x = (x * 9301 + 49297) % 233280;
    const j = Math.floor((x / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function HowTheInternetWorks() {
  const [stop, setStop] = useState(0);
  const [message, setMessage] = useState("Hello from the plant floor!");
  const [seed, setSeed] = useState(1);
  const [reassembled, setReassembled] = useState(false);

  const packets = useMemo(() => {
    const out: { seq: number; data: string }[] = [];
    for (let i = 0; i < message.length; i += PACKET_SIZE) out.push({ seq: out.length + 1, data: message.slice(i, i + PACKET_SIZE) });
    return out;
  }, [message]);
  const arrived = useMemo(() => shuffled(packets, seed), [packets, seed]);
  const shown = reassembled ? [...arrived].sort((a, b) => a.seq - b.seq) : arrived;

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>1. One request, stop by stop</h3>
        <ol className="hiw-path">
          {STOPS.map((s, i) => (
            <li key={s.name}>
              <button className={i === stop ? "hiw-stop active" : "hiw-stop"} onClick={() => setStop(i)} aria-current={i === stop ? "step" : undefined}>
                {s.short}
              </button>
            </li>
          ))}
        </ol>
        <p className="gate-note" aria-live="polite">
          <b>{STOPS[stop].name}.</b> {STOPS[stop].what}
        </p>
        <div className="cm-actions">
          <button disabled={stop === 0} onClick={() => setStop(stop - 1)}>Previous stop</button>
          <button disabled={stop === STOPS.length - 1} onClick={() => setStop(stop + 1)}>Next stop</button>
        </div>
      </div>

      <div className="crypto-section">
        <h3>2. Messages travel as packets</h3>
        <label className="tool-single-input">
          Message to send
          <input type="text" value={message} maxLength={64} onChange={(e) => { setMessage(e.target.value); setReassembled(false); }} />
        </label>
        <div className="cm-actions">
          <button onClick={() => { setSeed((s) => s + 1); setReassembled(false); }}>Send again</button>
          <button disabled={reassembled || packets.length < 2} onClick={() => setReassembled(true)}>Reassemble by number (TCP)</button>
        </div>
        <span className="stack-label">{reassembled ? "After TCP puts them in order" : "Packets in the order they arrived"}</span>
        <div className="hiw-packets">
          {shown.map((p) => (
            <div key={p.seq} className="hiw-packet">
              <span className="hiw-head">
                #{p.seq} of {packets.length} | from 192.168.1.20 to 203.0.113.10 port 443
              </span>
              <code>{p.data.replace(/ /g, " ")}</code>
            </div>
          ))}
        </div>
        <p className="gate-note">
          Each packet carries a header (where it's from, where it's going, which piece it is) in front of its slice of the
          data. Real packets hold up to about 1,500 bytes; these hold {PACKET_SIZE} characters so you can see them. Routers only
          read the header, and each packet finds its own way. Next:{" "}
          <button className="link-button" onClick={() => openLesson("network-layers")}>
            how the layers wrap each other
          </button>
          ,{" "}
          <button className="link-button" onClick={() => openLesson("tcp-vs-udp")}>
            TCP vs UDP
          </button>{" "}
          and{" "}
          <button className="link-button" onClick={() => openLesson("dns-and-http")}>
            DNS & HTTP
          </button>
          .
        </p>
      </div>
    </div>
  );
}
