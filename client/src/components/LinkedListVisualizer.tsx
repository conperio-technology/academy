import type { VisualizationStep } from "../types";
import { useStepScrubber } from "../useStepScrubber";
import { ScrubberControls } from "./ScrubberControls";

interface Props {
  steps: VisualizationStep[];
}

// Renders the canned "walk node to node" visualization. Reads `nodes` (the list's
// values, in order) and `collected` (what's been gathered so far) off each step's
// state -- sibling to ArrayVisualizer, both sit on top of useStepScrubber.
export function LinkedListVisualizer({ steps }: Props) {
  const scrubber = useStepScrubber(steps);
  const step = scrubber.step;
  if (!step) return null;

  const nodes = (step.state.nodes as number[]) ?? [];
  const collected = (step.state.collected as number[]) ?? [];
  const current = step.highlightIndices[0];
  // Optional -- only set by concepts running two pointers at once (fast & slow),
  // so every other concept's single `highlighted` node is unaffected.
  const slow = step.state.slow as number | undefined;
  const fast = step.state.fast as number | undefined;

  return (
    <div className="visualizer">
      <div className="visualizer-linked-list">
        <div className="ll-node ll-head-label-wrap">
          <span className="ll-head-label">head</span>
        </div>
        {nodes.map((value, i) => (
          <div key={i} className="ll-node-group">
            {slow === i && <span className="ll-pointer-label ll-slow-label">slow</span>}
            {fast === i && <span className="ll-pointer-label ll-fast-label">fast</span>}
            <div
              className={`ll-node ${current === i ? "highlighted" : ""} ${slow === i ? "slow-pointer" : ""} ${fast === i ? "fast-pointer" : ""}`}
            >
              <span className="ll-node-value">{value}</span>
            </div>
            <span className="ll-arrow">→</span>
          </div>
        ))}
        <div className="ll-node ll-null">null</div>
      </div>

      <div className="visualizer-sum">
        collected so far: <strong>[{collected.join(", ")}]</strong>
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
