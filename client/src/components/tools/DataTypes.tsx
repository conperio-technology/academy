import { useState } from "react";
import { openLesson } from "../../api";

// Part 1: the common integer types and their ranges. Part 2: push a 32-bit int past its limit
// and compare C# unchecked (wraps), C# checked (throws) and Python (grows). Part 3: text as
// numbers. Part 4: the same expression typed in C# and Python. BigInt keeps the math exact.

const INT_TYPES: { name: string; bits: number; signed: boolean; note: string }[] = [
  { name: "byte", bits: 8, signed: false, note: "C#: raw bytes, file and network data" },
  { name: "short", bits: 16, signed: true, note: "C#: rare outside binary formats" },
  { name: "int", bits: 32, signed: true, note: "C#: the default whole number" },
  { name: "long", bits: 64, signed: true, note: "C#: counts, IDs, timestamps that outgrow int" },
];

function range(bits: number, signed: boolean): [bigint, bigint] {
  const b = BigInt(bits);
  return signed ? [-(1n << (b - 1n)), (1n << (b - 1n)) - 1n] : [0n, (1n << b) - 1n];
}

const fmt = (v: bigint) => v.toLocaleString("en-US");
const INT_MIN = -(2n ** 31n);
const INT_MAX = 2n ** 31n - 1n;

function wrap32(v: bigint): bigint {
  return BigInt.asIntN(32, v);
}

function bits32(v: bigint): string {
  const u = BigInt.asUintN(32, v).toString(2).padStart(32, "0");
  return u.replace(/(.{8})(?!$)/g, "$1 ");
}

const EXPRESSIONS: { expr: string; cs: string; py: string }[] = [
  { expr: "7 / 2", cs: "3 (int / int drops the fraction)", py: "3.5 (/ always gives a float; 7 // 2 is 3)" },
  { expr: "\"5\" + 3", cs: "\"53\" (the number is turned into text and joined)", py: "TypeError: can't add str and int" },
  { expr: "0.1 + 0.2 == 0.3", cs: "False", py: "False (see Floating Point)" },
  { expr: "10 > 3", cs: "True (a bool)", py: "True (a bool)" },
  { expr: "x + 1, with x = 2147483647", cs: "-2147483648 (an int wraps)", py: "2147483648 (Python ints grow)" },
];

export function DataTypes() {
  const [value, setValue] = useState<bigint>(INT_MAX - 2n);
  const [text, setText] = useState("Hi é!");

  const exact = value;
  const cs = wrap32(exact);
  const overflowed = exact > INT_MAX || exact < INT_MIN;

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>1. Whole numbers come in fixed sizes</h3>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Bits</th>
                <th>Smallest</th>
                <th>Largest</th>
                <th>Used for</th>
              </tr>
            </thead>
            <tbody>
              {INT_TYPES.map((t) => {
                const [lo, hi] = range(t.bits, t.signed);
                return (
                  <tr key={t.name}>
                    <td><code>{t.name}</code></td>
                    <td>{t.bits}</td>
                    <td>{fmt(lo)}</td>
                    <td>{fmt(hi)}</td>
                    <td>{t.note}</td>
                  </tr>
                );
              })}
              <tr>
                <td><code>int</code> (Python)</td>
                <td>as many as needed</td>
                <td>no limit</td>
                <td>no limit</td>
                <td>Python: every whole number</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="crypto-section">
        <h3>2. Push a 32-bit int over the edge</h3>
        <div className="cm-actions">
          <button onClick={() => setValue((v) => v - 1n)}>- 1</button>
          <button onClick={() => setValue((v) => v + 1n)}>+ 1</button>
          <button onClick={() => setValue(INT_MAX - 2n)}>Near the top</button>
          <button onClick={() => setValue(INT_MIN + 2n)}>Near the bottom</button>
        </div>
        <div className="tool-readout">
          <div className="readout-cell">
            <span className="readout-label">The true answer</span>
            <span className="readout-value">{fmt(exact)}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">C# int (default)</span>
            <span className={overflowed ? "readout-value dt-bad" : "readout-value"}>{fmt(cs)}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">C# int in checked {"{ }"}</span>
            <span className={overflowed ? "readout-value dt-bad" : "readout-value"}>
              {overflowed ? "OverflowException" : fmt(exact)}
            </span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Python int</span>
            <span className="readout-value">{fmt(exact)}</span>
          </div>
        </div>
        <p className="gate-note mono dt-bits">C# int bits: {bits32(cs)}</p>
        <p className="gate-note">
          {overflowed
            ? "Overflow: the true value doesn't fit in 32 bits. C# keeps only the low 32 bits, so the leftmost (sign) bit flips and the number jumps to the other end of the range, like an odometer rolling over. checked turns that into an error you can catch; Python's int just grows."
            : "Still in range: all three agree. Press + 1 a few times to go past 2,147,483,647."}{" "}
          The bit pattern uses two's complement, explained in{" "}
          <button className="link-button" onClick={() => openLesson("number-bases-bits")}>
            Bits, Bytes & Number Bases
          </button>
          .
        </p>
      </div>

      <div className="crypto-section">
        <h3>3. Text is numbers too</h3>
        <label className="tool-single-input">
          Type some text
          <input type="text" value={text} onChange={(e) => setText(e.target.value)} maxLength={24} />
        </label>
        <div className="mfc-halvings">
          {[...text].map((ch, i) => (
            <span key={i} className="mfc-chip">
              {ch === " " ? "space" : ch} = {ch.codePointAt(0)}
            </span>
          ))}
        </div>
        <p className="gate-note">
          Each character is stored as a number (its Unicode code point): A is 65, a is 97, a space is 32. A string
          is a sequence of these. How the numbers become bytes, and why "length" can mean three different things, is in{" "}
          <button className="link-button" onClick={() => openLesson("text-encoding")}>
            Text Encoding
          </button>
          .
        </p>
      </div>

      <div className="crypto-section">
        <h3>4. Same expression, two languages</h3>
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
              {EXPRESSIONS.map((e) => (
                <tr key={e.expr}>
                  <td><code>{e.expr}</code></td>
                  <td>{e.cs}</td>
                  <td>{e.py}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="gate-note">
          Types decide what an operator means. Decimals are their own type with their own surprises: see{" "}
          <button className="link-button" onClick={() => openLesson("floating-point-representation")}>
            Floating Point: IEEE-754
          </button>
          .
        </p>
      </div>
    </div>
  );
}
