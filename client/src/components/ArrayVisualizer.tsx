import type { VisualizationStep } from "../types";
import { useStepScrubber } from "../useStepScrubber";
import { ScrubberControls } from "./ScrubberControls";

interface Props {
  steps: VisualizationStep[];
}

// Renders the canned "walk an array with a pointer" visualization. Reads a couple of
// well-known keys off each step's `state` bag (array, tracker/trackerLabel) -- works for
// both number arrays (sums, max) and character arrays (strings are just char arrays, so
// palindrome-checking reuses this same renderer). Other shapes (linked list, stack) get
// their own sibling renderer that also sits on top of useStepScrubber.
export function ArrayVisualizer({ steps }: Props) {
  const scrubber = useStepScrubber(steps);
  const step = scrubber.step;
  if (!step) return null;

  const array = (step.state.array as (number | string)[]) ?? [];
  const tracker = step.state.tracker as number | undefined;
  const trackerLabel = step.state.trackerLabel as string | undefined;
  const highlighted = new Set(step.highlightIndices);

  return (
    <div className="visualizer">
      <div className="visualizer-array">
        {array.map((value, i) => (
          <div key={i} className={`array-cell ${highlighted.has(i) ? "highlighted" : ""}`}>
            <div className="array-index">{i}</div>
            <div className="array-value">{value}</div>
          </div>
        ))}
      </div>

      {tracker !== undefined && (
        <div className="visualizer-sum">
          {trackerLabel ?? "tracker"}: <strong>{tracker}</strong>
        </div>
      )}

      <p className="visualizer-message">{step.message}</p>

      <ScrubberControls
        index={scrubber.index}
        total={steps.length}
        isFirst={scrubber.isFirst}
        isLast={scrubber.isLast}
        playing={scrubber.playing}
        onReset={scrubber.reset}
        onPrev={scrubber.prev}
        onNext={scrubber.next}
        onPlay={scrubber.play}
        onPause={scrubber.pause}
      />
    </div>
  );
}
