import { useMemo, useState } from "react";
import { cosine, tokenize, trainBpe } from "./aiShared";

// A toy byte-pair-encoding tokenizer trained in the browser on a tiny corpus, and a 2-D
// embedding space with hand-placed vectors for cosine similarity.

const CORPUS =
  "The motor starts when the start button is pressed. The motor stops when the stop button is pressed. " +
  "The conveyor motor runs while the sensor detects a box. The controller reads the sensor and the controller writes the output. " +
  "When the sensor detects a jam, the controller stops the conveyor and raises an alarm. " +
  "The operator resets the alarm and restarts the conveyor. " +
  "The pump starts when the tank level is low and stops when the tank level is high. " +
  "The controller monitors the motor current, the motor temperature and the conveyor speed. " +
  "Sensors, motors, pumps and conveyors are connected to the controller.";

const PRESETS: { label: string; text: string }[] = [
  { label: "Familiar words", text: "The controller stops the conveyor when the sensor detects a jam." },
  { label: "Unfamiliar words", text: "Refactor the asynchronous HTTP handler to use dependency injection." },
  { label: "Code", text: "if (tank.Level < 20) { pump.Start(); }" },
  { label: "Numbers", text: "Serial 4471-2209-8813, firmware 3.14.159" },
  { label: "German", text: "Der Förderbandmotor stoppt, wenn der Sensor einen Stau erkennt." },
  { label: "Emoji", text: "Line 3 is down 😬 again" },
];

const MAX_MERGES = 150;

interface Word {
  word: string;
  v: [number, number];
  group: string;
  side: "l" | "r";
}

const polar = (deg: number, len: number): [number, number] => [len * Math.cos((deg * Math.PI) / 180), len * Math.sin((deg * Math.PI) / 180)];

// Label side is chosen per word so the labels don't collide at phone width.
const WORDS: Word[] = [
  { word: "conveyor", v: polar(2, 0.85), group: "machines", side: "l" },
  { word: "motor", v: polar(10, 1.0), group: "machines", side: "l" },
  { word: "pump", v: polar(18, 0.8), group: "machines", side: "l" },
  { word: "fan", v: polar(26, 0.5), group: "machines", side: "r" },
  { word: "alarm", v: polar(40, 0.8), group: "problems", side: "r" },
  { word: "fault", v: polar(46, 1.0), group: "problems", side: "r" },
  { word: "error", v: polar(54, 0.6), group: "problems", side: "l" },
  { word: "voltage", v: polar(68, 0.75), group: "measurements", side: "r" },
  { word: "temperature", v: polar(76, 1.0), group: "measurements", side: "r" },
  { word: "pressure", v: polar(84, 0.8), group: "measurements", side: "l" },
  { word: "coffee", v: polar(104, 1.0), group: "food", side: "r" },
  { word: "pizza", v: polar(112, 0.8), group: "food", side: "l" },
  { word: "sandwich", v: polar(122, 0.6), group: "food", side: "l" },
];

function shown(text: string) {
  return text.replace(/ /g, "·").replace(/\n/g, "↵");
}

function Tokenizer() {
  const full = useMemo(() => trainBpe(CORPUS, MAX_MERGES), []);
  const [merges, setMerges] = useState(60);
  const [text, setText] = useState(PRESETS[0].text);
  const model = useMemo(() => ({ base: full.base, merges: full.merges.slice(0, merges) }), [full, merges]);
  const tokens = useMemo(() => tokenize(text, model), [text, model]);
  const chars = [...text].length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const bytes = tokens.filter((t) => t.byteFallback).length;

  return (
    <>
      <h3>A toy BPE tokenizer</h3>
      <p className="gate-note">
        Trained in your browser on a {CORPUS.split(" ").length}-word corpus about motors, sensors and conveyors. Real tokenizers
        learn from billions of words, but the algorithm is the same.
      </p>
      <label className="ai-slider">
        <span>
          Merges learned: <strong>{merges}</strong> of {full.merges.length} (vocabulary {full.base.length + merges} tokens)
        </span>
        <input type="range" min={0} max={full.merges.length} value={merges} onChange={(e) => setMerges(Number(e.target.value))} />
      </label>
      <div className="sql-presets">
        {PRESETS.map((p) => (
          <button key={p.label} className={p.text === text ? "active" : ""} onClick={() => setText(p.text)}>
            {p.label}
          </button>
        ))}
      </div>
      <textarea className="ai-textarea" rows={2} value={text} onChange={(e) => setText(e.target.value)} aria-label="Text to tokenize" />
      <div className="ai-tokens" aria-label="Tokens">
        {tokens.map((t, i) => (
          <span key={i} className={t.byteFallback ? "ai-token ai-token-byte" : `ai-token ai-token-${i % 5}`} title={`id ${t.id}`}>
            {t.byteFallback ? t.text : shown(t.text)}
          </span>
        ))}
      </div>
      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">Characters</span>
          <span className="readout-value">{chars}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Words</span>
          <span className="readout-value">{words}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Tokens</span>
          <span className="readout-value">{tokens.length}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Chars per token</span>
          <span className="readout-value">{tokens.length ? (chars / tokens.length).toFixed(1) : "0"}</span>
        </div>
      </div>
      <p className="gate-note">
        A dot (·) is a space, which belongs to the word after it. {bytes > 0 && `${bytes} red tokens are raw UTF-8 bytes for characters this tokenizer never learned. `}
        Slide merges to 0 to see one token per character, then up to see the corpus words collapse into single tokens while
        unfamiliar text stays in pieces. Hover a token for its id: that integer is all the model receives.
      </p>
      <details className="ai-details">
        <summary>The first 24 merges, in the order learned</summary>
        <p className="ai-merges">
          {full.merges.slice(0, 24).map(([a, b], i) => (
            <code key={i}>
              {shown(a)} + {shown(b)}
            </code>
          ))}
        </p>
      </details>
    </>
  );
}

function Embeddings() {
  const [pick, setPick] = useState("motor");
  const target = WORDS.find((w) => w.word === pick)!;
  const ranked = WORDS.filter((w) => w.word !== pick)
    .map((w) => ({ ...w, sim: cosine(target.v, w.v) }))
    .sort((a, b) => b.sim - a.sim);

  // Every vector here points up or to the right, so only that part of the plane is drawn.
  const SW = 300;
  const SH = 215;
  const R = 165;
  const px = (x: number) => 22 + (x + 0.55) * R;
  const py = (y: number) => SH - 14 - (y + 0.02) * R;
  const ox = px(0);
  const oy = py(0);

  return (
    <>
      <h3>Embeddings and cosine similarity</h3>
      <p className="gate-note">Tap a word. These 2-D vectors are placed by hand for illustration; real embeddings are learned and have hundreds or thousands of dimensions.</p>
      <div className="ai-embed">
        <svg viewBox={`0 0 ${SW} ${SH}`} className="ai-embed-svg" role="img" aria-label={`2-D embedding space, ${pick} selected`}>
          <rect x={0} y={0} width={SW} height={SH} className="ai-plot-bg" />
          <line x1={0} y1={oy} x2={SW} y2={oy} className="ai-axis" />
          <line x1={ox} y1={0} x2={ox} y2={SH} className="ai-axis" />
          {WORDS.map((w) => (
            <line key={`l${w.word}`} x1={ox} y1={oy} x2={px(w.v[0])} y2={py(w.v[1])} className={w.word === pick ? "ai-vec ai-vec-on" : "ai-vec"} />
          ))}
          {WORDS.map((w) => {
            const [x, y] = [px(w.v[0]), py(w.v[1])];
            const left = w.side === "l";
            return (
              <g key={w.word} className="ai-embed-pt" onClick={() => setPick(w.word)} role="button" aria-label={w.word}>
                <circle cx={x} cy={y} r={w.word === pick ? 6 : 4.5} className={`ai-grp-${w.group}`} />
                <text x={left ? x - 7 : x + 7} y={y + 4} textAnchor={left ? "end" : "start"} className={w.word === pick ? "ai-embed-label ai-embed-label-on" : "ai-embed-label"}>
                  {w.word}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="ai-sims">
          <div className="sql-presets ai-word-picker">
            {WORDS.map((w) => (
              <button key={w.word} className={w.word === pick ? "active" : ""} onClick={() => setPick(w.word)}>
                {w.word}
              </button>
            ))}
          </div>
          <p className="ai-sims-title">Cosine similarity to {pick}</p>
          {ranked.map((w) => (
            <div key={w.word} className="ai-sim-row">
              <span className="ai-sim-word">{w.word}</span>
              <span className="ai-sim-bar">
                <span className={w.sim >= 0 ? "ai-sim-fill" : "ai-sim-fill ai-sim-neg"} style={{ width: `${Math.abs(w.sim) * 50}%`, left: w.sim >= 0 ? "50%" : `${50 - Math.abs(w.sim) * 50}%` }} />
              </span>
              <span className="ai-sim-val">{w.sim.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="gate-note">
        Cosine similarity only looks at direction, so a short vector and a long one pointing the same way score 1. Same-topic
        words point nearly the same way and score close to 1; related topics (machines and faults) score fairly high; unrelated
        ones (machines and food) end up near 90 degrees apart, a score near 0. Vectors pointing in opposite directions would
        score -1. Search over embeddings is just "find the stored vectors with the highest cosine similarity to the query vector".
      </p>
    </>
  );
}

export function AiTokensEmbeddings() {
  return (
    <div className="tool-widget ai-widget">
      <Tokenizer />
      <Embeddings />
    </div>
  );
}
