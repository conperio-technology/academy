import { useState } from "react";
import { recordDrillAnswer } from "../../practiceHistory";
import { DRILL_QUESTIONS, TECHNIQUES, type DrillQuestion, type Technique } from "../../patternDrillData";
import { shuffle } from "../../random";

interface Round {
  question: DrillQuestion;
  options: Technique[];
}

// Four options per question: the answer, the realistic look-alike the question's author
// flagged as the trap, and two other techniques picked at random so the choice isn't
// always between the same pair. Fillers skip the question's alsoAccept techniques, which
// would otherwise be a valid answer graded wrong.
function buildRounds(questions: DrillQuestion[]): Round[] {
  return shuffle(questions).map((question) => {
    const excluded = new Set<Technique>([question.answer, question.trap, ...(question.alsoAccept ?? [])]);
    const fillers = shuffle(TECHNIQUES.filter((t) => !excluded.has(t))).slice(0, 2);
    return { question, options: shuffle<Technique>([question.answer, question.trap, ...fillers]) };
  });
}

export function PatternDrill() {
  const [rounds, setRounds] = useState<Round[]>(() => buildRounds(DRILL_QUESTIONS));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Technique | null>(null);
  const [missed, setMissed] = useState<DrillQuestion[]>([]);
  const [correct, setCorrect] = useState(0);

  const done = index >= rounds.length;
  const round = rounds[index];

  function choose(option: Technique) {
    if (picked !== null) return;
    setPicked(option);
    recordDrillAnswer(round.question.answer, option === round.question.answer);
    if (option === round.question.answer) setCorrect((c) => c + 1);
    else setMissed((m) => [...m, round.question]);
  }

  function next() {
    setPicked(null);
    setIndex((i) => i + 1);
  }

  function restart(questions: DrillQuestion[]) {
    setRounds(buildRounds(questions));
    setIndex(0);
    setPicked(null);
    setMissed([]);
    setCorrect(0);
  }

  const missCounts = missed.reduce<Record<string, number>>((acc, q) => {
    acc[q.answer] = (acc[q.answer] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="tool-widget">
      {!done && (
        <div className="drill-card">
          <div className="drill-progress">
            Problem {index + 1} of {rounds.length} -- score so far: {correct}
          </div>
          <p className="drill-statement">{round.question.statement}</p>
          <p className="gate-note">Which technique fits?</p>

          <div className="drill-options">
            {round.options.map((option) => {
              const state =
                picked === null ? "" : option === round.question.answer ? "correct" : option === picked ? "wrong" : "dim";
              return (
                <button key={option} className={`drill-option ${state}`} onClick={() => choose(option)} disabled={picked !== null}>
                  {option}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <div className="drill-feedback">
              <p>
                <strong>{picked === round.question.answer ? "Correct." : `Not quite -- this is ${round.question.answer}.`}</strong>
              </p>
              <p>{round.question.why}</p>
              <p className="gate-note">Signals to remember: {round.question.signals.join("; ")}.</p>
              <p className="gate-note">Easily confused with: {round.question.trap}.</p>
              <div className="darr-actions">
                <button onClick={next}>{index + 1 < rounds.length ? "Next problem" : "See results"}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {done && (
        <div className="drill-card">
          <h3>
            Score: {correct} / {rounds.length}
          </h3>
          {missed.length === 0 ? (
            <p className="gate-note">A clean run. Run it again -- the options reshuffle each time.</p>
          ) : (
            <>
              <p className="gate-note">Techniques you missed -- these are the ones to revisit in the Patterns track:</p>
              <ul className="drill-misses">
                {Object.entries(missCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([technique, count]) => (
                    <li key={technique}>
                      <strong>{technique}</strong> {count > 1 ? `(missed ${count}×)` : ""}
                    </li>
                  ))}
              </ul>
            </>
          )}
          <div className="darr-actions">
            <button onClick={() => restart(DRILL_QUESTIONS)}>Run all again</button>
            {missed.length > 0 && <button onClick={() => restart(missed)}>Drill only the ones I missed</button>}
          </div>
        </div>
      )}
    </div>
  );
}
