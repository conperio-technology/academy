import { Fragment, useState } from "react";
import { openLesson } from "../../api";
import { FAMILY_LESSON_ID, FAMILY_TITLE, patternsIn, QUIZ_LESSON_ID, type PatternFamily } from "../../designPatternsData";
import { withInlineCode } from "../../inlineCode";

const FAMILIES: PatternFamily[] = ["creational", "structural", "behavioral"];

interface Props {
  family: PatternFamily;
}

// One browsable lesson per pattern family: a picker across the top (same .arch-cards
// shape as CommonDesignPatterns), then the selected pattern's intent, when to use it and
// when not to, structure, C#, real examples and interview angle.
export function DesignPatternCatalog({ family }: Props) {
  const patterns = patternsIn(family);
  const [selected, setSelected] = useState(patterns[0].name);
  const index = Math.max(
    0,
    patterns.findIndex((p) => p.name === selected),
  );
  const pattern = patterns[index];
  const prev = patterns[index - 1];
  const next = patterns[index + 1];

  return (
    <div className="tool-widget dp-widget">
      <div className="arch-cards dp-picker" role="tablist" aria-label="Patterns">
        {patterns.map((p) => (
          <button
            key={p.name}
            role="tab"
            aria-selected={p.name === pattern.name}
            className={`arch-card ${p.name === pattern.name ? "selected" : ""}`}
            onClick={() => setSelected(p.name)}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="dp-detail">
        <h2 className="dp-title">{pattern.name}</h2>
        <p className="dp-intent">{withInlineCode(pattern.intent)}</p>

        <div className="dp-columns">
          <div className="dp-col dp-col-use">
            <h3>Use it when</h3>
            <ul>
              {pattern.useWhen.map((item, i) => (
                <li key={i}>{withInlineCode(item)}</li>
              ))}
            </ul>
          </div>
          <div className="dp-col dp-col-avoid">
            <h3>Skip it when</h3>
            <ul>
              {pattern.avoidWhen.map((item, i) => (
                <li key={i}>{withInlineCode(item)}</li>
              ))}
            </ul>
          </div>
        </div>

        <h3>Structure</h3>
        <pre className="algo-code dp-structure">{pattern.structure}</pre>

        <h3>In C#</h3>
        <pre className="algo-code">{pattern.code}</pre>

        <h3>Where you have already seen it</h3>
        <ul className="dp-list">
          {pattern.inTheWild.map((item, i) => (
            <li key={i}>{withInlineCode(item)}</li>
          ))}
        </ul>

        <h3>Interview angle</h3>
        <div className="dp-interview">
          <p>{withInlineCode(pattern.interview)}</p>
          <p className="dp-confused">
            <strong>Often confused with:</strong> {withInlineCode(pattern.confusedWith)}
          </p>
        </div>
      </div>

      <div className="dp-nav">
        <button onClick={() => prev && setSelected(prev.name)} disabled={!prev}>
          {prev ? `Previous: ${prev.name}` : "Previous"}
        </button>
        <button onClick={() => next && setSelected(next.name)} disabled={!next}>
          {next ? `Next: ${next.name}` : "Next"}
        </button>
      </div>

      <p className="gate-note dp-footer">
        Other families:{" "}
        {FAMILIES.filter((f) => f !== family).map((f, i) => (
          <Fragment key={f}>
            {i > 0 && ", "}
            <button className="link-button" onClick={() => openLesson(FAMILY_LESSON_ID[f])}>
              {FAMILY_TITLE[f]}
            </button>
          </Fragment>
        ))}
        . Ready to test yourself?{" "}
        <button className="link-button" onClick={() => openLesson(QUIZ_LESSON_ID)}>
          Which Pattern Is This?
        </button>
      </p>
    </div>
  );
}
