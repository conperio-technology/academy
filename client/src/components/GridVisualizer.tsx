import type { VisualizationStep } from "../types";
import { useStepScrubber } from "../useStepScrubber";
import { ScrubberControls } from "./ScrubberControls";

interface Props {
  steps: VisualizationStep[];
}

type Cell = [number, number];

// Renders a 2-D grid: flood fills and multi-source BFS on a map, backtracking on a
// board, and DP tables. Reads these keys off each step's `state` bag:
// - grid: (number | string)[][] -- the cell values, row by row
// - highlight / visited / frontier / rejected / muted: [row, col][] -- cell markers.
//   highlight = the cell being worked on now, visited = done / part of the answer,
//   frontier = queued or about to be tried, rejected = a conflict or dead end,
//   muted = background cells (water, empty squares) drawn dimmer
// - rowLabels / colLabels: optional header labels (DP tables label each row/column
//   with the character it stands for)
// - tracker / trackerLabel: an optional running value shown under the grid
export function GridVisualizer({ steps }: Props) {
  const scrubber = useStepScrubber(steps);
  const step = scrubber.step;
  if (!step) return null;

  const grid = (step.state.grid as (number | string)[][]) ?? [];
  const rowLabels = step.state.rowLabels as (number | string)[] | undefined;
  const colLabels = step.state.colLabels as (number | string)[] | undefined;
  const tracker = step.state.tracker as number | string | undefined;
  const trackerLabel = step.state.trackerLabel as string | undefined;

  const toSet = (key: string) =>
    new Set(((step.state[key] as Cell[] | undefined) ?? []).map(([r, c]) => `${r},${c}`));
  const highlight = toSet("highlight");
  const visited = toSet("visited");
  const frontier = toSet("frontier");
  const rejected = toSet("rejected");
  const muted = toSet("muted");

  const cellClass = (r: number, c: number) => {
    const k = `${r},${c}`;
    const classes = ["grid-cell"];
    if (muted.has(k)) classes.push("muted");
    if (visited.has(k)) classes.push("visited");
    if (frontier.has(k)) classes.push("frontier");
    if (rejected.has(k)) classes.push("rejected");
    if (highlight.has(k)) classes.push("highlighted");
    return classes.join(" ");
  };

  return (
    <div className="visualizer">
      <div className="visualizer-grid-scroll">
        <table className="visualizer-grid">
          {colLabels && (
            <thead>
              <tr>
                {rowLabels && <th className="grid-label" />}
                {colLabels.map((label, c) => (
                  <th key={c} className="grid-label">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {grid.map((row, r) => (
              <tr key={r}>
                {rowLabels && <th className="grid-label">{rowLabels[r] ?? ""}</th>}
                {row.map((value, c) => (
                  <td key={c} className={cellClass(r, c)}>
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
