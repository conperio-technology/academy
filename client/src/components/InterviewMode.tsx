import { useEffect, useState } from "react";

const TARGET_SECONDS = 20 * 60;

const STEPS = [
  "Restate the problem and ask about edge cases (empty input? duplicates? negatives?)",
  "Work a small example by hand",
  "Say the brute-force approach and its complexity out loud",
  "Name the pattern and explain the better approach BEFORE coding",
  "Write the code, narrating as you go",
  "Test it against your example and the edge cases",
  "State the final time and space complexity",
];

function storageKey(lessonId: string) {
  return `interview-notes:${lessonId}`;
}

function loadNotes(lessonId: string): string {
  try {
    return localStorage.getItem(storageKey(lessonId)) ?? "";
  } catch {
    return "";
  }
}

interface Props {
  lessonId: string;
}

// Optional practice wrapper, not graded: a timer and a "plan before you code" notepad that
// mirror what a real coding interview asks of you besides the code itself. Notes persist per
// lesson in this browser only (localStorage), because they're scratch thinking, not progress.
export function InterviewMode({ lessonId }: Props) {
  const [open, setOpen] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [notes, setNotes] = useState(() => loadNotes(lessonId));
  const [done, setDone] = useState<boolean[]>(() => STEPS.map(() => false));

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  function updateNotes(value: string) {
    setNotes(value);
    try {
      localStorage.setItem(storageKey(lessonId), value);
    } catch {
      // Private-window / blocked storage: notes just won't survive a reload.
    }
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const over = seconds > TARGET_SECONDS;

  return (
    <div className="interview-mode">
      <label className="interview-toggle">
        <input type="checkbox" checked={open} onChange={(e) => setOpen(e.target.checked)} />
        Interview mode (optional): time yourself and plan out loud before you code
      </label>

      {open && (
        <div className="interview-body">
          <div className="interview-timer-row">
            <span className={`interview-timer ${over ? "over" : ""}`}>
              {mm}:{ss}
            </span>
            <span className="gate-note">target 20:00{over ? " -- over time" : ""}</span>
            <button onClick={() => setRunning((r) => !r)}>{running ? "Pause" : seconds === 0 ? "Start" : "Resume"}</button>
            <button
              onClick={() => {
                setRunning(false);
                setSeconds(0);
                setDone(STEPS.map(() => false));
              }}
            >
              Reset
            </button>
          </div>

          <ol className="interview-steps">
            {STEPS.map((step, i) => (
              <li key={step}>
                <label>
                  <input
                    type="checkbox"
                    checked={done[i]}
                    onChange={(e) => setDone((d) => d.map((v, j) => (j === i ? e.target.checked : v)))}
                  />{" "}
                  {step}
                </label>
              </li>
            ))}
          </ol>

          <textarea
            className="interview-notes"
            placeholder="Your plan: clarifying questions, the example you worked, the brute force, the better approach, edge cases..."
            value={notes}
            onChange={(e) => updateNotes(e.target.value)}
            rows={6}
          />
        </div>
      )}
    </div>
  );
}
