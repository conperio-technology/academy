import { useState } from "react";
import { recordReveal } from "../api";
import { bareStarter, type ExerciseMode } from "../bareStarter";
import { REVEAL_COOLDOWN_MS } from "../progressCore";
import type { ConceptDetail } from "../types";
import { CSharpRunner } from "./CSharpRunner";
import { PythonRunner } from "./PythonRunner";
import { ReferenceSolution, UNLOCK_AFTER_ATTEMPTS } from "./ReferenceSolution";

interface Props {
  lesson: ConceptDetail;
  onPassed: () => void;
  // The mixed interview set hides the reference solution: it would give the problem away.
  hideReference?: boolean;
  // Set by the mixed interview set ("timed"), which supplies its own blind starter and hides the
  // guided / bare switch.
  fixedMode?: ExerciseMode;
  // Every run, pass or fail, with the language it ran in (the Building Blocks drill counts them).
  onRan?: (passed: boolean, language: string) => void;
}

const LANGUAGE_LABELS: Record<string, string> = {
  csharp: "C#",
  python: "Python",
};

const MODE_KEY = "exercise-mode";

// The Programming in C# & Python exercises teach a language feature, and their TODO comments
// state the task itself, so they keep the guided starter only.
const GUIDED_ONLY_SECTION = "Programming in C# & Python";

function loadMode(): ExerciseMode {
  try {
    return localStorage.getItem(MODE_KEY) === "bare" ? "bare" : "guided";
  } catch {
    return "guided";
  }
}

function saveMode(mode: ExerciseMode) {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    // Blocked storage: the choice lasts until the page closes.
  }
}

// Only offers a language tab if the lesson actually has starter code + a function name
// for it -- so a concept that hasn't been ported to Python yet (or a future language)
// just doesn't show that tab instead of rendering a broken runner.
export function LanguageRunner({ lesson, onPassed, hideReference = false, fixedMode, onRan }: Props) {
  const availableLanguages = Object.keys(lesson.starterCode).filter((lang) => lesson.functionNames[lang]);
  const [language, setLanguage] = useState(availableLanguages[0] ?? "csharp");
  const bareAllowed = !fixedMode && lesson.section !== GUIDED_ONLY_SECTION;
  const [chosenMode, setChosenMode] = useState<ExerciseMode>(loadMode);
  const mode: ExerciseMode = fixedMode ?? (bareAllowed ? chosenMode : "guided");
  // Runs and passes made since this lesson was loaded, on top of what the saved progress
  // already had (lesson.attempts / lesson.completed) -- so the reference solution unlocks the
  // moment a run qualifies, without re-fetching the lesson.
  const [localRuns, setLocalRuns] = useState(0);
  const [passedHere, setPassedHere] = useState<ExerciseMode | null>(null);
  const [revealedHere, setRevealedHere] = useState(false);
  const attempts = lesson.attempts + localRuns;
  const solutionUnlocked = lesson.completed || passedHere !== null || attempts >= UNLOCK_AFTER_ATTEMPTS;
  // An ISO time with its zone (progressCore.ts stores them that way; an import normalizes them).
  const revealedAt = lesson.evidence?.lastRevealedAt;
  const lastReveal = revealedAt ? Date.parse(revealedAt) : null;
  const [loadedAt] = useState(() => Date.now());
  const sawReference = revealedHere || (lastReveal !== null && loadedAt - lastReveal < REVEAL_COOLDOWN_MS);

  function handleRan(passed: boolean, lang: string) {
    setLocalRuns((n) => n + 1);
    if (passed) setPassedHere(mode);
    onRan?.(passed, lang);
  }

  function chooseMode(next: ExerciseMode) {
    setChosenMode(next);
    saveMode(next);
    setPassedHere(null);
  }

  function handleReveal() {
    setRevealedHere(true);
    recordReveal(lesson.id, language).catch(() => {
      // Not recorded: the pass may then count as independent. Nothing else depends on it.
    });
  }

  if (availableLanguages.length === 0) {
    return <p className="status-text">No starter code available for this lesson yet.</p>;
  }

  const starterFor = (lang: string) =>
    mode === "bare" ? bareStarter(lesson.id, lang, lesson.starterCode[lang]) : lesson.starterCode[lang];
  const independentNow = mode !== "guided" && !sawReference;

  return (
    <div>
      {bareAllowed && (
        <div className="exercise-mode">
          <div className="sql-presets" role="radiogroup" aria-label="Starter code">
            <button role="radio" aria-checked={mode === "guided"} className={mode === "guided" ? "active" : ""} onClick={() => chooseMode("guided")}>
              Guided: step-by-step TODOs
            </button>
            <button role="radio" aria-checked={mode === "bare"} className={mode === "bare" ? "active" : ""} onClick={() => chooseMode("bare")}>
              Bare: signature only
            </button>
          </div>
          <p className="gate-note">
            {mode === "guided"
              ? "A pass from the guided starter counts as assisted practice. Once it clicks, switch to bare and solve it again from the signature."
              : sawReference
                ? "You opened the reference solution in the last 7 days, so a pass now counts as assisted. Come back next week to record an independent pass."
                : "A pass from the bare starter, without opening the reference solution, counts as independent."}{" "}
            Switching resets the editors to that starter.
          </p>
        </div>
      )}

      {availableLanguages.length > 1 && (
        <div className="language-tabs">
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              className={`language-tab ${language === lang ? "active" : ""}`}
              onClick={() => setLanguage(lang)}
            >
              {LANGUAGE_LABELS[lang] ?? lang}
            </button>
          ))}
        </div>
      )}

      {/* Both runners stay mounted at once (hidden via CSS, not unmounted) once a
          language's been shown -- switching tabs used to fully unmount whichever
          runner wasn't active, wiping its edited code and test results every time.
          Keyed on lesson.id and the starter mode so a different lesson, or switching
          between guided and bare, remounts fresh with that starter. */}
      {availableLanguages.includes("csharp") && (
        <div style={{ display: language === "csharp" ? "block" : "none" }}>
          <CSharpRunner
            key={`${lesson.id}-${mode}`}
            lessonId={lesson.id}
            starterCode={starterFor("csharp")}
            functionName={lesson.functionNames["csharp"]}
            onPassed={onPassed}
            onRan={(passed) => handleRan(passed, "csharp")}
            mode={mode}
            harnessPreamble={lesson.cSharpHarnessPreamble}
            callTemplate={lesson.cSharpCallTemplate}
            testCases={lesson.testCases}
          />
        </div>
      )}

      {availableLanguages.includes("python") && (
        <div style={{ display: language === "python" ? "block" : "none" }}>
          <PythonRunner
            key={`${lesson.id}-${mode}`}
            lessonId={lesson.id}
            starterCode={starterFor("python")}
            functionName={lesson.functionNames["python"]}
            harnessPreamble={lesson.pythonHarnessPreamble}
            callTemplate={lesson.pythonCallTemplate ?? "{input}"}
            testCases={lesson.testCases}
            onPassed={onPassed}
            onRan={(passed) => handleRan(passed, "python")}
            mode={mode}
          />
        </div>
      )}

      {passedHere !== null && !fixedMode && (
        <p className="gate-note exercise-evidence">
          {independentNow
            ? "Recorded as an independent pass: bare starter, no reference solution."
            : mode === "bare"
              ? "Recorded as assisted: the reference solution was open in the last 7 days."
              : "Recorded as assisted practice (guided starter)."}
          {bareAllowed && mode === "guided" && " Try it bare next to record an independent pass."}
          {lesson.transferNext && " Then try the transfer problem below."}
        </p>
      )}

      {!hideReference && (
        <ReferenceSolution
        key={`${lesson.id}-${language}`}
        language={language}
        solution={lesson.referenceSolutions[language]}
        unlocked={solutionUnlocked}
        attempts={attempts}
        onReveal={handleReveal}
        />
      )}
    </div>
  );
}
