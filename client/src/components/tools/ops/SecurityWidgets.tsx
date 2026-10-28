import { useEffect, useMemo, useState } from "react";

// Simulators for the cryptography and web identity lessons: a toy RSA with numbers small
// enough to follow by hand, a Diffie-Hellman exchange, a real HS256 JWT signed and verified
// with the browser's Web Crypto API, and a CORS decision checker that follows the Fetch
// standard's rules for simple requests, preflights and credentials.

// ---- Toy RSA ---------------------------------------------------------------------------

const PRIMES = [5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61];

function gcd(a: bigint, b: bigint): bigint {
  while (b) [a, b] = [b, a % b];
  return a;
}

function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n;
  base %= mod;
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % mod;
    base = (base * base) % mod;
    exp >>= 1n;
  }
  return result;
}

// Extended Euclid: the d with e * d = 1 (mod m).
function modInverse(e: bigint, m: bigint): bigint {
  let [oldR, r] = [e, m];
  let [oldS, s] = [1n, 0n];
  while (r) {
    const q = oldR / r;
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  return ((oldS % m) + m) % m;
}

// A toy "hash" for the signature demo: real signatures hash the message with SHA-256 first.
function toyHash(text: string, n: bigint): bigint {
  let h = 0n;
  for (const ch of text) h = (h * 31n + BigInt(ch.codePointAt(0) ?? 0)) % n;
  return h;
}

export function ToyRsa() {
  const [p, setP] = useState(61);
  const [q, setQ] = useState(53);
  const [m, setM] = useState(65);
  const [text, setText] = useState("pay Bob 10");
  const [tampered, setTampered] = useState(false);

  const n = BigInt(p) * BigInt(q);
  const phi = BigInt(p - 1) * BigInt(q - 1);
  const e = [3n, 5n, 7n, 11n, 13n, 17n, 65537n].find((x) => x < phi && gcd(x, phi) === 1n) ?? 3n;
  const d = modInverse(e, phi);
  const msg = BigInt(Math.max(0, m)) % n;
  const c = modPow(msg, e, n);
  const back = modPow(c, d, n);
  const h = toyHash(text, n);
  const sig = modPow(h, d, n);
  const edited = text.replace(/\d+/, (x) => String(Number(x) * 100));
  const received = !tampered ? text : edited !== text ? edited : text + "!";
  const hReceived = toyHash(received, n);
  const check = modPow(sig, e, n);

  return (
    <div>
      <div className="sec-row">
        <label>
          p{" "}
          <select value={p} onChange={(ev) => setP(Number(ev.target.value))}>
            {PRIMES.filter((x) => x !== q).map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          q{" "}
          <select value={q} onChange={(ev) => setQ(Number(ev.target.value))}>
            {PRIMES.filter((x) => x !== p).map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
      </div>
      <ol className="dbw-steps">
        <li>
          <span className="dbw-who">1. Public modulus</span>n = p × q = {p} × {q} = <strong>{n.toString()}</strong>
        </li>
        <li>
          <span className="dbw-who">2. Totient (needs p and q, so it stays secret)</span>φ(n) = (p − 1)(q − 1) = {p - 1} × {q - 1} = {phi.toString()}
        </li>
        <li>
          <span className="dbw-who">3. Public exponent</span>e = {e.toString()}, the smallest of 3, 5, 7, 11, 13, 17, 65537 that shares no factor with {phi.toString()}
        </li>
        <li>
          <span className="dbw-who">4. Private exponent</span>d = {d.toString()}, because e × d = {(e * d).toString()} = {((e * d) / phi).toString()} × {phi.toString()} + 1
        </li>
      </ol>
      <p className="lt-p">
        Public key <code>(n = {n.toString()}, e = {e.toString()})</code>. Private key <code>d = {d.toString()}</code>.
      </p>
      <div className="dbw-lsm">
        <div className="dbw-box">
          <strong>Encrypt with the public key</strong>
          <label className="sec-row">
            message m{" "}
            <input type="number" min={0} value={m} onChange={(ev) => setM(Number(ev.target.value))} />
          </label>
          {BigInt(Math.max(0, m)) >= n && <p className="gate-note">m must be smaller than n; using m mod n = {msg.toString()}.</p>}
          <p className="lt-p">
            c = m<sup>e</sup> mod n = {msg.toString()}
            <sup>{e.toString()}</sup> mod {n.toString()} = <strong>{c.toString()}</strong>
          </p>
          <p className="lt-p">
            Decrypt: c<sup>d</sup> mod n = {c.toString()}
            <sup>{d.toString()}</sup> mod {n.toString()} = <strong>{back.toString()}</strong>
          </p>
        </div>
        <div className="dbw-box">
          <strong>Sign with the private key</strong>
          <label className="sec-row">
            text <input value={text} onChange={(ev) => setText(ev.target.value)} />
          </label>
          <p className="lt-p">
            hash(text) = {h.toString()}; signature s = hash<sup>d</sup> mod n = <strong>{sig.toString()}</strong>
          </p>
          <label className="sec-row sec-check">
            <input type="checkbox" checked={tampered} onChange={(ev) => setTampered(ev.target.checked)} /> someone changes the text in transit
          </label>
          <p className="lt-p">
            Receiver gets “{received}”: s<sup>e</sup> mod n = {check.toString()}, hash(received) = {hReceived.toString()}
          </p>
          <p className={`lt-p ${check === hReceived ? "ops-ok" : "ops-warn"}`}>
            {check === hReceived ? "Valid: only the private key could have produced this signature for this text." : "Invalid: the text no longer matches what was signed."}
          </p>
        </div>
      </div>
      <p className="gate-note">
        Real RSA uses primes of about 1,024 bits each, so n has over 600 digits and factoring it is out of reach. These numbers can be factored in your head, and real signatures hash with
        SHA-256 and pad the result; this toy hash just keeps the numbers small.
      </p>
    </div>
  );
}

// ---- Diffie-Hellman --------------------------------------------------------------------

export function DiffieHellman() {
  const [a, setA] = useState(6);
  const [b, setB] = useState(15);
  const p = 23n;
  const g = 5n;
  const A = modPow(g, BigInt(a), p);
  const B = modPow(g, BigInt(b), p);
  const sa = modPow(B, BigInt(a), p);
  const sb = modPow(A, BigInt(b), p);
  return (
    <div>
      <p className="lt-p">
        Public, agreed in the open: prime <code>p = 23</code> and generator <code>g = 5</code>.
      </p>
      <div className="dbw-lsm">
        <div className="dbw-box">
          <strong>Alice</strong>
          <label className="sec-row">
            secret a{" "}
            <input type="number" min={1} max={22} value={a} onChange={(ev) => setA(Math.min(22, Math.max(1, Number(ev.target.value))))} />
          </label>
          <p className="lt-p">
            sends A = g<sup>a</sup> mod p = 5<sup>{a}</sup> mod 23 = <strong>{A.toString()}</strong>
          </p>
          <p className="lt-p">
            computes B<sup>a</sup> mod p = {B.toString()}
            <sup>{a}</sup> mod 23 = <strong>{sa.toString()}</strong>
          </p>
        </div>
        <div className="dbw-box">
          <strong>Bob</strong>
          <label className="sec-row">
            secret b{" "}
            <input type="number" min={1} max={22} value={b} onChange={(ev) => setB(Math.min(22, Math.max(1, Number(ev.target.value))))} />
          </label>
          <p className="lt-p">
            sends B = g<sup>b</sup> mod p = 5<sup>{b}</sup> mod 23 = <strong>{B.toString()}</strong>
          </p>
          <p className="lt-p">
            computes A<sup>b</sup> mod p = {A.toString()}
            <sup>{b}</sup> mod 23 = <strong>{sb.toString()}</strong>
          </p>
        </div>
        <div className="dbw-box">
          <strong>Eve, listening</strong>
          <p className="lt-p">
            sees p = 23, g = 5, A = {A.toString()} and B = {B.toString()}. To get the shared secret she needs a or b, which means solving 5<sup>x</sup> mod 23 = {A.toString()}: the discrete
            logarithm. Easy for 23, infeasible for the 2,048-bit primes (or elliptic curves) real systems use.
          </p>
        </div>
      </div>
      <p className={`lt-p ${sa === sb ? "ops-ok" : "ops-warn"}`}>
        Both computed {sa.toString()} = g<sup>ab</sup> mod p without ever sending it. That number becomes the key for a fast symmetric cipher such as AES.
      </p>
    </div>
  );
}

// ---- JWT: build, decode, tamper, verify ------------------------------------------------

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const x of bytes) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const enc = new TextEncoder();

async function hmac(secret: string, data: string): Promise<string | null> {
  if (!globalThis.crypto?.subtle) return null;
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(data))));
}

const HEADER = '{"alg":"HS256","typ":"JWT"}';
const PAYLOAD = '{"sub":"1042","name":"Ada","role":"user","iat":1767225600,"exp":1767229200}';

export function JwtLab() {
  const [payload, setPayload] = useState(PAYLOAD);
  const [secret, setSecret] = useState("server-only-secret");
  const [forged, setForged] = useState(false);
  const [token, setToken] = useState<{ head: string; body: string; sig: string } | null>(null);
  const [check, setCheck] = useState<string | null>(null);
  const [noCrypto, setNoCrypto] = useState(false);

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(payload);
  } catch {
    parsed = null;
  }
  const forgedPayload = useMemo(() => {
    if (!parsed || typeof parsed !== "object") return payload;
    return JSON.stringify({ ...(parsed as Record<string, unknown>), role: "admin" });
  }, [parsed, payload]);

  useEffect(() => {
    let live = true;
    (async () => {
      const head = b64url(enc.encode(HEADER));
      const body = b64url(enc.encode(payload));
      const sig = await hmac(secret, `${head}.${body}`);
      if (!live) return;
      if (sig === null) {
        setNoCrypto(true);
        return;
      }
      const sent = { head, body: forged ? b64url(enc.encode(forgedPayload)) : body, sig };
      setToken(sent);
      const expected = await hmac(secret, `${sent.head}.${sent.body}`);
      if (live) setCheck(expected);
    })();
    return () => {
      live = false;
    };
  }, [payload, secret, forged, forgedPayload]);

  if (noCrypto) return <p className="gate-note">This browser has no Web Crypto API here (it needs HTTPS or localhost), so the token can't be signed.</p>;
  const valid = token !== null && check === token.sig;
  return (
    <div>
      <label className="sec-col">
        Payload (claims), JSON
        <textarea rows={3} value={payload} onChange={(ev) => setPayload(ev.target.value)} spellCheck={false} />
      </label>
      {parsed === null && <p className="ops-warn lt-p">That isn't valid JSON yet.</p>}
      <label className="sec-row">
        Server's signing secret <input value={secret} onChange={(ev) => setSecret(ev.target.value)} />
      </label>
      {token && (
        <p className="sec-token" aria-label="The token">
          <span className="sec-tok-head">{token.head}</span>.<span className="sec-tok-body">{token.body}</span>.<span className="sec-tok-sig">{token.sig}</span>
        </p>
      )}
      <p className="gate-note">
        Header (red), payload (purple), signature (blue). The first two are only base64url-encoded: anyone holding the token can read them, so never put secrets in a JWT.
      </p>
      <label className="sec-row sec-check">
        <input type="checkbox" checked={forged} onChange={(ev) => setForged(ev.target.checked)} />
        <span>
          attacker edits the payload to <code>"role":"admin"</code> and keeps the old signature
        </span>
      </label>
      <p className={`lt-p ${valid ? "ops-ok" : "ops-warn"}`}>
        {valid
          ? "Server recomputes HMAC-SHA256(secret, header.payload): it matches the signature, so the claims are trusted (next it must still check exp, iss and aud)."
          : "Server recomputes HMAC-SHA256(secret, header.payload): it does not match the signature, so the token is rejected. Without the secret, nobody can make a matching signature for edited claims."}
      </p>
    </div>
  );
}

// ---- CORS: does the browser let this page read the response? ---------------------------

type Origin = "https://app.example.com" | "https://evil.example" | "https://api.example.com";
type Acao = "(none)" | "*" | "https://app.example.com";
type AllowHeaders = "(none)" | "Content-Type" | "Content-Type, Authorization" | "*";
const METHODS = ["GET", "POST", "PUT", "DELETE"] as const;
const CONTENT_TYPES = ["(no body)", "text/plain", "application/x-www-form-urlencoded", "application/json"] as const;
const SAFE_TYPES = new Set(["(no body)", "text/plain", "application/x-www-form-urlencoded"]);

function Pick<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return (
    <label className="sec-col">
      {label}
      <select value={value} onChange={(ev) => onChange(ev.target.value as T)}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

export function CorsChecker() {
  const [origin, setOrigin] = useState<Origin>("https://app.example.com");
  const [method, setMethod] = useState<(typeof METHODS)[number]>("GET");
  const [ctype, setCtype] = useState<(typeof CONTENT_TYPES)[number]>("(no body)");
  const [auth, setAuth] = useState(false);
  const [creds, setCreds] = useState(false);
  const [acao, setAcao] = useState<Acao>("(none)");
  const [acac, setAcac] = useState(false);
  const [allowMethods, setAllowMethods] = useState("GET, POST");
  const [allowHeaders, setAllowHeaders] = useState<AllowHeaders>("(none)");

  const lines: { ok: boolean | null; text: string }[] = [];
  let readable: boolean;
  if (origin === "https://api.example.com") {
    lines.push({ ok: true, text: "The page and the API have the same origin (scheme, host and port), so CORS doesn't apply at all. The browser sends the request and the page reads the response." });
    readable = true;
  } else {
    const originOk = (wantCreds: boolean) => (acao === "*" ? !wantCreds : acao === origin);
    const credsOk = !creds || acac;
    const simple = (method === "GET" || method === "POST") && SAFE_TYPES.has(ctype) && !auth;
    let sent = true;
    if (simple) {
      lines.push({ ok: null, text: `Simple request (${method}, a safelisted Content-Type, no custom headers): no preflight. The browser sends it straight away with Origin: ${origin}.` });
    } else {
      const reasons = [
        method === "PUT" || method === "DELETE" ? `method ${method}` : "",
        !SAFE_TYPES.has(ctype) ? `Content-Type ${ctype}` : "",
        auth ? "an Authorization header" : "",
      ].filter(Boolean);
      lines.push({ ok: null, text: `Not a simple request (${reasons.join(", ")}), so the browser first sends a preflight: OPTIONS with Access-Control-Request-Method: ${method}${auth || !SAFE_TYPES.has(ctype) ? " and Access-Control-Request-Headers" : ""}.` });
      const methodsList = allowMethods.split(",").map((s) => s.trim().toUpperCase());
      const methodOk = method === "GET" || method === "POST" || methodsList.includes(method) || (methodsList.includes("*") && !creds);
      const needHeaders = [!SAFE_TYPES.has(ctype) ? "content-type" : "", auth ? "authorization" : ""].filter(Boolean);
      const allowed = allowHeaders === "(none)" ? [] : allowHeaders.toLowerCase().split(",").map((s) => s.trim());
      const headerOk = needHeaders.every((h) => allowed.includes(h) || (allowed.includes("*") && !creds && h !== "authorization"));
      const preflightOk = originOk(creds) && credsOk && methodOk && headerOk;
      if (!originOk(creds)) lines.push({ ok: false, text: acao === "*" && creds ? "Preflight fails: Access-Control-Allow-Origin: * is not allowed on a request with credentials." : acao === "(none)" ? "Preflight fails: the response has no Access-Control-Allow-Origin header." : `Preflight fails: Access-Control-Allow-Origin is ${acao}, not ${origin}.` });
      else if (!credsOk) lines.push({ ok: false, text: "Preflight fails: the request includes credentials but the server doesn't send Access-Control-Allow-Credentials: true." });
      else if (!methodOk) lines.push({ ok: false, text: `Preflight fails: ${method} is not in Access-Control-Allow-Methods (${allowMethods || "empty"}).` });
      else if (!headerOk)
        lines.push({
          ok: false,
          text: `Preflight fails: Access-Control-Allow-Headers must list ${needHeaders.join(" and ")}.${auth && allowHeaders === "*" ? " The wildcard never covers Authorization." : ""}`,
        });
      else lines.push({ ok: true, text: "Preflight passes, so the browser sends the real request." });
      sent = preflightOk;
    }
    if (sent) {
      readable = originOk(creds) && credsOk;
      lines.push(
        readable
          ? { ok: true, text: "The response's CORS headers allow this origin, so the page's JavaScript can read it." }
          : {
              ok: false,
              text: `The server received and ran the request, but the browser hides the response from the page (${acao === "*" && creds ? "a wildcard origin can't be used with credentials" : !credsOk ? "credentials without Access-Control-Allow-Credentials: true" : acao === "(none)" ? "no Access-Control-Allow-Origin header" : "Access-Control-Allow-Origin doesn't match"}). CORS protects reads, not the server: this is why CSRF defences are still needed.`,
            },
      );
    } else {
      readable = false;
      lines.push({ ok: false, text: "The real request is never sent. The page sees a network error." });
    }
  }

  return (
    <div>
      <p className="lt-p">
        A page wants to call <code>https://api.example.com/orders</code> with <code>fetch</code>.
      </p>
      <div className="dbw-lsm">
        <div className="dbw-box sec-form">
          <strong>The request (browser side)</strong>
          <Pick label="Page origin" value={origin} options={["https://app.example.com", "https://evil.example", "https://api.example.com"] as const} onChange={setOrigin} />
          <Pick label="Method" value={method} options={METHODS} onChange={setMethod} />
          <Pick label="Content-Type" value={ctype} options={CONTENT_TYPES} onChange={setCtype} />
          <label className="sec-row sec-check">
            <input type="checkbox" checked={auth} onChange={(ev) => setAuth(ev.target.checked)} /> Authorization: Bearer header
          </label>
          <label className="sec-row sec-check">
            <input type="checkbox" checked={creds} onChange={(ev) => setCreds(ev.target.checked)} /> credentials: "include" (send cookies)
          </label>
        </div>
        <div className="dbw-box sec-form">
          <strong>The API's response headers</strong>
          <Pick label="Access-Control-Allow-Origin" value={acao} options={["(none)", "*", "https://app.example.com"] as const} onChange={setAcao} />
          <label className="sec-row sec-check">
            <input type="checkbox" checked={acac} onChange={(ev) => setAcac(ev.target.checked)} /> Access-Control-Allow-Credentials: true
          </label>
          <label className="sec-col">
            Access-Control-Allow-Methods
            <input value={allowMethods} onChange={(ev) => setAllowMethods(ev.target.value)} />
          </label>
          <Pick label="Access-Control-Allow-Headers" value={allowHeaders} options={["(none)", "Content-Type", "Content-Type, Authorization", "*"] as const} onChange={setAllowHeaders} />
        </div>
      </div>
      <ol className="dbw-steps">
        {lines.map((l, i) => (
          <li key={i} className={l.ok === null ? "" : l.ok ? "dbw-step-a" : "dbw-step-b"}>
            {l.text}
          </li>
        ))}
      </ol>
      <p className={`lt-p dbw-verdict ${readable ? "ops-ok" : "ops-warn"}`}>
        <strong>{readable ? "The page can read the response." : "The page can't read the response."}</strong>
      </p>
    </div>
  );
}
