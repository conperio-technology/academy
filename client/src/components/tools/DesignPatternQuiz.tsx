import { useState } from "react";
import { openLesson } from "../../api";
import { PATTERN_QUESTIONS, type PatternQuestion } from "../../designPatternQuizData";
import { FAMILY_LESSON_ID, FAMILY_TITLE, familyOf, PATTERN_NAMES, type PatternName } from "../../designPatternsData";
import { recordPatternQuizRun } from "../../practiceHistory";
import { shuffle } from "../../random";

interface Round {
  question: PatternQuestion;
  options: PatternName[];
}

interface Miss {
  question: PatternQuestion;
  picked: PatternName;
}

// Same scheme as the Pattern Recognition Drill: the answer, the sibling it is most often
// confused with, and two other patterns at random.
function buildRounds(questions: PatternQuestion[]): Round[] {
  return shuffle(questions).map((question) => {
    const fillers = shuffle(PATTERN_NAMES.filter((p) => p !== question.answer && p !== question.trap)).slice(0, 2);
    return { question, options: shuffle<PatternName>([question.answer, question.trap, ...fillers]) };
  });
}

export function DesignPatternQuiz() {
  const [rounds, setRounds] = useState<Round[]>(() => buildRounds(PATTERN_QUESTIONS));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<PatternName | null>(null);
  const [missed, setMissed] = useState<Miss[]>([]);
  const [correct, setCorrect] = useState(0);

  const done = index >= rounds.length;
  const round = rounds[index];

  function choose(option: PatternName) {
    if (picked !== null) return;
    setPicked(option);
    if (option === round.question.answer) setCorrect((c) => c + 1);
    else setMissed((m) => [...m, { question: round.question, picked: option }]);
  }

  function next() {
    // Finishing a run records its score for the Study Plan and Readiness tool.
    if (index + 1 >= rounds.length)
      recordPatternQuizRun({
        at: new Date().toISOString(),
        correct,
        total: rounds.length,
        full: rounds.length === PATTERN_QUESTIONS.length,
      });
    setPicked(null);
    setIndex((i) => i + 1);
  }

  function restart(questions: PatternQuestion[]) {
    setRounds(buildRounds(questions));
    setIndex(0);
    setPicked(null);
    setMissed([]);
    setCorrect(0);
  }

  return (
    <div className="tool-widget">
      {!done && (
        <div className="drill-card">
          <div className="drill-progress">
            Question {index + 1} of {rounds.length}, score so far: {correct}
          </div>
          <p className="drill-statement">{round.question.scenario}</p>
          {round.question.code && <pre className="algo-code dp-quiz-code">{round.question.code}</pre>}
          <p className="gate-note">Which pattern is this?</p>

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
                <strong>
                  {picked === round.question.answer ? "Correct." : `Not quite. This is ${round.question.answer}.`}
                </strong>
              </p>
              <p>{round.question.why}</p>
              <p className="gate-note">Signals to remember: {round.question.signals.join("; ")}.</p>
              <p className="gate-note">Commonly confused with: {round.question.trap}.</p>
              <div className="darr-actions">
                <button onClick={next}>{index + 1 < rounds.length ? "Next question" : "See results"}</button>
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
            <p className="gate-note">A clean run. Run it again; the order and the options reshuffle each time.</p>
          ) : (
            <>
              <p className="gate-note">The ones you missed, with the lesson that covers each:</p>
              <ul className="drill-misses dp-misses">
                {missed.map(({ question, picked: wrong }) => {
                  const family = familyOf(question.answer);
                  return (
                    <li key={question.id}>
                      <strong>{question.title}</strong>: {question.answer}, you picked {wrong}.{" "}
                      <button className="link-button" onClick={() => openLesson(FAMILY_LESSON_ID[family])}>
                        Review in {FAMILY_TITLE[family]}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          <div className="darr-actions dp-actions">
            <button onClick={() => restart(PATTERN_QUESTIONS)}>Run all again</button>
            {missed.length > 0 && (
              <button onClick={() => restart(missed.map((m) => m.question))}>Retry only the ones I missed</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
