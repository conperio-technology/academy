import { useState, type ReactNode } from "react";
import { openLesson } from "../../api";

// Small pieces shared by the Networking and Security lessons: a multiple-choice quiz with an
// explanation per question, a row of tabs, a terminal transcript, and a link to another lesson.

export interface QuizItem {
  q: ReactNode;
  options: string[];
  answer: number; // index into options
  why: string;
}

export function Quiz({ items, title }: { items: QuizItem[]; title?: string }) {
  const [picked, setPicked] = useState<(number | null)[]>(() => items.map(() => null));
  const answered = picked.filter((p) => p !== null).length;
  const score = picked.filter((p, i) => p === items[i].answer).length;
  return (
    <div className="crypto-section">
      {title && <h3>{title}</h3>}
      <ol className="cm-quiz">
        {items.map((item, i) => (
          <li key={i}>
            <p>{item.q}</p>
            <div className="sql-presets">
              {item.options.map((o, k) => (
                <button
                  key={o}
                  className={picked[i] === k ? (k === item.answer ? "active" : "cm-wrong") : ""}
                  onClick={() => setPicked(picked.map((p, j) => (j === i ? k : p)))}
                >
                  {o}
                </button>
              ))}
            </div>
            {picked[i] !== null && (
              <p className={picked[i] === item.answer ? "constraint-ok" : "constraint-fail"}>
                {picked[i] === item.answer ? "Right. " : `Not quite: the answer is "${item.options[item.answer]}". `}
                {item.why}
              </p>
            )}
          </li>
        ))}
      </ol>
      {answered > 0 && (
        <p className="gate-note">
          {score} of {items.length} right{answered < items.length ? ` so far (${answered} answered)` : ""}.
          {answered === items.length && (
            <>
              {" "}
              <button className="link-button" onClick={() => setPicked(items.map(() => null))}>
                Try again
              </button>
            </>
          )}
        </p>
      )}
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string }[]; value: T; onChange: (id: T) => void }) {
  return (
    <div className="sql-presets" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={t.id === value} className={t.id === value ? "active" : ""} onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// A command and its output. `source` says where the output came from (a real run, or an
// example with documentation addresses), so nobody mistakes an example for a capture.
export function Terminal({ command, output, source }: { command: string; output: string; source?: string }) {
  return (
    <div className="ns-terminal">
      <pre className="algo-code ns-term-pre">
        <span className="ns-prompt">$ </span>
        {command}
        {"\n"}
        {output}
      </pre>
      {source && <p className="gate-note ns-term-source">{source}</p>}
    </div>
  );
}

export function LessonLink({ id, children }: { id: string; children: ReactNode }) {
  return (
    <button className="link-button" onClick={() => openLesson(id)}>
      {children}
    </button>
  );
}

// Per-browser counters for practice that has no server-side progress (the subnetting drill).
export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Blocked storage: the counters last until the page closes.
  }
}
