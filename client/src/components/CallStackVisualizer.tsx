import type { VisualizationStep } from "../types";
import { useStepScrubber } from "../useStepScrubber";
import { ScrubberControls } from "./ScrubberControls";

interface Props {
  steps: VisualizationStep[];
}

// Renders the actual call stack as recursion happens: each step's `frames` (bottom =
// first/outermost call) is shown top-to-bottom with the most recent call on top, the
// way a debugger's call stack panel reads. Works for both linear recursion (factorial)
// and branching recursion (backtracking) -- the steps are a literal trace of real calls
// pushing and popping, not a canned animation.
export function CallStackVisualizer({ steps }: Props) {
  const scrubber = useStepScrubber(steps);
  const step = scrubber.step;
  if (!step) return null;

  const frames = (step.state.frames as string[]) ?? [];
  const activeIndex = step.highlightIndices[0];
  const reversed = [...frames].reverse(); // most recent (top of stack) first, for top-to-bottom rendering

  return (
    <div className="visualizer">
      <div className="call-stack">
        {reversed.length === 0 && <span className="stack-empty">call stack empty</span>}
        {reversed.map((frame, reversedIndex) => {
          const originalIndex = frames.length - 1 - reversedIndex;
          return (
            <div key={originalIndex} className={`call-frame ${originalIndex === activeIndex ? "highlighted" : ""}`}>
              {frame}
            </div>
          );
        })}
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
