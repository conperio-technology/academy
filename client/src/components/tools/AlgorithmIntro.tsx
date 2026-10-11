import { useMemo, useState } from "react";
import { ScrubberControls } from "../ScrubberControls";
import { useStepScrubber } from "../../useStepScrubber";

type Lang = "csharp" | "python";

const CODE: Record<Lang, string> = {
  csharp:
    "public static int FindLargest(int a, int b, int c)\n" +
    "{\n" +
    "    int max = a;\n" +
    "    if (b > max) max = b;\n" +
    "    if (c > max) max = c;\n" +
    "    return max;\n" +
    "}",
  python:
    "def find_largest(a, b, c):\n" +
    "    max_val = a\n" +
    "    if b > max_val:\n" +
    "        max_val = b\n" +
    "    if c > max_val:\n" +
    "        max_val = c\n" +
    "    return max_val",
};

interface Step {
  label: string;
  detail: string;
  maxSoFar: number;
}

// Same "Find the Largest of Three Numbers" algorithm, traced as plain-English steps
// against whatever a/b/c the learner types -- this is deliberately NOT canned sample
// data like every other visualizer uses, since the whole point here is "this isn't
// tied to one specific input," which is easiest to make felt by letting it change live.
function buildSteps(a: number, b: number, c: number): Step[] {
  let max = a;
  const steps: Step[] = [{ label: "Step 1", detail: `Assume the first number is the largest so far: max = a = ${a}.`, maxSoFar: max }];

  const bWins = b > max;
  if (bWins) max = b;
  steps.push({
    label: "Step 2",
    detail: bWins
      ? `Is b (${b}) greater than max (${steps[0].maxSoFar})? Yes -- max = b = ${b}.`
      : `Is b (${b}) greater than max (${steps[0].maxSoFar})? No -- max stays ${max}.`,
    maxSoFar: max,
  });

  const cWins = c > max;
  if (cWins) max = c;
  steps.push({
    label: "Step 3",
    detail: cWins
      ? `Is c (${c}) greater than max (${steps[1].maxSoFar})? Yes -- max = c = ${c}.`
      : `Is c (${c}) greater than max (${steps[1].maxSoFar})? No -- max stays ${max}.`,
    maxSoFar: max,
  });

  steps.push({ label: "Step 4", detail: `No numbers left to check. Return max = ${max}.`, maxSoFar: max });
  return steps;
}

export function AlgorithmIntro() {
  const [a, setA] = useState(7);
  const [b, setB] = useState(15);
  const [c, setC] = useState(3);
  const [lang, setLang] = useState<Lang>("csharp");

  const steps = useMemo(() => buildSteps(a, b, c), [a, b, c]);
  const scrubber = useStepScrubber(steps);
  const current = scrubber.step;

  function numberInput(setter: (n: number) => void) {
    return (raw: string) => {
      const n = Number(raw);
      setter(Number.isFinite(n) ? n : 0);
    };
  }

  return (
    <div className="tool-widget">
      <p className="gate-note">The algorithm: "Find the Largest of Three Numbers." Edit the inputs, then step through.</p>

      <div className="tool-inputs algo-inputs">
        <label>
          a
          <input type="number" value={a} onChange={(e) => numberInput(setA)(e.target.value)} />
        </label>
        <label>
          b
          <input type="number" value={b} onChange={(e) => numberInput(setB)(e.target.value)} />
        </label>
        <label>
          c
          <input type="number" value={c} onChange={(e) => numberInput(setC)(e.target.value)} />
        </label>
      </div>

      <ol className="algo-steps">
        {steps.map((s, i) => (
          <li key={i} className={i === scrubber.index ? "algo-step-active" : i < scrubber.index ? "algo-step-done" : ""}>
            <strong>{s.label}:</strong> {s.detail}
          </li>
        ))}
      </ol>

      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">max (running value)</span>
          <span className="readout-value">{current.maxSoFar}</span>
        </div>
      </div>

      <ScrubberControls
        index={scrubber.index}
        total={steps.length}
        isFirst={scrubber.isFirst}
        isLast={scrubber.isLast}
        playing={scrubber.playing}
        onReset={scrubber.reset}
        onPrev={scrubber.prev}
        onNext={scrubber.next}
        onPlay={scrubber.play}
        onPause={scrubber.pause}
      />

      <h4 className="bigo-table-heading">The same algorithm, as code</h4>
      <div className="gate-picker">
        <button className={`gate-tab ${lang === "csharp" ? "active" : ""}`} onClick={() => setLang("csharp")}>
          C#
        </button>
        <button className={`gate-tab ${lang === "python" ? "active" : ""}`} onClick={() => setLang("python")}>
          Python
        </button>
      </div>
      <pre className="algo-code">{CODE[lang]}</pre>
    </div>
  );
}
