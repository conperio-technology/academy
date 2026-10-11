import type { VisualizationStep } from "../types";
import { useStepScrubber } from "../useStepScrubber";
import { ScrubberControls } from "./ScrubberControls";

interface Props {
  steps: VisualizationStep[];
}

// Renders "walk an array, build a map as you go." Top row is the array being scanned
// (current index highlighted); below it, the map's entries so far as key -> value chips,
// in insertion order -- watching entries accumulate is the whole point of the lesson.
export function HashMapVisualizer({ steps }: Props) {
  const scrubber = useStepScrubber(steps);
  const step = scrubber.step;
  if (!step) return null;

  const array = (step.state.array as number[]) ?? [];
  const hashMap = (step.state.hashMap as [number, number][]) ?? [];
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

      <div className="hashmap-visual">
        <span className="stack-label">map (value → index)</span>
        <div className="hashmap-entries">
          {hashMap.length === 0 && <span className="stack-empty">empty</span>}
          {hashMap.map(([key, value], i) => (
            <div key={i} className="hashmap-entry">
              <span className="hashmap-key">{key}</span>
              <span className="hashmap-arrow">→</span>
              <span className="hashmap-value">{value}</span>
            </div>
          ))}
        </div>
      </div>

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
