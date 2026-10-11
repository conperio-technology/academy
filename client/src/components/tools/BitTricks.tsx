import { useState } from "react";
import { openLesson } from "../../api";

// Bit manipulation toolkit: an operator playground at 8, 16 or 32 bits (signed two's complement,
// with arithmetic and logical right shifts), the common tricks applied to any number, XOR
// cancellation, subsets as bitmasks, and a C# vs Python reference table. BigInt keeps the
// fixed-width wraparound exact.

type Width = 8 | 16 | 32;

function parseInt0(s: string): bigint {
  const t = s.trim().replace(/_/g, "");
  try {
    if (/^-?0x[0-9a-f]+$/i.test(t)) return t.startsWith("-") ? -BigInt(t.slice(1)) : BigInt(t);
    if (/^-?0b[01]+$/i.test(t)) return t.startsWith("-") ? -BigInt(t.slice(1)) : BigInt(t);
    if (/^-?\d+$/.test(t)) return BigInt(t);
  } catch {
    // fall through
  }
  return 0n;
}

const signed = (v: bigint, w: Width) => BigInt.asIntN(w, v);
const unsigned = (v: bigint, w: Width) => BigInt.asUintN(w, v);
const bitString = (v: bigint, w: Width) => unsigned(v, w).toString(2).padStart(w, "0");

function Bits({ value, width, onToggle }: { value: bigint; width: Width; onToggle?: (bit: number) => void }) {
  const s = bitString(value, width);
  const groups: string[] = [];
  for (let i = 0; i < width; i += 4) groups.push(s.slice(i, i + 4));
  return (
    <span className="bt-bits">
      {groups.map((g, gi) => (
        <span key={gi} className="bt-nibble">
          {g.split("").map((ch, ci) => {
            const pos = width - 1 - (gi * 4 + ci);
            const cls = `bt-bit ${ch === "1" ? "bt-one" : ""} ${pos === width - 1 ? "bt-sign" : ""}`;
            return onToggle ? (
              <button key={ci} className={cls} onClick={() => onToggle(pos)} aria-label={`Toggle bit ${pos}`}>
                {ch}
              </button>
            ) : (
              <span key={ci} className={cls}>
                {ch}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

function Playground() {
  const [width, setWidth] = useState<Width>(8);
  const [aText, setA] = useState("-6");
  const [bText, setB] = useState("13");
  const [k, setK] = useState(1);
  const a = signed(parseInt0(aText), width);
  const b = signed(parseInt0(bText), width);
  const kk = BigInt(Math.min(k, width - 1));
  const rows: { label: string; v: bigint; note?: string }[] = [
    { label: "a", v: a },
    { label: "b", v: b },
    { label: "a & b", v: a & b, note: "1 where both are 1" },
    { label: "a | b", v: a | b, note: "1 where either is 1" },
    { label: "a ^ b", v: a ^ b, note: "1 where they differ" },
    { label: "~a", v: ~a, note: "every bit flipped, = -a - 1" },
    { label: `a << ${kk}`, v: signed(a << kk, width), note: "bits pushed off the top are lost" },
    { label: `a >> ${kk}`, v: a >> kk, note: "arithmetic: copies the sign bit in" },
    { label: `a >>> ${kk}`, v: signed(unsigned(a, width) >> kk, width), note: "logical: shifts in zeros" },
  ];

  return (
    <div className="crypto-section">
      <h3>1. Operator playground</h3>
      <div className="sql-presets" role="group" aria-label="Width">
        {([8, 16, 32] as Width[]).map((w) => (
          <button key={w} className={w === width ? "active" : ""} onClick={() => setWidth(w)}>
            {w}-bit
          </button>
        ))}
      </div>
      <div className="tool-inputs ai-inputs">
        <label>
          a (decimal, 0x or 0b)
          <input value={aText} onChange={(e) => setA(e.target.value)} aria-label="a" />
        </label>
        <label>
          b
          <input value={bText} onChange={(e) => setB(e.target.value)} aria-label="b" />
        </label>
      </div>
      <label className="cm-slider">
        Shift by k = <strong>{Number(kk)}</strong>
        <input type="range" min={0} max={width - 1} value={Number(kk)} onChange={(e) => setK(Number(e.target.value))} aria-label="Shift amount" />
      </label>
      <p className="gate-note">Click a bit of a to flip it. The leftmost bit (outlined) is the sign bit: it is worth -2^{width - 1}.</p>
      <div className="bt-rows">
        {rows.map((r, i) => (
          <div key={r.label} className="bt-row">
            <span className="bt-label">{r.label}</span>
            <Bits
              value={r.v}
              width={width}
              onToggle={i === 0 ? (pos) => setA(signed(a ^ (1n << BigInt(pos)), width).toString()) : undefined}
            />
            <span className="bt-dec">
              {signed(r.v, width).toString()}
              <span className="cm-sub">unsigned {unsigned(r.v, width).toString()}</span>
            </span>
            {r.note && <span className="bt-note">{r.note}</span>}
          </div>
        ))}
      </div>
      <p className="gate-note">
        Same bits, two readings: as a signed {width}-bit two&apos;s complement number and as an unsigned one. In C#, int and
        uint are this pair at 32 bits, and &gt;&gt;&gt; exists since C# 11. Python has no &gt;&gt;&gt; and no width; use (a &amp;
        0xFFFFFFFF) &gt;&gt; k for a 32-bit logical shift.
      </p>
    </div>
  );
}

function Tricks() {
  const [xText, setX] = useState("44");
  const [k, setK] = useState(2);
  const w: Width = 16;
  const x = signed(parseInt0(xText), w);
  const kb = BigInt(k);
  const bit = 1n << kb;
  const popcount = bitString(x, w).split("").filter((c) => c === "1").length;
  const isPow2 = x > 0n && (x & (x - 1n)) === 0n;
  const rows: { code: string; v: bigint | string; meaning: string }[] = [
    { code: `(x >> ${k}) & 1`, v: (x >> kb) & 1n, meaning: `is bit ${k} set?` },
    { code: `x | (1 << ${k})`, v: signed(x | bit, w), meaning: `set bit ${k}` },
    { code: `x & ~(1 << ${k})`, v: x & ~bit, meaning: `clear bit ${k}` },
    { code: `x ^ (1 << ${k})`, v: signed(x ^ bit, w), meaning: `toggle bit ${k}` },
    { code: "x & (x - 1)", v: signed(x & (x - 1n), w), meaning: "clear the lowest set bit" },
    { code: "x & -x", v: signed(x & -x, w), meaning: "keep only the lowest set bit" },
    { code: "x > 0 && (x & (x - 1)) == 0", v: isPow2 ? "true" : "false", meaning: "is x a power of two?" },
    { code: "popcount(x)", v: String(popcount), meaning: "how many 1 bits (16-bit pattern)" },
  ];
  return (
    <div className="crypto-section">
      <h3>2. The trick table</h3>
      <div className="tool-inputs ai-inputs">
        <label>
          x (16-bit)
          <input value={xText} onChange={(e) => setX(e.target.value)} aria-label="x" />
        </label>
      </div>
      <label className="cm-slider">
        k = <strong>{k}</strong>
        <input type="range" min={0} max={15} value={k} onChange={(e) => setK(Number(e.target.value))} aria-label="bit position k" />
      </label>
      <div className="bt-rows">
        <div className="bt-row">
          <span className="bt-label">x</span>
          <Bits value={x} width={w} />
          <span className="bt-dec">{x.toString()}</span>
        </div>
      </div>
      <div className="cm-scroll">
        <table className="bigo-table">
          <thead>
            <tr>
              <th>Expression</th>
              <th>Result</th>
              <th>What it does</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.code}>
                <td className="mono">{r.code}</td>
                <td className="mono">{typeof r.v === "string" ? r.v : `${r.v.toString()} (${bitString(r.v, w)})`}</td>
                <td>{r.meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="gate-note">
        Why x &amp; (x - 1) works: subtracting 1 turns the lowest 1 into 0 and every 0 below it into 1, so the AND wipes exactly
        that one bit. Why x &amp; -x works: -x is ~x + 1, which flips everything above the lowest 1 and keeps that bit.
        Practise them in{" "}
        <button className="link-button" onClick={() => openLesson("bits-power-of-two")}>
          Power of Two
        </button>{" "}
        and{" "}
        <button className="link-button" onClick={() => openLesson("bits-counting-bits")}>
          Counting Bits
        </button>
        .
      </p>
    </div>
  );
}

function XorCancel() {
  const [text, setText] = useState("5, 3, 5, 6, 3");
  const nums = text
    .split(/[,\s]+/)
    .filter(Boolean)
    .slice(0, 12)
    .map((t) => signed(parseInt0(t), 8));
  const running: bigint[] = [];
  let acc = 0n;
  for (const v of nums) {
    acc ^= v;
    running.push(acc);
  }
  return (
    <div className="crypto-section">
      <h3>3. XOR cancels pairs</h3>
      <div className="tool-inputs ai-inputs">
        <label>
          Numbers (8-bit, up to 12)
          <input value={text} onChange={(e) => setText(e.target.value)} aria-label="Numbers to XOR" />
        </label>
      </div>
      <div className="bt-rows">
        {nums.map((v, i) => (
          <div key={i} className="bt-row">
            <span className="bt-label">^= {v.toString()}</span>
            <Bits value={running[i]} width={8} />
            <span className="bt-dec">acc = {running[i].toString()}</span>
          </div>
        ))}
      </div>
      <p className="gate-note">
        x ^ x = 0 and x ^ 0 = x, and the order doesn&apos;t matter, so every value that appears an even number of times
        disappears. Final acc = <strong>{acc.toString()}</strong>. This is{" "}
        <button className="link-button" onClick={() => openLesson("bits-single-number")}>
          Single Number
        </button>{" "}
        and{" "}
        <button className="link-button" onClick={() => openLesson("bits-missing-number")}>
          Missing Number
        </button>
        .
      </p>
    </div>
  );
}

function SubsetMasks() {
  const [text, setText] = useState("a, b, c");
  const items = text
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 5);
  const n = items.length;
  const masks = Array.from({ length: 1 << n }, (_, m) => m);
  return (
    <div className="crypto-section">
      <h3>4. Subsets as bitmasks</h3>
      <div className="tool-inputs ai-inputs">
        <label>
          Items (comma separated, up to 5)
          <input value={text} onChange={(e) => setText(e.target.value)} aria-label="Items" />
        </label>
      </div>
      <div className="cm-scroll">
        <table className="bigo-table">
          <thead>
            <tr>
              <th>mask</th>
              <th>binary</th>
              <th>subset</th>
            </tr>
          </thead>
          <tbody>
            {masks.map((m) => (
              <tr key={m}>
                <td className="mono">{m}</td>
                <td className="mono">{n === 0 ? "-" : m.toString(2).padStart(n, "0")}</td>
                <td className="mono">{"{" + items.filter((_, i) => (m >> i) & 1).join(", ") + "}"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="gate-note">
        Bit i (counting from the right, starting at 0) says whether item i is in. {n} items give 2^{n} = {1 << n} masks,
        one per subset. The graded version is{" "}
        <button className="link-button" onClick={() => openLesson("bits-subsets-bitmask")}>
          All Subsets by Counting Bitmasks
        </button>
        .
      </p>
    </div>
  );
}

const DIFFS: { what: string; cs: string; py: string }[] = [
  { what: "Integer size", cs: "int is 32-bit, long 64-bit, uint/ulong unsigned", py: "int is unbounded (arbitrary precision)" },
  { what: "int.MaxValue + 1", cs: "-2147483648 (wraps; checked(...) throws)", py: "2147483648" },
  { what: "~5", cs: "-6", py: "-6" },
  { what: "-8 >> 1", cs: "-4 (arithmetic shift on int)", py: "-4 (always arithmetic)" },
  { what: "Logical right shift of -1 by 28", cs: "-1 >>> 28 is 15 (C# 11+), or (uint)-1 >> 28", py: "no >>>: (-1 & 0xFFFFFFFF) >> 28 is 15" },
  { what: "1 << 32", cs: "1 for an int (shift count is taken mod 32); 1L << 32 is 4294967296", py: "4294967296" },
  { what: "Binary text of -5", cs: "Convert.ToString(-5, 2) is 32 bits: 111...1011", py: "bin(-5) is '-0b101'; use format(-5 & 0xFFFFFFFF, '032b')" },
  { what: "Popcount", cs: "BitOperations.PopCount((uint)x), or int.PopCount(x) (.NET 7+)", py: "x.bit_count() (3.10+); for negatives it counts abs(x), so mask first" },
  { what: "^", cs: "XOR (power is Math.Pow)", py: "XOR (power is **)" },
  { what: "x & 1 == 0", cs: "compile error: == binds first", py: "means (x & 1) == 0, but add brackets anyway" },
];

export function BitTricks() {
  return (
    <div className="tool-widget">
      <Playground />
      <Tricks />
      <XorCancel />
      <SubsetMasks />
      <div className="crypto-section">
        <h3>5. C# vs Python: where bit code differs</h3>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Thing</th>
                <th>C#</th>
                <th>Python</th>
              </tr>
            </thead>
            <tbody>
              {DIFFS.map((d) => (
                <tr key={d.what}>
                  <td>{d.what}</td>
                  <td className="mono bt-wrap">{d.cs}</td>
                  <td className="mono bt-wrap">{d.py}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="gate-note">
          The rule of thumb for Python: when a problem means 32-bit integers, mask with &amp; 0xFFFFFFFF as you go and convert
          back to signed at the end (subtract 2^32 if bit 31 is set). See{" "}
          <button className="link-button" onClick={() => openLesson("bits-sum-of-two-integers")}>
            Sum of Two Integers
          </button>{" "}
          and{" "}
          <button className="link-button" onClick={() => openLesson("bits-reverse-bits")}>
            Reverse Bits
          </button>
          .
        </p>
      </div>
    </div>
  );
}
