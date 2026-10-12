import type { VisualizationStep } from "../types";
import { useStepScrubber } from "../useStepScrubber";
import { ScrubberControls } from "./ScrubberControls";

interface Props {
  steps: VisualizationStep[];
}

const WIDTH = 560;
const HEIGHT = 200;
const TOP_PAD = 28;
const NODE_R = 18;
// Supports a tree up to 4 levels deep (15 nodes) -- the same "small canned sample"
// scale every other visualizer uses.
const MAX_DEPTH = 4;

// A binary tree encoded as a level-order array (index 0 = root, 2i+1/2i+2 = children,
// null/undefined = no node) -- same encoding TreeSerializer.ToLevelOrderArray produces
// in the C# content, and the same shape a binary heap will reuse later. Position is computed
// purely from index, the same way a complete binary tree's array representation always
// works, so there's no separate layout algorithm to keep in sync with the data.
function depthOf(index: number): number {
  return Math.floor(Math.log2(index + 1));
}
function positionInDepth(index: number, depth: number): number {
  return index - (2 ** depth - 1);
}
function coordOf(index: number): { x: number; y: number } {
  const depth = depthOf(index);
  const slots = 2 ** depth;
  const pos = positionInDepth(index, depth);
  const x = ((pos + 0.5) / slots) * WIDTH;
  const levelHeight = (HEIGHT - TOP_PAD - 20) / (MAX_DEPTH - 1);
  const y = TOP_PAD + depth * levelHeight;
  return { x, y };
}

export function TreeVisualizer({ steps }: Props) {
  const scrubber = useStepScrubber(steps);
  const step = scrubber.step;
  if (!step) return null;

  const tree = (step.state.tree as (number | null)[]) ?? [];
  const collected = step.state.collected as number[] | undefined;
  const highlighted = new Set(step.highlightIndices);

  const edges: { from: number; to: number }[] = [];
  tree.forEach((val, i) => {
    if (val === null || val === undefined) return;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < tree.length && tree[left] !== null && tree[left] !== undefined) edges.push({ from: i, to: left });
    if (right < tree.length && tree[right] !== null && tree[right] !== undefined) edges.push({ from: i, to: right });
  });

  return (
    <div className="visualizer">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="tree-svg" role="img" aria-label="Binary tree">
        {edges.map((e, i) => {
          const from = coordOf(e.from);
          const to = coordOf(e.to);
          return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="tree-edge" />;
        })}
        {tree.map((val, i) => {
          if (val === null || val === undefined) return null;
          const { x, y } = coordOf(i);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={NODE_R} className={`tree-node-circle ${highlighted.has(i) ? "highlighted" : ""}`} />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central" className="tree-node-text">
                {val}
              </text>
            </g>
          );
        })}
      </svg>

      {collected !== undefined && (
        <div className="visualizer-sum">
          visited so far: <strong>[{collected.join(", ")}]</strong>
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
