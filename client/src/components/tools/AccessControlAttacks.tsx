import { useState } from "react";
import { classify, ipToString, parseIp } from "../../netMath";
import { LessonLink, Quiz, Tabs, type QuizItem } from "./netSecShared";

// Three access-control failures, each as a simulated request with the defence you can switch on:
// IDOR (changing an ID), CSRF (another site submitting a form with your cookie) and SSRF (making
// the server fetch an internal URL). Nothing here is sent anywhere.

type Tab = "idor" | "csrf" | "ssrf";

const INVOICES: Record<number, { customer: string; total: string }> = {
  1043: { customer: "ava@conperio.com", total: "€1,240.00" },
  1044: { customer: "ben@supplier.example", total: "€88,310.50" },
  1045: { customer: "ava@conperio.com", total: "€310.00" },
};

function Idor() {
  const [id, setId] = useState(1043);
  const [checkOwner, setCheckOwner] = useState(false);
  const [checkRole, setCheckRole] = useState(false);
  const [admin, setAdmin] = useState(false);
  const inv = INVOICES[id];
  let status = "200 OK";
  let body: string;
  let bad = false;
  if (!inv) {
    status = "404 Not Found";
    body = "{}";
  } else if (checkOwner && inv.customer !== "ava@conperio.com") {
    status = "404 Not Found";
    body = '{ "error": "not found" }';
  } else {
    body = JSON.stringify({ id, customer: inv.customer, total: inv.total }, null, 2);
    bad = inv.customer !== "ava@conperio.com";
  }
  const refundOk = !checkRole;
  return (
    <>
      <p className="gate-note">You are signed in as ava@conperio.com. Your invoices are 1043 and 1045.</p>
      <div className="tool-inputs">
        <label>
          GET /api/invoices/
          <input type="number" value={id} onChange={(e) => setId(Number(e.target.value) || 0)} />
        </label>
      </div>
      <label className="tool-checkbox">
        <input type="checkbox" checked={checkOwner} onChange={(e) => setCheckOwner(e.target.checked)} /> Server checks the invoice belongs to the signed-in
        customer
      </label>
      <pre className={`algo-code ${bad ? "ns-bad-box" : ""}`}>
        HTTP/1.1 {status}
        {"\n"}
        {body}
      </pre>
      {bad && (
        <p className="constraint-fail">
          Another customer's invoice. This is IDOR (insecure direct object reference): the ID was guessable and nothing checked ownership.
        </p>
      )}
      {checkOwner && inv && inv.customer !== "ava@conperio.com" && (
        <p className="constraint-ok">Blocked. Answering 404 rather than 403 also avoids confirming that invoice {id} exists.</p>
      )}

      <h3>The hidden admin button</h3>
      <p className="gate-note">The page only shows the Refund button to admins. Ava opens the browser's developer tools and sends the request herself.</p>
      <label className="tool-checkbox">
        <input type="checkbox" checked={checkRole} onChange={(e) => setCheckRole(e.target.checked)} /> Server checks the caller has the admin role
      </label>
      <div className="darr-actions">
        <button onClick={() => setAdmin(true)}>POST /api/admin/refund {"{ invoice: 1044 }"}</button>
      </div>
      {admin && (
        <p className={refundOk ? "constraint-fail" : "constraint-ok"}>
          {refundOk
            ? "200 OK: refund issued. Hiding a button is not access control; the API trusted whoever called it."
            : "403 Forbidden: the server checked the role. The UI can hide buttons for convenience, but only the server can enforce."}
        </p>
      )}
    </>
  );
}

function Csrf() {
  const [sameSite, setSameSite] = useState<"None" | "Lax">("None");
  const [token, setToken] = useState(false);
  const [sent, setSent] = useState(false);
  const cookieSent = sameSite === "None";
  const outcome = !cookieSent
    ? { ok: true, text: "The browser didn't attach the session cookie to a cross-site POST (SameSite=Lax), so the portal saw an anonymous request: 401 Unauthorized." }
    : token
      ? { ok: true, text: "The cookie went along, but the form had no CSRF token (the other site can't read it from your page), so the portal refused: 403 Forbidden." }
      : { ok: false, text: "The cookie went along and nothing else was checked. The notification email is now the attacker's: 200 OK." };
  return (
    <>
      <p className="gate-note">
        You're signed in to the plant portal in one tab. In another you open a page someone emailed you. It contains this, which submits itself as soon as it loads:
      </p>
      <pre className="algo-code">{`<form action="https://portal.example.net/settings/notify" method="POST">
  <input name="email" value="attacker@evil.example">
</form>
<script>document.forms[0].submit()</script>`}</pre>
      <label className="tool-checkbox">
        <input type="checkbox" checked={sameSite === "Lax"} onChange={(e) => setSameSite(e.target.checked ? "Lax" : "None")} /> Session cookie has
        SameSite=Lax
      </label>
      <label className="tool-checkbox">
        <input type="checkbox" checked={token} onChange={(e) => setToken(e.target.checked)} /> Portal requires an anti-CSRF token in every form
      </label>
      <div className="darr-actions">
        <button onClick={() => setSent(true)}>Open the email's link</button>
      </div>
      {sent && (
        <ol className="auth-stages">
          <li className="auth-stage">
            <span className="auth-icon">1</span>
            <div>
              <p>
                The browser POSTs to portal.example.net. Cookie: {cookieSent ? "session=8f3c… (sent, SameSite=None allows it from any site)" : "(not sent: SameSite=Lax cookies stay off cross-site POSTs)"}
              </p>
            </div>
          </li>
          <li className={`auth-stage ${outcome.ok ? "auth-pass" : "auth-fail"}`}>
            <span className="auth-icon">{outcome.ok ? "✓" : "✗"}</span>
            <div>
              <p>{outcome.text}</p>
            </div>
          </li>
        </ol>
      )}
      <p className="gate-note">
        CSRF (cross-site request forgery) works because browsers attach cookies to requests no matter which site started them. Chromium-based browsers (Chrome, Edge)
        treat cookies without a SameSite attribute as Lax by default; Firefox and Safari don't. So always set SameSite explicitly and use tokens too: frameworks like ASP.NET Core do it for you with antiforgery
        tokens. APIs that take a bearer token in a header instead of a cookie aren't exposed this way.
      </p>
    </>
  );
}

// Pretend DNS for the SSRF demo.
const DNS: Record<string, string> = {
  "news.example.com": "203.0.113.80",
  localhost: "127.0.0.1",
  "metadata.attacker.example": "169.254.169.254",
};

const SSRF_PRESETS = [
  "https://news.example.com/article/42",
  "http://169.254.169.254/latest/meta-data/iam/security-credentials/",
  "http://localhost:8080/admin",
  "http://10.10.5.20/hr/salaries.csv",
  "http://2130706433/admin",
  "http://metadata.attacker.example/latest/meta-data/",
];

type Defence = "none" | "string" | "resolve";

function resolveHost(host: string): string | null {
  if (/^\d+$/.test(host)) {
    const n = Number(host);
    return n <= 0xffffffff ? ipToString(n) : null; // a whole address written as one decimal number
  }
  if (parseIp(host) !== null) return host;
  return DNS[host] ?? null;
}

function Ssrf() {
  const [url, setUrl] = useState(SSRF_PRESETS[1]);
  const [defence, setDefence] = useState<Defence>("none");
  // Read the host as typed: the browser's URL parser would already turn 2130706433 into
  // 127.0.0.1, but a naive server-side filter sees the raw text.
  const host = (/^[a-z]+:\/\/([^/:?#]+)/i.exec(url.trim())?.[1] ?? "").toLowerCase();
  const ip = host ? resolveHost(host) : null;
  const kind = ip ? classify(parseIp(ip)!) : null;
  const internal = kind !== null && kind.kind !== "public" && kind.kind !== "documentation";
  const naiveBlocked = /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host);
  const blocked = defence === "string" ? naiveBlocked : defence === "resolve" ? internal : false;
  let result: { ok: boolean; text: string };
  if (!host || !ip) result = { ok: true, text: "The server couldn't resolve that host, so nothing was fetched." };
  else if (blocked)
    result = { ok: true, text: defence === "resolve" ? `Blocked: ${host} resolves to ${ip}, which is ${kind!.label.toLowerCase()}.` : `Blocked by the hostname filter.` };
  else if (internal)
    result = {
      ok: false,
      text: `The server fetched ${ip} (${kind!.label.toLowerCase()}) from inside the network and returned the response to the user.${
        ip === "169.254.169.254" ? " On a cloud VM that address is the instance metadata service, which can hand out the server's own cloud credentials." : ""
      }${defence === "string" ? " The hostname filter looked at the text, not at where it actually goes." : ""}`,
    };
  else result = { ok: true, text: `A normal external page (${ip}). The preview works as intended.` };

  return (
    <>
      <p className="gate-note">The portal has a &quot;paste a link, get a preview&quot; feature. The server fetches whatever URL you give it.</p>
      <div className="sql-presets">
        {SSRF_PRESETS.map((p) => (
          <button key={p} className={p === url ? "active" : ""} onClick={() => setUrl(p)}>
            {/^[a-z]+:\/\/([^/:?#]+)/i.exec(p)![1]}
          </button>
        ))}
      </div>
      <div className="tool-single-input ns-wide-input">
        URL
        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} aria-label="URL to preview" />
      </div>
      <Tabs
        tabs={[
          { id: "none", label: "No defence" },
          { id: "string", label: "Block suspicious hostnames (text check)" },
          { id: "resolve", label: "Resolve, then block internal IPs" },
        ]}
        value={defence}
        onChange={(d) => setDefence(d as Defence)}
      />
      <p className={result.ok ? "constraint-ok" : "constraint-fail"}>{result.text}</p>
      <p className="gate-note">
        2130706433 is 127.0.0.1 written as one number (127 × 2^24 + 1), and metadata.attacker.example is a name the attacker pointed at 169.254.169.254. Both slip
        past a text filter. The real fix resolves the name, checks the actual IP against private, loopback and link-local ranges (see{" "}
        <LessonLink id="net-subnetting-practice">Subnetting Practice</LessonLink> for the ranges), connects to that same IP, refuses redirects to anywhere new,
        and best of all only allows a list of known destinations.
      </p>
    </>
  );
}

const QUIZ: QuizItem[] = [
  {
    q: "Where must authorization checks happen?",
    options: ["In the UI, by hiding what users can't use", "On the server, for every request and every object", "In the database only"],
    answer: 1,
    why: "Anything in the browser can be changed or bypassed. The server is the only place you control.",
  },
  {
    q: "Why does CSRF work at all?",
    options: ["Browsers attach cookies to a site's requests even when another site triggered them", "The attacker steals the cookie", "HTTPS is broken"],
    answer: 0,
    why: "The attacker never sees the cookie; they just get your browser to send a request that carries it. SameSite cookies and anti-CSRF tokens break that.",
  },
  {
    q: "What makes SSRF dangerous in the cloud?",
    options: ["Cloud servers are slower", "The server can reach internal services, including the metadata endpoint that hands out its credentials", "It only affects old browsers"],
    answer: 1,
    why: "The server sits inside the network with access the attacker doesn't have. AWS's IMDSv2, which requires a token obtained with a PUT request, exists largely because of SSRF.",
  },
];

export function AccessControlAttacks() {
  const [tab, setTab] = useState<Tab>("idor");
  return (
    <div className="tool-widget">
      <Tabs
        tabs={[
          { id: "idor", label: "IDOR and missing checks" },
          { id: "csrf", label: "CSRF" },
          { id: "ssrf", label: "SSRF" },
        ]}
        value={tab}
        onChange={setTab}
      />
      <div className="crypto-section">
        {tab === "idor" && <Idor />}
        {tab === "csrf" && <Csrf />}
        {tab === "ssrf" && <Ssrf />}
      </div>
      <Quiz items={QUIZ} title="Check yourself" />
    </div>
  );
}
