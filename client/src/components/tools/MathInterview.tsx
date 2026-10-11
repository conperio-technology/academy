import { useState } from "react";
import { openLesson } from "../../api";

// Interview math widgets: C# vs Python modulo and division, Euclid's GCD with LCM, a steppable
// Sieve of Eratosthenes, square-and-multiply, an overflow checker (BigInt models C#'s 32-bit
// wraparound), and counting with factorials, nCr and Pascal's triangle.

const INT_MIN = -(2n ** 31n);
const INT_MAX = 2n ** 31n - 1n;
const LONG_MIN = -(2n ** 63n);
const LONG_MAX = 2n ** 63n - 1n;
const MOD = 1_000_000_007n;

function parseBig(s: string, fallback: bigint): bigint {
  try {
    const t = s.trim().replace(/_/g, "");
    return /^-?\d+$/.test(t) ? BigInt(t) : fallback;
  } catch {
    return fallback;
  }
}

const fmt = (v: bigint) => v.toLocaleString("en-US");

// ---------- modulo ----------

function Modulo() {
  const [aText, setA] = useState("-7");
  const [mText, setM] = useState("3");
  const a = parseBig(aText, -7n);
  const m = parseBig(mText, 3n);
  const ok = m !== 0n;
  // BigInt / and % truncate toward zero, exactly like C#.
  const csMod = ok ? a % m : 0n;
  const csDiv = ok ? a / m : 0n;
  const pyDiv = ok ? (csMod !== 0n && (csMod < 0n) !== (m < 0n) ? csDiv - 1n : csDiv) : 0n;
  const pyMod = ok ? a - m * pyDiv : 0n;
  const fixed = ok ? ((a % m) + m) % m : 0n;

  return (
    <div className="crypto-section">
      <h3>1. Remainders: C# and Python disagree on negatives</h3>
      <div className="tool-inputs ai-inputs">
        <label>
          a
          <input value={aText} onChange={(e) => setA(e.target.value)} aria-label="a" />
        </label>
        <label>
          m
          <input value={mText} onChange={(e) => setM(e.target.value)} aria-label="m" />
        </label>
      </div>
      {!ok ? (
        <p className="gate-note">m can't be 0: both languages throw a divide-by-zero error.</p>
      ) : (
        <>
          <div className="cm-scroll">
            <table className="bigo-table">
              <thead>
                <tr>
                  <th>Expression</th>
                  <th>C#</th>
                  <th>Python</th>
                </tr>
              </thead>
              <tbody>
                <tr className={csMod !== pyMod ? "cm-row-on" : ""}>
                  <td>a % m</td>
                  <td className="mono">{fmt(csMod)}</td>
                  <td className="mono">{fmt(pyMod)}</td>
                </tr>
                <tr className={csDiv !== pyDiv ? "cm-row-on" : ""}>
                  <td>a / m (C#), a // m (Python)</td>
                  <td className="mono">{fmt(csDiv)}</td>
                  <td className="mono">{fmt(pyDiv)}</td>
                </tr>
                <tr>
                  <td>((a % m) + m) % m</td>
                  <td className="mono">{fmt(fixed)}</td>
                  <td className="mono">{fmt(pyMod)} (same as a % m)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="gate-note">
            C# truncates toward zero, so a % m takes the sign of a. Python floors, so a % m takes the sign of m. Both keep
            a == (a / m) * m + a % m true for their own kind of division. For a positive m, ((a % m) + m) % m always lands
            in 0 to m - 1 in C#, which is what &quot;mod&quot; means in maths and what Python gives you directly.
          </p>
        </>
      )}
    </div>
  );
}

// ---------- gcd ----------

function Gcd() {
  const [aText, setA] = useState("48");
  const [bText, setB] = useState("18");
  const a0 = parseBig(aText, 48n);
  const b0 = parseBig(bText, 18n);
  const a = a0 < 0n ? -a0 : a0;
  const b = b0 < 0n ? -b0 : b0;
  const rows: [bigint, bigint, bigint][] = [];
  let x = a;
  let y = b;
  while (y !== 0n && rows.length < 200) {
    rows.push([x, y, x % y]);
    [x, y] = [y, x % y];
  }
  const g = x;
  const lcm = g === 0n ? 0n : (a / g) * b;
  const product = a * b;
  const productWraps = product > INT_MAX;

  return (
    <div className="crypto-section">
      <h3>2. Euclid&apos;s GCD, and LCM without overflow</h3>
      <div className="tool-inputs ai-inputs">
        <label>
          a
          <input value={aText} onChange={(e) => setA(e.target.value)} aria-label="a for gcd" />
        </label>
        <label>
          b
          <input value={bText} onChange={(e) => setB(e.target.value)} aria-label="b for gcd" />
        </label>
      </div>
      <div className="cm-scroll">
        <table className="bigo-table">
          <thead>
            <tr>
              <th>Step</th>
              <th>gcd(a, b)</th>
              <th>a % b</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([p, q, r], i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td className="mono">
                  gcd({fmt(p)}, {fmt(q)})
                </td>
                <td className="mono">{fmt(r)}</td>
              </tr>
            ))}
            <tr className="cm-row-on">
              <td>end</td>
              <td className="mono">gcd({fmt(g)}, 0) = {fmt(g)}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">gcd</span>
          <span className="readout-value">{fmt(g)}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">lcm = a / gcd * b</span>
          <span className="readout-value mono">{fmt(lcm)}</span>
        </div>
      </div>
      <p className="gate-note">
        {rows.length} step{rows.length === 1 ? "" : "s"}: the numbers shrink at least by half every two steps, so it stays
        tiny even for 18-digit inputs.{" "}
        {productWraps
          ? `Here a * b = ${fmt(product)} doesn't fit in a C# int; as int * int it would wrap to ${fmt(BigInt.asIntN(32, product))}. Dividing first, or (long)a * b, avoids it.`
          : "Try 100000 and 99999: a * b passes int range in C#, but a / gcd * b in long is safe."}{" "}
        Practise it in{" "}
        <button className="link-button" onClick={() => openLesson("math-gcd-lcm")}>
          GCD and LCM of an Array
        </button>
        .
      </p>
    </div>
  );
}

// ---------- sieve ----------

function sieveStates(n: number) {
  // One snapshot per prime p with p * p < n: which numbers are crossed out after its pass.
  const crossed = new Array<boolean>(n).fill(false);
  crossed[0] = true;
  if (n > 1) crossed[1] = true;
  const snaps: { p: number; crossed: boolean[]; newly: number[] }[] = [{ p: 0, crossed: [...crossed], newly: [] }];
  for (let p = 2; p * p < n; p++) {
    if (crossed[p]) continue;
    const newly: number[] = [];
    for (let m = p * p; m < n; m += p) {
      if (!crossed[m]) newly.push(m);
      crossed[m] = true;
    }
    snaps.push({ p, crossed: [...crossed], newly });
  }
  return snaps;
}

function Sieve() {
  const [n, setN] = useState(60);
  const [step, setStep] = useState(0);
  const snaps = sieveStates(n);
  const s = Math.min(step, snaps.length - 1);
  const snap = snaps[s];
  const finished = s === snaps.length - 1;
  const primesFound = new Set(snaps.slice(1, s + 1).map((x) => x.p));
  const count = snap.crossed.filter((c) => !c).length;

  return (
    <div className="crypto-section">
      <h3>3. Sieve of Eratosthenes</h3>
      <label className="cm-slider">
        Primes below n = <strong>{n}</strong>
        <input
          type="range"
          min={10}
          max={150}
          value={n}
          onChange={(e) => {
            setN(Number(e.target.value));
            setStep(0);
          }}
          aria-label="n for the sieve"
        />
      </label>
      <div className="cm-actions">
        <button onClick={() => setStep(0)} disabled={s === 0}>
          Reset
        </button>
        <button onClick={() => setStep(s + 1)} disabled={finished}>
          Next prime
        </button>
        <button onClick={() => setStep(snaps.length - 1)} disabled={finished}>
          Finish
        </button>
      </div>
      <div className="mi-sieve" aria-label="Numbers below n">
        {snap.crossed.map((c, k) => {
          const cls = snap.newly.includes(k) ? "mi-new" : primesFound.has(k) || (finished && !c) ? "mi-prime" : c ? "mi-crossed" : "";
          return (
            <span key={k} className={`mi-num ${cls}`}>
              {k}
            </span>
          );
        })}
      </div>
      <p className="gate-note">
        {s === 0
          ? "0 and 1 are not prime. Press Next prime: the smallest number not yet crossed out is prime, and its multiples are crossed out starting from its square."
          : finished
            ? `Done: the next candidate squared is at least ${n}, so every survivor is prime. ${count} primes below ${n}.`
            : `${snap.p} is prime. Crossed out ${snap.newly.length} new multiples from ${snap.p} * ${snap.p} = ${snap.p * snap.p} (amber). Smaller multiples were already gone.`}{" "}
        The graded version is{" "}
        <button className="link-button" onClick={() => openLesson("math-count-primes")}>
          Count Primes
        </button>
        .
      </p>
    </div>
  );
}

// ---------- fast power ----------

function FastPower() {
  const [baseText, setBase] = useState("3");
  const [expText, setExp] = useState("13");
  const [useMod, setUseMod] = useState(true);
  const base0 = parseBig(baseText, 3n);
  let exp = parseBig(expText, 13n);
  if (exp < 0n) exp = 0n;
  if (exp > 2n ** 62n) exp = 2n ** 62n;
  const reduce = (v: bigint) => (useMod ? ((v % MOD) + MOD) % MOD : v);
  const rows: { bit: number; b: bigint; result: bigint; used: boolean }[] = [];
  let result = 1n;
  let b = reduce(base0);
  let e = exp;
  let bit = 0;
  let mults = 0;
  let tooBig = false;
  while (e > 0n) {
    const used = (e & 1n) === 1n;
    if (used) {
      result = reduce(result * b);
      mults++;
    }
    rows.push({ bit, b, result, used });
    e >>= 1n;
    if (e > 0n) {
      b = reduce(b * b);
      mults++;
    }
    bit++;
    if (!useMod && (result.toString().length > 400 || b.toString().length > 400)) {
      tooBig = true;
      break;
    }
  }
  const short = (v: bigint) => {
    const t = v.toString();
    return t.length > 24 ? `${t.slice(0, 10)}...${t.slice(-6)} (${t.length} digits)` : fmt(v);
  };

  return (
    <div className="crypto-section">
      <h3>4. Fast power: square and multiply</h3>
      <div className="tool-inputs ai-inputs">
        <label>
          base
          <input value={baseText} onChange={(e) => setBase(e.target.value)} aria-label="base" />
        </label>
        <label>
          exponent
          <input value={expText} onChange={(e) => setExp(e.target.value)} aria-label="exponent" />
        </label>
      </div>
      <label className="tool-checkbox">
        <input type="checkbox" checked={useMod} onChange={(e) => setUseMod(e.target.checked)} />
        Work modulo 1,000,000,007
      </label>
      <p className="gate-note">
        Exponent {fmt(exp)} in binary is <code>{exp.toString(2)}</code> ({exp.toString(2).length} bits).
      </p>
      <div className="cm-scroll">
        <table className="bigo-table">
          <thead>
            <tr>
              <th>Bit</th>
              <th>Set?</th>
              <th>base^(2^bit)</th>
              <th>result</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.bit} className={r.used ? "cm-row-on" : ""}>
                <td>{r.bit}</td>
                <td>{r.used ? "1: multiply in" : "0: skip"}</td>
                <td className="mono">{short(r.b)}</td>
                <td className="mono">{short(r.result)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="gate-note">
        {tooBig
          ? "Without the modulus the numbers explode (thousands of digits), which is why these problems ask for an answer mod 1e9+7. Stopped early."
          : `${mults} multiplications instead of ${exp > 0n ? fmt(exp - 1n) : "0"}.`}{" "}
        In C#, keep the values as long and take % after every multiply: two values below 1e9+7 multiply to about 10^18, which
        fits in a long (9.2 * 10^18) but not an int. Python has this built in as pow(base, exp, mod). Graded:{" "}
        <button className="link-button" onClick={() => openLesson("math-pow")}>
          Pow(x, n)
        </button>
        .
      </p>
    </div>
  );
}

// ---------- overflow ----------

type Op = "+" | "-" | "*";

const OVERFLOW_PRESETS: { label: string; a: string; b: string; op: Op }[] = [
  { label: "int.MaxValue + 1", a: "2147483647", b: "1", op: "+" },
  { label: "lo + hi in binary search", a: "1500000000", b: "2000000000", op: "+" },
  { label: "100,000 squared", a: "100000", b: "100000", op: "*" },
  { label: "int.MinValue - 1", a: "-2147483648", b: "1", op: "-" },
  { label: "Two values below 1e9+7", a: "1000000006", b: "1000000006", op: "*" },
];

function Overflow() {
  const [aText, setA] = useState("2147483647");
  const [bText, setB] = useState("1");
  const [op, setOp] = useState<Op>("+");
  const clampInt = (v: bigint) => (v > INT_MAX ? INT_MAX : v < INT_MIN ? INT_MIN : v);
  const a = clampInt(parseBig(aText, 0n));
  const b = clampInt(parseBig(bText, 0n));
  const exact = op === "+" ? a + b : op === "-" ? a - b : a * b;
  const asInt = BigInt.asIntN(32, exact);
  const fitsInt = exact >= INT_MIN && exact <= INT_MAX;
  const fitsLong = exact >= LONG_MIN && exact <= LONG_MAX;

  return (
    <div className="crypto-section">
      <h3>5. Overflow: what each language actually computes</h3>
      <div className="sql-presets" role="group" aria-label="Overflow examples">
        {OVERFLOW_PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setA(p.a);
              setB(p.b);
              setOp(p.op);
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="tool-inputs ai-inputs">
        <label>
          a (int)
          <input value={aText} onChange={(e) => setA(e.target.value)} aria-label="a (int)" />
        </label>
        <label>
          operator
          <select value={op} onChange={(e) => setOp(e.target.value as Op)} aria-label="operator">
            <option value="+">+</option>
            <option value="-">-</option>
            <option value="*">*</option>
          </select>
        </label>
        <label>
          b (int)
          <input value={bText} onChange={(e) => setB(e.target.value)} aria-label="b (int)" />
        </label>
      </div>
      <div className="cm-scroll">
        <table className="bigo-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            <tr className={fitsInt ? "" : "ll-missing"}>
              <td>C# int a {op} b (default, unchecked)</td>
              <td className="mono">{fmt(asInt)}</td>
            </tr>
            <tr>
              <td>C# checked(a {op} b)</td>
              <td className="mono">{fitsInt ? fmt(exact) : "throws OverflowException"}</td>
            </tr>
            <tr>
              <td>C# (long)a {op} b</td>
              <td className="mono">{fitsLong ? fmt(exact) : "overflows long too"}</td>
            </tr>
            <tr>
              <td>Python a {op} b</td>
              <td className="mono">{fmt(exact)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="gate-note">
        {fitsInt
          ? "This fits in an int, so every row agrees."
          : `The true answer is outside int range (${fmt(INT_MIN)} to ${fmt(INT_MAX)}), so the unchecked C# int keeps only the low 32 bits and the sign comes out ${asInt < 0n ? "negative" : "positive"}.`}{" "}
        Inputs are clamped to int range. Python never overflows, so when a problem says &quot;32-bit&quot; you must check the
        limits yourself (see{" "}
        <button className="link-button" onClick={() => openLesson("math-reverse-integer")}>
          Reverse Integer
        </button>
        ).
      </p>
    </div>
  );
}

// ---------- counting ----------

function factorial(n: number): bigint {
  let r = 1n;
  for (let i = 2n; i <= BigInt(n); i++) r *= i;
  return r;
}

function Counting() {
  const [n, setN] = useState(5);
  const [k, setK] = useState(2);
  const kk = Math.min(k, n);
  const nf = factorial(n);
  const perm = nf / factorial(n - kk);
  const comb = perm / factorial(kk);
  const fits = (v: bigint) => (v <= INT_MAX ? "fits in int" : v <= LONG_MAX ? "needs long" : "overflows long");
  const rows = Math.min(n, 10);
  const pascal: bigint[][] = [[1n]];
  for (let r = 1; r <= rows; r++) {
    const prev = pascal[r - 1];
    pascal.push(Array.from({ length: r + 1 }, (_, c) => (c === 0 || c === r ? 1n : prev[c - 1] + prev[c])));
  }

  return (
    <div className="crypto-section">
      <h3>6. Counting: factorials, permutations and n choose k</h3>
      <label className="cm-slider">
        n = <strong>{n}</strong>
        <input type="range" min={0} max={25} value={n} onChange={(e) => setN(Number(e.target.value))} aria-label="n" />
      </label>
      <label className="cm-slider">
        k = <strong>{kk}</strong>
        <input type="range" min={0} max={n} value={kk} onChange={(e) => setK(Number(e.target.value))} aria-label="k" />
      </label>
      <div className="cm-scroll">
        <table className="bigo-table">
          <thead>
            <tr>
              <th>Quantity</th>
              <th>Value</th>
              <th>C# type</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>n! (orderings of n items)</td>
              <td className="mono">{fmt(nf)}</td>
              <td>{fits(nf)}</td>
            </tr>
            <tr>
              <td>n! / (n - k)! (ordered picks of k)</td>
              <td className="mono">{fmt(perm)}</td>
              <td>{fits(perm)}</td>
            </tr>
            <tr>
              <td>C(n, k) = n! / (k! (n - k)!)</td>
              <td className="mono">{fmt(comb)}</td>
              <td>{fits(comb)}</td>
            </tr>
            <tr>
              <td>C(n, k) mod 1e9+7</td>
              <td className="mono">{fmt(comb % MOD)}</td>
              <td>fits in int</td>
            </tr>
          </tbody>
        </table>
      </div>
      {n <= 10 ? (
        <div className="mi-pascal" aria-label="Pascal's triangle">
          {pascal.map((row, r) => (
            <div key={r} className="mi-pascal-row">
              {row.map((v, c) => (
                <span key={c} className={`mi-pascal-cell ${r === n && c === kk ? "mi-on" : ""} ${r === n - 1 && (c === kk || c === kk - 1) ? "mi-src" : ""}`}>
                  {v.toString()}
                </span>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="gate-note">Pascal&apos;s triangle is drawn for n up to 10.</p>
      )}
      <p className="gate-note">
        Each entry of Pascal&apos;s triangle is the sum of the two above it: C(n, k) = C(n - 1, k - 1) + C(n - 1, k), which
        builds every C(n, k) with additions only, no huge factorials (the two sources are outlined). Rule of thumb: n!
        passes int at 13 and long at 21, so compute C(n, k) incrementally (multiply then divide, step by step) or modulo a
        prime.
      </p>
    </div>
  );
}

export function MathInterview() {
  return (
    <div className="tool-widget">
      <Modulo />
      <Gcd />
      <Sieve />
      <FastPower />
      <Overflow />
      <Counting />
    </div>
  );
}
