import { useState } from "react";

// Shared by the API design lessons: "which of these two designs is better, and why?" Each
// question shows two designs as code; picking one reveals the explanation. The multiple-choice
// quiz with plain-text options is Quiz in netSecShared.tsx.

export interface DesignPair {
  q: string;
  a: string; // design A, shown as code
  b: string; // design B
  better: "a" | "b";
  why: string;
}

export function DesignChoice({ items, title }: { items: DesignPair[]; title: string }) {
  const [picked, setPicked] = useState<("a" | "b" | null)[]>(() => items.map(() => null));
  const answered = picked.filter((p) => p !== null).length;
  const score = picked.filter((p, i) => p === items[i].better).length;
  const pick = (i: number, side: "a" | "b") => setPicked((prev) => prev.map((p, j) => (j === i ? side : p)));

  return (
    <div className="crypto-section">
      <h3>{title}</h3>
      <ol className="cm-quiz">
        {items.map((item, i) => (
          <li key={i}>
            <p>{item.q}</p>
            <div className="api-pair">
              {(["a", "b"] as const).map((side) => {
                const state = picked[i] === null ? "" : side === item.better ? "api-opt-right" : picked[i] === side ? "api-opt-wrong" : "api-opt-dim";
                return (
                  <button key={side} className={`api-opt ${state}`} onClick={() => pick(i, side)} aria-pressed={picked[i] === side}>
                    <span className="api-opt-label">Design {side.toUpperCase()}</span>
                    <code className="api-opt-code">{side === "a" ? item.a : item.b}</code>
                  </button>
                );
              })}
            </div>
            {picked[i] !== null && (
              <p className={picked[i] === item.better ? "constraint-ok" : "constraint-fail"}>
                {picked[i] === item.better ? "Right. " : `Design ${item.better.toUpperCase()} is better. `}
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
