import { useState } from "react";
import { LessonLink, Quiz, type QuizItem } from "./netSecShared";

// Part 1: classify changes as safe or breaking. Part 2: an old client (written against v1)
// reads the response after a server change, with a strict and a tolerant deserializer, with or
// without the server pinning old clients to v1. Part 3: three error responses graded against a
// checklist. All outcomes are hand-written, not computed.

const SAFE = "Safe";
const BREAKING = "Breaking";
const CARELESS = "Breaks only careless clients";
const OPTS = [SAFE, BREAKING, CARELESS];

const CHANGES: QuizItem[] = [
  { q: "Add a new endpoint, GET /photos/{id}/likes.", options: OPTS, answer: 0, why: "Nothing that exists changes. Old clients never call it." },
  {
    q: "Add a field \"location\" to the photo response.",
    options: OPTS,
    answer: 2,
    why: "Additive, so safe for tolerant readers, which is what you should require. A client whose deserializer rejects unknown properties will break; document that clients must ignore unknown fields.",
  },
  { q: "Rename \"caption\" to \"text\" in the response.", options: OPTS, answer: 1, why: "Every client reading caption now gets nothing. Add text alongside caption, migrate, and remove caption only in a new version (expand and contract)." },
  { q: "Change \"id\" from the number 8812 to the string \"ph_8812\".", options: OPTS, answer: 1, why: "A type change breaks typed clients outright. This is why many APIs return ids as opaque strings from day one." },
  { q: "Add an optional query parameter ?since= with no default filtering.", options: OPTS, answer: 0, why: "Old requests don't send it and get exactly the old behaviour." },
  { q: "Make the request field \"alt_text\" required on POST /photos.", options: OPTS, answer: 1, why: "Every old client that doesn't send it now gets a 4xx. New required input needs a new version, or a default." },
  {
    q: "Add \"archived\" as a new value of the photo's status enum.",
    options: OPTS,
    answer: 2,
    why: "Clients with an exhaustive switch that throws on unknown values break; tolerant clients map it to \"other\". Say in the docs that enums may grow, and Protocol Buffers enums should keep an UNSPECIFIED value 0.",
  },
  { q: "Change the default page size from 50 to 20.", options: OPTS, answer: 1, why: "No field changed, but clients that assumed one call returns up to 50 now silently miss items. Behaviour is part of the contract (Hyrum's law)." },
  { q: "Start rejecting captions longer than 2,200 characters, which used to be accepted.", options: OPTS, answer: 1, why: "Tightening validation turns requests that used to succeed into errors. Loosening validation (accepting more) is the safe direction." },
  { q: "Return prices in cents (4000) instead of dollars (40.00), same field name.", options: OPTS, answer: 1, why: "The worst kind: same name, same type, different meaning. Nothing fails loudly; every old client is now off by a factor of 100. Use a new field." },
];

type Change = "addField" | "rename" | "typeChange" | "enumValue" | "removeField";

const V1 = `{
  "id": 8812,
  "caption": "Sunset at the pier",
  "like_count": 41,
  "status": "published"
}`;

const AFTER: Record<Change, { label: string; json: string; strict: [boolean, string]; tolerant: [boolean, string] }> = {
  addField: {
    label: "Add \"location\"",
    json: `{
  "id": 8812,
  "caption": "Sunset at the pier",
  "like_count": 41,
  "status": "published",
  "location": "Brighton"      <- new
}`,
    strict: [false, "JsonException: unknown property 'location'. The app shows an error screen for every photo."],
    tolerant: [true, "Ignores location, shows the photo as before."],
  },
  rename: {
    label: "Rename caption to text",
    json: `{
  "id": 8812,
  "text": "Sunset at the pier",  <- was caption
  "like_count": 41,
  "status": "published"
}`,
    strict: [false, "JsonException: required property 'caption' missing, unknown property 'text'."],
    tolerant: [false, "No crash, but every caption is now blank. A tolerant reader can't save you from a rename: it's still broken, just quietly."],
  },
  typeChange: {
    label: "id becomes a string",
    json: `{
  "id": "ph_8812",              <- was 8812
  "caption": "Sunset at the pier",
  "like_count": 41,
  "status": "published"
}`,
    strict: [false, "JsonException: cannot convert \"ph_8812\" to Int64."],
    tolerant: [false, "Reads id as 0 (or NaN), so tapping a photo opens /photos/0. Type changes break everyone."],
  },
  enumValue: {
    label: "New status \"archived\"",
    json: `{
  "id": 8812,
  "caption": "Sunset at the pier",
  "like_count": 41,
  "status": "archived"          <- new value
}`,
    strict: [false, "ArgumentException: unknown PhotoStatus 'archived' (the switch has no default)."],
    tolerant: [true, "Maps the unknown status to Other and shows the photo with no badge."],
  },
  removeField: {
    label: "Remove like_count",
    json: `{
  "id": 8812,
  "caption": "Sunset at the pier",
  "status": "published"
}`,
    strict: [false, "JsonException: required property 'like_count' missing."],
    tolerant: [false, "Shows 0 likes on every photo. Removing a field is breaking, whatever the client does."],
  },
};

function OldClient() {
  const [change, setChange] = useState<Change>("addField");
  const [pinned, setPinned] = useState(false);
  const c = AFTER[change];
  const outcome = (r: [boolean, string]): [boolean, string] => (pinned ? [true, "Gets the v1 shape it was written for and works."] : r);
  const strict = outcome(c.strict);
  const tolerant = outcome(c.tolerant);
  return (
    <div className="crypto-section">
      <h3>Part 2: an old app reads the new response</h3>
      <p className="gate-note">The app was written against v1. Pick a server change and see what two versions of the app do with it.</p>
      <div className="sql-presets">
        {(Object.keys(AFTER) as Change[]).map((k) => (
          <button key={k} className={k === change ? "active" : ""} onClick={() => setChange(k)}>
            {AFTER[k].label}
          </button>
        ))}
      </div>
      <label className="tool-checkbox">
        <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} /> Ship the change as v2; old clients stay pinned to v1
      </label>
      <div className="api-cols">
        <div>
          <span className="readout-label">v1 response (what the app expects)</span>
          <pre className="algo-code api-http">{V1}</pre>
        </div>
        <div>
          <span className="readout-label">{pinned ? "v1 response (still served to old clients)" : "Response after the change"}</span>
          <pre className="algo-code api-http">{pinned ? V1 : c.json}</pre>
        </div>
      </div>
      <table className="bigo-table api-table">
        <tbody>
          <tr>
            <td>Strict client (rejects unknown fields, exhaustive enums)</td>
            <td className={strict[0] ? "api-yes" : "api-no"}>{strict[1]}</td>
          </tr>
          <tr>
            <td>Tolerant reader (ignores unknown fields, unknown enum = Other)</td>
            <td className={tolerant[0] ? "api-yes" : "api-no"}>{tolerant[1]}</td>
          </tr>
        </tbody>
      </table>
      <p className="gate-note">
        {pinned
          ? "Versioning keeps old clients working while new ones get the new shape. The price is running both until the old version's traffic is gone: send Deprecation and Sunset headers and watch who still calls v1."
          : "Tolerant readers make additive changes safe. Renames, removals and type changes break every client, which is what versions (or expand and contract) are for."}
      </p>
    </div>
  );
}

type ErrStyle = "ok200" | "adhoc" | "problem";

const ERRORS: Record<ErrStyle, { label: string; text: string; checks: boolean[] }> = {
  ok200: {
    label: "200 with an error inside",
    text: `HTTP/1.1 200 OK
Content-Type: application/json

{"success": false, "error": "Something went wrong"}`,
    checks: [false, false, false, false, true],
  },
  adhoc: {
    label: "Ad hoc 500",
    text: `HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{"error": "SqlException: Cannot insert NULL into column
 'alt_text', table 'prod.dbo.Photos' at PhotoRepo.cs:88"}`,
    checks: [false, false, false, false, false],
  },
  problem: {
    label: "Problem Details (RFC 9457)",
    text: `HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json

{
  "type": "https://api.example.com/errors/validation",
  "title": "The photo has invalid fields.",
  "status": 422,
  "detail": "alt_text is required for public photos.",
  "instance": "/v2/photos",
  "request_id": "req_7Hc2Qx",
  "errors": [
    { "field": "alt_text", "code": "required" }
  ]
}`,
    checks: [true, true, true, true, true],
  },
};

const CHECKS = [
  "Status code matches the outcome (a client error is 4xx)",
  "Stable machine-readable code or type to branch on",
  "Points at the field that was wrong",
  "Request id for support and log search",
  "Leaks no internals (SQL, stack traces, hostnames)",
];

function ErrorFormats() {
  const [style, setStyle] = useState<ErrStyle>("ok200");
  const e = ERRORS[style];
  return (
    <div className="crypto-section">
      <h3>Part 3: the same validation error, three ways</h3>
      <div className="sql-presets">
        {(Object.keys(ERRORS) as ErrStyle[]).map((k) => (
          <button key={k} className={k === style ? "active" : ""} onClick={() => setStyle(k)}>
            {ERRORS[k].label}
          </button>
        ))}
      </div>
      <pre className="algo-code api-http">{e.text}</pre>
      <ul className="api-checks">
        {CHECKS.map((c, i) => (
          <li key={c} className={e.checks[i] ? "constraint-ok" : "constraint-fail"}>
            {e.checks[i] ? "Yes: " : "No: "}
            {c}
          </li>
        ))}
      </ul>
      <p className="gate-note">
        {style === "ok200"
          ? "Retries, dashboards and client libraries all count this as a success, and the only way to react is to parse an English sentence."
          : style === "adhoc"
            ? "Blames the server for the client's mistake (so clients may retry it forever), gives nothing to branch on, and hands an attacker the table name and source file."
            : "The status says whose fault it is, type and errors[].code are stable values a program can branch on, detail is for humans and can be reworded freely, and request_id ties the report to the logs."}
      </p>
    </div>
  );
}

export function ApiEvolution() {
  return (
    <div className="tool-widget">
      <Quiz title="Part 1: safe or breaking?" items={CHANGES} />
      <OldClient />
      <ErrorFormats />
      <p className="gate-note">
        Related: <LessonLink id="sd-api-rest-http">REST Resources and HTTP Semantics</LessonLink> ·{" "}
        <LessonLink id="sd-api-styles">REST vs gRPC vs GraphQL</LessonLink>
      </p>
    </div>
  );
}
