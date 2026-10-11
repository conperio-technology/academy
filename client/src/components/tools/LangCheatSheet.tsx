import { useState } from "react";
import { withInlineCode } from "../../inlineCode";
import { cheatSheet, SHEET_TOPICS, type SheetEntry, type SheetTopic } from "../../langTrack/cheatSheet";
import type { Lang } from "../../langTrack/types";
import { CodePane } from "./LangShared";

// The three cheat sheets of the "Programming in C# & Python" section, all drawn from one
// data set: one language at a time, or the two side by side as a translation table.
// Search and topic chips filter; Print hides the controls (see the print styles in
// index.css) so the sheet prints as a compact reference.

export type SheetMode = Lang | "translate";

function matches(e: SheetEntry, mode: SheetMode, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const code = mode === "csharp" ? e.csharp : mode === "python" ? e.python : `${e.csharp ?? ""}\n${e.python ?? ""}`;
  return [e.title, e.topic, e.note ?? "", e.bigO ?? "", code ?? ""].some((t) => t.toLowerCase().includes(q));
}

function available(e: SheetEntry, mode: SheetMode): boolean {
  return mode === "translate" ? !!(e.csharp && e.python) : !!e[mode];
}

export function LangCheatSheet({ mode }: { mode: SheetMode }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<SheetTopic | "All">("All");
  const entries = cheatSheet.entries.filter((e) => available(e, mode));
  const shown = entries.filter((e) => (topic === "All" || e.topic === topic) && matches(e, mode, query.trim()));
  const topics = SHEET_TOPICS.filter((t) => shown.some((e) => e.topic === t));

  return (
    <div className="tool-widget lt-widget lt-sheet">
      <div className="lt-sheet-controls lt-no-print">
        <input
          className="lt-search"
          type="search"
          placeholder={mode === "translate" ? "Search both languages, e.g. dictionary, heap, split" : "Search, e.g. dictionary, heap, split"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search the cheat sheet"
        />
        <div className="lt-chips" role="group" aria-label="Filter by topic">
          {(["All", ...SHEET_TOPICS] as const).map((t) => (
            <button key={t} className={topic === t ? "active" : ""} aria-pressed={topic === t} onClick={() => setTopic(t)}>
              {t}
            </button>
          ))}
        </div>
        <div className="lt-sheet-actions">
          <span>
            {shown.length} of {entries.length} entries
          </span>
          {(query || topic !== "All") && (
            <button
              onClick={() => {
                setQuery("");
                setTopic("All");
              }}
            >
              Clear filters
            </button>
          )}
          <button onClick={() => window.print()}>Print</button>
        </div>
      </div>

      {shown.length === 0 && <p className="lt-empty">Nothing matches. Try a shorter search, or another topic.</p>}

      {topics.map((t) => (
        <section key={t}>
          <h3 className="lt-sheet-topic">{t}</h3>
          <div className={`lt-entries ${mode === "translate" ? "lt-wide" : ""}`}>
            {shown
              .filter((e) => e.topic === t)
              .map((e) => (
                <div key={e.id} className="lt-entry">
                  <h4>
                    {e.title}
                    {e.bigO && <span className="lt-bigo">{e.bigO}</span>}
                  </h4>
                  {mode === "translate" ? (
                    <div className="lt-pair">
                      <CodePane lang="csharp" code={e.csharp!} />
                      <CodePane lang="python" code={e.python!} />
                    </div>
                  ) : (
                    <CodePane lang={mode} code={e[mode]!} />
                  )}
                  {e.note && <p className="lt-p">{withInlineCode(e.note)}</p>}
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
