import { useState } from "react";
import { LessonLink, Quiz, Tabs, type QuizItem } from "./netSecShared";

// Part 1: why letting the data choose its own type is dangerous, with a simulated
// deserializer. Part 2: a deployment review where you find the misconfigurations.

type Mode = "typed" | "fixed";

const PAYLOADS = [
  {
    id: "normal",
    label: "Normal cart cookie",
    json: `{
  "$type": "Shop.Cart, Shop",
  "Items": [ { "Sku": "PLC-IO-16", "Qty": 2 } ]
}`,
    type: "Shop.Cart",
  },
  {
    id: "evil",
    label: "Tampered cookie",
    json: `{
  "$type": "Shop.Maintenance.CleanupJob, Shop",
  "TargetFolder": "C:\\\\inetpub\\\\wwwroot",
  "RunOnLoad": true
}`,
    type: "Shop.Maintenance.CleanupJob",
  },
];

function Deserialization() {
  const [mode, setMode] = useState<Mode>("typed");
  const [payloadId, setPayloadId] = useState("evil");
  const p = PAYLOADS.find((x) => x.id === payloadId)!;
  const evil = p.id === "evil";
  const code =
    mode === "typed"
      ? `// Newtonsoft.Json with type names honoured
var settings = new JsonSerializerSettings { TypeNameHandling = TypeNameHandling.All };
object cart = JsonConvert.DeserializeObject(cookie, settings);`
      : `// System.Text.Json into one fixed type; "$type" is just an unknown property
Cart cart = JsonSerializer.Deserialize<Cart>(cookie)!;`;
  return (
    <>
      <p className="gate-note">
        A shop keeps the cart in a cookie as JSON. The cookie lives in the user's browser, so the user can edit it. Here's what the server does with it:
      </p>
      <Tabs
        tabs={[
          { id: "typed", label: "Type comes from the data" },
          { id: "fixed", label: "Type fixed in the code" },
        ]}
        value={mode}
        onChange={setMode}
      />
      <pre className="algo-code">{code}</pre>
      <div className="sql-presets">
        {PAYLOADS.map((x) => (
          <button key={x.id} className={x.id === payloadId ? "active" : ""} onClick={() => setPayloadId(x.id)}>
            {x.label}
          </button>
        ))}
      </div>
      <pre className="algo-code">{p.json}</pre>
      <p className={evil && mode === "typed" ? "constraint-fail" : "constraint-ok"}>
        {mode === "fixed"
          ? `Creates a Cart, always. The "$type" field is ignored${evil ? ", so the tampered cookie just produces an empty cart; validation then rejects it" : ""}.`
          : evil
            ? `Creates a ${p.type}, because the data asked for it. Its property setters run during deserialization, and this class happens to delete files when RunOnLoad is set. The attacker chose which code runs.`
            : `Creates a ${p.type}, as expected. The danger is that the next cookie gets to pick a different class.`}
      </p>
      <p className="gate-note">
        Deserialization turns bytes back into objects, and creating objects runs code: constructors, setters, and in Python, whatever a pickled object's{" "}
        <code>__reduce__</code> asks for. Real attacks chain together classes already present in common libraries (gadget chains), so you don't need a class as
        obviously dangerous as this one. The rules: never deserialize untrusted data into types it chooses, prefer plain data formats (JSON into fixed types),
        never use Python&apos;s <code>pickle</code> or .NET&apos;s <code>BinaryFormatter</code> on input from outside (BinaryFormatter is removed in .NET 9), and
        sign data you hand to clients if you need it back unchanged.
      </p>
    </>
  );
}

interface ConfigItem {
  id: string;
  text: string;
  problem: boolean;
  why: string;
}

const CONFIG: ConfigItem[] = [
  { id: "env", text: "ASPNETCORE_ENVIRONMENT=Development on the production server", problem: true, why: "Development mode shows the detailed exception page: stack traces, file paths, sometimes connection strings." },
  { id: "hsts", text: "Strict-Transport-Security: max-age=31536000", problem: false, why: "Good: HSTS tells browsers to use HTTPS only for this site for a year." },
  { id: "admin", text: "HMI web interface still has the factory admin / admin login", problem: true, why: "Default credentials are published in the manual and in scanning tools. Change them at install time." },
  { id: "listing", text: "Directory listing enabled on /uploads", problem: true, why: "Anyone can browse every uploaded file, including ones that were never linked." },
  { id: "tls", text: "TLS 1.2 and 1.3 only", problem: false, why: "Good: older SSL and TLS versions are disabled." },
  { id: "bucket", text: "Cloud storage bucket plant-reports allows public read", problem: true, why: "Public buckets are one of the most common causes of data leaks. Grant access to identities, not to everyone." },
  { id: "swagger", text: "Swagger UI with 'Try it out' published on the production internet address", problem: true, why: "It's a map and a test console for your API for anyone who finds it. Keep it internal or behind sign-in." },
  { id: "sql", text: "Firewall rule allows TCP 1433 (SQL Server) from 0.0.0.0/0", problem: true, why: "The database is open to the whole internet. Only the app servers should reach it." },
  { id: "cookies", text: "Session cookie: Secure; HttpOnly; SameSite=Lax", problem: false, why: "Good: HTTPS only, invisible to JavaScript (limits XSS damage), and not sent on cross-site POSTs (limits CSRF)." },
  { id: "cors", text: "CORS policy echoes back any Origin header and allows credentials", problem: true, why: "Any website can make authenticated requests to the API from a visitor's browser and read the answers." },
  { id: "logs", text: "Request logging strips Authorization headers and password fields", problem: false, why: "Good: logs are widely readable and kept for a long time, so secrets must never be in them." },
  { id: "sample", text: "The vendor's sample app is still deployed at /samples", problem: true, why: "Unused code is attack surface that nobody patches. Remove what you don't use." },
];

function MisconfigAudit() {
  const [flagged, setFlagged] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const problems = CONFIG.filter((c) => c.problem);
  const found = problems.filter((c) => flagged.includes(c.id)).length;
  const falseAlarms = CONFIG.filter((c) => !c.problem && flagged.includes(c.id)).length;
  return (
    <>
      <p className="gate-note">A pre-go-live review of a plant reporting app. Tick every line that's a security problem, then check your answers.</p>
      <ul className="sdi-points prep-tasks">
        {CONFIG.map((c) => (
          <li key={c.id}>
            <label>
              <input
                type="checkbox"
                checked={flagged.includes(c.id)}
                disabled={checked}
                onChange={(e) => setFlagged(e.target.checked ? [...flagged, c.id] : flagged.filter((x) => x !== c.id))}
              />
              <span>
                <span className="mono ns-small">{c.text}</span>
                {checked && (
                  <span className={`ns-small ${c.problem === flagged.includes(c.id) ? "constraint-ok" : "constraint-fail"}`}>
                    {" "}
                    {c.problem ? (flagged.includes(c.id) ? "Found. " : "Missed. ") : flagged.includes(c.id) ? "Not a problem. " : ""}
                    {c.why}
                  </span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <div className="darr-actions">
        {!checked ? (
          <button onClick={() => setChecked(true)}>Check my review</button>
        ) : (
          <button
            onClick={() => {
              setChecked(false);
              setFlagged([]);
            }}
          >
            Start again
          </button>
        )}
      </div>
      {checked && (
        <p className="drill-statement">
          You found {found} of {problems.length} problems{falseAlarms ? ` and flagged ${falseAlarms} good setting${falseAlarms === 1 ? "" : "s"}` : ""}.
        </p>
      )}
    </>
  );
}

const QUIZ: QuizItem[] = [
  {
    q: "Which is the safe way to read JSON a client sent back?",
    options: ["Let the JSON name its own .NET type with $type", "Deserialize into one fixed type, then validate the values", "Use BinaryFormatter, it's faster"],
    answer: 1,
    why: "The code, not the data, decides the type. Validation then checks the values make sense.",
  },
  {
    q: "Why is security misconfiguration so common?",
    options: ["Configuration is hard to read", "Every environment, server and cloud service has its own settings and defaults, and they drift unless they're defined in code and checked automatically", "Developers don't care"],
    answer: 1,
    why: "One forgotten setting on one server is enough. Infrastructure as code plus automated configuration scanning keeps environments consistent.",
  },
];

export function DeserializationMisconfig() {
  const [tab, setTab] = useState<"deser" | "misconfig">("deser");
  return (
    <div className="tool-widget">
      <Tabs
        tabs={[
          { id: "deser", label: "Insecure deserialization" },
          { id: "misconfig", label: "Find the misconfigurations" },
        ]}
        value={tab}
        onChange={setTab}
      />
      <div className="crypto-section">{tab === "deser" ? <Deserialization /> : <MisconfigAudit />}</div>
      <Quiz items={QUIZ} title="Check yourself" />
      <p className="gate-note">
        Both are entries in the <LessonLink id="sec-owasp-top-10">OWASP Top 10</LessonLink>: deserialization under Software and Data Integrity Failures,
        misconfiguration under its own name.
      </p>
    </div>
  );
}
