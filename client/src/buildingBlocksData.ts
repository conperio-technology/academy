import type { BlockRep } from "./practiceHistory.ts";

// The Building Blocks drill (components/tools/BlockReps.tsx): the small templates most interview
// solutions are glued together from, each a graded lesson in content/Concepts/Block*.cs. This file
// adds what the drill needs on top of the lesson: the tier, a target time for a clean rep, which
// blocks it builds on (it unlocks once those are fluent), and existing lessons that glue it to
// another idea. Tier 1 is simple constructs, tier 2 the algorithm blocks.

export interface BuildingBlock {
  id: string;
  tier: 1 | 2;
  name: string;
  targetSeconds: number;
  uses: string[];
  glue: string[];
}

const t1 = (id: string, name: string, targetSeconds = 150): BuildingBlock => ({
  id,
  tier: 1,
  name,
  targetSeconds,
  uses: [],
  glue: [],
});

const t2 = (id: string, name: string, targetSeconds: number, uses: string[], glue: string[]): BuildingBlock => ({
  id,
  tier: 2,
  name,
  targetSeconds,
  uses,
  glue,
});

export const BUILDING_BLOCKS: BuildingBlock[] = [
  t1("block-most-common-char", "Count with a hashmap"),
  t1("block-first-repeat", "Set of seen values", 120),
  t1("block-group-by-key", "Group by a key"),
  t1("block-index-of-max", "Best so far with an index", 120),
  t1("block-palindrome-pointers", "Two pointers from both ends", 180),
  t1("block-dedupe-sorted", "Fast and slow pointers"),
  t1("block-rotate-array", "Swap and reverse a range", 180),
  t1("block-bracket-stack", "Push, pop and peek a stack", 180),
  t1("block-recent-calls", "A queue (deque)"),
  t1("block-interleave-strings", "Build a string", 120),
  t1("block-sort-pairs", "Sort with a custom key", 120),
  t1("block-coast-cells", "Grid neighbours", 240),
  t1("block-range-sums", "Prefix sum array"),
  t1("block-shift-letters", "Character arithmetic", 180),
  t1("block-remove-value-list", "Linked list with a dummy node", 180),
  t1("block-tree-height", "Tree recursion", 90),
  t2("block-bfs-distances", "BFS with a visited set", 300, ["block-first-repeat", "block-recent-calls"], ["graph-bfs-traversal", "graph-word-ladder", "graph-bipartite"]),
  t2("block-grid-distance-to-zero", "Multi-source BFS on a grid", 420, ["block-coast-cells", "block-recent-calls"], ["grid-rotting-oranges"]),
  t2("block-iterative-dfs", "Iterative DFS with a stack", 300, ["block-first-repeat", "block-bracket-stack"], ["graph-dfs-traversal", "grid-number-of-islands", "grid-max-area-island", "graph-clone"]),
  t2("block-count-components", "Recursive DFS over every node", 360, ["block-tree-height", "block-first-repeat"], ["grid-number-of-islands", "union-find-components"]),
  t2("block-lower-bound", "Binary search for the first index", 240, ["block-palindrome-pointers"], ["binary-search-array", "binary-search-range"]),
  t2("block-min-ship-capacity", "Binary search on the answer", 420, ["block-lower-bound"], ["binary-search-on-answer", "binary-search-split-array"]),
  t2("block-longest-k-distinct", "Sliding window with a hashmap", 360, ["block-most-common-char", "block-palindrome-pointers"], ["sliding-window-longest-unique", "sliding-window-char-replacement", "string-min-window"]),
  t2("block-count-windows", "Fixed-size sliding window", 240, ["block-range-sums"], ["sliding-window-max-sum", "sliding-window-maximum"]),
  t2("block-top-k-words", "Heap of tuples", 360, ["block-most-common-char", "block-sort-pairs"], ["top-k-heap", "heap-k-closest-points", "heap-merge-k-sorted"]),
  t2("block-dijkstra", "Dijkstra with a min-heap", 480, ["block-top-k-words", "block-bfs-distances"], ["graph-dijkstra-shortest-path", "graph-network-delay-time"]),
  t2("block-earliest-connected", "Union-find", 420, ["block-count-components"], ["union-find-components", "union-find-redundant-connection", "graph-minimum-spanning-tree"]),
  t2("block-course-order", "Topological sort (Kahn)", 420, ["block-recent-calls", "block-bfs-distances"], ["topological-sort", "graph-course-schedule", "graph-parallel-courses"]),
  t2("block-combinations", "Backtracking template", 360, ["block-tree-height"], ["backtracking-subsets", "backtracking-permutations", "backtracking-subsets-with-duplicates"]),
  t2("block-longest-sum-k", "Prefix sum plus a hashmap", 360, ["block-range-sums", "block-first-repeat"], ["hashmap-subarray-sum-k", "prefix-sums-range-query"]),
  t2("block-previous-smaller", "Monotonic stack", 300, ["block-bracket-stack"], ["monotonic-stack-next-greater", "monotonic-stack-daily-temperatures"]),
  t2("block-memo-grid-paths", "Memoized recursion (top-down DP)", 300, ["block-tree-height", "block-most-common-char"], ["dp-fibonacci-memo", "dp-climbing-stairs"]),
  t2("block-min-cost-climb", "1-D DP table (bottom-up)", 300, ["block-index-of-max"], ["dp-climbing-stairs", "dp-house-robber", "dp-house-robber-circular"]),
  t2("block-longest-common-run", "2-D DP table over two strings", 420, ["block-min-cost-climb"], ["dp-longest-common-subsequence", "dp-edit-distance"]),
  t2("block-knapsack-one-row", "0/1 knapsack in one row", 420, ["block-min-cost-climb"], ["knapsack-01", "dp-coin-change", "dp-coin-change-ways"]),
];

// A rep counts as clean when it passes on its first run within the target time. A block is
// fluent after clean reps on this many different days.
export const FLUENT_DAYS = 3;

export interface BlockStats {
  reps: number;
  cleanDays: number;
  cleanToday: boolean;
  fluent: boolean;
  bestSeconds: number | null;
  lastAt: string | null;
}

export function isCleanRep(rep: BlockRep, block: BuildingBlock): boolean {
  return rep.passed && rep.failedRuns === 0 && !rep.sawReference && rep.seconds <= block.targetSeconds;
}

// The learner's calendar day, so "different days" means what it says where they are.
function localDay(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function blockStats(reps: BlockRep[], now: Date = new Date()): Record<string, BlockStats> {
  const today = localDay(now.toISOString());
  const out: Record<string, BlockStats> = {};
  for (const block of BUILDING_BLOCKS) {
    const mine = reps.filter((r) => r.blockId === block.id);
    const clean = mine.filter((r) => isCleanRep(r, block));
    const days = new Set(clean.map((r) => localDay(r.at)));
    const passes = mine.filter((r) => r.passed).map((r) => r.seconds);
    out[block.id] = {
      reps: mine.length,
      cleanDays: days.size,
      cleanToday: days.has(today),
      fluent: days.size >= FLUENT_DAYS,
      bestSeconds: passes.length > 0 ? Math.min(...passes) : null,
      lastAt: mine.length > 0 ? mine[mine.length - 1].at : null,
    };
  }
  return out;
}

// A block is offered in a session once every block it builds on is fluent. (Its lesson is
// always open from the sidebar.)
export function isUnlocked(block: BuildingBlock, stats: Record<string, BlockStats>): boolean {
  return block.uses.every((id) => stats[id]?.fluent);
}

// Today's reps: unlocked blocks that aren't fluent yet, ones without a clean rep today first
// (a second clean rep on the same day doesn't move fluency), then fewest clean days, simple
// constructs before algorithm blocks, least recently drilled. Fluent blocks fill any spare
// places, least recently drilled first, so they stay warm.
export function pickReps(stats: Record<string, BlockStats>, count: number): BuildingBlock[] {
  const last = (b: BuildingBlock) => (stats[b.id].lastAt ? Date.parse(stats[b.id].lastAt!) : 0);
  const learning = BUILDING_BLOCKS.filter((b) => isUnlocked(b, stats) && !stats[b.id].fluent).sort(
    (a, b) =>
      Number(stats[a.id].cleanToday) - Number(stats[b.id].cleanToday) ||
      stats[a.id].cleanDays - stats[b.id].cleanDays ||
      a.tier - b.tier ||
      last(a) - last(b),
  );
  const fluent = BUILDING_BLOCKS.filter((b) => stats[b.id].fluent).sort((a, b) => last(a) - last(b));
  return [...learning, ...fluent].slice(0, count);
}

// The plan steps written into a block's guided starter as numbered comments (BuildingBlock.cs).
export function planSteps(starter: string): string[] {
  return starter
    .split("\n")
    .map((line) => line.match(/^\s*(?:\/\/|#)\s*\d+\.\s+(.*)$/)?.[1])
    .filter((step): step is string => step !== undefined);
}
