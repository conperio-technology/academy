import { useEffect, useState } from "react";

// Everything here is the browser's real Web Crypto API -- the same SHA-256, AES-GCM and
// PBKDF2 a production system would call. Web Crypto only exists in a "secure context"
// (https://, or http://localhost), so opening the app over plain http on the LAN hides it.
const subtle: SubtleCrypto | undefined = globalThis.crypto?.subtle;

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
}

function toBase64(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

async function sha256(text: string) {
  return toHex(await subtle!.digest("SHA-256", encoder.encode(text)));
}

function bitsDifferent(hexA: string, hexB: string) {
  let count = 0;
  for (let i = 0; i < hexA.length; i++) {
    let x = parseInt(hexA[i], 16) ^ parseInt(hexB[i], 16);
    while (x) {
      count += x & 1;
      x >>= 1;
    }
  }
  return count;
}

async function pbkdf2(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number) {
  const key = await subtle!.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  return toHex(await subtle!.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256));
}

// ---- 1. Hashing ------------------------------------------------------------------------

function HashSection() {
  const [a, setA] = useState("Conperio Academy");
  const [b, setB] = useState("Conperio academy");
  const [hashA, setHashA] = useState("");
  const [hashB, setHashB] = useState("");

  useEffect(() => {
    sha256(a).then(setHashA);
  }, [a]);
  useEffect(() => {
    sha256(b).then(setHashB);
  }, [b]);

  return (
    <div className="crypto-section">
      <h3>1. Hashing: a fingerprint, one way only</h3>
      <label className="crypto-field">
        Input A
        <input value={a} onChange={(e) => setA(e.target.value)} />
      </label>
      <code className="sql-snippet">SHA-256: {hashA}</code>
      <label className="crypto-field">
        Input B
        <input value={b} onChange={(e) => setB(e.target.value)} />
      </label>
      <code className="sql-snippet">SHA-256: {hashB}</code>
      {hashA && hashB && (
        <p className="gate-note">
          {a === b
            ? "Same input, same hash -- every time, on every machine."
            : `One small change flipped ${bitsDifferent(hashA, hashB)} of the 256 bits. There's no way to work backwards from a hash to the input, and no way to nudge an input toward a hash you want.`}
        </p>
      )}
    </div>
  );
}

// ---- 2. Encryption ---------------------------------------------------------------------

function EncryptSection() {
  const [message, setMessage] = useState("Payroll file: Q3 bonuses attached");
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [cipher, setCipher] = useState<{ iv: Uint8Array<ArrayBuffer>; data: ArrayBuffer } | null>(null);
  const [output, setOutput] = useState<string | null>(null);

  useEffect(() => {
    subtle!.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]).then((k) => setKey(k as CryptoKey));
  }, []);

  async function encrypt() {
    if (!key) return;
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = await subtle!.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(message));
    setCipher({ iv, data });
    setOutput(null);
  }

  async function decrypt(withKey: CryptoKey) {
    if (!cipher) return;
    try {
      const plain = await subtle!.decrypt({ name: "AES-GCM", iv: cipher.iv }, withKey, cipher.data);
      setOutput(`✓ Decrypted: "${new TextDecoder().decode(plain)}"`);
    } catch {
      setOutput("✗ Decryption failed: wrong key. Without the right key, the ciphertext is useless.");
    }
  }

  async function decryptWithWrongKey() {
    const other = (await subtle!.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"])) as CryptoKey;
    await decrypt(other);
  }

  return (
    <div className="crypto-section">
      <h3>2. Encryption: locked, but reversible with the key</h3>
      <label className="crypto-field">
        Message
        <input value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>
      <div className="darr-actions">
        <button onClick={encrypt} disabled={!key}>
          🔒 Encrypt (AES-256-GCM)
        </button>
        <button onClick={() => key && decrypt(key)} disabled={!cipher}>
          🔓 Decrypt with the key
        </button>
        <button onClick={decryptWithWrongKey} disabled={!cipher}>
          Decrypt with a different key
        </button>
      </div>
      {cipher && <code className="sql-snippet">Ciphertext: {toBase64(cipher.data)}</code>}
      {output && <p className={output.startsWith("✓") ? "constraint-ok" : "constraint-fail"}>{output}</p>}
    </div>
  );
}

// ---- 3. Storing passwords --------------------------------------------------------------

const USERS = [
  { name: "ava", password: "Summer2024!" },
  { name: "ben", password: "password123" },
  { name: "cara", password: "password123" },
  { name: "dev", password: "k7#qPz!x9Lw2" },
];

// The attacker's precomputed table: hashes of the most common passwords. Real ones have
// billions of entries.
const COMMON_PASSWORDS = ["123456", "password", "password123", "qwerty", "Summer2024!", "letmein", "admin"];

type Mode = "plain" | "sha256" | "pbkdf2";

// OWASP's current PBKDF2-HMAC-SHA256 recommendation (it prefers Argon2id where available).
const ITERATIONS = 600_000;

function PasswordSection() {
  const [mode, setMode] = useState<Mode>("plain");
  const [rows, setRows] = useState<{ name: string; stored: string; cracked: string | null }[]>([]);
  const [timing, setTiming] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setTiming(null);
      if (mode === "plain") {
        setRows(USERS.map((u) => ({ name: u.name, stored: u.password, cracked: u.password })));
        return;
      }
      if (mode === "sha256") {
        const lookup = new Map<string, string>();
        for (const p of COMMON_PASSWORDS) lookup.set(await sha256(p), p);
        const result = [];
        for (const u of USERS) {
          const h = await sha256(u.password);
          result.push({ name: u.name, stored: h, cracked: lookup.get(h) ?? null });
        }
        if (!cancelled) setRows(result);
        return;
      }
      const result = [];
      let elapsed = 0;
      for (const u of USERS) {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const start = performance.now();
        const h = await pbkdf2(u.password, salt, ITERATIONS);
        elapsed += performance.now() - start;
        result.push({ name: u.name, stored: `${toHex(salt.buffer as ArrayBuffer).slice(0, 12)}…$${h}`, cracked: null });
      }
      if (cancelled) return;
      setRows(result);
      const perGuess = elapsed / USERS.length;
      // The browser figure is one single-threaded WebCrypto call. Attackers use GPUs: hashcat's
      // RTX 4090 benchmark (mode 10900, PBKDF2-HMAC-SHA256) is ~8.8 MH/s at 999 iterations, so
      // ~15,000 guesses/s at 600,000 (https://gist.github.com/Chick3nman/32e662a5bb63bc4f51b847bb422222fd).
      setTiming(
        `Each hash took about ${perGuess.toFixed(0)} ms here, on a single browser thread. That's nothing for one login, ` +
          `but it is not what an attacker sees: a single modern GPU runs this same hash over ten thousand times a second, ` +
          `so a million guesses against one account takes about a minute, not hours. The slow hash still helps, because it ` +
          `multiplies the attacker's cost per guess: every guess costs ${ITERATIONS.toLocaleString()} rounds instead of one ` +
          `(hundreds of thousands of times slower than plain SHA-256), and the per-user salt means that cost is paid again for ` +
          `every account. Weak passwords still fall; memory-hard hashes (Argon2id, scrypt) narrow the GPU's advantage further.`,
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  return (
    <div className="crypto-section">
      <h3>3. Storing passwords: what a stolen database gives away</h3>
      <div className="sql-presets">
        <button className={mode === "plain" ? "active" : ""} onClick={() => setMode("plain")}>
          Plain text
        </button>
        <button className={mode === "sha256" ? "active" : ""} onClick={() => setMode("sha256")}>
          SHA-256
        </button>
        <button className={mode === "pbkdf2" ? "active" : ""} onClick={() => setMode("pbkdf2")}>
          Salted, slow hash (PBKDF2, {ITERATIONS.toLocaleString()} rounds)
        </button>
      </div>
      <table className="bigo-table crypto-table">
        <thead>
          <tr>
            <th>user</th>
            <th>what's stored in the database</th>
            <th>attacker recovers</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td>{r.name}</td>
              <td className="mono crypto-stored">{r.stored}</td>
              <td className={r.cracked ? "cell-conflict" : "mono"}>{r.cracked ?? "nothing yet"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="gate-note">
        {mode === "plain" && "Anyone who sees the table -- a backup, a log, a breach -- has every password."}
        {mode === "sha256" &&
          "Better, but ben and cara have identical hashes (same password), and any common password falls instantly to a precomputed lookup table. Fast hashes are built to be fast, which is exactly wrong here."}
        {mode === "pbkdf2" &&
          "Each user gets a random salt, so identical passwords store differently and precomputed tables are useless. The deliberate slowness makes every guess expensive."}
      </p>
      {timing && <p className="gate-note">⏱ {timing}</p>}
    </div>
  );
}

export function HashingEncryption() {
  if (!subtle) {
    return (
      <p className="status-text">
        The browser only offers its crypto API on secure pages (https://, or http://localhost). Open the app that way
        to try this lesson.
      </p>
    );
  }
  return (
    <div className="tool-widget">
      <HashSection />
      <EncryptSection />
      <PasswordSection />
    </div>
  );
}
