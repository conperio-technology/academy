import { useState } from "react";
import { LessonLink, Quiz, type QuizItem } from "./netSecShared";

// Threat modeling a small plant monitoring system with STRIDE per element: pick an element in
// the data flow diagram, guess which threat categories apply, then compare with the worked list.

type Letter = "S" | "T" | "R" | "I" | "D" | "E";

const STRIDE: { l: Letter; name: string; property: string; question: string }[] = [
  { l: "S", name: "Spoofing", property: "Authentication", question: "Can someone pretend to be this?" },
  { l: "T", name: "Tampering", property: "Integrity", question: "Can someone change it?" },
  { l: "R", name: "Repudiation", property: "Non-repudiation", question: "Can someone deny doing something here?" },
  { l: "I", name: "Information disclosure", property: "Confidentiality", question: "Can someone read what they shouldn't?" },
  { l: "D", name: "Denial of service", property: "Availability", question: "Can someone stop it working?" },
  { l: "E", name: "Elevation of privilege", property: "Authorization", question: "Can someone gain rights they shouldn't have?" },
];

interface Element {
  id: string;
  label: string;
  kind: "external entity" | "process" | "data store" | "data flow";
  x: number;
  y: number;
  threats: Partial<Record<Letter, { threat: string; mitigation: string }>>;
}

const ELEMENTS: Element[] = [
  {
    id: "user",
    label: "Engineer's browser",
    kind: "external entity",
    x: 70,
    y: 60,
    threats: {
      S: { threat: "An attacker logs in with a phished or reused password.", mitigation: "SSO with MFA; phishing-resistant MFA for admins." },
      R: { threat: "An engineer changes an alarm limit, then says they didn't.", mitigation: "Audit log of who changed what and when, stored where users can't edit it." },
    },
  },
  {
    id: "flow1",
    label: "HTTPS",
    kind: "data flow",
    x: 205,
    y: 60,
    threats: {
      T: { threat: "Someone on the network path alters requests.", mitigation: "TLS 1.2+ with valid certificates and HSTS." },
      I: { threat: "Session cookies read on hotel Wi-Fi.", mitigation: "TLS everywhere; Secure and HttpOnly cookies." },
      D: { threat: "The link is flooded.", mitigation: "Rate limiting, a reverse proxy or WAF in front." },
    },
  },
  {
    id: "web",
    label: "Dashboard web app",
    kind: "process",
    x: 340,
    y: 60,
    threats: {
      S: { threat: "A forged identity header is accepted from a direct connection.", mitigation: "Only accept traffic from the ingress; validate tokens." },
      T: { threat: "SQL injection changes stored readings.", mitigation: "Parameterized queries; input validation." },
      R: { threat: "Actions aren't attributed to a user.", mitigation: "Log the authenticated user with every change." },
      I: { threat: "IDOR exposes another plant's data; stack traces leak internals.", mitigation: "Per-object authorization checks; generic error pages." },
      D: { threat: "An expensive report query run in a loop exhausts the server.", mitigation: "Rate limits, query timeouts, pagination." },
      E: { threat: "A viewer reaches admin endpoints the UI hides.", mitigation: "Role checks on the server for every endpoint." },
    },
  },
  {
    id: "db",
    label: "Readings database",
    kind: "data store",
    x: 340,
    y: 180,
    threats: {
      T: { threat: "Someone with database access edits historic readings.", mitigation: "Least-privilege logins; the app can insert but not update history." },
      I: { threat: "A backup file is copied off a share.", mitigation: "Encrypt backups; restrict and audit access." },
      D: { threat: "The disk fills up and inserts start failing.", mitigation: "Monitoring and alerts on capacity; retention policy." },
    },
  },
  {
    id: "collector",
    label: "OPC UA collector",
    kind: "process",
    x: 340,
    y: 300,
    threats: {
      S: { threat: "A rogue device pretends to be the PLC and feeds fake values.", mitigation: "OPC UA with certificates (Sign and Encrypt mode); trust lists." },
      T: { threat: "Its configuration is changed to poll a different address.", mitigation: "Config under change control; file integrity monitoring." },
      R: { threat: "Nobody can tell who changed the collector.", mitigation: "Change records and logs forwarded to the SIEM." },
      I: { threat: "Its service account password sits in a config file.", mitigation: "Secrets manager or protected credential store." },
      D: { threat: "A crash stops data collection silently.", mitigation: "Health checks and alerting on stale data." },
      E: { threat: "A bug in it gives an attacker a foothold in the plant network.", mitigation: "Run as a low-privilege account; patch; place it in the DMZ, not on the control network." },
    },
  },
  {
    id: "flow2",
    label: "OPC UA",
    kind: "data flow",
    x: 205,
    y: 300,
    threats: {
      T: { threat: "Values altered in transit.", mitigation: "OPC UA security mode Sign (or Sign and Encrypt), not None." },
      I: { threat: "Production recipes visible on the wire.", mitigation: "Sign and Encrypt; segmented network." },
      D: { threat: "Network storm on the plant LAN blocks polling.", mitigation: "Segmentation, storm control on switches, QoS." },
    },
  },
  {
    id: "plc",
    label: "PLC",
    kind: "external entity",
    x: 70,
    y: 300,
    threats: {
      S: { threat: "Something else on the network claims the PLC's address.", mitigation: "Certificates; switch port security; Dynamic ARP Inspection." },
      R: { threat: "A program change on the PLC can't be traced to anyone.", mitigation: "Engineering workstation change logs; PLC change detection." },
    },
  },
];

// STRIDE per element: the categories that normally apply to each kind of element.
const APPLIES: Record<Element["kind"], Letter[]> = {
  "external entity": ["S", "R"],
  process: ["S", "T", "R", "I", "D", "E"],
  "data store": ["T", "I", "D"],
  "data flow": ["T", "I", "D"],
};

const QUIZ: QuizItem[] = [
  {
    q: "Which security property does Tampering threaten?",
    options: ["Confidentiality", "Integrity", "Availability"],
    answer: 1,
    why: "Tampering is unauthorized change: integrity. Information disclosure threatens confidentiality and denial of service threatens availability.",
  },
  {
    q: "When is threat modeling cheapest?",
    options: ["After a penetration test", "During design, before the code exists", "After an incident"],
    answer: 1,
    why: "A design change on a whiteboard costs minutes; the same change after release costs a project. Revisit the model whenever the design changes.",
  },
  {
    q: "What is a trust boundary in a data flow diagram?",
    options: ["A line where data crosses between areas with different levels of trust, such as internet to DMZ or DMZ to plant network", "The edge of the screen", "A firewall rule"],
    answer: 0,
    why: "Most threats cluster where data crosses a boundary, because that's where one side has to check what the other sends.",
  },
];

export function ThreatModelingStride() {
  const [sel, setSel] = useState("web");
  const [guesses, setGuesses] = useState<Record<string, Letter[]>>({});
  const [revealed, setRevealed] = useState<string[]>([]);
  const el = ELEMENTS.find((e) => e.id === sel)!;
  const guess = guesses[sel] ?? [];
  const isRevealed = revealed.includes(sel);
  const applies = APPLIES[el.kind];
  const score = (id: string) => {
    const e = ELEMENTS.find((x) => x.id === id)!;
    const g = guesses[id] ?? [];
    return STRIDE.filter((s) => APPLIES[e.kind].includes(s.l) === g.includes(s.l)).length;
  };

  return (
    <div className="tool-widget">
      <svg viewBox="0 0 420 360" className="ns-dfd" role="img" aria-label="Data flow diagram: browser to web app to database, and PLC to collector to database">
        <rect x={10} y={10} width={400} height={115} rx={8} className="ns-boundary" />
        <text x={20} y={28} className="ns-dfd-zone">
          Internet and office (less trusted)
        </text>
        <rect x={10} y={240} width={400} height={110} rx={8} className="ns-boundary" />
        <text x={20} y={344} className="ns-dfd-zone">
          Plant network (control zone)
        </text>
        <line x1={110} y1={60} x2={290} y2={60} className="ns-dfd-line" />
        <line x1={340} y1={85} x2={340} y2={155} className="ns-dfd-line" />
        <line x1={340} y1={275} x2={340} y2={205} className="ns-dfd-line" />
        <line x1={110} y1={300} x2={290} y2={300} className="ns-dfd-line" />
        {ELEMENTS.map((e) => {
          const on = e.id === sel;
          const done = revealed.includes(e.id);
          const cls = `ns-dfd-node ${on ? "ns-dfd-on" : ""} ${done ? "ns-dfd-done" : ""}`;
          return (
            <g key={e.id} className={cls} onClick={() => setSel(e.id)} role="button" tabIndex={0} onKeyDown={(k) => (k.key === "Enter" || k.key === " ") && setSel(e.id)} aria-label={`${e.label}, ${e.kind}`}>
              {e.kind === "process" && <circle cx={e.x} cy={e.y} r={34} />}
              {e.kind === "external entity" && <rect x={e.x - 50} y={e.y - 22} width={100} height={44} />}
              {e.kind === "data store" && (
                <>
                  <rect x={e.x - 55} y={e.y - 20} width={110} height={40} className="ns-dfd-store" />
                  <line x1={e.x - 55} y1={e.y - 20} x2={e.x + 55} y2={e.y - 20} />
                  <line x1={e.x - 55} y1={e.y + 20} x2={e.x + 55} y2={e.y + 20} />
                </>
              )}
              {e.kind === "data flow" && <rect x={e.x - 32} y={e.y - 13} width={64} height={26} rx={13} />}
              <text x={e.x} y={e.y + 4} textAnchor="middle" className="ns-dfd-text">
                {e.label.length > 14 && e.kind !== "data store" ? e.label.split(" ").slice(0, 2).join(" ") : e.label}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="gate-note">
        Click an element. Rectangles are external entities, circles are processes, the open box is a data store, pills are data flows, and the shaded areas are trust
        zones.
      </p>

      <div className="crypto-section">
        <h3>
          {el.label} ({el.kind})
        </h3>
        <p className="gate-note">Which STRIDE threats apply to this element? Tick them, then reveal.</p>
        <ul className="sdi-points prep-tasks">
          {STRIDE.map((s) => {
            const ticked = guess.includes(s.l);
            const right = applies.includes(s.l);
            return (
              <li key={s.l}>
                <label>
                  <input
                    type="checkbox"
                    checked={ticked}
                    disabled={isRevealed}
                    onChange={(e) => setGuesses({ ...guesses, [sel]: e.target.checked ? [...guess, s.l] : guess.filter((x) => x !== s.l) })}
                  />
                  <span>
                    <strong>
                      {s.l}: {s.name}
                    </strong>{" "}
                    <span className="status-text ns-small">
                      ({s.property}) {s.question}
                    </span>
                    {isRevealed && (
                      <span className={`ns-small ${ticked === right ? "constraint-ok" : "constraint-fail"}`}>
                        {" "}
                        {right ? (ticked ? "Yes. " : "Missed. ") : ticked ? "Not usually for this kind of element." : ""}
                        {right && el.threats[s.l] && `${el.threats[s.l]!.threat} Mitigation: ${el.threats[s.l]!.mitigation}`}
                      </span>
                    )}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        <div className="darr-actions">
          {!isRevealed ? (
            <button onClick={() => setRevealed([...revealed, sel])}>Reveal</button>
          ) : (
            <span className="status-text">
              {score(sel)} of 6 categories judged right. {revealed.length} of {ELEMENTS.length} elements done.
            </span>
          )}
        </div>
      </div>

      <Quiz items={QUIZ} title="Check yourself" />
      <p className="gate-note">
        Where the plant network sits relative to the office and the internet: <LessonLink id="sec-ot-ics-security">OT/ICS Security</LessonLink>.
      </p>
    </div>
  );
}
