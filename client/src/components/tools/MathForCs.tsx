import { useState } from "react";
import { openLesson } from "../../api";

// Three sliders for the math Big O leans on: powers of two, log2 as repeated halving, and the
// triangle sum 1 + 2 + ... + n, plus a growth table comparing the usual complexity classes.

function sizeWord(v: number): string {
  if (v >= 1e12) return `about ${(v / 1e12).toPrecision(3)} trillion`;
  if (v >= 1e9) return `about ${(v / 1e9).toPrecision(3)} billion`;
  if (v >= 1e6) return `about ${(v / 1e6).toPrecision(3)} million`;
  if (v >= 1e3) return `about ${(v / 1e3).toPrecision(3)} thousand`;
  return "";
}

function big(v: number): string {
  if (!Number.isFinite(v) || v >= 1e15) return v.toExponential(2).replace("e+", " x 10^");
  return v.toLocaleString("en-US");
}

function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

// Log-scale slider positions for "n" in the halving demo.
const HALVING_SIZES = [2, 8, 16, 100, 1000, 10_000, 100_000, 1_000_000, 1_000_000_000];

export function MathForCs() {
  const [power, setPower] = useState(10);
  const [sizeIdx, setSizeIdx] = useState(4);
  const [tri, setTri] = useState(6);
  const [growthN, setGrowthN] = useState(10);

  const pow = 2 ** power;
  const n = HALVING_SIZES[sizeIdx];
  const halvings: number[] = [];
  for (let v = n; v >= 1; v = Math.floor(v / 2)) {
    halvings.push(v);
    if (v === 1) break;
  }
  const steps = halvings.length - 1;
  const shown = halvings.length > 12 ? [...halvings.slice(0, 6), -1, ...halvings.slice(-4)] : halvings;

  const triSum = (tri * (tri + 1)) / 2;

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>1. Powers of two: what n bits can count</h3>
        <label className="cm-slider">
          Exponent: <strong>{power}</strong>
          <input type="range" min={0} max={64} value={power} onChange={(e) => setPower(Number(e.target.value))} aria-label="Exponent" />
        </label>
        <div className="tool-readout">
          <div className="readout-cell">
            <span className="readout-label">2^{power}</span>
            <span className="readout-value">{big(pow)}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">In words</span>
            <span className="readout-value">{sizeWord(pow) || "under a thousand"}</span>
          </div>
        </div>
        <p className="gate-note">
          {power} bit{power === 1 ? "" : "s"} can hold 2^{power} = {big(pow)} different values
          {power > 0 ? `, from 0 up to ${big(pow - 1)} if none are negative` : ""}. Each extra bit doubles it.
          Landmarks: 2^8 = 256 (a byte), 2^10 = 1,024 (about a thousand, a KB), 2^20 (a million, MB), 2^30 (a
          billion, GB), 2^32 (about 4.3 billion, a 32-bit int), 2^64 (a 64-bit long).
        </p>
      </div>

      <div className="crypto-section">
        <h3>2. Logarithms: how many times can you halve it?</h3>
        <label className="cm-slider">
          Start with n = <strong>{n.toLocaleString("en-US")}</strong>
          <input
            type="range"
            min={0}
            max={HALVING_SIZES.length - 1}
            value={sizeIdx}
            onChange={(e) => setSizeIdx(Number(e.target.value))}
            aria-label="Starting size n"
          />
        </label>
        <div className="mfc-halvings" aria-label="Halving sequence">
          {shown.map((v, i) =>
            v === -1 ? (
              <span key={i} className="mfc-gap">
                ...
              </span>
            ) : (
              <span key={i} className="mfc-chip">
                {v.toLocaleString("en-US")}
              </span>
            ),
          )}
        </div>
        <div className="tool-readout">
          <div className="readout-cell">
            <span className="readout-label">Halvings to reach 1</span>
            <span className="readout-value">{steps}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">log2(n)</span>
            <span className="readout-value">{Math.log2(n).toFixed(2)}</span>
          </div>
        </div>
        <p className="gate-note">
          Halving (rounding down) reaches 1 after about log2(n) steps. A thousand times more data adds only about
          10 steps. That's what O(log n) means, and it's how{" "}
          <button className="link-button" onClick={() => openLesson("binary-search-array")}>
            binary search
          </button>{" "}
          finds one item among a billion in about 30 comparisons.
        </p>
      </div>

      <div className="crypto-section">
        <h3>3. The sum 1 + 2 + ... + n</h3>
        <label className="cm-slider">
          n = <strong>{tri}</strong>
          <input type="range" min={1} max={16} value={tri} onChange={(e) => setTri(Number(e.target.value))} aria-label="n for the sum" />
        </label>
        <div className="mfc-tri" aria-hidden="true">
          {Array.from({ length: tri }, (_, row) => (
            <div key={row} className="mfc-row">
              {Array.from({ length: tri }, (_, col) => (
                <span key={col} className={col <= row ? "mfc-cell on" : "mfc-cell"} />
              ))}
            </div>
          ))}
        </div>
        <p className="gate-note">
          1 + 2 + ... + {tri} = {tri} x {tri + 1} / 2 = <strong>{triSum}</strong>. The filled staircase is just over
          half of the {tri} x {tri} square ({tri * tri} cells). Code shaped like "for each item, look at every item
          before it" does this much work, so it grows like n^2 / 2: O(n^2).
        </p>
      </div>

      <div className="crypto-section">
        <h3>4. Growth side by side</h3>
        <label className="cm-slider">
          n = <strong>{growthN}</strong>
          <input type="range" min={1} max={30} value={growthN} onChange={(e) => setGrowthN(Number(e.target.value))} aria-label="n for the growth table" />
        </label>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>log2 n</th>
                <th>n</th>
                <th>n^2</th>
                <th>2^n</th>
                <th>n!</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{Math.log2(growthN).toFixed(1)}</td>
                <td>{growthN}</td>
                <td>{big(growthN * growthN)}</td>
                <td>{big(2 ** growthN)}</td>
                <td>{big(factorial(growthN))}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="gate-note">
          At a billion simple steps per second, 2^30 steps take about a second, 2^60 would take decades, and 30!
          steps would outlast the universe. That's why{" "}
          <button className="link-button" onClick={() => openLesson("big-o-notation")}>
            Big O Notation
          </button>{" "}
          cares about the shape of the curve, not the exact count.
        </p>
      </div>
    </div>
  );
}
