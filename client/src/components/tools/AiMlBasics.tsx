import { useMemo, useState } from "react";
import { evalPolynomial, fitPolynomial, makeDataset, meanSquaredError, seededRandom, trueCurve } from "./aiShared";

// Polynomial curve fitting on 12 noisy points from a fixed seed, with 40 separate
// validation points, plus a short "which kind of learning is this?" drill.

const SEEDS = [11, 7, 42, 21];
const NOISE = 0.22;
const MAX_DEGREE = 11;
const RIDGE = 0.01;
const TRAIN_X = Array.from({ length: 12 }, (_, i) => (i + 0.5) / 12);

const W = 360;
const H = 220;
const PAD = 28;
const Y_MIN = -2;
const Y_MAX = 2;
const sx = (x: number) => PAD + x * (W - PAD * 2);
const sy = (y: number) => H - PAD - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (H - PAD * 2);

function curvePath(f: (x: number) => number) {
  const pts: string[] = [];
  for (let i = 0; i <= 200; i++) {
    const x = i / 200;
    // Clamp far outside the plot so the path stays finite; the clip path hides the rest.
    const y = Math.max(Y_MIN - 3, Math.min(Y_MAX + 3, f(x)));
    pts.push(`${sx(x).toFixed(1)},${sy(y).toFixed(1)}`);
  }
  return pts.join(" ");
}

function verdict(d: number, val: number[], train: number[]) {
  const best = val.indexOf(Math.min(...val));
  if (d < best && val[d] > 1.3 * val[best]) {
    return { cls: "ai-bad", text: "Underfitting: too simple to follow the real shape, so both errors are high." };
  }
  if (d > best && val[d] > 1.3 * val[best]) {
    return {
      cls: "ai-bad",
      text:
        train[d] < 0.001
          ? "Overfitting badly: the curve passes through every training point and is useless in between."
          : "Overfitting: training error keeps falling but validation error is rising. It is fitting the noise.",
    };
  }
  return { cls: "ai-good", text: `About right: close to the lowest validation error (degree ${best}).` };
}

const SCENARIOS: { text: string; answer: "supervised" | "unsupervised" | "reinforcement"; why: string }[] = [
  {
    text: "Predict whether a gearbox will fail in the next 30 days from vibration data, using 5 years of maintenance records saying which ones did.",
    answer: "supervised",
    why: "Each example has a known outcome (failed or not), so this is supervised classification.",
  },
  {
    text: "Group 400 motors into families by their current and temperature profiles, with no idea in advance what the groups are.",
    answer: "unsupervised",
    why: "No labels, just looking for structure: clustering.",
  },
  {
    text: "A simulated robot arm learns to stack boxes by trying moves and getting points when a box ends up on the stack.",
    answer: "reinforcement",
    why: "Actions, an environment and a reward signal: reinforcement learning.",
  },
  {
    text: "Estimate the remaining hours before a filter needs changing, trained on past filters and when each one clogged.",
    answer: "supervised",
    why: "The label is a number (hours), so this is supervised regression.",
  },
  {
    text: "Flag sensor readings that look unlike anything seen in a month of normal running, without examples of faults.",
    answer: "unsupervised",
    why: "Anomaly detection learns what normal looks like from unlabelled data and flags what does not fit.",
  },
  {
    text: "Tune a language model so that replies people preferred in side-by-side comparisons become more likely.",
    answer: "reinforcement",
    why: "This is RLHF: a reward learned from human preferences drives reinforcement learning. Covered in the LLM training lesson.",
  },
];

export function AiMlBasics() {
  const [degree, setDegree] = useState(3);
  const [seedIndex, setSeedIndex] = useState(0);
  const [ridge, setRidge] = useState(false);
  const [showTrue, setShowTrue] = useState(true);
  const [picks, setPicks] = useState<(string | null)[]>(SCENARIOS.map(() => null));

  const seed = SEEDS[seedIndex];
  const { train, val } = useMemo(() => {
    const r = seededRandom(seed + 1000);
    const valX = Array.from({ length: 40 }, () => r());
    return { train: makeDataset(seed, TRAIN_X, NOISE), val: makeDataset(seed + 1, valX, NOISE) };
  }, [seed]);

  const errors = useMemo(
    () =>
      Array.from({ length: MAX_DEGREE + 1 }, (_, d) => {
        const c = fitPolynomial(train, d, ridge ? RIDGE : 0);
        return { train: meanSquaredError(c, train), val: meanSquaredError(c, val), coef: c };
      }),
    [train, val, ridge],
  );
  const current = errors[degree];
  const v = verdict(
    degree,
    errors.map((e) => e.val),
    errors.map((e) => e.train),
  );

  // Error-vs-degree chart, log scale on y.
  const EW = 360;
  const EH = 150;
  const EP = 28;
  const logMin = Math.log10(0.001);
  const logMax = Math.log10(10);
  const ex = (d: number) => EP + (d / MAX_DEGREE) * (EW - EP * 2);
  const ey = (e: number) => {
    const t = (Math.log10(Math.min(Math.max(e, 0.001), 10)) - logMin) / (logMax - logMin);
    return EH - EP + 6 - t * (EH - EP - 6 - 8);
  };
  const line = (key: "train" | "val") => errors.map((e, d) => `${ex(d)},${ey(e[key])}`).join(" ");

  return (
    <div className="tool-widget ai-widget">
      <h3>Fit a curve, then check it on unseen data</h3>
      <label className="ai-slider">
        <span>
          Polynomial degree: <strong>{degree}</strong> ({degree + 1} parameters)
        </span>
        <input type="range" min={0} max={MAX_DEGREE} value={degree} onChange={(e) => setDegree(Number(e.target.value))} />
      </label>
      <div className="ai-row">
        <label className="tool-checkbox">
          <input type="checkbox" checked={showTrue} onChange={(e) => setShowTrue(e.target.checked)} />
          Show the true curve
        </label>
        <label className="tool-checkbox">
          <input type="checkbox" checked={ridge} onChange={(e) => setRidge(e.target.checked)} />
          Regularise (penalise large weights)
        </label>
        <button onClick={() => setSeedIndex((seedIndex + 1) % SEEDS.length)}>Draw another sample</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="ai-chart" role="img" aria-label={`Degree ${degree} polynomial fitted to 12 training points`}>
        <defs>
          <clipPath id="ai-fit-clip">
            <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} />
          </clipPath>
        </defs>
        <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} className="ai-plot-bg" />
        <line x1={PAD} y1={sy(0)} x2={W - PAD} y2={sy(0)} className="ai-axis" />
        <text x={W / 2} y={H - 8} textAnchor="middle" className="ai-axis-label">
          feature x
        </text>
        <text x={10} y={H / 2} textAnchor="middle" className="ai-axis-label" transform={`rotate(-90, 10, ${H / 2})`}>
          label y
        </text>
        <g clipPath="url(#ai-fit-clip)">
          {showTrue && <polyline points={curvePath(trueCurve)} className="ai-true-line" />}
          <polyline points={curvePath((x) => evalPolynomial(current.coef, x))} className="ai-fit-line" />
        </g>
        {val.map((p, i) => (
          <circle key={`v${i}`} cx={sx(p.x)} cy={sy(p.y)} r={3} className="ai-val-pt" />
        ))}
        {train.map((p, i) => (
          <circle key={`t${i}`} cx={sx(p.x)} cy={sy(p.y)} r={4} className="ai-train-pt" />
        ))}
      </svg>
      <ul className="ai-legend">
        <li>
          <span className="ai-key ai-key-train" /> training points (12)
        </li>
        <li>
          <span className="ai-key ai-key-val" /> validation points (40, never used for fitting)
        </li>
        <li>
          <span className="ai-key ai-key-fit" /> fitted model
        </li>
        {showTrue && (
          <li>
            <span className="ai-key ai-key-true" /> true curve
          </li>
        )}
      </ul>

      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">Training error</span>
          <span className="readout-value">{current.train.toFixed(4)}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Validation error</span>
          <span className="readout-value">{current.val < 100 ? current.val.toFixed(3) : current.val.toExponential(1)}</span>
        </div>
      </div>
      <p className={`ai-verdict ${v.cls}`}>{v.text}</p>

      <h4 className="ai-subhead">Error against degree</h4>
      <svg viewBox={`0 0 ${EW} ${EH}`} className="ai-chart" role="img" aria-label="Training and validation error for every degree">
        <rect x={EP} y={8} width={EW - EP * 2} height={EH - EP - 2} className="ai-plot-bg" />
        <polyline points={line("train")} className="ai-err-train" />
        <polyline points={line("val")} className="ai-err-val" />
        {errors.map((e, d) => (
          <g key={d}>
            <circle cx={ex(d)} cy={ey(e.train)} r={d === degree ? 4 : 2.5} className="ai-err-train-pt" />
            <circle cx={ex(d)} cy={ey(e.val)} r={d === degree ? 4 : 2.5} className="ai-err-val-pt" />
            <text x={ex(d)} y={EH - 8} textAnchor="middle" className={d === degree ? "ai-tick ai-tick-on" : "ai-tick"}>
              {d}
            </text>
          </g>
        ))}
        <line x1={ex(degree)} y1={8} x2={ex(degree)} y2={EH - EP + 6} className="ai-marker" />
      </svg>
      <ul className="ai-legend">
        <li>
          <span className="ai-key ai-key-fit" /> training error
        </li>
        <li>
          <span className="ai-key ai-key-valline" /> validation error (log scale, degree along the bottom)
        </li>
      </ul>
      <p className="gate-note">
        Error here is mean squared error. The noise in the data alone gives an error of about {(NOISE * NOISE).toFixed(3)}, so a
        training error far below that means the model is memorising noise. Tick Regularise at degree 11 to see a penalty on
        large weights tame the wild curve without lowering the degree.
      </p>

      <h3>Which kind of learning?</h3>
      <ol className="ai-quiz">
        {SCENARIOS.map((s, i) => (
          <li key={i}>
            <p>{s.text}</p>
            <div className="sql-presets">
              {(["supervised", "unsupervised", "reinforcement"] as const).map((k) => (
                <button
                  key={k}
                  className={picks[i] === k ? (k === s.answer ? "active" : "ai-wrong") : ""}
                  onClick={() => setPicks(picks.map((p, j) => (j === i ? k : p)))}
                >
                  {k}
                </button>
              ))}
            </div>
            {picks[i] && <p className={picks[i] === s.answer ? "ai-good" : "ai-bad"}>{picks[i] === s.answer ? "Right. " : "Not quite. "}{s.why}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}
