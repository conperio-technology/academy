import { useState } from "react";
import { softmax } from "./aiShared";

// Three parts: an attention-weights heatmap with hand-written, illustrative scores (causal
// vs bidirectional), a next-token loop with made-up probabilities, and a context window
// that drops the oldest messages first.

type Ending = "heavy" | "weak";
type Mode = "causal" | "bidirectional";

const BASE = ["The", "robot", "couldn't", "lift", "the", "box", "because", "it", "was", "too"];
const IT = 7;
const LAST = 10;

// Hand-written relevance scores: row = the token doing the looking (query), keys = tokens it
// looks at. Unlisted pairs score 0. These are NOT from a real model.
function scores(ending: Ending, mode: Mode): Record<number, number>[] {
  const subject = ending === "heavy" ? 5 : 1; // "it" means the box if heavy, the robot if weak
  const other = ending === "heavy" ? 1 : 5;
  return [
    { 0: 2 },
    { 0: 1.5, 1: 1.5 },
    { 1: 2.2, 2: 1 },
    { 1: 1.4, 2: 1.8, 3: 1, 5: 1.5 },
    { 3: 0.8, 4: 1.5, 5: 1.2 },
    { 3: 2, 4: 1.4, 5: 1 },
    { 2: 1.2, 3: 1.2, 6: 0.8 },
    mode === "causal" ? { 1: 2, 5: 2, 6: 0.6 } : { [subject]: 3.2, [other]: 0.8, 10: 1.6 },
    { 7: 2.2, 8: 0.5, 10: 1.2 },
    { 8: 1.2, 10: 1.8 },
    { 7: 2, [subject]: 2.6, 9: 1.2 },
  ];
}

function attention(ending: Ending, mode: Mode): (number | null)[][] {
  const n = BASE.length + 1;
  return scores(ending, mode).map((row, i) => {
    const visible = Array.from({ length: n }, (_, j) => mode === "bidirectional" || j <= i);
    const logits = Array.from({ length: n }, (_, j) => row[j] ?? 0);
    const probs = softmax(logits.filter((_, j) => visible[j]));
    let k = 0;
    return visible.map((v) => (v ? probs[k++] : null));
  });
}

function AttentionHeatmap() {
  const [ending, setEnding] = useState<Ending>("heavy");
  const [mode, setMode] = useState<Mode>("causal");
  const [row, setRow] = useState(IT);
  const tokens = [...BASE, ending];
  const weights = attention(ending, mode);
  const sel = weights[row];
  const top = sel
    .map((w, j) => ({ w, j }))
    .filter((x): x is { w: number; j: number } => x.w !== null)
    .sort((a, b) => b.w - a.w)
    .slice(0, 3);

  return (
    <>
      <h3>Self-attention weights (illustrative)</h3>
      <div className="ai-row">
        <div className="sql-presets">
          <button className={ending === "heavy" ? "active" : ""} onClick={() => setEnding("heavy")}>
            ...too heavy
          </button>
          <button className={ending === "weak" ? "active" : ""} onClick={() => setEnding("weak")}>
            ...too weak
          </button>
        </div>
        <div className="sql-presets">
          <button className={mode === "causal" ? "active" : ""} onClick={() => setMode("causal")}>
            Causal (text generators)
          </button>
          <button className={mode === "bidirectional" ? "active" : ""} onClick={() => setMode("bidirectional")}>
            Bidirectional (encoders)
          </button>
        </div>
      </div>
      <p className="gate-note">
        Each row is one token deciding how much to take from each column. Rows add up to 1. Tap a row. The weights are written by
        hand to show the idea and are not from any real model.
      </p>
      <div className="ai-heat" role="grid" aria-label="Attention weights">
        <span className="ai-heat-corner">looks at →</span>
        {tokens.map((t, j) => (
          <span key={`h${j}`} className={j === row ? "ai-heat-col ai-heat-col-on" : "ai-heat-col"}>
            {t}
          </span>
        ))}
        {weights.map((r, i) => (
          <div key={`r${i}`} className={i === row ? "ai-heat-row ai-heat-row-on" : "ai-heat-row"} role="row" onClick={() => setRow(i)}>
            <span className="ai-heat-label">{tokens[i]}</span>
            {r.map((w, j) => (
              <span
                key={j}
                className={w === null ? "ai-heat-cell ai-heat-masked" : "ai-heat-cell"}
                style={w === null ? undefined : { background: `rgba(125, 211, 168, ${Math.min(1, 0.06 + w * 1.4).toFixed(2)})` }}
                title={w === null ? `${tokens[i]} cannot see ${tokens[j]} (future token)` : `${tokens[i]} → ${tokens[j]}: ${w.toFixed(2)}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="ai-sentence">
        {tokens.map((t, j) => (
          <span
            key={j}
            className={j === row ? "ai-word ai-word-self" : sel[j] === null ? "ai-word ai-word-masked" : "ai-word"}
            style={sel[j] === null ? undefined : { background: `rgba(125, 211, 168, ${Math.min(1, (sel[j] as number) * 1.6).toFixed(2)})` }}
          >
            {t}
          </span>
        ))}
      </div>
      <p className="ai-verdict">
        <strong>{tokens[row]}</strong> attends most to {top.map((x) => `${tokens[x.j]} (${x.w.toFixed(2)})`).join(", ")}.
      </p>
      <p className="gate-note">
        {row === IT && mode === "causal"
          ? `In a causal model "it" cannot see "${ending}" yet, so here it splits between robot and box. Switch to the last row: once "${ending}" arrives, that position can look back at "it" and the right noun.`
          : row === IT
            ? `With bidirectional attention "it" can see "${ending}" and leans towards the ${ending === "heavy" ? "box" : "robot"}. Flip heavy and weak to watch the weight move.`
            : row === LAST
              ? `"${ending}" looks back at "it" and at the ${ending === "heavy" ? "box" : "robot"}: this is where a causal model can resolve the reference.`
              : "Greyed cells are future tokens, hidden by the causal mask."}
      </p>
    </>
  );
}

const STEPS: { cands: [string, number][] }[] = [
  { cands: [["tank", 0.31], ["motor", 0.22], ["valve", 0.18], ["operator", 0.12], ["power", 0.08]] },
  { cands: [["level", 0.45], ["was", 0.3], ["ran", 0.12], ["overflowed", 0.06], ["valve", 0.04]] },
  { cands: [["was", 0.52], ["dropped", 0.21], ["sensor", 0.1], ["fell", 0.09], ["reading", 0.04]] },
  { cands: [["too", 0.38], ["low", 0.34], ["below", 0.12], ["under", 0.07], ["at", 0.05]] },
  { cands: [["low", 0.81], ["high", 0.09], ["empty", 0.05], ["far", 0.02], ["close", 0.01]] },
  { cands: [[".", 0.72], ["and", 0.14], [",", 0.08], ["for", 0.03], ["after", 0.01]] },
];

function NextToken() {
  const [step, setStep] = useState(0);
  const prompt = "The pump stopped because the";
  const generated = STEPS.slice(0, step).map((s) => s.cands[0][0]);
  const text = [prompt, ...generated].join(" ").replace(/ \./, ".");
  const current = STEPS[step];
  return (
    <>
      <h3>Generation is next-token prediction in a loop</h3>
      <p className="ai-gen">
        {prompt}
        {generated.map((g, i) => (
          <span key={i} className="ai-gen-new">
            {g === "." ? g : ` ${g}`}
          </span>
        ))}
        {current && <span className="ai-caret">▍</span>}
      </p>
      {current ? (
        <>
          <p className="gate-note">Probabilities for the next token (made up for illustration; the remaining probability is spread over the rest of the vocabulary):</p>
          {current.cands.map(([tok, p], i) => (
            <div key={tok} className="ai-prob-row">
              <span className="ai-prob-tok">{tok}</span>
              <span className="ai-prob-bar">
                <span className={i === 0 ? "ai-prob-fill ai-prob-top" : "ai-prob-fill"} style={{ width: `${p * 100}%` }} />
              </span>
              <span className="ai-prob-val">{(p * 100).toFixed(0)}%</span>
            </div>
          ))}
        </>
      ) : (
        <p className="ai-verdict ai-good">Done: the model produced a full stop and, in a real system, an end-of-sequence token. Text so far: "{text}"</p>
      )}
      <div className="cm-actions">
        <button onClick={() => setStep(step + 1)} disabled={!current}>
          Append the most likely token
        </button>
        <button onClick={() => setStep(0)}>Reset</button>
      </div>
      <p className="gate-note">
        Each new token is appended to the input and the whole model runs again. Always taking the top token is greedy decoding;
        the Using LLMs Well lesson shows sampling instead.
      </p>
    </>
  );
}

const MESSAGES: { who: string; text: string; tokens: number; pinned?: boolean; key?: boolean }[] = [
  { who: "System", text: "You are a maintenance assistant for Line 3.", tokens: 12, pinned: true },
  { who: "User", text: "Line 3's photo-eyes are 24 V DC PNP sensors, part SE-200.", tokens: 22, key: true },
  { who: "Assistant", text: "Noted: 24 V DC PNP photo-eyes, part SE-200.", tokens: 18 },
  { who: "User", text: "(pastes 60 lines of fault log from last night)", tokens: 260 },
  { who: "Assistant", text: "Summary of the log: three jam faults at the merge, one E-stop at 02:14...", tokens: 90 },
  { who: "User", text: "Which voltage do the photo-eyes on Line 3 use?", tokens: 14 },
];

function ContextWindow() {
  const [windowSize, setWindowSize] = useState(512);
  // Keep the pinned system prompt, then add messages from newest to oldest until full.
  let used = MESSAGES.filter((m) => m.pinned).reduce((s, m) => s + m.tokens, 0);
  const visible = MESSAGES.map((m) => !!m.pinned);
  for (let i = MESSAGES.length - 1; i >= 0; i--) {
    if (MESSAGES[i].pinned) continue;
    if (used + MESSAGES[i].tokens > windowSize) break;
    used += MESSAGES[i].tokens;
    visible[i] = true;
  }
  const keyVisible = visible[MESSAGES.findIndex((m) => m.key)];
  return (
    <>
      <h3>The context window</h3>
      <label className="ai-slider">
        <span>
          Context window: <strong>{windowSize}</strong> tokens (a toy size; real windows hold many thousands)
        </span>
        <input type="range" min={128} max={512} step={16} value={windowSize} onChange={(e) => setWindowSize(Number(e.target.value))} />
      </label>
      <div className="ai-msgs">
        {MESSAGES.map((m, i) => (
          <div key={i} className={visible[i] ? "ai-msg" : "ai-msg ai-msg-out"}>
            <span className="ai-msg-who">
              {m.who} · {m.tokens} tokens{m.pinned ? " · always kept" : ""}
              {!visible[i] && " · dropped"}
            </span>
            <span>{m.text}</span>
          </div>
        ))}
      </div>
      <p className={keyVisible ? "ai-verdict ai-good" : "ai-verdict ai-bad"}>
        {used} of {windowSize} tokens used.{" "}
        {keyVisible
          ? "The sensor spec is still in view, so the model can answer from it: 24 V DC."
          : "The message with the sensor spec was dropped. The model now cannot see it at all, and may guess a plausible voltage instead of saying it does not know."}
      </p>
      <p className="gate-note">
        This toy app drops the oldest messages first and always keeps the system prompt. Real products use various strategies
        (trimming, summarising older turns), but nothing outside the window reaches the model.
      </p>
    </>
  );
}

export function AiTransformers() {
  return (
    <div className="tool-widget ai-widget">
      <AttentionHeatmap />
      <NextToken />
      <ContextWindow />
    </div>
  );
}
