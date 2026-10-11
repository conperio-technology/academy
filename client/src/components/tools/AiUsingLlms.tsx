import { useState } from "react";
import { contentWords, overlapScore, pickIndex, seededRandom, softmax } from "./aiShared";

// Three tabs: temperature and top-p over a made-up next-token distribution, a step-through
// of a tool-use loop, and a RAG retriever that scores manual chunks by word overlap.

// ---- sampling ----

const LOGITS: [string, number][] = [
  ["belt", 3.0],
  ["sensor", 2.8],
  ["motor", 2.5],
  ["operator", 1.9],
  ["power", 1.6],
  ["emergency", 1.3],
  ["jam", 1.1],
  ["photo-eye", 0.8],
  ["weather", -0.6],
  ["cat", -1.5],
  ["banana", -2.5],
];

function sampling(temperature: number, topP: number) {
  const before =
    temperature === 0
      ? LOGITS.map((_, i) => (i === 0 ? 1 : 0))
      : softmax(LOGITS.map(([, l]) => l / temperature));
  // LOGITS is already sorted, so the nucleus is a prefix.
  let cum = 0;
  let keep = 0;
  while (keep < before.length && (keep === 0 || cum < topP - 1e-9)) {
    cum += before[keep];
    keep++;
  }
  const kept = before.slice(0, keep).reduce((a, b) => a + b, 0);
  const after = before.map((p, i) => (i < keep ? p / kept : 0));
  return { before, after, keep };
}

function Sampling() {
  const [temperature, setTemperature] = useState(1);
  const [topP, setTopP] = useState(1);
  const [draws, setDraws] = useState(0);
  const { before, after, keep } = sampling(temperature, topP);
  // Seeded by the click count, so the same clicks give the same draws.
  let samples: number[] | null = null;
  if (draws > 0) {
    const rand = seededRandom(draws * 104729);
    samples = LOGITS.map(() => 0);
    for (let i = 0; i < 20; i++) samples[pickIndex(after, rand())]++;
  }

  return (
    <>
      <p className="ai-gen">
        The conveyor stopped because the <span className="ai-caret">▍</span>
      </p>
      <p className="gate-note">A made-up next-token distribution. Move the sliders and watch the bars.</p>
      <div className="sql-presets">
        <button onClick={() => { setTemperature(0); setTopP(1); }}>Greedy (T = 0)</button>
        <button onClick={() => { setTemperature(0.3); setTopP(1); }}>Code or extraction (T = 0.3)</button>
        <button onClick={() => { setTemperature(1); setTopP(0.9); }}>Default-ish (T = 1, p = 0.9)</button>
        <button onClick={() => { setTemperature(1.8); setTopP(1); }}>Too hot (T = 1.8)</button>
      </div>
      <div className="ai-grid-2">
        <label className="ai-slider">
          <span>
            Temperature: <strong>{temperature.toFixed(2)}</strong>
            {temperature === 0 && " (greedy)"}
          </span>
          <input type="range" min={0} max={2} step={0.05} value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} />
        </label>
        <label className="ai-slider">
          <span>
            Top-p: <strong>{topP.toFixed(2)}</strong> ({keep} of {LOGITS.length} tokens kept)
          </span>
          <input type="range" min={0.05} max={1} step={0.05} value={topP} onChange={(e) => setTopP(Number(e.target.value))} />
        </label>
      </div>
      {LOGITS.map(([tok], i) => (
        <div key={tok} className={i < keep ? "ai-prob-row" : "ai-prob-row ai-prob-cut"}>
          <span className="ai-prob-tok">{tok}</span>
          <span className="ai-prob-bar">
            <span className="ai-prob-fill ai-prob-ghost" style={{ width: `${before[i] * 100}%` }} />
            <span className="ai-prob-fill" style={{ width: `${after[i] * 100}%` }} />
          </span>
          <span className="ai-prob-val">
            {(after[i] * 100).toFixed(after[i] > 0 && after[i] < 0.01 ? 1 : 0)}%
            {samples && <span className="ai-count"> ×{samples[i]}</span>}
          </span>
        </div>
      ))}
      <div className="cm-actions">
        <button onClick={() => setDraws(draws + 1)}>Draw 20 samples</button>
        {samples && <button onClick={() => setDraws(0)}>Clear</button>}
      </div>
      <p className="gate-note">
        Faint bars are probabilities after temperature; solid bars are after the top-p cut and renormalising. ×n is how often each
        token came up in 20 seeded draws. Low temperature piles everything onto "belt"; high temperature lets "cat" and "banana"
        through, which top-p then removes.
      </p>
    </>
  );
}

// ---- tool use ----

const TOOLS_DEF = `get_line_status(line: int)
  Returns the running state and active fault of a production line.
lookup_fault_code(code: string)
  Returns the manual's description of a fault code.`;

const TRACE: { who: "user" | "model" | "app"; text: string; note: string }[] = [
  { who: "user", text: "Is the Line 3 conveyor running? If not, why?", note: "The app sends this to the model along with the tool descriptions above." },
  { who: "model", text: 'tool_call: get_line_status({ "line": 3 })', note: "The model does not run anything. It replies with a structured request to call a tool, and stops." },
  { who: "app", text: '{ "conveyor": "stopped", "fault": "F-212", "since": "02:14" }', note: "Your code runs the real function (with whatever permissions you gave it) and sends the result back as a new message." },
  { who: "model", text: 'tool_call: lookup_fault_code({ "code": "F-212" })', note: "The model reads the result and decides it needs another tool. This plan, act, observe loop is what makes it an agent." },
  { who: "app", text: '{ "text": "Photo-eye PE-4 blocked for more than 5 seconds. Clear the obstruction and press reset." }', note: "Second tool result goes back into the context." },
  {
    who: "model",
    text: "The Line 3 conveyor has been stopped since 02:14 with fault F-212: photo-eye PE-4 was blocked for more than 5 seconds. Clear whatever is blocking PE-4, then press reset.",
    note: "A final answer grounded in tool results rather than memory. The app should still treat it as model output: a tool that could restart the line would need a human to confirm.",
  },
];

function ToolUse() {
  const [step, setStep] = useState(0);
  return (
    <>
      <p className="gate-note">Tools described to the model:</p>
      <pre className="algo-code ai-pre-wrap">{TOOLS_DEF}</pre>
      <div className="ai-msgs">
        {TRACE.slice(0, step + 1).map((t, i) => (
          <div key={i} className={`ai-msg ai-msg-${t.who}`}>
            <span className="ai-msg-who">{t.who === "app" ? "Your code (tool result)" : t.who === "model" ? "Model" : "User"}</span>
            <code className="ai-msg-code">{t.text}</code>
          </div>
        ))}
      </div>
      <p className="ai-verdict">{TRACE[step].note}</p>
      <div className="cm-actions">
        <button onClick={() => setStep(step - 1)} disabled={step === 0}>
          Back
        </button>
        <button onClick={() => setStep(step + 1)} disabled={step === TRACE.length - 1}>
          Next
        </button>
        <span className="status-text">
          Step {step + 1} of {TRACE.length}
        </span>
      </div>
    </>
  );
}

// ---- RAG ----

const CHUNKS = [
  "To stop the conveyor for maintenance, press the stop button, then lock out the main disconnect and verify zero energy before opening any guard.",
  "Fault F-212 means photo-eye PE-4 has been blocked for more than five seconds. Clear the obstruction and press reset.",
  "The photo-eyes on Line 3 are 24 V DC PNP sensors, part SE-200. Replace them only with the same part.",
  "Check conveyor belt tension monthly. The belt should deflect about 10 mm at the midpoint.",
  "Pump P-3 fills the rinse tank. If the tank level is low for more than 30 seconds the pump starts automatically.",
  "Lubricate the drive motor bearings every 2,000 operating hours with the grease listed in appendix B.",
  "An emergency stop removes power from all drives. After an E-stop, reset the safety relay before restarting the line.",
  "The HMI shows active alarms in red. Acknowledged alarms turn yellow until the condition clears.",
];

const QUERIES = [
  "What does fault F-212 mean?",
  "What voltage are the Line 3 photo-eyes?",
  "How often do the motor bearings need grease?",
  "How do I halt the belt safely?",
];

function Highlight({ text, words }: { text: string; words: string[] }) {
  const parts = text.split(/(\s+)/);
  return (
    <>
      {parts.map((p, i) => {
        const w = contentWords(p)[0];
        return w && words.includes(w) ? (
          <mark key={i} className="ai-mark">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        );
      })}
    </>
  );
}

function Rag() {
  const [query, setQuery] = useState(QUERIES[0]);
  const [k, setK] = useState(2);
  const ranked = CHUNKS.map((c, i) => ({ c, i, ...overlapScore(query, c) })).sort((a, b) => b.score - a.score || a.i - b.i);
  const chosen = ranked.slice(0, k).filter((r) => r.score > 0);
  const prompt =
    "Answer using only the sources below and cite the source number. If the answer is not in the sources, say you don't know.\n\n" +
    (chosen.length ? chosen.map((r, n) => `[${n + 1}] ${r.c}`).join("\n") : "(no sources matched)") +
    `\n\nQuestion: ${query}`;

  return (
    <>
      <p className="gate-note">A tiny "maintenance manual" split into 8 chunks. Ask a question; the best-matching chunks go into the prompt.</p>
      <div className="sql-presets">
        {QUERIES.map((q) => (
          <button key={q} className={q === query ? "active" : ""} onClick={() => setQuery(q)}>
            {q}
          </button>
        ))}
      </div>
      <input className="ai-input" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Question" />
      <label className="ai-slider">
        <span>
          Chunks to retrieve (top-k): <strong>{k}</strong>
        </span>
        <input type="range" min={1} max={4} value={k} onChange={(e) => setK(Number(e.target.value))} />
      </label>
      <ol className="ai-chunks">
        {ranked.map((r, n) => (
          <li key={r.i} className={n < k && r.score > 0 ? "ai-chunk ai-chunk-on" : "ai-chunk"}>
            <span className="ai-chunk-score">
              chunk {r.i + 1} · score {r.score.toFixed(2)}
            </span>
            <span>
              <Highlight text={r.c} words={r.matched} />
            </span>
          </li>
        ))}
      </ol>
      <p className="gate-note">The prompt the model actually receives:</p>
      <pre className="algo-code ai-pre-wrap">{prompt}</pre>
      <p className="gate-note">
        Scores here are word overlap, so you can see why each chunk matched. Try "How do I halt the belt safely?": the lockout
        chunk says "stop" and "conveyor", not "halt" and "belt", so word overlap retrieves the tension chunk instead. Embedding
        search would usually catch that paraphrase, which is why real systems use it, often alongside keyword search.
      </p>
    </>
  );
}

const TABS = [
  { id: "sampling", label: "Temperature and top-p" },
  { id: "tools", label: "Tool use loop" },
  { id: "rag", label: "RAG retrieval" },
] as const;

export function AiUsingLlms() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("sampling");
  return (
    <div className="tool-widget ai-widget">
      <div className="sql-presets ai-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={t.id === tab ? "active" : ""} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "sampling" && <Sampling />}
      {tab === "tools" && <ToolUse />}
      {tab === "rag" && <Rag />}
    </div>
  );
}
