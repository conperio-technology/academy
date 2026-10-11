import type { VisualizationStep } from "../types";
import { useStepScrubber } from "../useStepScrubber";
import { ScrubberControls } from "./ScrubberControls";

interface Props {
  steps: VisualizationStep[];
}

const WIDTH = 560;
const HEIGHT = 200;
const NODE_R = 18;

// Fixed sample graph layout (hand-placed coordinates, not auto-layout) -- the same 8
// nodes and edges every concept using this visualizer draws, matching the SampleGraph
// hidden harness both Graph concepts call against. Node 7 is isolated on purpose (no
// edges), to visualize what "nothing reachable from here" looks like.
const POSITIONS: Record<number, { x: number; y: number }> = {
  0: { x: 80, y: 60 },
  1: { x: 80, y: 160 },
  2: { x: 220, y: 60 },
  3: { x: 220, y: 160 },
  4: { x: 360, y: 60 },
  5: { x: 360, y: 160 },
  6: { x: 480, y: 160 },
  7: { x: 480, y: 60 },
};

const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
  [2, 4],
  [3, 5],
  [4, 5],
  [5, 6],
];

// Some graph concepts (e.g. Dijkstra) need a different node layout, edge set, and edge
// weights than the shared BFS/DFS graph above. Rather than threading new props through
// LessonView for every concept, a step can smuggle its own `positions`/`edges`/
// `distances` through `state` -- the same trick ArrayVisualizer's `tracker` field
// already uses. A concept that doesn't set these renders exactly as before.
interface CustomEdge {
  from: number;
  to: number;
  weight?: number;
}

export function GraphVisualizer({ steps }: Props) {
  const scrubber = useStepScrubber(steps);
  const step = scrubber.step;
  if (!step) return null;

  const visited = new Set((step.state.visited as number[]) ?? []);
  const frontier = new Set((step.state.frontier as number[]) ?? []);
  const current = step.state.current as number | null | undefined;
  const distances = step.state.distances as Record<string, string> | undefined;

  const rawPositions = step.state.positions as Record<string, { x: number; y: number }> | undefined;
  const positions: Record<number, { x: number; y: number }> = rawPositions
    ? Object.fromEntries(Object.entries(rawPositions).map(([k, v]) => [Number(k), v]))
    : POSITIONS;

  const rawEdges = step.state.edges as number[][] | undefined;
  // Optional, by index into edges: edges picked so far (MST) and one just rejected.
  const chosenEdges = new Set((step.state.chosenEdges as number[]) ?? []);
  const rejectedEdges = new Set((step.state.rejectedEdges as number[]) ?? []);
  const edges: CustomEdge[] = rawEdges
    ? rawEdges.map(([from, to, weight]) => ({ from, to, weight }))
    : EDGES.map(([from, to]) => ({ from, to }));

  return (
    <div className="visualizer">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="graph-svg" role="img" aria-label="Graph">
        {edges.map(({ from, to, weight }, i) => {
          const a = positions[from];
          const b = positions[to];
          // Nudge the weight label off the line, to the side that points up (or right
          // for a vertical edge), so it never sits on top of the edge itself.
          const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
          let nx = -(b.y - a.y) / len;
          let ny = (b.x - a.x) / len;
          if (ny > 0 || (ny === 0 && nx < 0)) {
            nx = -nx;
            ny = -ny;
          }
          return (
            <g key={i}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                className={`graph-edge${chosenEdges.has(i) ? " chosen" : ""}${rejectedEdges.has(i) ? " rejected" : ""}`}
              />
              {weight !== undefined && (
                <text
                  x={(a.x + b.x) / 2 + nx * 10}
                  y={(a.y + b.y) / 2 + ny * 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="graph-edge-weight"
                >
                  {weight}
                </text>
              )}
            </g>
          );
        })}
        {Object.entries(positions).map(([key, { x, y }]) => {
          const node = Number(key);
          const classes = [
            "graph-node-circle",
            visited.has(node) ? "visited" : "",
            frontier.has(node) ? "frontier" : "",
            current === node ? "current" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <g key={node}>
              <circle cx={x} cy={y} r={NODE_R} className={classes} />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central" className="graph-node-text">
                {node}
              </text>
              {distances?.[key] !== undefined && (
                <text x={x} y={y + NODE_R + 14} textAnchor="middle" className="graph-node-dist">
                  {distances[key]}
                </text>
              )}
            </g>
          );
        })}
      </svg>

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
