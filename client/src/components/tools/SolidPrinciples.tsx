import { useState } from "react";
import { openLesson } from "../../api";
import { FAMILY_LESSON_ID, SOLID } from "../../designPatternsData";
import { withInlineCode } from "../../inlineCode";

// The five SOLID principles, one at a time: the rule, the smell that gives a violation
// away, the violating C#, the refactored C#, and what interviewers listen for.
export function SolidPrinciples() {
  const [letter, setLetter] = useState(SOLID[0].letter);
  const principle = SOLID.find((p) => p.letter === letter) ?? SOLID[0];

  return (
    <div className="tool-widget dp-widget">
      <div className="arch-cards dp-picker" role="tablist" aria-label="Principles">
        {SOLID.map((p) => (
          <button
            key={p.letter}
            role="tab"
            aria-selected={p.letter === principle.letter}
            className={`arch-card ${p.letter === principle.letter ? "selected" : ""}`}
            onClick={() => setLetter(p.letter)}
          >
            <span className="dp-letter">{p.letter}</span> {p.name}
          </button>
        ))}
      </div>

      <div className="dp-detail">
        <h2 className="dp-title">
          {principle.letter}: {principle.name}
        </h2>
        <p className="dp-intent">{withInlineCode(principle.rule)}</p>

        <div className="dp-smell">
          <h3>The smell</h3>
          <p>{withInlineCode(principle.smell)}</p>
        </div>

        <h3>
          <span className="dp-tag dp-tag-bad">Violates</span>
        </h3>
        <pre className="algo-code dp-code-bad">{principle.before}</pre>

        <h3>
          <span className="dp-tag dp-tag-good">Refactored</span>
        </h3>
        <pre className="algo-code dp-code-good">{principle.after}</pre>

        <p>{withInlineCode(principle.whyBetter)}</p>

        <h3>Where you have already seen it</h3>
        <p>{withInlineCode(principle.inTheWild)}</p>

        <h3>Interview angle</h3>
        <div className="dp-interview">
          <p>{withInlineCode(principle.interview)}</p>
        </div>
      </div>

      <p className="gate-note dp-footer">
        Next in the track:{" "}
        <button className="link-button" onClick={() => openLesson(FAMILY_LESSON_ID.creational)}>
          Creational Patterns
        </button>
        . Open/Closed is the reason Strategy exists, and Dependency Inversion is why DI usually replaces Singleton.
      </p>
    </div>
  );
}
