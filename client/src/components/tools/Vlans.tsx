import { useState } from "react";
import { LessonLink, Quiz, type QuizItem } from "./netSecShared";

// One switch, eight access ports split into VLANs, and a trunk to a router that routes
// between them (router on a stick). Click a port's VLAN to move it.

interface Vlan {
  id: number;
  name: string;
  subnet: string;
  cls: string;
}

const VLANS: Vlan[] = [
  { id: 10, name: "Office", subnet: "192.168.10.0/24", cls: "ns-v10" },
  { id: 20, name: "Production", subnet: "192.168.20.0/24", cls: "ns-v20" },
  { id: 30, name: "Guest Wi-Fi", subnet: "192.168.30.0/24", cls: "ns-v30" },
];

interface Device {
  port: number;
  name: string;
  hostPart: number;
}

const DEVICES: Device[] = [
  { port: 1, name: "Office PC", hostPart: 21 },
  { port: 2, name: "Laptop", hostPart: 22 },
  { port: 3, name: "Printer", hostPart: 50 },
  { port: 4, name: "HMI panel", hostPart: 40 },
  { port: 5, name: "PLC", hostPart: 10 },
  { port: 6, name: "Engineering PC", hostPart: 30 },
  { port: 7, name: "Visitor's phone", hostPart: 101 },
  { port: 8, name: "Camera", hostPart: 60 },
];

const START: Record<number, number> = { 1: 10, 2: 10, 3: 10, 4: 20, 5: 20, 6: 20, 7: 30, 8: 30 };

const vlan = (id: number) => VLANS.find((v) => v.id === id)!;
const ipOf = (d: Device, v: number) => `192.168.${v}.${d.hostPart}`;

interface Hop {
  text: string;
  bad?: boolean;
}

const QUIZ: QuizItem[] = [
  {
    q: "Two PCs plug into the same switch but are in VLAN 10 and VLAN 20. Can they reach each other without a router?",
    options: ["Yes, they share a switch", "No, a VLAN is its own Layer 2 network, so traffic between VLANs must be routed", "Only with broadcasts"],
    answer: 1,
    why: "The switch keeps each VLAN's frames separate, broadcasts included. To get between VLANs a router or Layer 3 switch has to route, which is also the natural place to apply firewall rules.",
  },
  {
    q: "What is a trunk port?",
    options: ["A port that carries several VLANs, each frame tagged with its VLAN ID", "The fastest port on the switch", "A port that's disabled"],
    answer: 0,
    why: "Trunks link switches to each other and to routers. 802.1Q inserts a 4-byte tag with a 12-bit VLAN ID. An access port belongs to one VLAN and its devices never see tags.",
  },
  {
    q: "How many VLAN IDs can an 802.1Q tag hold?",
    options: ["256", "1,024", "4,096 values, of which 1 to 4094 are usable"],
    answer: 2,
    why: "The VLAN ID field is 12 bits: 2^12 = 4,096 values. 0 and 4095 are reserved.",
  },
  {
    q: "Why put production machines (PLCs, HMIs) in their own VLAN?",
    options: [
      "It makes them faster",
      "It limits who can reach them: an infected office laptop can't talk to a PLC unless a routing rule allows it",
      "PLCs require it by law",
    ],
    answer: 1,
    why: "Segmentation shrinks the blast radius. Office broadcasts and malware scans stay out, and the inter-VLAN rules document exactly which flows are allowed. The OT/ICS security lesson takes this further.",
  },
];

export function Vlans() {
  const [ports, setPorts] = useState<Record<number, number>>(START);
  const [src, setSrc] = useState(1);
  const [dst, setDst] = useState(5);
  const [allowOfficeToProd, setAllowOfficeToProd] = useState(false);
  const [hops, setHops] = useState<Hop[]>([]);
  const [lit, setLit] = useState<number[]>([]);
  const [trunkLit, setTrunkLit] = useState(false);

  function cycle(port: number) {
    const order = VLANS.map((v) => v.id);
    setPorts({ ...ports, [port]: order[(order.indexOf(ports[port]) + 1) % order.length] });
    setHops([]);
    setLit([]);
    setTrunkLit(false);
  }

  function broadcast() {
    const v = ports[src];
    const same = DEVICES.filter((d) => d.port !== src && ports[d.port] === v).map((d) => d.port);
    setLit(same);
    setTrunkLit(true);
    setHops([
      { text: `${DEVICES[src - 1].name} sends a broadcast (an ARP request, say) into VLAN ${v}.` },
      {
        text:
          same.length > 0
            ? `The switch floods it only to the other VLAN ${v} access ports (${same.map((p) => `port ${p}`).join(", ")}) and up the trunk tagged ${v}.`
            : `No other access port is in VLAN ${v}; it only goes up the trunk, tagged ${v}.`,
      },
      { text: `Ports in other VLANs never see it. Each VLAN is its own broadcast domain.` },
    ]);
  }

  function send() {
    if (src === dst) return;
    const sv = ports[src];
    const dv = ports[dst];
    const s = DEVICES[src - 1];
    const d = DEVICES[dst - 1];
    const out: Hop[] = [{ text: `${s.name} (${ipOf(s, sv)}, VLAN ${sv}) sends to ${d.name} (${ipOf(d, dv)}, VLAN ${dv}).` }];
    if (sv === dv) {
      out.push({ text: `Same VLAN and same subnet: the switch delivers the frame straight from port ${src} to port ${dst}. No router involved.` });
      setLit([dst]);
      setTrunkLit(false);
      setHops(out);
      return;
    }
    out.push({ text: `Different subnet, so ${s.name} sends the frame to its gateway 192.168.${sv}.1. The switch sends it up the trunk with an 802.1Q tag: VLAN ${sv}.` });
    let allowed = true;
    let rule = "";
    if (sv === 30) {
      allowed = false;
      rule = "Guest VLAN may only reach the internet.";
    } else if (dv === 30) {
      allowed = false;
      rule = "Nothing internal opens connections into the guest VLAN.";
    } else if (sv === 10 && dv === 20) {
      allowed = allowOfficeToProd;
      rule = allowOfficeToProd ? "Rule: office may reach production (you allowed it below)." : "Office to production is denied by default.";
    } else if (sv === 20 && dv === 10) {
      rule = "Production may reach office servers (historian uploads, file shares).";
    }
    if (!allowed) {
      out.push({ text: `The router's access rule blocks it. ${rule}`, bad: true });
      setLit([]);
    } else {
      out.push({ text: `The router routes it: removes the VLAN ${sv} tag, sends it back down the same trunk tagged VLAN ${dv}. ${rule}` });
      out.push({ text: `The switch strips the tag and delivers it out of access port ${dst}.` });
      setLit([dst]);
    }
    setTrunkLit(true);
    setHops(out);
  }

  return (
    <div className="tool-widget">
      <p className="gate-note">Click a port's VLAN label to move that port to the next VLAN.</p>
      <div className="ns-switch ns-switch-8">
        {DEVICES.map((d) => {
          const v = vlan(ports[d.port]);
          return (
            <div key={d.port} className={`ns-port ${v.cls} ${lit.includes(d.port) ? "ns-port-on" : ""} ${d.port === src ? "ns-port-src" : ""}`}>
              <span className="ns-port-num">port {d.port}</span>
              <strong>{d.name}</strong>
              <span className="mono ns-small">{ipOf(d, v.id)}</span>
              <button className="ns-vlan-chip" onClick={() => cycle(d.port)} aria-label={`Port ${d.port} is in VLAN ${v.id}; change`}>
                VLAN {v.id}
              </button>
            </div>
          );
        })}
        <div className={`ns-port ns-trunk ${trunkLit ? "ns-port-on" : ""}`}>
          <span className="ns-port-num">port 24, trunk</span>
          <strong>Router</strong>
          <span className="mono ns-small">tagged 10, 20, 30</span>
        </div>
      </div>
      <div className="ns-legend">
        {VLANS.map((v) => (
          <span key={v.id} className={`ns-legend-item ${v.cls}`}>
            VLAN {v.id} {v.name}, {v.subnet}
          </span>
        ))}
      </div>

      <div className="auth-pickers">
        <label>
          From
          <select value={src} onChange={(e) => setSrc(Number(e.target.value))}>
            {DEVICES.map((d) => (
              <option key={d.port} value={d.port}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          To
          <select value={dst} onChange={(e) => setDst(Number(e.target.value))}>
            {DEVICES.map((d) => (
              <option key={d.port} value={d.port}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="darr-actions">
        <button onClick={send} disabled={src === dst}>
          Send a packet
        </button>
        <button onClick={broadcast}>Send a broadcast</button>
      </div>
      <label className="tool-checkbox">
        <input type="checkbox" checked={allowOfficeToProd} onChange={(e) => setAllowOfficeToProd(e.target.checked)} /> Allow office VLAN to open connections into
        production
      </label>

      {hops.length > 0 && (
        <ol className="auth-stages">
          {hops.map((h, i) => (
            <li key={i} className={`auth-stage ${h.bad ? "auth-fail" : ""}`}>
              <span className="auth-icon">{h.bad ? "✗" : i + 1}</span>
              <div>
                <p>{h.text}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="crypto-section">
        <h3>The 802.1Q tag on the trunk</h3>
        <div className="ns-frame" role="img" aria-label="Ethernet frame with an 802.1Q tag between the source MAC and the EtherType">
          <span>Dest MAC, 6 bytes</span>
          <span>Source MAC, 6 bytes</span>
          <span className="ns-tag">
            802.1Q tag, 4 bytes: TPID 0x8100 · priority 3 bits · DEI 1 bit · VLAN ID 12 bits
          </span>
          <span>EtherType</span>
          <span>Payload (the IP packet)</span>
          <span>FCS</span>
        </div>
        <p className="gate-note">
          Access ports send and receive untagged frames; the switch adds the tag when a frame goes onto a trunk and removes it on the way out to an access port. The
          priority bits are what Quality of Service (QoS) uses to put voice or control traffic first.
        </p>
      </div>

      <Quiz items={QUIZ} title="Check yourself" />
      <p className="gate-note">
        Where segmentation fits in a plant network: <LessonLink id="sec-ot-ics-security">OT/ICS Security: the Purdue Model and Segmentation</LessonLink>.
      </p>
    </div>
  );
}
