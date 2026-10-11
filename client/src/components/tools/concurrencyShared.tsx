import { useState } from "react";

// Small pieces shared by the Concurrency & Memory lessons. Every simulator in that section
// is a deterministic state machine in React state: no real threads, timers only for
// "play" buttons, so the same clicks always produce the same result.

export interface CodeSample {
  label: string;
  code: string;
  note?: string;
}

// A row of tabs over C# snippets, e.g. "broken" vs "with lock" vs "Interlocked".
export function CodeTabs({ samples }: { samples: CodeSample[] }) {
  const [i, setI] = useState(0);
  const sample = samples[Math.min(i, samples.length - 1)];
  return (
    <div className="cm-code-tabs">
      <div className="sql-presets">
        {samples.map((s, k) => (
          <button key={s.label} className={k === i ? "active" : ""} onClick={() => setI(k)}>
            {s.label}
          </button>
        ))}
      </div>
      <pre className="algo-code">{sample.code}</pre>
      {sample.note && <p className="gate-note">{sample.note}</p>}
    </div>
  );
}

export interface TimelineCell {
  text: string;
  cls: string;
  title?: string;
}

export interface TimelineRow {
  label: string;
  cells: TimelineCell[];
}

// One row per core or thread, one column per tick. Columns after `upTo` are drawn faded,
// so a tick slider can "play" the schedule without recomputing it.
export function Timeline({ rows, upTo, ariaLabel }: { rows: TimelineRow[]; upTo: number; ariaLabel: string }) {
  return (
    <div className="cm-scroll" role="img" aria-label={ariaLabel}>
      <div className="cm-timeline">
        {rows.map((row) => (
          <div key={row.label} className="cm-tl-row">
            <span className="cm-tl-label">{row.label}</span>
            {row.cells.map((c, t) => (
              <span key={t} className={`cm-tl-cell ${c.cls} ${t > upTo ? "cm-future" : ""} ${t === upTo ? "cm-now" : ""}`} title={c.title}>
                {c.text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// A highlighted listing for code steppers: one line per row, the active line marked.
export function CodeListing({ lines, active }: { lines: string[]; active: number | number[] | null }) {
  const on = new Set(Array.isArray(active) ? active : active == null ? [] : [active]);
  return (
    <pre className="algo-code cm-listing">
      {lines.map((l, k) => (
        <div key={k} className={on.has(k) ? "cm-line cm-line-on" : "cm-line"}>
          <span className="cm-ln">{k + 1}</span>
          {l || " "}
        </div>
      ))}
    </pre>
  );
}
