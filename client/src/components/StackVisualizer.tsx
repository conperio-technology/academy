import type { VisualizationStep } from "../types";
import { useStepScrubber } from "../useStepScrubber";
import { ScrubberControls } from "./ScrubberControls";

interface Props {
  steps: VisualizationStep[];
}

// Renders "walk a string, push/pop a stack as you go." Top row is the input being
// scanned (like ArrayVisualizer's cells, with the current index highlighted); below it
// is the stack itself, growing to the right, with the top of the stack marked.
export function StackVisualizer({ steps }: Props) {
  const scrubber = useStepScrubber(steps);
  const step = scrubber.step;
  if (!step) return null;

  const input = (step.state.input as string[]) ?? [];
  const stack = (step.state.stack as string[]) ?? [];
  const pointer = step.highlightIndices[0];

  return (
    <div className="visualizer">
      <div className="visualizer-array">
        {input.map((value, i) => (
          <div key={i} className={`array-cell ${pointer === i ? "highlighted" : ""}`}>
            <div className="array-index">{i}</div>
            <div className="array-value">{value}</div>
          </div>
        ))}
      </div>

      <div className="stack-visual">
        <span className="stack-label">stack (top on the right)</span>
        <div className="stack-cells">
          {stack.length === 0 && <span className="stack-empty">empty</span>}
          {stack.map((value, i) => (
            <div key={i} className={`stack-cell ${i === stack.length - 1 ? "stack-top" : ""}`}>
              {value}
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
