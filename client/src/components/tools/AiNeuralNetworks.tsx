import { useState } from "react";
import { descend, loss } from "./aiShared";

// Three parts: a single neuron you can wire by hand, gradient descent on a one-weight loss
// curve with a learning-rate slider, and an epochs/batches calculator.

type Activation = "none" | "relu" | "sigmoid" | "tanh";

const ACTIVATIONS: { id: Activation; label: string; f: (z: number) => number; note: string }[] = [
  { id: "none", label: "None (linear)", f: (z) => z, note: "Passes the sum straight through. Layers of these collapse into one straight-line model." },
  { id: "relu", label: "ReLU", f: (z) => Math.max(0, z), note: "max(0, z). Cheap and the usual default inside hidden layers." },
  { id: "sigmoid", label: "Sigmoid", f: (z) => 1 / (1 + Math.exp(-z)), note: "Squashes any number into 0 to 1, handy for a probability." },
  { id: "tanh", label: "tanh", f: (z) => Math.tanh(z), note: "Squashes into -1 to 1, centred on zero." },
];

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="ai-slider ai-slider-sm">
      <span>
        {label} = <strong>{value.toFixed(1)}</strong>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

function Neuron() {
  const [x1, setX1] = useState(1);
  const [x2, setX2] = useState(0.5);
  const [w1, setW1] = useState(0.8);
  const [w2, setW2] = useState(-1.2);
  const [b, setB] = useState(0.2);
  const [act, setAct] = useState<Activation>("relu");
  const a = ACTIVATIONS.find((x) => x.id === act)!;
  const z = w1 * x1 + w2 * x2 + b;
  const out = a.f(z);

  const W = 360;
  const H = 150;
  const P = 24;
  const zx = (v: number) => P + ((v + 4) / 8) * (W - P * 2);
  const yMin = act === "none" ? -4 : -1.2;
  const yMax = act === "none" ? 4 : act === "relu" ? 4 : 1.2;
  const zy = (v: number) => H - P - ((Math.max(yMin, Math.min(yMax, v)) - yMin) / (yMax - yMin)) * (H - P * 2);
  const pts = Array.from({ length: 81 }, (_, i) => -4 + i * 0.1)
    .map((v) => `${zx(v)},${zy(a.f(v))}`)
    .join(" ");

  return (
    <>
      <h3>One neuron</h3>
      <div className="ai-grid-2">
        <div>
          <Slider label="input x1" value={x1} min={-2} max={2} step={0.1} onChange={setX1} />
          <Slider label="input x2" value={x2} min={-2} max={2} step={0.1} onChange={setX2} />
        </div>
        <div>
          <Slider label="weight w1" value={w1} min={-2} max={2} step={0.1} onChange={setW1} />
          <Slider label="weight w2" value={w2} min={-2} max={2} step={0.1} onChange={setW2} />
          <Slider label="bias b" value={b} min={-2} max={2} step={0.1} onChange={setB} />
        </div>
      </div>
      <div className="sql-presets">
        {ACTIVATIONS.map((x) => (
          <button key={x.id} className={x.id === act ? "active" : ""} onClick={() => setAct(x.id)}>
            {x.label}
          </button>
        ))}
      </div>
      <pre className="algo-code ai-math">
        {`z = w1·x1 + w2·x2 + b
  = ${w1.toFixed(1)}·${x1.toFixed(1)} + ${w2.toFixed(1)}·${x2.toFixed(1)} + ${b.toFixed(1)}
  = ${z.toFixed(2)}
output = ${a.id === "none" ? "z" : a.label + "(z)"} = ${out.toFixed(3)}`}
      </pre>
      <svg viewBox={`0 0 ${W} ${H}`} className="ai-chart" role="img" aria-label={`${a.label} activation with z = ${z.toFixed(2)}`}>
        <rect x={P} y={P} width={W - P * 2} height={H - P * 2} className="ai-plot-bg" />
        <line x1={zx(0)} y1={P} x2={zx(0)} y2={H - P} className="ai-axis" />
        <line x1={P} y1={zy(0)} x2={W - P} y2={zy(0)} className="ai-axis" />
        <polyline points={pts} className="ai-fit-line" />
        {Math.abs(z) <= 4 && <circle cx={zx(z)} cy={zy(out)} r={5} className="ai-dot" />}
        <text x={W / 2} y={H - 6} textAnchor="middle" className="ai-axis-label">
          z (weighted sum), -4 to 4
        </text>
      </svg>
      <p className="gate-note">{a.note} Training is nothing more than finding good values for the weights and biases of millions of these.</p>
    </>
  );
}

const RATES = [0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.3, 0.5, 0.7, 0.9, 1.05, 1.3];
const PRESETS: { label: string; rate: number; start: number }[] = [
  { label: "Too small", rate: 0.01, start: 3.4 },
  { label: "About right", rate: 0.1, start: 3.4 },
  { label: "Stuck in a local minimum", rate: 0.1, start: -3 },
  { label: "Bounces around", rate: 0.9, start: -3 },
  { label: "Diverges", rate: 1.3, start: 3.4 },
];

const GW = 360;
const GH = 220;
const GP = 28;
const W_MIN = -3.5;
const W_MAX = 3.8;
const L_MAX = 5;
const gx = (w: number) => GP + ((w - W_MIN) / (W_MAX - W_MIN)) * (GW - GP * 2);
const gy = (l: number) => GH - GP - (Math.min(l, L_MAX + 1) / L_MAX) * (GH - GP * 2);
const LOSS_PATH = Array.from({ length: 147 }, (_, i) => W_MIN + i * 0.05)
  .map((w) => `${gx(w).toFixed(1)},${gy(loss(w)).toFixed(1)}`)
  .join(" ");

function GradientDescent() {
  const [rateIndex, setRateIndex] = useState(4);
  const [start, setStart] = useState(3.4);
  const [steps, setSteps] = useState(0);
  const rate = RATES[rateIndex];
  const path = descend(start, rate, steps);
  const last = path[path.length - 1];
  const diverged = Number.isNaN(last.w) || Math.abs(last.w) > 6;
  const onChart = path.filter((p) => !Number.isNaN(p.w) && p.w >= W_MIN && p.w <= W_MAX);

  let status: { cls: string; text: string };
  if (steps === 0) status = { cls: "", text: "Press Step to take the first step downhill." };
  else if (diverged) status = { cls: "ai-bad", text: "Diverged: each step overshoots by more than the last, and the weight flies off to infinity." };
  else if (Math.abs(last.grad) < 0.005)
    status =
      last.w < 0
        ? { cls: "ai-warn", text: `Settled at w = ${last.w.toFixed(2)}, a local minimum (loss ${last.loss.toFixed(2)}). The deeper valley on the right was never found.` }
        : { cls: "ai-good", text: `Settled at w = ${last.w.toFixed(2)}, the global minimum (loss ${last.loss.toFixed(2)}).` };
  else if (steps >= 6 && Math.abs(path[path.length - 1].w - path[path.length - 3].w) < 0.05 && Math.abs(path[path.length - 1].w - path[path.length - 2].w) > 0.2)
    status = { cls: "ai-warn", text: "Bouncing between two points: the steps are too big to settle into the valley." };
  else status = { cls: "", text: steps < 40 ? "Still moving. Keep stepping." : "Still moving after many steps: the learning rate is too small to get anywhere quickly." };

  function reset(nextRate = rateIndex, nextStart = start) {
    setRateIndex(nextRate);
    setStart(nextStart);
    setSteps(0);
  }

  return (
    <>
      <h3>Gradient descent on a loss curve</h3>
      <div className="sql-presets">
        {PRESETS.map((p) => (
          <button key={p.label} className={RATES[rateIndex] === p.rate && start === p.start ? "active" : ""} onClick={() => reset(RATES.indexOf(p.rate), p.start)}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="ai-grid-2">
        <label className="ai-slider">
          <span>
            Learning rate: <strong>{rate}</strong>
          </span>
          <input type="range" min={0} max={RATES.length - 1} value={rateIndex} onChange={(e) => reset(Number(e.target.value))} />
        </label>
        <label className="ai-slider">
          <span>
            Starting weight: <strong>{start.toFixed(1)}</strong>
          </span>
          <input type="range" min={-3.3} max={3.6} step={0.1} value={start} onChange={(e) => reset(rateIndex, Number(e.target.value))} />
        </label>
      </div>
      <div className="cm-actions">
        <button onClick={() => setSteps(steps + 1)} disabled={diverged}>
          Step
        </button>
        <button onClick={() => setSteps(steps + 10)} disabled={diverged}>
          10 steps
        </button>
        <button onClick={() => reset()}>Reset</button>
      </div>
      <svg viewBox={`0 0 ${GW} ${GH}`} className="ai-chart" role="img" aria-label="Loss curve with the gradient descent path">
        <defs>
          <clipPath id="ai-gd-clip">
            <rect x={GP} y={GP - 10} width={GW - GP * 2} height={GH - GP * 2 + 10} />
          </clipPath>
        </defs>
        <rect x={GP} y={GP} width={GW - GP * 2} height={GH - GP * 2} className="ai-plot-bg" />
        <text x={GW / 2} y={GH - 8} textAnchor="middle" className="ai-axis-label">
          weight w
        </text>
        <text x={10} y={GH / 2} textAnchor="middle" className="ai-axis-label" transform={`rotate(-90, 10, ${GH / 2})`}>
          loss
        </text>
        <g clipPath="url(#ai-gd-clip)">
          <polyline points={LOSS_PATH} className="ai-loss-line" />
          {onChart.length > 1 && <polyline points={onChart.map((p) => `${gx(p.w)},${gy(p.loss)}`).join(" ")} className="ai-gd-path" />}
          {onChart.map((p, i) => (
            <circle key={i} cx={gx(p.w)} cy={gy(p.loss)} r={i === onChart.length - 1 ? 5 : 3} className={i === onChart.length - 1 ? "ai-dot" : "ai-dot-old"} />
          ))}
        </g>
      </svg>
      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">Steps</span>
          <span className="readout-value">{path.length - 1}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Weight w</span>
          <span className="readout-value">{diverged ? "∞" : last.w.toFixed(3)}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Loss</span>
          <span className="readout-value">{diverged ? "∞" : last.loss.toFixed(3)}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Gradient</span>
          <span className="readout-value">{diverged ? "n/a" : last.grad.toFixed(3)}</span>
        </div>
      </div>
      <p className={`ai-verdict ${status.cls}`}>{status.text}</p>
      <p className="gate-note">
        Each step is w = w - learning rate × gradient. The gradient is the slope under the dot: steep slope, big step. This curve is
        a made-up function of one weight; in a real network backpropagation computes the slope for every weight at once and the
        landscape has millions of dimensions.
      </p>
    </>
  );
}

function EpochsBatches() {
  const [examples, setExamples] = useState(50000);
  const [batch, setBatch] = useState(64);
  const [epochs, setEpochs] = useState(10);
  const perEpoch = Math.ceil(examples / Math.max(1, batch));
  return (
    <>
      <h3>Epochs and batches</h3>
      <div className="tool-inputs ai-inputs">
        <label>
          Training examples
          <input type="number" min={1} value={examples} onChange={(e) => setExamples(Math.max(1, Number(e.target.value) || 1))} />
        </label>
        <label>
          Batch size
          <input type="number" min={1} value={batch} onChange={(e) => setBatch(Math.max(1, Number(e.target.value) || 1))} />
        </label>
        <label>
          Epochs
          <input type="number" min={1} value={epochs} onChange={(e) => setEpochs(Math.max(1, Number(e.target.value) || 1))} />
        </label>
      </div>
      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">Updates per epoch</span>
          <span className="readout-value">{perEpoch.toLocaleString()}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Total weight updates</span>
          <span className="readout-value">{(perEpoch * epochs).toLocaleString()}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Times each example is seen</span>
          <span className="readout-value">{epochs}</span>
        </div>
      </div>
      <p className="gate-note">
        Each batch gives one gradient estimate and one update. Bigger batches give smoother estimates but fewer updates per epoch;
        too many epochs on a small dataset is a classic route to overfitting.
      </p>
    </>
  );
}

export function AiNeuralNetworks() {
  return (
    <div className="tool-widget ai-widget">
      <Neuron />
      <GradientDescent />
      <EpochsBatches />
    </div>
  );
}
