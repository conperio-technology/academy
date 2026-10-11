import { useState } from "react";
import { openLesson } from "../../api";

// Greedy algorithms explainer: break greedy coin change, compare interval-scheduling rules on
// inputs built to defeat them, fractional vs 0/1 knapsack, an exchange-argument walk-through and
// a "greedy or DP?" check. Everything is computed here, nothing is canned.

// ---------- coin change ----------

const COIN_SYSTEMS: { label: string; coins: number[] }[] = [
  { label: "1, 5, 10, 25 (US cents)", coins: [1, 5, 10, 25] },
  { label: "1, 3, 4", coins: [1, 3, 4] },
  { label: "1, 7, 10", coins: [1, 7, 10] },
  { label: "1, 5, 6, 9", coins: [1, 5, 6, 9] },
];

function greedyCoins(coins: number[], amount: number): number[] {
  const out: number[] = [];
  let left = amount;
  for (const c of [...coins].sort((a, b) => b - a)) {
    while (left >= c) {
      out.push(c);
      left -= c;
    }
  }
  return out;
}

function optimalCoins(coins: number[], amount: number): number[] {
  const best = new Array<number>(amount + 1).fill(Infinity);
  const pick = new Array<number>(amount + 1).fill(0);
  best[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a && best[a - c] + 1 < best[a]) {
        best[a] = best[a - c] + 1;
        pick[a] = c;
      }
    }
  }
  const out: number[] = [];
  for (let a = amount; a > 0; a -= pick[a]) out.push(pick[a]);
  return out.sort((x, y) => y - x);
}

function firstCounterexample(coins: number[]): number | null {
  for (let a = 1; a <= 200; a++) {
    if (greedyCoins(coins, a).length > optimalCoins(coins, a).length) return a;
  }
  return null;
}

function CoinChange() {
  const [sys, setSys] = useState(1);
  const [amount, setAmount] = useState(6);
  const coins = COIN_SYSTEMS[sys].coins;
  const g = greedyCoins(coins, amount);
  const o = optimalCoins(coins, amount);
  const counter = firstCounterexample(coins);
  const fails = g.length > o.length;

  return (
    <div className="crypto-section">
      <h3>1. Break greedy coin change</h3>
      <p className="gate-note">Greedy rule: always take the largest coin that still fits. Compare it with the true fewest coins (computed by dynamic programming).</p>
      <div className="sql-presets" role="group" aria-label="Coin system">
        {COIN_SYSTEMS.map((s, i) => (
          <button key={s.label} className={i === sys ? "active" : ""} onClick={() => setSys(i)}>
            {s.label}
          </button>
        ))}
      </div>
      <label className="cm-slider">
        Amount: <strong>{amount}</strong>
        <input type="range" min={1} max={60} value={amount} onChange={(e) => setAmount(Number(e.target.value))} aria-label="Amount" />
      </label>
      <div className="gr-coin-rows">
        <div className="gr-coin-row">
          <span className="gr-coin-label">Greedy ({g.length})</span>
          <span className="gr-coins">
            {g.map((c, i) => (
              <span key={i} className={`gr-coin ${fails ? "gr-bad" : ""}`}>
                {c}
              </span>
            ))}
          </span>
        </div>
        <div className="gr-coin-row">
          <span className="gr-coin-label">Fewest ({o.length})</span>
          <span className="gr-coins">
            {o.map((c, i) => (
              <span key={i} className="gr-coin gr-good">
                {c}
              </span>
            ))}
          </span>
        </div>
      </div>
      <p className="gate-note">
        {fails ? (
          <>
            <strong>Greedy loses:</strong> {g.length} coins where {o.length} would do. Taking the biggest coin first
            committed to a choice that no later step could undo.
          </>
        ) : (
          <>Greedy matches the best answer for {amount}.</>
        )}{" "}
        {counter === null
          ? "For this coin system greedy is optimal for every amount up to 200 (systems like this are called canonical)."
          : `The smallest amount where greedy fails with these coins is ${counter}.`}{" "}
        The general fix is the{" "}
        <button className="link-button" onClick={() => openLesson("dp-coin-change")}>
          Coin Change
        </button>{" "}
        DP.
      </p>
    </div>
  );
}

// ---------- interval scheduling ----------

type Interval = [number, number];
type Rule = "start" | "shortest" | "end";

const RULES: { id: Rule; label: string }[] = [
  { id: "start", label: "Earliest start" },
  { id: "shortest", label: "Shortest first" },
  { id: "end", label: "Earliest end" },
];

const INTERVAL_SETS: { label: string; note: string; items: Interval[] }[] = [
  {
    label: "One long early meeting",
    note: "A long interval that starts first blocks everything if you pick by start time.",
    items: [
      [0, 10],
      [1, 3],
      [4, 6],
      [7, 9],
    ],
  },
  {
    label: "A short bridge",
    note: "The shortest interval can overlap two others that would both fit.",
    items: [
      [0, 5],
      [4, 7],
      [6, 11],
    ],
  },
  {
    label: "Mixed day",
    note: "A busier example: try each rule and count.",
    items: [
      [0, 6],
      [1, 4],
      [3, 5],
      [3, 8],
      [4, 7],
      [5, 9],
      [6, 10],
      [8, 11],
    ],
  },
];

function schedule(items: Interval[], rule: Rule): Set<number> {
  const order = items
    .map((iv, i) => ({ iv, i }))
    .sort((a, b) => {
      if (rule === "start") return a.iv[0] - b.iv[0] || a.iv[1] - b.iv[1];
      if (rule === "shortest") return a.iv[1] - a.iv[0] - (b.iv[1] - b.iv[0]) || a.iv[0] - b.iv[0];
      return a.iv[1] - b.iv[1] || a.iv[0] - b.iv[0];
    });
  const chosen: number[] = [];
  for (const { iv, i } of order) {
    // Touching endpoints don't overlap.
    if (chosen.every((j) => iv[1] <= items[j][0] || iv[0] >= items[j][1])) chosen.push(i);
  }
  return new Set(chosen);
}

function IntervalRules() {
  const [setIdx, setSetIdx] = useState(0);
  const [rule, setRule] = useState<Rule>("start");
  const { items, note } = INTERVAL_SETS[setIdx];
  const chosen = schedule(items, rule);
  const best = schedule(items, "end").size;
  const max = Math.max(...items.map((iv) => iv[1]));

  return (
    <div className="crypto-section">
      <h3>2. Interval scheduling: which greedy rule?</h3>
      <p className="gate-note">
        Keep as many non-overlapping intervals as possible. Each rule sorts the intervals its own way and keeps every
        one that doesn't clash with what it already kept.
      </p>
      <div className="sql-presets" role="group" aria-label="Interval set">
        {INTERVAL_SETS.map((s, i) => (
          <button key={s.label} className={i === setIdx ? "active" : ""} onClick={() => setSetIdx(i)}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="sql-presets" role="group" aria-label="Greedy rule">
        {RULES.map((r) => (
          <button key={r.id} className={r.id === rule ? "active" : ""} onClick={() => setRule(r.id)}>
            {r.label}
          </button>
        ))}
      </div>
      <div className="gr-timeline" aria-label="Intervals on a timeline">
        {items.map((iv, i) => (
          <div key={i} className="gr-tl-row">
            <span className="gr-tl-label">
              [{iv[0]}, {iv[1]}]
            </span>
            <span className="gr-tl-track">
              <span
                className={`gr-tl-bar ${chosen.has(i) ? "gr-kept" : "gr-dropped"}`}
                style={{ left: `${(iv[0] / max) * 100}%`, width: `${((iv[1] - iv[0]) / max) * 100}%` }}
              />
            </span>
          </div>
        ))}
      </div>
      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">{RULES.find((r) => r.id === rule)!.label} keeps</span>
          <span className="readout-value">{chosen.size}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Best possible</span>
          <span className="readout-value">{best}</span>
        </div>
      </div>
      <p className="gate-note">
        {note}{" "}
        {chosen.size < best
          ? "This rule loses here, so it can't be the right greedy choice."
          : rule === "end"
            ? "Earliest end is the rule with a proof (below): it never loses."
            : "This rule happens to tie here; another preset breaks it."}{" "}
        The graded version is{" "}
        <button className="link-button" onClick={() => openLesson("intervals-non-overlapping")}>
          Non-overlapping Intervals
        </button>
        .
      </p>
    </div>
  );
}

// ---------- exchange argument ----------

const EXCHANGE_STEPS = [
  "Claim: some optimal schedule starts with g, the interval that ends earliest of all.",
  "Take any optimal schedule O and look at its first interval f (the one in O that ends first).",
  "If f is g, done. Otherwise g ends no later than f, because g ends earliest of all.",
  "Swap f out and g in. Every other interval in O starts after f ends, so it also starts after g ends: no new overlaps.",
  "The swapped schedule is valid and has the same size, so it is also optimal, and it starts with g. The claim holds.",
  "What's left after g is the same problem on the intervals that start at or after g's end, so apply the same argument again. By induction, every greedy choice is safe.",
];

function ExchangeArgument() {
  const [step, setStep] = useState(0);
  return (
    <div className="crypto-section">
      <h3>3. The exchange argument, one step at a time</h3>
      <ol className="gr-proof">
        {EXCHANGE_STEPS.slice(0, step + 1).map((s, i) => (
          <li key={i} className={i === step ? "gr-proof-now" : ""}>
            {s}
          </li>
        ))}
      </ol>
      <div className="cm-actions">
        <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          Back
        </button>
        <button onClick={() => setStep((s) => Math.min(EXCHANGE_STEPS.length - 1, s + 1))} disabled={step === EXCHANGE_STEPS.length - 1}>
          Next step
        </button>
      </div>
      <p className="gate-note">
        Try the same argument on &quot;earliest start&quot;: step 3 fails, because the interval that starts first can end
        very late, and swapping it in can create overlaps. A proof that breaks tells you where to look for a
        counterexample.
      </p>
    </div>
  );
}

// ---------- knapsack ----------

const ITEMS = [
  { name: "A", w: 10, v: 60 },
  { name: "B", w: 20, v: 100 },
  { name: "C", w: 30, v: 120 },
];

function Knapsack() {
  const [cap, setCap] = useState(50);
  const byRatio = [...ITEMS].sort((a, b) => b.v / b.w - a.v / a.w);

  // Fractional: take by ratio, cut the last item.
  let room = cap;
  let fractional = 0;
  const fracParts: string[] = [];
  for (const it of byRatio) {
    if (room <= 0) break;
    const take = Math.min(it.w, room);
    fractional += (it.v * take) / it.w;
    fracParts.push(take === it.w ? it.name : `${take}/${it.w} of ${it.name}`);
    room -= take;
  }

  // 0/1 greedy by ratio: whole items only, skip what doesn't fit.
  room = cap;
  let greedyWhole = 0;
  const greedyParts: string[] = [];
  for (const it of byRatio) {
    if (it.w <= room) {
      greedyWhole += it.v;
      greedyParts.push(it.name);
      room -= it.w;
    }
  }

  // 0/1 optimum: try all 8 subsets.
  let best = 0;
  let bestParts: string[] = [];
  for (let mask = 0; mask < 1 << ITEMS.length; mask++) {
    const pick = ITEMS.filter((_, i) => (mask >> i) & 1);
    const w = pick.reduce((s, it) => s + it.w, 0);
    const v = pick.reduce((s, it) => s + it.v, 0);
    if (w <= cap && v > best) {
      best = v;
      bestParts = pick.map((it) => it.name);
    }
  }

  const fmt = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1));
  return (
    <div className="crypto-section">
      <h3>4. Knapsack: same greedy, two different problems</h3>
      <p className="gate-note">
        Items A (10 kg, 60), B (20 kg, 100) and C (30 kg, 120). The greedy rule takes the best value per kilo first: A is
        6 per kg, B 5, C 4.
      </p>
      <label className="cm-slider">
        Bag capacity: <strong>{cap} kg</strong>
        <input type="range" min={10} max={60} step={5} value={cap} onChange={(e) => setCap(Number(e.target.value))} aria-label="Bag capacity" />
      </label>
      <div className="cm-scroll">
        <table className="bigo-table">
          <thead>
            <tr>
              <th>Version</th>
              <th>Takes</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Fractional, greedy by ratio</td>
              <td>{fracParts.join(", ") || "nothing"}</td>
              <td className="mono">{fmt(fractional)}</td>
            </tr>
            <tr className={greedyWhole < best ? "ll-missing" : ""}>
              <td>Whole items, greedy by ratio</td>
              <td>{greedyParts.join(", ") || "nothing"}</td>
              <td className="mono">{greedyWhole}</td>
            </tr>
            <tr>
              <td>Whole items, best possible</td>
              <td>{bestParts.join(", ") || "nothing"}</td>
              <td className="mono">{best}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="gate-note">
        When you can cut items, ratio-first is provably optimal (an exchange argument swaps any lower-ratio kilo for a
        higher-ratio one). With whole items it can leave the bag badly filled: at 50 kg greedy gets 160, but B + C gets
        220. That version is{" "}
        <button className="link-button" onClick={() => openLesson("knapsack-01")}>
          0/1 Knapsack
        </button>
        , a DP.
      </p>
    </div>
  );
}

// ---------- greedy or not? ----------

const QUIZ: { q: string; greedy: boolean; why: string }[] = [
  { q: "Fewest coins for an amount, coins 1, 5, 10, 25.", greedy: true, why: "This coin system is canonical: largest coin first is always optimal (but only because of these particular values)." },
  { q: "Fewest coins for an amount, coins 1, 3, 4.", greedy: false, why: "6 = 3 + 3 beats greedy's 4 + 1 + 1. Use the coin change DP." },
  { q: "Most meetings you can attend in one room.", greedy: true, why: "Interval scheduling: always take the meeting that ends earliest. The exchange argument proves it." },
  { q: "Most value in a bag when items can't be split.", greedy: false, why: "0/1 knapsack: ratio-first fails, so you need DP over capacity." },
  { q: "Most value in a bag when you can take any fraction of an item.", greedy: true, why: "Fractional knapsack: take the best value per kilo first, cutting the last item." },
  { q: "Longest increasing subsequence.", greedy: false, why: "Taking each larger number as it comes can lock you out of a longer run later. It's a DP (or patience sorting with binary search)." },
  { q: "Can you reach the end of an array where nums[i] is the longest jump from i?", greedy: true, why: "Jump Game: keep the farthest reachable index; a bigger reach is never worse." },
  { q: "Cheapest way to connect every city with roads.", greedy: true, why: "Minimum spanning tree: Kruskal adds the cheapest edge that doesn't close a cycle, a greedy rule with a cut-property proof." },
];

function GreedyOrNot() {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const right = QUIZ.filter((item, i) => answers[i] === item.greedy).length;
  const done = Object.keys(answers).length;
  return (
    <div className="crypto-section">
      <h3>5. Greedy or not?</h3>
      <p className="gate-note">For each problem, does a simple greedy rule give the optimal answer?</p>
      <ol className="cm-quiz">
        {QUIZ.map((item, i) => {
          const a = answers[i];
          return (
            <li key={i}>
              <p>{item.q}</p>
              <div className="sql-presets">
                {[true, false].map((choice) => (
                  <button
                    key={String(choice)}
                    className={a === undefined ? "" : choice === item.greedy ? "active" : a === choice ? "cm-wrong" : ""}
                    onClick={() => setAnswers((s) => ({ ...s, [i]: choice }))}
                    disabled={a !== undefined}
                  >
                    {choice ? "Greedy works" : "Needs DP or search"}
                  </button>
                ))}
              </div>
              {a !== undefined && (
                <p className="gate-note">
                  {a === item.greedy ? "Right. " : "Not quite. "}
                  {item.why}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      {done > 0 && (
        <div className="cm-actions">
          <span className="gate-note">
            {right} of {done} right.
          </span>
          <button onClick={() => setAnswers({})}>Reset</button>
        </div>
      )}
    </div>
  );
}

export function GreedyAlgorithms() {
  return (
    <div className="tool-widget">
      <CoinChange />
      <IntervalRules />
      <ExchangeArgument />
      <Knapsack />
      <GreedyOrNot />
    </div>
  );
}
