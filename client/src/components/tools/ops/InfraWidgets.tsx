import { useMemo, useState } from "react";

// Widgets for the IT infrastructure lessons: a RAID capacity and failure calculator, a backup
// restore chain (full, incremental, differential), an IPv6 address drill, an email
// authentication checker (SPF, DKIM and DMARC with alignment) and an IAM policy evaluator
// that follows AWS's rule: an explicit deny wins, then an allow, otherwise denied by default.

// ---- RAID ------------------------------------------------------------------------------

type RaidLevel = "0" | "1" | "5" | "6" | "10";
const LEVELS: { level: RaidLevel; min: number; label: string }[] = [
  { level: "0", min: 2, label: "RAID 0 (stripe)" },
  { level: "1", min: 2, label: "RAID 1 (mirror)" },
  { level: "5", min: 3, label: "RAID 5 (single parity)" },
  { level: "6", min: 4, label: "RAID 6 (double parity)" },
  { level: "10", min: 4, label: "RAID 10 (mirrored pairs, striped)" },
];

function raidFacts(level: RaidLevel, n: number) {
  switch (level) {
    case "0":
      return { data: n, survives: "no disk failures", penalty: 1, read: `${n}x one disk` };
    case "1":
      return { data: 1, survives: `up to ${n - 1} failures`, penalty: n, read: `up to ${n}x one disk` };
    case "5":
      return { data: n - 1, survives: "any 1 failure", penalty: 4, read: `${n - 1}x one disk` };
    case "6":
      return { data: n - 2, survives: "any 2 failures", penalty: 6, read: `${n - 2}x one disk` };
    case "10":
      return { data: n / 2, survives: `any 1 failure, up to ${n / 2} if each is in a different pair`, penalty: 2, read: `up to ${n}x one disk` };
  }
}

function raidState(level: RaidLevel, n: number, failed: Set<number>): { ok: boolean; text: string } {
  const f = failed.size;
  if (f === 0) return { ok: true, text: "All disks healthy." };
  let lost: boolean;
  if (level === "0") lost = true;
  else if (level === "1") lost = f === n;
  else if (level === "5") lost = f > 1;
  else if (level === "6") lost = f > 2;
  else lost = Array.from({ length: n / 2 }, (_, p) => failed.has(2 * p) && failed.has(2 * p + 1)).some(Boolean);
  if (lost)
    return {
      ok: false,
      text:
        level === "10"
          ? "Both disks of one mirrored pair are gone: that pair's stripes are lost, so the whole array is lost. Restore from backup."
          : "More disks failed than this level can survive: the array is lost. Restore from backup.",
    };
  return { ok: true, text: `Degraded but working: reads of the missing data are rebuilt on the fly. Replace the failed disk${f > 1 ? "s" : ""} and rebuild before another one goes.` };
}

export function RaidCalc() {
  const [level, setLevel] = useState<RaidLevel>("5");
  const [count, setCount] = useState(4);
  const [size, setSize] = useState(8);
  const [failed, setFailed] = useState<Set<number>>(new Set());
  const min = LEVELS.find((l) => l.level === level)!.min;
  const n = Math.max(min, level === "10" && count % 2 ? count + 1 : count);
  const facts = raidFacts(level, n);
  const state = raidState(level, n, new Set([...failed].filter((d) => d < n)));

  const toggle = (d: number) =>
    setFailed((s) => {
      const next = new Set(s);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });

  return (
    <div>
      <div className="sql-presets" aria-label="RAID level">
        {LEVELS.map((l) => (
          <button key={l.level} className={l.level === level ? "active" : ""} onClick={() => setLevel(l.level)}>
            {l.label}
          </button>
        ))}
      </div>
      <div className="sec-row">
        <label>
          Disks{" "}
          <input type="number" min={2} max={12} value={n} onChange={(ev) => setCount(Math.min(12, Math.max(2, Number(ev.target.value) || 2)))} style={{ width: "4rem" }} />
        </label>
        <label>
          Disk size (TB){" "}
          <input type="number" min={1} max={30} value={size} onChange={(ev) => setSize(Math.min(30, Math.max(1, Number(ev.target.value) || 1)))} style={{ width: "4rem" }} />
        </label>
      </div>
      {n !== count && <p className="gate-note">{level === "10" ? "RAID 10 needs an even number of disks" : `This level needs at least ${min} disks`}, so the calculator uses {n}.</p>}
      <ul className="dbw-entries">
        <li className="dbw-run">
          Raw capacity {n * size} TB, usable <strong>{facts.data * size} TB</strong> ({Math.round((facts.data / n) * 100)}%)
        </li>
        <li className="dbw-run">Survives: {facts.survives}</li>
        <li className="dbw-run">
          Each random write costs about {facts.penalty} disk I/O{facts.penalty > 1 ? "s" : ""}
          {level === "5" ? " (read data and parity, write data and parity)" : level === "6" ? " (read data and two parities, write all three)" : ""}; reads run at {facts.read}.
        </li>
      </ul>
      <p className="gate-note">Click disks to fail them{level === "10" ? ". Disks are mirrored in pairs: 1 with 2, 3 with 4, and so on" : ""}.</p>
      <div className="raid-disks">
        {Array.from({ length: n }, (_, d) => (
          <button key={d} className={`raid-disk${failed.has(d) ? " raid-failed" : ""}`} onClick={() => toggle(d)} aria-pressed={failed.has(d)}>
            Disk {d + 1}
            <span>{failed.has(d) ? "failed" : "ok"}</span>
          </button>
        ))}
      </div>
      <p className={`lt-p dbw-verdict ${state.ok ? "ops-ok" : "ops-warn"}`}>{state.text}</p>
      {level === "5" && size >= 8 && (
        <p className="gate-note">
          With {size} TB disks, a rebuild reads all {(n - 1) * size} TB from the surviving disks and can take a day or more, during which one more failure or unreadable sector loses data. That is why large arrays use RAID 6 or RAID 10.
        </p>
      )}
    </div>
  );
}

// ---- Backup chains ---------------------------------------------------------------------

type Scheme = "full" | "incremental" | "differential";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DATA_GB = 500;
const CHANGE_GB = 20;

export function BackupChain() {
  const [scheme, setScheme] = useState<Scheme>("incremental");
  const [lostOn, setLostOn] = useState(4);

  // Night d's backup: Sunday is always a full; the rest depend on the scheme.
  const backups = DAYS.map((day, d) => {
    if (scheme === "full" || d === 0) return { day, kind: "full", size: DATA_GB };
    if (scheme === "incremental") return { day, kind: "incremental", size: CHANGE_GB };
    return { day, kind: "differential", size: CHANGE_GB * d };
  });
  const lastGood = lostOn - 1; // failure during day lostOn: last backup is the night before
  const restore = scheme === "full" ? [lastGood] : scheme === "incremental" ? Array.from({ length: lastGood + 1 }, (_, i) => i) : lastGood === 0 ? [0] : [0, lastGood];
  const stored = backups.reduce((sum, b) => sum + b.size, 0);
  const read = restore.reduce((sum, d) => sum + backups[d].size, 0);

  return (
    <div>
      <div className="sql-presets" aria-label="Backup scheme">
        {(["full", "incremental", "differential"] as const).map((s) => (
          <button key={s} className={s === scheme ? "active" : ""} onClick={() => setScheme(s)}>
            {s === "full" ? "Full every night" : `Sunday full + nightly ${s}`}
          </button>
        ))}
      </div>
      <label className="sec-row">
        The server dies during{" "}
        <select value={lostOn} onChange={(ev) => setLostOn(Number(ev.target.value))}>
          {DAYS.slice(1).map((d, i) => (
            <option key={d} value={i + 1}>
              {d}
            </option>
          ))}
        </select>
      </label>
      <div className="backup-days">
        {backups.map((b, d) => (
          <div key={b.day} className={`dbw-box backup-day${restore.includes(d) ? " backup-need" : ""}${d >= lostOn ? " backup-future" : ""}`}>
            <strong>{b.day} night</strong>
            <span>{b.kind}</span>
            <span className="gate-note">{d >= lostOn ? "not taken yet" : `${b.size} GB`}</span>
          </div>
        ))}
      </div>
      <ol className="dbw-steps">
        <li>
          Restore needs: <strong>{restore.map((d) => `${DAYS[d]} ${backups[d].kind}`).join(", then ")}</strong>, {read} GB to read back, applied in that order.
        </li>
        <li>
          Everything written since {DAYS[lastGood]} night is lost: with nightly backups the recovery point objective (RPO) is up to 24 hours.
          {scheme === "incremental" && restore.length > 2 ? " If any one incremental in the chain is damaged, every later day is unrecoverable." : ""}
        </li>
        <li>A week of backups stores {stored} GB for {DATA_GB} GB of data (each day changes about {CHANGE_GB} GB).</li>
      </ol>
      <p className="gate-note">
        Full: simplest and fastest to restore, most storage. Incremental: least storage and fastest nightly job, slowest restore with the longest chain. Differential: in between, and a restore never needs more than two sets.
      </p>
    </div>
  );
}

// ---- IPv6 drill ------------------------------------------------------------------------

function expand6(addr: string): string[] | null {
  const a = addr.trim().toLowerCase();
  if (!/^[0-9a-f:]+$/.test(a) || a.split("::").length > 2) return null;
  const [head, tail] = a.includes("::") ? a.split("::") : [a, null];
  const h = head ? head.split(":") : [];
  const t = tail === null ? [] : tail ? tail.split(":") : [];
  const missing = 8 - h.length - t.length;
  if (tail === null ? missing !== 0 : missing < 1) return null;
  const groups = [...h, ...Array(tail === null ? 0 : missing).fill("0"), ...t];
  if (groups.some((g) => g.length === 0 || g.length > 4)) return null;
  return groups.map((g) => g.padStart(4, "0"));
}

// RFC 5952: lowercase, no leading zeros, the longest run of two or more zero groups (the first
// if tied) becomes ::.
function compress6(groups: string[]): string {
  const g = groups.map((x) => x.replace(/^0+(?=.)/, ""));
  let best = -1;
  let bestLen = 1;
  for (let i = 0; i < 8; ) {
    if (g[i] !== "0") {
      i++;
      continue;
    }
    let j = i;
    while (j < 8 && g[j] === "0") j++;
    if (j - i > bestLen) {
      best = i;
      bestLen = j - i;
    }
    i = j;
  }
  if (best < 0) return g.join(":");
  return `${g.slice(0, best).join(":")}::${g.slice(best + bestLen).join(":")}`;
}

const KINDS = [
  { kind: "global unicast", hint: "2000::/3, routable on the internet (2001:db8::/32 is reserved for documentation)" },
  { kind: "link-local", hint: "fe80::/10, every interface has one; never routed" },
  { kind: "unique local (ULA)", hint: "fc00::/7, in practice fd00::/8: private, like 10.0.0.0/8" },
  { kind: "multicast", hint: "ff00::/8, IPv6 has no broadcast" },
  { kind: "loopback", hint: "::1, like 127.0.0.1" },
];

function rnd(n: number) {
  return Math.floor(Math.random() * n);
}
function hex4() {
  return rnd(0x10000).toString(16).padStart(4, "0");
}

type Q = { type: "compress" | "expand" | "prefix" | "kind"; prompt: string; shown: string; answer: string; groups: string[] };

function makeQuestion(): Q {
  const type = (["compress", "expand", "prefix", "kind"] as const)[rnd(4)];
  if (type === "kind") {
    const k = rnd(KINDS.length);
    const groups =
      k === 0
        ? ["2001", "0db8", hex4(), hex4(), "0000", "0000", "0000", hex4()]
        : k === 1
          ? ["fe80", "0000", "0000", "0000", hex4(), hex4(), hex4(), hex4()]
          : k === 2
            ? ["fd" + hex4().slice(2), hex4(), hex4(), "0001", "0000", "0000", "0000", hex4()]
            : k === 3
              ? ["ff02", "0000", "0000", "0000", "0000", "0000", "0000", ["0001", "0002", "00fb"][rnd(3)]]
              : ["0000", "0000", "0000", "0000", "0000", "0000", "0000", "0001"];
    return { type, prompt: "What kind of address is this?", shown: compress6(groups), answer: KINDS[k].kind, groups };
  }
  // A documentation address with a run of zero groups and some leading zeros to strip.
  const groups = ["2001", "0db8", hex4(), "00" + hex4().slice(2), "0000", "0000", hex4().slice(0, 1) === "0" ? "0000" : "0" + hex4().slice(1), hex4()];
  if (rnd(2)) groups[2] = "0000";
  if (type === "compress") return { type, prompt: "Write the shortest standard form (RFC 5952).", shown: groups.join(":"), answer: compress6(groups), groups };
  if (type === "expand") return { type, prompt: "Write it out in full: eight groups of four hex digits.", shown: compress6(groups), answer: groups.join(":"), groups };
  return { type, prompt: "Which /64 network is this host in? Answer in short form, like 2001:db8:1:2::/64.", shown: compress6(groups), answer: `${compress6([...groups.slice(0, 4), "0000", "0000", "0000", "0000"])}/64`, groups };
}

export function Ipv6Drill() {
  const [q, setQ] = useState<Q>(makeQuestion);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });

  function check() {
    let ok: boolean;
    const typed = input.trim().toLowerCase();
    if (q.type === "compress") ok = typed === q.answer;
    else if (q.type === "expand") ok = typed === q.answer;
    else if (q.type === "prefix") {
      const [addr, len] = typed.split("/");
      const g = expand6(addr ?? "");
      ok = len === "64" && g !== null && g.join(":") === expand6(q.answer.split("/")[0])!.join(":");
    } else ok = input === q.answer;
    let note = "";
    if (!ok && q.type === "compress") {
      const g = expand6(typed);
      if (g && g.join(":") === q.groups.join(":")) note = " Yours is the same address, but not the standard form: drop every leading zero and use :: for the longest run of zero groups.";
    }
    setResult({ ok, text: ok ? `Right: ${q.answer}` : `Not quite. The answer is ${q.answer}.${note}` });
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }));
  }

  function next() {
    setQ(makeQuestion());
    setInput("");
    setResult(null);
  }

  return (
    <div>
      <p className="lt-p">{q.prompt}</p>
      <p className="sec-token">{q.shown}</p>
      {q.type === "kind" ? (
        <div className="sql-presets" aria-label="Address kind">
          {KINDS.map((k) => (
            <button key={k.kind} className={input === k.kind ? "active" : ""} onClick={() => setInput(k.kind)} disabled={result !== null}>
              {k.kind}
            </button>
          ))}
        </div>
      ) : (
        <label className="sec-col">
          Your answer
          <input value={input} onChange={(ev) => setInput(ev.target.value)} onKeyDown={(ev) => ev.key === "Enter" && !result && check()} spellCheck={false} autoCapitalize="off" disabled={result !== null} />
        </label>
      )}
      <div className="sec-row">
        <button onClick={check} disabled={!input || result !== null}>
          Check
        </button>
        <button onClick={next}>Next address</button>
        <span className="gate-note">
          {score.right} of {score.total} right
        </span>
      </div>
      {result && (
        <p className={`lt-p dbw-verdict ${result.ok ? "ops-ok" : "ops-warn"}`}>
          {result.text}
          {q.type === "kind" ? ` (${KINDS.find((k) => k.kind === q.answer)!.hint})` : ""}
        </p>
      )}
    </div>
  );
}

// ---- Email authentication --------------------------------------------------------------

const IPS = {
  bank: { ip: "203.0.113.10", label: "the bank's own mail server" },
  esp: { ip: "198.51.100.25", label: "the bank's newsletter provider (ESP)" },
  evil: { ip: "192.0.2.66", label: "an attacker's server" },
} as const;
type Sender = keyof typeof IPS;
const ENVELOPES = ["bank.example", "bounce.bank.example", "mailer.esp.example", "evil.example"] as const;
type Envelope = (typeof ENVELOPES)[number];
type Dkim = "none" | "bank.example" | "esp.example" | "broken";
type Dmarc = "(none published)" | "p=none" | "p=quarantine" | "p=reject";

function orgDomain(d: string) {
  return d.split(".").slice(-2).join(".");
}

export function EmailAuth() {
  const [sender, setSender] = useState<Sender>("evil");
  const [envelope, setEnvelope] = useState<Envelope>("evil.example");
  const [dkim, setDkim] = useState<Dkim>("none");
  const [includeEsp, setIncludeEsp] = useState(true);
  const [dmarc, setDmarc] = useState<Dmarc>("p=reject");

  const bankSpf = `v=spf1 ip4:203.0.113.10${includeEsp ? " include:esp.example" : ""} -all`;
  const spfRecords: Record<Envelope, string> = {
    "bank.example": bankSpf,
    "bounce.bank.example": "v=spf1 include:esp.example -all",
    "mailer.esp.example": "v=spf1 include:esp.example -all",
    "evil.example": "v=spf1 ip4:192.0.2.66 -all",
  };
  const authorized: Record<Envelope, Sender[]> = {
    "bank.example": includeEsp ? ["bank", "esp"] : ["bank"],
    "bounce.bank.example": ["esp"],
    "mailer.esp.example": ["esp"],
    "evil.example": ["evil"],
  };
  const ip = IPS[sender].ip;
  const spfPass = authorized[envelope].includes(sender);
  const spfAligned = orgDomain(envelope) === "bank.example";
  const dkimPass = dkim === "bank.example" || dkim === "esp.example";
  const dkimAligned = dkim === "bank.example";
  const dmarcPass = (spfPass && spfAligned) || (dkimPass && dkimAligned);

  const lines: { ok: boolean | null; text: string }[] = [
    { ok: null, text: `${IPS[sender].label} (${ip}) connects to the recipient's server and says MAIL FROM:<...@${envelope}>. The visible header says From: alerts@bank.example.` },
    {
      ok: spfPass,
      text: `SPF looks up the TXT record of the envelope domain ${envelope}: "${spfRecords[envelope]}". ${ip} is ${spfPass ? "listed, so SPF passes" : "not listed and the record ends in -all, so SPF fails"}.`,
    },
    {
      ok: dkim === "none" ? null : dkimPass,
      text:
        dkim === "none"
          ? "DKIM: the message has no DKIM-Signature header."
          : dkim === "broken"
            ? "DKIM: the signature claims d=bank.example, but the body was changed after signing, so the hash doesn't match: DKIM fails."
            : `DKIM: the signature (d=${dkim}) verifies against the public key published in DNS at selector._domainkey.${dkim}: DKIM passes.`,
    },
  ];
  if (dmarc === "(none published)") {
    lines.push({
      ok: false,
      text: "DMARC: bank.example publishes no _dmarc record, so nothing ties SPF or DKIM to the From domain the user sees. The receiver falls back on its own spam scoring.",
    });
  } else {
    lines.push({
      ok: dmarcPass,
      text: `DMARC (_dmarc.bank.example: "v=DMARC1; ${dmarc}") needs SPF or DKIM to pass for a domain aligned with From: bank.example. SPF ${spfPass ? "passed" : "failed"} for ${envelope}, which is ${spfAligned ? "aligned" : "not aligned"}; DKIM ${dkim === "none" ? "is missing" : dkimPass ? `passed for ${dkim}, which is ${dkimAligned ? "aligned" : "not aligned"}` : "failed"}. DMARC ${dmarcPass ? "passes" : "fails"}.`,
    });
  }
  const spoof = sender === "evil";
  const blocked = dmarc === "p=reject" || dmarc === "p=quarantine";
  const fate =
    dmarc === "(none published)"
      ? "Delivered or sent to spam at the receiver's discretion."
      : dmarcPass
        ? "Delivered: the bank's domain vouches for this message."
        : !blocked
          ? "Delivered anyway (p=none only asks for reports); the failure shows up in the bank's DMARC aggregate reports."
          : dmarc === "p=reject"
            ? "Rejected during the SMTP conversation."
            : "Sent to the spam or junk folder (quarantine).";
  const verdict = spoof
    ? dmarcPass
      ? { ok: false, text: `${fate} The spoof got through, which here would need the attacker to hold the bank's DKIM private key.` }
      : { ok: blocked, text: blocked ? `${fate} The spoof never reaches the inbox.` : `${fate} The spoof can reach the inbox.` }
    : dmarcPass
      ? { ok: true, text: fate }
      : { ok: false, text: `${fate} This is the bank's own mail failing: authorize the sender in SPF with an aligned envelope domain, or sign with d=bank.example.` };

  return (
    <div>
      <div className="dbw-lsm">
        <div className="dbw-box sec-form">
          <strong>The message</strong>
          <label className="sec-col">
            Sent from
            <select value={sender} onChange={(ev) => setSender(ev.target.value as Sender)}>
              {(Object.keys(IPS) as Sender[]).map((s) => (
                <option key={s} value={s}>
                  {IPS[s].label}
                </option>
              ))}
            </select>
          </label>
          <label className="sec-col">
            Envelope sender (MAIL FROM, the bounce address)
            <select value={envelope} onChange={(ev) => setEnvelope(ev.target.value as Envelope)}>
              {ENVELOPES.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </label>
          <label className="sec-col">
            DKIM signature
            <select value={dkim} onChange={(ev) => setDkim(ev.target.value as Dkim)}>
              <option value="none">none</option>
              <option value="bank.example">valid, d=bank.example</option>
              <option value="esp.example">valid, d=esp.example</option>
              <option value="broken">d=bank.example, body changed after signing</option>
            </select>
          </label>
        </div>
        <div className="dbw-box sec-form">
          <strong>bank.example's DNS</strong>
          <label className="sec-row sec-check">
            <input type="checkbox" checked={includeEsp} onChange={(ev) => setIncludeEsp(ev.target.checked)} />
            <span>SPF includes the newsletter provider</span>
          </label>
          <label className="sec-col">
            DMARC policy
            <select value={dmarc} onChange={(ev) => setDmarc(ev.target.value as Dmarc)}>
              {(["(none published)", "p=none", "p=quarantine", "p=reject"] as const).map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <p className="gate-note">From: in the header is always alerts@bank.example, the address the user sees.</p>
        </div>
      </div>
      <ol className="dbw-steps">
        {lines.map((l, i) => (
          <li key={i} className={l.ok === null ? "" : l.ok ? "dbw-step-a" : "dbw-step-b"}>
            {l.text}
          </li>
        ))}
      </ol>
      <p className={`lt-p dbw-verdict ${verdict.ok ? "ops-ok" : "ops-warn"}`}>
        <strong>{verdict.text}</strong>
      </p>
    </div>
  );
}

// ---- IAM policy evaluation -------------------------------------------------------------

interface Statement {
  effect: "Allow" | "Deny";
  action: string;
  resource: string;
}
const STATEMENTS: Statement[] = [
  { effect: "Allow", action: "s3:GetObject", resource: "arn:aws:s3:::reports/*" },
  { effect: "Allow", action: "s3:*", resource: "arn:aws:s3:::scratch/*" },
  { effect: "Allow", action: "ec2:Describe*", resource: "*" },
  { effect: "Deny", action: "s3:DeleteObject", resource: "*" },
  { effect: "Allow", action: "*", resource: "*" },
];
const ACTIONS = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "ec2:DescribeInstances", "ec2:TerminateInstances"];
const RESOURCES: Record<string, string[]> = {
  s3: ["arn:aws:s3:::reports/q3.pdf", "arn:aws:s3:::scratch/tmp.csv", "arn:aws:s3:::payroll/june.xlsx"],
  ec2: ["arn:aws:ec2:eu-west-1:111122223333:instance/i-0abc123"],
};

function glob(pattern: string, value: string) {
  const re = new RegExp("^" + pattern.split("*").map((p) => p.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$");
  return re.test(value);
}

export function IamPolicy() {
  const [on, setOn] = useState<boolean[]>([true, true, true, true, false]);
  const [action, setAction] = useState(ACTIONS[0]);
  const service = action.split(":")[0];
  const [resource, setResource] = useState(RESOURCES.s3[0]);
  const res = RESOURCES[service].includes(resource) ? resource : RESOURCES[service][0];

  const matches = useMemo(() => STATEMENTS.map((s, i) => on[i] && glob(s.action, action) && glob(s.resource, res)), [on, action, res]);
  const deny = matches.findIndex((m, i) => m && STATEMENTS[i].effect === "Deny");
  const allow = matches.findIndex((m, i) => m && STATEMENTS[i].effect === "Allow");
  const verdict =
    deny >= 0
      ? { ok: false, text: `Denied: statement ${deny + 1} is an explicit Deny that matches, and an explicit deny beats any allow.` }
      : allow >= 0
        ? { ok: true, text: `Allowed by statement ${allow + 1}${matches.filter(Boolean).length > 1 ? " (and others)" : ""}, and no Deny matches.` }
        : { ok: false, text: "Denied by default: no statement allows it. Everything not explicitly allowed is denied." };

  return (
    <div>
      <p className="gate-note">The policies attached to a role. Untick a statement to detach it; the last one is what an admin policy looks like.</p>
      <ol className="dbw-steps">
        {STATEMENTS.map((s, i) => (
          <li key={i} className={matches[i] ? (s.effect === "Deny" ? "dbw-step-b" : "dbw-step-a") : ""}>
            <label className="sec-row sec-check">
              <input type="checkbox" checked={on[i]} onChange={(ev) => setOn((o) => o.map((x, j) => (j === i ? ev.target.checked : x)))} />
              <span className="iam-stmt">
                {`{ "Effect": "${s.effect}", "Action": "${s.action}", "Resource": "${s.resource}" }`}
                {matches[i] ? " (matches)" : ""}
              </span>
            </label>
          </li>
        ))}
      </ol>
      <div className="dbw-lsm">
        <label className="sec-col">
          Action
          <select value={action} onChange={(ev) => setAction(ev.target.value)}>
            {ACTIONS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
        <label className="sec-col">
          Resource
          <select value={res} onChange={(ev) => setResource(ev.target.value)}>
            {RESOURCES[service].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
      </div>
      <p className={`lt-p dbw-verdict ${verdict.ok ? "ops-ok" : "ops-warn"}`}>
        <strong>{verdict.text}</strong>
      </p>
    </div>
  );
}
