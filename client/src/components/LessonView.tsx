import { useEffect, useState } from "react";
import { fetchLesson, openLesson, resetLessonProgress } from "../api";
import { recordLessonOpened } from "../practiceHistory";
import { GlossaryProse } from "./GlossaryProse";
import type { ConceptDetail } from "../types";
import { ArrayVisualizer } from "./ArrayVisualizer";
import { CallStackVisualizer } from "./CallStackVisualizer";
import { ComplexityCheck } from "./ComplexityCheck";
import { ConfirmButton } from "./ConfirmButton";
import { GraphVisualizer } from "./GraphVisualizer";
import { GridVisualizer } from "./GridVisualizer";
import { HashMapVisualizer } from "./HashMapVisualizer";
import { InterviewMode } from "./InterviewMode";
import { LanguageRunner } from "./LanguageRunner";
import { LinkedListVisualizer } from "./LinkedListVisualizer";
import { PatternNotes } from "./PatternNotes";
import { StackVisualizer } from "./StackVisualizer";
import { TreeVisualizer } from "./TreeVisualizer";

interface Props {
  lessonId: string;
  onCompleted: () => void;
}

export function LessonView({ lessonId, onCompleted }: Props) {
  const [lesson, setLesson] = useState<ConceptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  // Bumped on reset to force LanguageRunner (and its editor/results state) to remount
  // fresh instead of showing a "completed" run against code that's no longer credited.
  const [runnerKey, setRunnerKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    recordLessonOpened(lessonId);
    fetchLesson(lessonId)
      .then(setLesson)
      .finally(() => setLoading(false));
  }, [lessonId]);

  async function handleReset() {
    await resetLessonProgress(lessonId);
    const fresh = await fetchLesson(lessonId);
    setLesson(fresh);
    setRunnerKey((k) => k + 1);
    onCompleted(); // also refreshes the sidebar's completed/not-completed state
  }

  if (loading) return <p className="status-text">Loading lesson…</p>;
  if (!lesson) return <p className="status-text">Couldn't load this lesson.</p>;

  return (
    <div className="lesson-view">
      <header>
        <div className="lesson-header-row">
          <h1>{lesson.title}</h1>
          {lesson.completed && (
            <div className="reset-control">
              <ConfirmButton
                label="Reset progress"
                confirmLabel="Reset this lesson back to not-started?"
                onConfirm={handleReset}
              />
            </div>
          )}
        </div>
        <p className="one-liner">{lesson.oneLiner}</p>
      </header>

      <div className="key-takeaway">
        <span className="key-takeaway-label">Key takeaway</span>
        <p>{lesson.keyTakeaway}</p>
      </div>

      {lesson.transferOf && (
        <p className="gate-note transfer-note">
          Transfer problem: this follows{" "}
          <button className="link-button" onClick={() => openLesson(lesson.transferOf!.id)}>
            {lesson.transferOf.title}
          </button>
          . Try it from the bare starter first, and answer the "explain why" prompt at the end of the explanation.
        </p>
      )}

      <GlossaryProse text={lesson.explanation} title={lesson.title} />

      <PatternNotes
        recognitionSignals={lesson.recognitionSignals}
        gotchas={lesson.gotchas}
        confusableWith={lesson.confusableWith}
      />

      <section>
        <h2>1. Watch it happen</h2>
        {lesson.visualizerKind === "linkedList" && <LinkedListVisualizer steps={lesson.visualizationSteps} />}
        {lesson.visualizerKind === "stack" && <StackVisualizer steps={lesson.visualizationSteps} />}
        {lesson.visualizerKind === "hashMap" && <HashMapVisualizer steps={lesson.visualizationSteps} />}
        {lesson.visualizerKind === "callStack" && <CallStackVisualizer steps={lesson.visualizationSteps} />}
        {lesson.visualizerKind === "tree" && <TreeVisualizer steps={lesson.visualizationSteps} />}
        {lesson.visualizerKind === "graph" && <GraphVisualizer steps={lesson.visualizationSteps} />}
        {lesson.visualizerKind === "grid" && <GridVisualizer steps={lesson.visualizationSteps} />}
        {lesson.visualizerKind === "array" && <ArrayVisualizer steps={lesson.visualizationSteps} />}
      </section>

      <section>
        <h2>2. Now write it yourself</h2>
        <InterviewMode lessonId={lesson.id} />
        <LanguageRunner key={runnerKey} lesson={lesson} onPassed={onCompleted} />
      </section>

      {lesson.complexity && (
        <section>
          <h2>3. Name the complexity</h2>
          <ComplexityCheck complexity={lesson.complexity} />
        </section>
      )}

      {lesson.transferNext && (
        <section className="transfer-next">
          <h2>Next: transfer problem</h2>
          <p>
            The same idea with a changed requirement, or on a problem you haven't seen:{" "}
            <button className="link-button" onClick={() => openLesson(lesson.transferNext!.id)}>
              {lesson.transferNext.title}
            </button>
            . Solve this one bare first, then see whether the idea carries over without a walk-through.
          </p>
        </section>
      )}
    </div>
  );
}
