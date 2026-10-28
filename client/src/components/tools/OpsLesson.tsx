import { lazy, Suspense, useMemo, useState } from "react";
import { openLesson } from "../../api";
import { withInlineCode } from "../../inlineCode";
import { shuffle } from "../../random";
import type { LINUX_LESSONS } from "../../linuxLessons";
import type { CodeBlock, CodeLang, OpsLessonData, OpsPart, QuizItem, WalkthroughPart } from "../../opsTrack/types";
import { CopyButton } from "./LangShared";
import { OPS_WIDGETS } from "./ops";
import { SQL_SAMPLE_SCHEMA } from "../../sqlSampleData";
import { SHOP_SCHEMA } from "../../sqlPracticeData";

// Renders one IT operations lesson (Linux administration, Windows & PowerShell, Cloud &
// DevOps) from its data file in src/opsTrack/: prose, code with real output, tables,
// step-throughs, a bespoke simulator or the in-browser Linux machine, then a quiz.

const LinuxLab = lazy(() => import("./LinuxLab"));
const SqlPlayground = lazy(() => import("./SqlPlayground").then((m) => ({ default: m.SqlPlayground })));
const SqlPractice = lazy(() => import("./SqlPractice").then((m) => ({ default: m.SqlPractice })));

const LANG_LABEL: Record<CodeLang, string> = {
  bash: "bash",
  sh: "sh",
  powershell: "PowerShell",
  cmd: "cmd",
  yaml: "YAML",
  hcl: "Terraform",
  bicep: "Bicep",
  dockerfile: "Dockerfile",
  ini: "config",
  text: "text",
  json: "JSON",
  sql: "SQL",
  csharp: "C#",
  python: "Python",
  http: "HTTP",
};

export function OpsCode({ block }: { block: CodeBlock }) {
  return (
    <div className={`lt-pane ops-pane ops-${block.lang}`}>
      <div className="lt-pane-head">
        <span className="lt-lang">{block.label ?? LANG_LABEL[block.lang]}</span>
        <CopyButton text={block.code} />
      </div>
      <pre className="algo-code lt-code">{block.code}</pre>
      {block.output !== undefined && (
        <>
          <div className="ops-out-head">
            Output
            {block.unverified && <span className="ops-unverified"> (typical output, not captured here)</span>}
          </div>
          <pre className="algo-code lt-code ops-output">{block.output}</pre>
        </>
      )}
    </div>
  );
}

function Walkthrough({ part }: { part: WalkthroughPart }) {
  const [i, setI] = useState(0);
  const step = part.steps[i];
  return (
    <div className="crypto-section">
      <h3>{part.title}</h3>
      {part.intro && <p className="lt-p">{withInlineCode(part.intro)}</p>}
      <ol className="ops-dots" aria-label="Steps">
        {part.steps.map((s, j) => (
          <li key={j}>
            <button className={j === i ? "active" : j < i ? "done" : ""} onClick={() => setI(j)} aria-label={`Step ${j + 1}: ${s.title}`}>
              {j + 1}
            </button>
          </li>
        ))}
      </ol>
      <div className="ops-step">
        <h4>
          Step {i + 1} of {part.steps.length}: {step.title}
        </h4>
        <p className="lt-p">{withInlineCode(step.body)}</p>
        {step.code && <OpsCode block={{ lang: step.lang ?? "text", code: step.code }} />}
      </div>
      <div className="darr-actions">
        <button onClick={() => setI(i - 1)} disabled={i === 0}>
          Back
        </button>
        <button onClick={() => setI(i + 1)} disabled={i === part.steps.length - 1}>
          Next
        </button>
      </div>
    </div>
  );
}

function Part({ part }: { part: OpsPart }) {
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
    case "code":
      return (
        <div className="crypto-section">
          <h3>{part.title}</h3>
          <div className="ops-blocks">
            {part.blocks.map((b, i) => (
              <OpsCode key={i} block={b} />
            ))}
          </div>
          {part.notes?.map((n, i) => (
            <p key={i} className="lt-p">
              {withInlineCode(n)}
            </p>
          ))}
        </div>
      );
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
            <table className="bigo-table lt-table ops-table">
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
    case "walkthrough":
      return <Walkthrough part={part} />;
    case "widget": {
      const Widget = OPS_WIDGETS[part.widget];
      return (
        <div className="crypto-section">
          <h3>{part.title}</h3>
          {part.intro && <p className="lt-p">{withInlineCode(part.intro)}</p>}
          <Widget />
        </div>
      );
    }
    case "sql":
      return (
        <div className="crypto-section">
          <h3>{part.title}</h3>
          {part.intro && <p className="lt-p">{withInlineCode(part.intro)}</p>}
          <Suspense fallback={<p className="status-text">Loading the SQL editor…</p>}>
            <SqlPlayground schemaSql={part.schema === "shop" ? SHOP_SCHEMA : SQL_SAMPLE_SCHEMA} starterQuery={part.query} />
          </Suspense>
        </div>
      );
    case "sqlPractice":
      return (
        <div className="crypto-section">
          <h3>{part.title}</h3>
          <Suspense fallback={<p className="status-text">Loading the SQL editor…</p>}>
            <SqlPractice set={part.set} />
          </Suspense>
        </div>
      );
    case "lab":
      return (
        <div className="crypto-section">
          <h3>{part.title}</h3>
          <Suspense fallback={<p className="status-text">Loading the terminal…</p>}>
            <LinuxLab lesson={part.lesson as keyof typeof LINUX_LESSONS} />
          </Suspense>
        </div>
      );
  }
}

function QuizCard({ item, index, onAnswer }: { item: QuizItem; index: number; onAnswer: (correct: boolean) => void }) {
  const options = useMemo(() => shuffle([item.answer, ...item.distractors]), [item]);
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="drill-card lt-predict">
      <div className="drill-progress">Question {index + 1}</div>
      <p className="lt-p ops-question">{withInlineCode(item.question)}</p>
      {item.code && <OpsCode block={{ lang: item.lang ?? "bash", code: item.code }} />}
      <div className="drill-options lt-options ops-options">
        {options.map((o) => {
          const state = picked === null ? "" : o === item.answer ? "correct" : o === picked ? "wrong" : "dim";
          return (
            <button
              key={o}
              className={`drill-option ${state}`}
              disabled={picked !== null}
              onClick={() => {
                setPicked(o);
                onAnswer(o === item.answer);
              }}
            >
              <span className="lt-out">{o}</span>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="drill-feedback">
          <p>
            <strong>{picked === item.answer ? "Correct." : "Not quite."}</strong> {withInlineCode(item.why)}
          </p>
        </div>
      )}
    </div>
  );
}

export function OpsLesson({ lesson }: { lesson: OpsLessonData }) {
  const [score, setScore] = useState({ answered: 0, correct: 0 });
  const [round, setRound] = useState(0);
  return (
    <div className="tool-widget lt-widget ops-widget">
      {lesson.parts.map((p, i) => (
        <Part key={i} part={p} />
      ))}

      {lesson.quiz.length > 0 && (
        <div className="crypto-section">
          <h3>Check yourself</h3>
          <p className="gate-note">Pick an answer to see why it's right or wrong.</p>
          {lesson.quiz.map((q, i) => (
            <QuizCard
              key={`${round}-${i}`}
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
