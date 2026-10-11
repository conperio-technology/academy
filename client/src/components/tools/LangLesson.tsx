import { useMemo, useState } from "react";
import { openLesson } from "../../api";
import { withInlineCode } from "../../inlineCode";
import { shuffle } from "../../random";
import type { LangLessonData, LessonPart, PredictItem } from "../../langTrack/types";
import { CodePane, LANG_LABEL, LangViewToggle, shows, useLangView, type LangView } from "./LangShared";

// Renders one lesson of the "Programming in C# & Python" section from its data file:
// side-by-side code (or one language, by the switch at the top), notes, tables, then
// predict-the-output questions, pitfalls and where to go next.

function Part({ part, view }: { part: LessonPart; view: LangView }) {
  switch (part.kind) {
    case "text":
      return (
        <div className="crypto-section">
          {part.title && <h3>{part.title}</h3>}
          {part.paragraphs.map((p, i) => (
            <p key={i} className="lt-p">
              {withInlineCode(p)}
            </p>
          ))}
        </div>
      );
    case "code": {
      const both = view === "both";
      return (
        <div className="crypto-section">
          <h3>{part.title}</h3>
          <div className={both ? "lt-pair" : "lt-single"}>
            {shows(view, "csharp") && <CodePane lang="csharp" code={part.csharp} caption={part.captions?.csharp} />}
            {shows(view, "python") && <CodePane lang="python" code={part.python} caption={part.captions?.python} />}
          </div>
          {part.notes.map((n, i) => (
            <p key={i} className="lt-p">
              {withInlineCode(n)}
            </p>
          ))}
        </div>
      );
    }
    case "terms":
      return (
        <div className="crypto-section">
          <h3>{part.title}</h3>
          <dl className="lt-terms">
            {part.terms.map((t) => (
              <div key={t.term} className="lt-term">
                <dt>{t.term}</dt>
                <dd>{withInlineCode(t.meaning)}</dd>
              </div>
            ))}
          </dl>
        </div>
      );
    case "table":
      return (
        <div className="crypto-section">
          <h3>{part.title}</h3>
          <div className="cm-scroll">
            <table className="bigo-table lt-table">
              <thead>
                <tr>
                  {part.head.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {part.rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((c, j) => (
                      <td key={j}>{withInlineCode(c)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {part.notes?.map((n, i) => (
            <p key={i} className="gate-note">
              {withInlineCode(n)}
            </p>
          ))}
        </div>
      );
    case "steps":
      return (
        <div className="crypto-section">
          <h3>{part.title}</h3>
          <ol className="lt-steps">
            {part.steps.map((s, i) => (
              <li key={i}>{withInlineCode(s)}</li>
            ))}
          </ol>
        </div>
      );
  }
}

function PredictCard({ item, index, onAnswer }: { item: PredictItem; index: number; onAnswer: (correct: boolean) => void }) {
  const options = useMemo(() => shuffle([item.output, ...item.distractors]), [item]);
  const [picked, setPicked] = useState<string | null>(null);
  const right = picked === item.output;
  return (
    <div className="drill-card lt-predict">
      <div className="drill-progress">
        Question {index + 1}, {LANG_LABEL[item.lang]}: what does this print?
      </div>
      <CodePane lang={item.lang} code={item.code} />
      <div className="drill-options lt-options">
        {options.map((o) => {
          const state = picked === null ? "" : o === item.output ? "correct" : o === picked ? "wrong" : "dim";
          return (
            <button
              key={o}
              className={`drill-option ${state}`}
              disabled={picked !== null}
              onClick={() => {
                setPicked(o);
                onAnswer(o === item.output);
              }}
            >
              <pre className="lt-out">{o}</pre>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="drill-feedback">
          <p>
            <strong>{right ? "Correct." : "Not quite."}</strong> It prints:
          </p>
          <pre className="algo-code lt-code">{item.output}</pre>
          <p>{withInlineCode(item.why)}</p>
        </div>
      )}
    </div>
  );
}

export function LangLesson({ lesson }: { lesson: LangLessonData }) {
  const [view, setView] = useLangView();
  const [score, setScore] = useState({ answered: 0, correct: 0 });
  // Remounting the cards (new key) resets their answers and reshuffles the options.
  const [round, setRound] = useState(0);
  const questions = lesson.predict.filter((q) => shows(view, q.lang));

  return (
    <div className="tool-widget lt-widget">
      <div className="lt-bar">
        <LangViewToggle view={view} onChange={setView} />
      </div>

      {lesson.parts.map((p, i) => (
        <Part key={i} part={p} view={view} />
      ))}

      {questions.length > 0 && (
        <div className="crypto-section">
          <h3>Predict the output</h3>
          <p className="gate-note">
            Read each program and pick what it prints before you look. Every one of these was run to get its answer.
            {view !== "both" && " The switch at the top also filters these by language."}
          </p>
          {questions.map((q, i) => (
            <PredictCard
              key={`${round}-${lesson.predict.indexOf(q)}`}
              item={q}
              index={i}
              onAnswer={(ok) => setScore((s) => ({ answered: s.answered + 1, correct: s.correct + (ok ? 1 : 0) }))}
            />
          ))}
          <div className="lt-score">
            <span>
              Score: {score.correct} of {score.answered} answered
            </span>
            <button
              onClick={() => {
                setRound((r) => r + 1);
                setScore({ answered: 0, correct: 0 });
              }}
            >
              Reset the questions
            </button>
          </div>
        </div>
      )}

      {lesson.pitfalls.length > 0 && (
        <div className="crypto-section">
          <h3>Watch out for</h3>
          <ul className="lt-list">
            {lesson.pitfalls.map((p, i) => (
              <li key={i}>{withInlineCode(p)}</li>
            ))}
          </ul>
        </div>
      )}

      {lesson.next.length > 0 && (
        <div className="crypto-section">
          <h3>Where to next</h3>
          <ul className="lt-list">
            {lesson.next.map((l) => (
              <li key={l.id}>
                <button className="link-button" onClick={() => openLesson(l.id)}>
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
