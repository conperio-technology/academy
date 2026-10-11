import Editor from "@monaco-editor/react";
import { useState } from "react";

// How many runs before the solution unlocks without passing. Counted across languages,
// and persisted server-side (ConceptDetail.attempts), so a reload doesn't reset it.
export const UNLOCK_AFTER_ATTEMPTS = 3;

interface Props {
  language: string;
  solution: string | undefined;
  unlocked: boolean;
  attempts: number;
  // Called each time the solution is opened, so the attempt that follows is recorded as assisted.
  onReveal?: () => void;
}

// The standard solution for this lesson, in whichever language tab is active. Locked
// until you've passed or made a few real attempts -- reading the answer first skips the
// part that actually builds the skill -- with a deliberate "show it anyway" escape hatch
// for when you're truly stuck.
export function ReferenceSolution({ language, solution, unlocked, attempts, onReveal }: Props) {
  const [forced, setForced] = useState(false);
  const [open, setOpen] = useState(false);

  if (!solution) return null;

  const available = unlocked || forced;
  const remaining = Math.max(0, UNLOCK_AFTER_ATTEMPTS - attempts);

  return (
    <div className="reference-solution">
      {!available ? (
        <p className="gate-note">
          🔒 Reference solution unlocks once you pass, or after {remaining} more{" "}
          {remaining === 1 ? "run" : "runs"}.{" "}
          <button className="link-button" onClick={() => { setForced(true); setOpen(true); onReveal?.(); }}>
            Stuck? Show it anyway
          </button>
        </p>
      ) : (
        <>
          <button
            className="reference-toggle"
            onClick={() => {
              if (!open) onReveal?.();
              setOpen(!open);
            }}
          >
            {open ? "▾ Hide reference solution" : "▸ Show reference solution"}
          </button>
          {open && (
            <div className="reference-body">
              <p className="gate-note">
                One standard way to solve it. Yours doesn't have to match -- compare the approach, not the exact
                lines. Passes in the next 7 days count as assisted practice, not independent.
              </p>
              <div className="editor-wrap">
                <Editor
                  height={`${Math.min(480, (solution.split("\n").length + 1) * 19)}px`}
                  language={language}
                  theme="vs-dark"
                  value={solution}
                  options={{ fontSize: 14, minimap: { enabled: false }, readOnly: true, scrollBeyondLastLine: false }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
