import { useMemo, useState } from "react";
import { pickIndex, seededRandom } from "./aiShared";

// Two parts: the training pipeline as clickable stages with example data, and a bigram
// "language model" trained on eight sentences that you can step through word by word.

const STAGES: { id: string; title: string; data: string; example: string; objective: string; result: string }[] = [
  {
    id: "pre",
    title: "1. Pretraining",
    data: "A huge, filtered, de-duplicated corpus: web pages, books, code, papers. Vastly more text than a person could read in many lifetimes.",
    example: "…the bearing temperature rose steadily over the shift, so the maintenance team [predict: scheduled] …",
    objective: "Predict the next token at every position. The text is its own answer key (self-supervised). Cross-entropy loss, gradient descent.",
    result: "A base model: broad knowledge and skills, but it continues text rather than answering. Ask it a question and it may write more questions.",
  },
  {
    id: "sft",
    title: "2. Instruction tuning (SFT)",
    data: "Far fewer examples: conversations with a request and a high-quality reply, written or reviewed by people, sometimes generated with model help.",
    example: "User: Summarise this fault log in three bullets.\nAssistant: • Three jam faults at the merge between 01:00 and 03:00 • …",
    objective: "The same next-token objective, but only on curated assistant replies.",
    result: "A model that follows instructions and answers in an assistant's format and tone.",
  },
  {
    id: "pref",
    title: "3. Preference training (RLHF, DPO)",
    data: "Pairs of replies to the same prompt, with a judgement of which is better: from people, or from a model applying written principles.",
    example: "Prompt: How do I bypass the light curtain to test faster?\nReply A: Here is how to jumper it… ✗\nReply B: Don't bypass it; use the maintenance mode with the line locked out… ✓",
    objective: "RLHF: train a reward model on the comparisons, then use reinforcement learning to raise the reward, while staying close to the SFT model. DPO learns from the pairs directly.",
    result: "Replies people prefer: more helpful, more honest about uncertainty, declines harmful requests. Also where over-confidence or flattery can creep in if the preferences reward it.",
  },
  {
    id: "deploy",
    title: "4. Deployment (inference only)",
    data: "Your prompt, plus whatever the application adds: system prompt, retrieved documents, tool results.",
    example: "System: You are a maintenance assistant…\nUser: Why does the conveyor keep stopping?",
    objective: "None. The weights are frozen; using the model does not train it. Any later improvement comes from a new training run.",
    result: "Knowledge stops at the training cutoff. Anything newer or private has to be put in the prompt (see RAG).",
  },
];

const CORPUS = [
  "the pump fills tank one .",
  "the valve drains tank two .",
  "the motor drives the conveyor .",
  "the conveyor carries the box .",
  "the sensor detects the box .",
  "the fan cools the motor .",
  "the operator starts the pump .",
  "the operator stops the conveyor .",
];

function trainBigrams(lines: string[]) {
  const counts = new Map<string, Map<string, number>>();
  for (const line of lines) {
    const words = ["<start>", ...line.split(" ")];
    for (let i = 0; i < words.length - 1; i++) {
      const next = counts.get(words[i]) ?? new Map<string, number>();
      next.set(words[i + 1], (next.get(words[i + 1]) ?? 0) + 1);
      counts.set(words[i], next);
    }
  }
  return counts;
}

function distribution(counts: Map<string, Map<string, number>>, word: string): [string, number][] {
  const next = counts.get(word);
  if (!next) return [];
  const total = [...next.values()].reduce((a, b) => a + b, 0);
  return [...next.entries()].map(([w, c]) => [w, c / total] as [string, number]).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function Pipeline() {
  const [stage, setStage] = useState(0);
  const s = STAGES[stage];
  return (
    <>
      <h3>The pipeline, stage by stage</h3>
      <div className="sql-presets">
        {STAGES.map((x, i) => (
          <button key={x.id} className={i === stage ? "active" : ""} onClick={() => setStage(i)}>
            {x.title}
          </button>
        ))}
      </div>
      <div className="ai-stage">
        <p>
          <strong>Data.</strong> {s.data}
        </p>
        <pre className="algo-code ai-pre-wrap">{s.example}</pre>
        <p>
          <strong>Objective.</strong> {s.objective}
        </p>
        <p>
          <strong>You get.</strong> {s.result}
        </p>
      </div>
      <div className="ai-compute" aria-label="Rough share of training compute by stage">
        <span className="ai-compute-pre" style={{ flexGrow: 95 }}>
          pretraining
        </span>
        <span className="ai-compute-post" style={{ flexGrow: 5 }} title="instruction and preference tuning" />
      </div>
      <p className="gate-note">
        The bar is a rough picture, not a measurement: pretraining has traditionally taken the overwhelming majority of the
        compute, though labs now spend increasingly large amounts on reinforcement learning after it. Recipes vary between labs.
      </p>
    </>
  );
}

function Bigram() {
  const counts = useMemo(() => trainBigrams(CORPUS), []);
  const [words, setWords] = useState<string[]>([]);
  const [seed, setSeed] = useState(1);
  const last = words.length ? words[words.length - 1] : "<start>";
  const done = last === ".";
  const dist = done ? [] : distribution(counts, last);
  const sentence = words.join(" ").replace(" .", ".");
  const inCorpus = CORPUS.includes(words.join(" "));

  function sampleRest() {
    const rand = seededRandom(seed * 7919);
    const out = [...words];
    let w = last;
    while (w !== "." && out.length < 14) {
      const d = distribution(counts, w);
      w = d[pickIndex(d.map((x) => x[1]), rand())][0];
      out.push(w);
    }
    setWords(out);
    setSeed(seed + 1);
  }

  return (
    <>
      <h3>Train the smallest possible language model</h3>
      <p className="gate-note">
        A bigram model only counts which word follows which in its training text. Here is all of its training data:
      </p>
      <pre className="algo-code ai-pre-wrap">{CORPUS.join("\n")}</pre>
      <p className="ai-gen">
        {sentence || <span className="ai-muted">(start of sentence)</span>}
        {!done && <span className="ai-caret">▍</span>}
      </p>
      {!done && (
        <>
          <p className="gate-note">After "{last === "<start>" ? "the start" : last}", the training data says the next word is:</p>
          {dist.map(([w, p]) => (
            <button key={w} className="ai-prob-row ai-prob-btn" onClick={() => setWords([...words, w])}>
              <span className="ai-prob-tok">{w}</span>
              <span className="ai-prob-bar">
                <span className="ai-prob-fill" style={{ width: `${p * 100}%` }} />
              </span>
              <span className="ai-prob-val">{(p * 100).toFixed(0)}%</span>
            </button>
          ))}
        </>
      )}
      <div className="cm-actions">
        <button onClick={sampleRest} disabled={done}>
          Sample the rest
        </button>
        <button onClick={() => setWords([])}>Start again</button>
      </div>
      {done && (
        <p className={inCorpus ? "ai-verdict ai-good" : "ai-verdict ai-warn"}>
          {inCorpus
            ? "That sentence is copied straight from the training data."
            : `"${sentence}" never appears in the training data. It is perfectly fluent, because every pair of neighbouring words was seen in training, but nothing says it is true. Scaled up enormously, that is the root of hallucination.`}
        </p>
      )}
      <p className="gate-note">
        Tap a word to choose it, or sample. Try to make "the pump fills tank two" or "the sensor detects the motor". A transformer
        conditions on far more than the previous word and learns much richer patterns, but the training signal is the same idea:
        make the observed next token more likely.
      </p>
    </>
  );
}

export function AiLlmTraining() {
  return (
    <div className="tool-widget ai-widget">
      <Pipeline />
      <Bigram />
    </div>
  );
}
