import { useState } from "react";
import type { ComplexityInfo } from "../types";

// Every canonical (and accepted-alternative) answer in content/ComplexityCatalog.cs
// must appear here, or a correct answer would be impossible to select.
const OPTIONS = [
  "O(1)",
  "O(log n)",
  "O(h)",
  "O(k)",
  "O(W)",
  "O(V)",
  "O(n)",
  "O(n log log n)",
  "O(n + m)",
  "O(E)",
  "O(V + E)",
  "O(n log k)",
  "O(n log m)",
  "O(n log n)",
  "O(m log n)",
  "O(n · h)",
  "O(n · L log L)",
  "O(n · L²)",
  "O((V + E) log V)",
  "O(V log V + E)",
  "O(n²)",
  "O(m)",
  "O(n · m)",
  "O(n · m · 3ᴸ)",
  "O(n · m · 4ᴸ)",
  "O(L)",
  "O(n · L)",
  "O(n · L + q · L)",
  "O(E log E)",
  "O(E log V)",
  "O(n · W)",
  "O(n · 2ⁿ)",
  "O(n · n!)",
  "O(n!)",
  "O(2ⁿ)",
];

interface Props {
  complexity: ComplexityInfo;
}

// Asked AFTER writing a solution, not before: working out your own code's complexity is a
// separate skill from writing it, and the lesson "How to Analyze Time & Space Complexity"
// teaches the method. Reveals the reference solution's answer plus the reasoning, so a wrong
// guess becomes the useful part.
export function ComplexityCheck({ complexity }: Props) {
  const [time, setTime] = useState("");
  const [space, setSpace] = useState("");
  const [checked, setChecked] = useState(false);

  const timeOk = [complexity.time, ...(complexity.alsoTime ?? [])].includes(time);
  const spaceOk = [complexity.space, ...(complexity.alsoSpace ?? [])].includes(space);

  return (
    <div className="complexity-check">
      <p className="gate-note">
        For the standard solution to this problem: how does the running time grow with the input, and how does the
        extra memory? Not sure how to work it out? See <em>How to Analyze Time &amp; Space Complexity</em> in the
        Complexity track.
      </p>
      <div className="complexity-selects">
        <label>
          Time
          <select value={time} onChange={(e) => setTime(e.target.value)} disabled={checked}>
            <option value="">choose…</option>
            {OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
        <label>
          Space
          <select value={space} onChange={(e) => setSpace(e.target.value)} disabled={checked}>
            <option value="">choose…</option>
            {OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
        {!checked && (
          <button onClick={() => setChecked(true)} disabled={!time || !space}>
            Check
          </button>
        )}
        {checked && (
          <button
            onClick={() => {
              setChecked(false);
              setTime("");
              setSpace("");
            }}
          >
            Try again
          </button>
        )}
      </div>

      {checked && (
        <div className="drill-feedback">
          <p>
            <strong className={timeOk ? "complexity-ok" : "complexity-bad"}>
              {timeOk ? "✓" : "✗"} Time: {complexity.time}
            </strong>
            {!timeOk && <span> (you said {time})</span>}
            {"   "}
            <strong className={spaceOk ? "complexity-ok" : "complexity-bad"}>
              {spaceOk ? "✓" : "✗"} Space: {complexity.space}
            </strong>
            {!spaceOk && <span> (you said {space})</span>}
          </p>
          <p>{complexity.note}</p>
        </div>
      )}
    </div>
  );
}
