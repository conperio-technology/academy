import { useState } from "react";

type Lane = 0 | 1; // 0 = main, 1 = feature

interface GitCommit {
  id: string;
  seq: number;
  x: number;
  lane: Lane;
  parents: string[];
  message: string;
}

function randomId() {
  return Math.random().toString(16).slice(2, 9);
}

function makeInitialCommits(): GitCommit[] {
  const c1: GitCommit = { id: randomId(), seq: 1, x: 0, lane: 0, parents: [], message: "Initial commit" };
  const c2: GitCommit = { id: randomId(), seq: 2, x: 1, lane: 0, parents: [c1.id], message: "Add index.html" };
  return [c1, c2];
}

const NODE_R = 18;
const LANE_Y: Record<Lane, number> = { 0: 60, 1: 150 };
const COL_SPACING = 100;
const START_X = 60;
const HEIGHT = 200;

export function GitBranching() {
  const [commits, setCommits] = useState<GitCommit[]>(makeInitialCommits);
  const [nextX, setNextX] = useState(2);
  const [nextSeq, setNextSeq] = useState(3);
  const [branches, setBranches] = useState<{ main: string; feature: string | null }>(() => ({
    main: commits[commits.length - 1].id,
    feature: null,
  }));
  const [currentBranch, setCurrentBranch] = useState<"main" | "feature">("main");
  const [noFf, setNoFf] = useState(false);
  const [mergeOutput, setMergeOutput] = useState<string | null>(null);

  const addCommit = (lane: Lane, parents: string[], message: string) => {
    const id = randomId();
    setMergeOutput(null);
    setCommits((prev) => [...prev, { id, seq: nextSeq, x: nextX, lane, parents, message }]);
    setNextX((x) => x + 1);
    setNextSeq((s) => s + 1);
    return id;
  };

  const switchTo = (branch: "main" | "feature") => {
    setCurrentBranch(branch);
    setMergeOutput(null);
  };

  const commitOnMain = () => {
    const id = addCommit(0, [branches.main], "Commit on main");
    setBranches((prev) => ({ ...prev, main: id }));
  };

  const commitOnFeature = () => {
    const id = addCommit(1, [branches.feature!], "Commit on feature");
    setBranches((prev) => ({ ...prev, feature: id }));
  };

  const createFeatureBranch = () => {
    setBranches((prev) => ({ ...prev, feature: prev.main }));
    switchTo("feature");
  };

  const byId = new Map(commits.map((c) => [c.id, c]));

  // True when `ancestor` is `tip` itself or reachable from it by following parent links.
  const isAncestor = (ancestor: string, tip: string) => {
    const stack = [tip];
    const seen = new Set<string>();
    while (stack.length) {
      const id = stack.pop()!;
      if (id === ancestor) return true;
      if (seen.has(id)) continue;
      seen.add(id);
      stack.push(...byId.get(id)!.parents);
    }
    return false;
  };

  // What real git does: nothing new on feature means "Already up to date"; if main hasn't
  // moved since the branch point, main just fast-forwards to feature's tip (no new commit);
  // only when both sides have new commits (or with --no-ff) is a two-parent merge commit made.
  const mergeFeatureIntoMain = () => {
    if (!branches.feature) return;
    const short = (id: string) => id.slice(0, 7);
    if (isAncestor(branches.feature, branches.main)) {
      setMergeOutput("Already up to date.");
    } else if (!noFf && isAncestor(branches.main, branches.feature)) {
      setMergeOutput(`Updating ${short(branches.main)}..${short(branches.feature)}\nFast-forward`);
      setBranches((prev) => ({ ...prev, main: prev.feature! }));
    } else {
      const id = addCommit(0, [branches.main, branches.feature], "Merge feature into main");
      setBranches((prev) => ({ ...prev, main: id }));
      setMergeOutput("Merge made by the 'ort' strategy.");
    }
  };

  const width = Math.max(560, START_X * 2 + nextX * COL_SPACING);
  const canMerge = currentBranch === "main" && !!branches.feature;

  return (
    <div className="tool-widget">
      <svg viewBox={`0 0 ${width} ${HEIGHT}`} className="graph-svg" role="img" aria-label="Git commit graph">
        {commits.flatMap((c) =>
          c.parents.map((pid) => {
            const p = byId.get(pid)!;
            const cx1 = START_X + p.x * COL_SPACING;
            const cy1 = LANE_Y[p.lane];
            const cx2 = START_X + c.x * COL_SPACING;
            const cy2 = LANE_Y[c.lane];
            return <line key={`${pid}-${c.id}`} x1={cx1} y1={cy1} x2={cx2} y2={cy2} className="graph-edge" />;
          })
        )}

        {commits.map((c) => {
          const cx = START_X + c.x * COL_SPACING;
          const cy = LANE_Y[c.lane];
          const classes = ["graph-node-circle", c.lane === 0 ? "visited" : "git-node-feature", c.parents.length > 1 ? "current" : ""]
            .filter(Boolean)
            .join(" ");
          return (
            <g key={c.id}>
              <circle cx={cx} cy={cy} r={NODE_R} className={classes} />
              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="graph-node-text">
                {c.parents.length > 1 ? "M" : c.seq}
              </text>
            </g>
          );
        })}

        {(() => {
          const mainHead = byId.get(branches.main)!;
          const cx = START_X + mainHead.x * COL_SPACING;
          return (
            <g>
              <rect x={cx - 26} y={LANE_Y[mainHead.lane] - 42} width="52" height="20" rx="10" className={`git-branch-tag ${currentBranch === "main" ? "active" : ""}`} />
              <text x={cx} y={LANE_Y[mainHead.lane] - 32} textAnchor="middle" dominantBaseline="central" className="git-branch-tag-text">
                main
              </text>
            </g>
          );
        })()}

        {branches.feature &&
          (() => {
            const featureHead = byId.get(branches.feature!)!;
            const cx = START_X + featureHead.x * COL_SPACING;
            return (
              <g>
                <rect x={cx - 32} y={LANE_Y[1] + 22} width="64" height="20" rx="10" className={`git-branch-tag ${currentBranch === "feature" ? "active" : ""}`} />
                <text x={cx} y={LANE_Y[1] + 32} textAnchor="middle" dominantBaseline="central" className="git-branch-tag-text">
                  feature
                </text>
              </g>
            );
          })()}
      </svg>

      <p className="gate-note">
        Currently on <strong>{currentBranch}</strong>. Node numbers are commit order; "M" is a merge
        commit with two parent lines. After a fast-forward, the main label simply moves onto feature's tip.
      </p>
      {mergeOutput && (
        <pre className="algo-code" aria-live="polite">
          {`$ git merge${noFf ? " --no-ff" : ""} feature\n${mergeOutput}`}
        </pre>
      )}

      <div className="darr-actions">
        {currentBranch === "main" && <button onClick={commitOnMain}>git commit (main)</button>}
        {currentBranch === "main" && branches.feature === null && (
          <button onClick={createFeatureBranch}>git checkout -b feature</button>
        )}
        {currentBranch === "main" && branches.feature !== null && (
          <button onClick={() => switchTo("feature")}>git checkout feature</button>
        )}
        {currentBranch === "main" && canMerge && (
          <button onClick={mergeFeatureIntoMain}>git merge{noFf ? " --no-ff" : ""} feature</button>
        )}
        {currentBranch === "feature" && <button onClick={commitOnFeature}>git commit (feature)</button>}
        {currentBranch === "feature" && <button onClick={() => switchTo("main")}>git checkout main</button>}
      </div>
      <label className="tool-checkbox">
        <input type="checkbox" checked={noFf} onChange={(e) => setNoFf(e.target.checked)} /> --no-ff: always make a
        merge commit, even when main could just fast-forward
      </label>
    </div>
  );
}
