// The Interview Prep plan: coding topic families (for the readiness view) and the ordered
// list of tasks that gets spread across however many weeks the learner picks. Task ids are
// lesson or tool ids; a task whose id the server doesn't know (content not merged yet, or
// removed) is simply left out of the plan.

import { BUILDING_BLOCKS } from "./buildingBlocksData.ts";

export interface Family {
  id: string;
  label: string;
  lessons: string[];
}

export const CODING_FAMILIES: Family[] = [
  {
    id: "arrays",
    label: "Arrays, hashing and prefix sums",
    lessons: [
      "hashmap-two-sum",
      "string-group-anagrams",
      "prefix-sums-range-query",
      "hashmap-subarray-sum-k",
      "string-is-palindrome",
      "hashmap-longest-consecutive",
      "array-product-except-self",
      "string-encode-decode",
      "matrix-spiral-order",
      "matrix-rotate-image",
      "matrix-set-zeroes",
    ],
  },
  {
    id: "pointers",
    label: "Two pointers and sliding window",
    lessons: [
      "two-pointers-sorted-two-sum",
      "two-pointers-three-sum",
      "two-pointers-trapping-rain-water",
      "sliding-window-max-sum",
      "sliding-window-longest-unique",
      "sliding-window-char-replacement",
      "string-min-window",
      "sorting-sort-colors",
    ],
  },
  {
    id: "stacks",
    label: "Stacks and monotonic structures",
    lessons: [
      "stack-valid-parentheses",
      "stack-evaluate-rpn",
      "monotonic-stack-next-greater",
      "monotonic-stack-daily-temperatures",
      "monotonic-stack-largest-rectangle",
      "sliding-window-maximum",
      "design-min-stack",
    ],
  },
  {
    id: "sorting",
    label: "Sorting and selection",
    lessons: [
      "sorting-merge-sort",
      "sorting-quicksort",
      "sorting-heap-sort",
      "sorting-counting-sort",
      "quickselect-kth-largest",
      "random-shuffle",
      "random-reservoir-sampling",
    ],
  },
  {
    id: "binary-search",
    label: "Binary search",
    lessons: ["binary-search-array", "binary-search-range", "binary-search-rotated", "binary-search-rotated-min", "binary-search-on-answer", "binary-search-split-array"],
  },
  {
    id: "lists",
    label: "Linked lists",
    lessons: [
      "linked-list-reverse",
      "linked-list-reverse-between",
      "fast-slow-pointers-middle",
      "linked-list-cycle-start",
      "linked-list-remove-nth",
      "linked-list-merge-sorted",
      "design-lru-cache",
      "design-randomized-set",
      "design-time-map",
    ],
  },
  {
    id: "trees",
    label: "Trees and tries",
    lessons: [
      "binary-tree-level-order",
      "tree-invert",
      "tree-right-side-view",
      "tree-validate-bst",
      "tree-kth-smallest-bst",
      "tree-diameter",
      "tree-max-path-sum",
      "tree-lowest-common-ancestor",
      "tree-build-from-traversals",
      "tree-serialize-deserialize",
      "trie-prefix-count",
      "trie-replace-words",
    ],
  },
  {
    id: "heaps",
    label: "Heaps and intervals",
    lessons: [
      "top-k-heap",
      "heap-k-closest-points",
      "heap-merge-k-sorted",
      "heap-running-median",
      "merge-intervals",
      "intervals-list-intersections",
      "intervals-insert",
      "intervals-meeting-rooms",
      "intervals-non-overlapping",
    ],
  },
  {
    id: "graphs",
    label: "Graphs",
    lessons: [
      "grid-number-of-islands",
      "grid-max-area-island",
      "grid-rotting-oranges",
      "graph-course-schedule",
      "topological-sort",
      "graph-parallel-courses",
      "graph-clone",
      "linked-list-copy-random",
      "graph-bipartite",
      "union-find-components",
      "union-find-redundant-connection",
      "graph-word-ladder",
      "graph-dijkstra-shortest-path",
      "graph-network-delay-time",
      "graph-minimum-spanning-tree",
      "graph-cheapest-flights",
      "graph-alien-dictionary",
    ],
  },
  {
    id: "backtracking",
    label: "Backtracking",
    lessons: [
      "backtracking-subsets",
      "backtracking-subsets-with-duplicates",
      "backtracking-permutations",
      "backtracking-combination-sum",
      "backtracking-generate-parentheses",
      "backtracking-word-search",
      "backtracking-n-queens",
    ],
  },
  {
    id: "dp",
    label: "Dynamic programming",
    lessons: [
      "dp-climbing-stairs",
      "dp-house-robber",
      "dp-house-robber-circular",
      "dp-coin-change",
      "dp-coin-change-ways",
      "dp-longest-increasing-subsequence",
      "knapsack-01",
      "dp-partition-equal-subset",
      "dp-word-break",
      "dp-decode-ways",
      "dp-longest-common-subsequence",
      "dp-edit-distance",
      "dp-longest-palindromic-substring",
      "dp-stock-cooldown",
      "dp-regex-matching",
    ],
  },
  {
    id: "greedy",
    label: "Greedy",
    lessons: [
      "greedy-assign-cookies",
      "greedy-jump-game",
      "greedy-jump-game-ii",
      "greedy-gas-station",
      "greedy-partition-labels",
      "greedy-max-subarray",
      "greedy-max-product-subarray",
    ],
  },
  {
    id: "math",
    label: "Math and number theory",
    lessons: [
      "math-count-primes",
      "math-pow",
      "math-gcd-lcm",
      "math-happy-number",
      "math-excel-column-title",
      "math-reverse-integer",
      "probability-counting",
    ],
  },
  {
    id: "strings-bits",
    label: "String matching and bits",
    lessons: [
      "string-kmp-search",
      "bit-manipulation-count-set-bits",
      "bits-single-number",
      "bits-missing-number",
      "bits-power-of-two",
      "bits-counting-bits",
      "bits-reverse-bits",
      "bits-sum-of-two-integers",
      "bits-subsets-bitmask",
    ],
  },
  {
    id: "range-queries",
    label: "Segment trees and Fenwick trees",
    lessons: [
      "segment-tree-range-sum-mutable",
      "segment-tree-range-min",
      "fenwick-range-add-point-query",
      "fenwick-count-smaller-after-self",
      "fenwick-count-inversions",
    ],
  },
];

// CS foundations for the readiness view: complexity analysis, concurrency, memory, design
// patterns, OS and runtimes, testing, and AI (topics with no lessons in this build are hidden). Most of these are tool
// lessons with no server-side completion, so they count once the learner marks them worked
// through; deadlock-detection is graded and counts when it's solved.
export const FOUNDATION_TOPICS: Family[] = [
  {
    id: "complexity",
    label: "Complexity analysis in depth",
    lessons: [
      "complexity-recursion",
      "complexity-amortized",
      "complexity-variables",
      "complexity-hidden-costs",
      "complexity-space",
      "complexity-explaining",
      "complexity-classes",
    ],
  },
  {
    id: "concurrency",
    label: "Concurrency",
    lessons: [
      "threads-processes",
      "race-conditions",
      "sync-primitives",
      "deadlock",
      "deadlock-detection",
      "producer-consumer",
      "async-await",
    ],
  },
  { id: "memory", label: "Memory", lessons: ["stack-heap-gc", "memory-hierarchy"] },
  {
    id: "patterns",
    label: "SOLID and design patterns",
    lessons: ["solid-principles", "creational-patterns", "structural-patterns", "behavioral-patterns"],
  },
  {
    id: "os",
    label: "Operating systems and how code runs",
    lessons: [
      "cpu-scheduling",
      "kernel-mode-syscalls",
      "running-a-program",
      "compiled-vs-interpreted",
      "linkers-libraries",
      "text-encoding",
    ],
  },
  { id: "testing", label: "Testing", lessons: ["test-pyramid", "test-doubles", "tdd-coverage"] },
  {
    id: "ai",
    label: "AI and machine learning",
    lessons: [
      "ai-ml-basics",
      "ai-neural-networks",
      "ai-tokens-embeddings",
      "ai-transformers-attention",
      "ai-llm-training",
      "ai-using-llms",
      "ai-risks-limits",
    ],
  },
];

// Glossary topics whose flash cards count toward CS foundations (threads, locks, memory,
// SOLID, the patterns). A card counts as known from Leitner box 3 up.
export const FOUNDATION_GLOSSARY_CATEGORIES = ["linux", "engineering"];
export const KNOWN_BOX = 3;

// Design walk-throughs: storage id (DesignInterview's `design` prop) to the tool lesson id.
export const SYSTEM_DESIGN_WALKTHROUGHS: Record<string, string> = {
  urlShortener: "sd-interview-url-shortener",
  newsFeed: "sd-interview-news-feed",
  chat: "sd-interview-chat",
  rateLimiter: "sd-interview-rate-limiter",
  keyValueStore: "sd-interview-key-value-store",
  webCrawler: "sd-interview-web-crawler",
  notificationSystem: "sd-interview-notification-system",
  videoStreaming: "sd-interview-video-streaming",
  rideSharing: "sd-interview-ride-sharing",
  jobScheduler: "sd-interview-job-scheduler",
  paymentSystem: "sd-interview-payment-system",
  apiPhotoSharing: "sd-interview-api-photo-sharing",
};

export const OOD_WALKTHROUGHS: Record<string, string> = {
  parkingLot: "ood-interview-parking-lot",
  elevator: "ood-interview-elevator",
  vendingMachine: "ood-interview-vending-machine",
  ticketBooking: "ood-interview-ticket-booking",
  cardGame: "ood-interview-card-game",
};

export type TaskArea = "coding" | "system design" | "object-oriented design" | "behavioral" | "CS foundations";

export interface PlanTask {
  key: string; // unique within the plan
  lessonId: string; // what clicking the task opens
  label?: string; // defaults to the lesson's title
  area: TaskArea;
  minutes: number;
  // How the task is marked done: "lesson" = the graded lesson is completed,
  // "walkthrough" = every stage of that design compared, "stories" = at least `target`
  // stories in the bank, "worked" = the tool lesson is marked worked through (shared with the
  // readiness view), "patternQuiz" = at least `runs` full runs of the design pattern quiz,
  // "reps" = Today's reps done on at least `sessions` different days, anything else = ticked by hand.
  doneBy?:
    | { kind: "lesson" }
    | { kind: "walkthrough"; design: string }
    | { kind: "stories"; target: number }
    | { kind: "worked" }
    | { kind: "patternQuiz"; runs: number }
    | { kind: "reps"; sessions: number };
}

const lesson = (id: string, minutes = 45): PlanTask => ({
  key: id,
  lessonId: id,
  area: "coding",
  minutes,
  doneBy: { kind: "lesson" },
});
const read = (id: string, area: TaskArea, minutes = 20): PlanTask => ({ key: id, lessonId: id, area, minutes });
const walkthrough = (design: string, lessonId: string, area: TaskArea = "system design"): PlanTask => ({
  key: lessonId,
  lessonId,
  area,
  minutes: 60,
  doneBy: { kind: "walkthrough", design },
});
const activity = (key: string, lessonId: string, label: string, area: TaskArea, minutes: number): PlanTask => ({
  key,
  lessonId,
  label,
  area,
  minutes,
});
const stories = (target: number): PlanTask => ({
  key: `stories-${target}`,
  lessonId: "behavioral-story-bank",
  label: `Story bank: get to ${target} stories`,
  area: "behavioral",
  minutes: 45,
  doneBy: { kind: "stories", target },
});
const mixed = (n: number, format: string, minutes: number) =>
  activity(`mixed-${n}`, "mixed-interview-set", `Mixed interview set: ${format}`, "coding", minutes);
// Building Blocks sessions (components/tools/BlockReps.tsx), one in every study week (see
// scheduleByHours); the nth ticks itself once reps were done on n different days.
const REPS_MINUTES = 15;
const reps = (n: number): PlanTask => ({
  ...activity(`block-reps-${n}`, "building-block-reps", "Today's reps: one building-block session (3 to 5 reps)", "coding", REPS_MINUTES),
  doneBy: { kind: "reps", sessions: n },
});
const drill = (n: number) => activity(`drill-${n}`, "pattern-recognition-drill", "Pattern recognition drill, one full run", "coding", 20);
const tool = (id: string, minutes = 25): PlanTask => ({
  key: id,
  lessonId: id,
  area: "CS foundations",
  minutes,
  doneBy: { kind: "worked" },
});
const patternQuiz = (n: number): PlanTask => ({
  ...activity(`pattern-quiz-${n}`, "design-pattern-quiz", "Design pattern quiz, one full run", "CS foundations", 15),
  doneBy: { kind: "patternQuiz", runs: n },
});
const flashCards = (n: number) =>
  activity(`flash-cards-${n}`, "glossary-flash-cards", "Glossary flash cards: clear today's due cards", "CS foundations", 10);
// Recurring Complexity Gym sessions, ticked by hand.
const gym = (n: number, focus: string) =>
  activity(`complexity-gym-${n}`, "complexity-gym", `Complexity Gym: 15 minutes, ${focus}`, "coding", 15);
const mock = (n: number, style: string) =>
  activity(`mock-${n}`, "behavioral-mock-round", `Behavioral mock round (${style}, 5 questions)`, "behavioral", 30);

// Five phases. Each phase gets a share of the weeks; within a phase tasks run in order.
export interface Phase {
  name: string;
  share: number;
  tasks: PlanTask[];
}

export const PHASES: Phase[] = [
  {
    name: "Foundations",
    share: 0.15,
    tasks: [
      read("big-o-notation", "coding"),
      read("complexity-analysis", "coding", 30),
      tool("complexity-recursion", 30),
      tool("complexity-amortized", 25),
      tool("complexity-explaining", 20),
      gym(1, "Practice, mixed categories"),
      lesson("hashmap-two-sum", 30),
      lesson("string-group-anagrams"),
      lesson("prefix-sums-range-query", 30),
      lesson("hashmap-subarray-sum-k", 30),
      lesson("two-pointers-sorted-two-sum", 30),
      lesson("two-pointers-three-sum"),
      lesson("sliding-window-max-sum", 30),
      lesson("sliding-window-longest-unique"),
      lesson("sliding-window-char-replacement"),
      lesson("hashmap-longest-consecutive", 30),
      lesson("array-product-except-self", 30),
      lesson("string-encode-decode", 30),
      lesson("matrix-spiral-order", 30),
      lesson("matrix-rotate-image", 30),
      lesson("matrix-set-zeroes", 30),
      lesson("stack-valid-parentheses", 30),
      lesson("stack-evaluate-rpn", 30),
      read("behavioral-star", "behavioral", 30),
      stories(3),
      tool("glossary-terms", 15),
      flashCards(1),
      gym(2, "Explain it, three snippets out loud"),
      tool("text-encoding", 30),
      drill(1),
    ],
  },
  {
    name: "Core data structures",
    share: 0.25,
    tasks: [
      lesson("binary-search-array", 30),
      lesson("sorting-merge-sort", 30),
      lesson("sorting-quicksort", 30),
      lesson("sorting-heap-sort", 30),
      lesson("sorting-counting-sort", 20),
      lesson("sorting-sort-colors", 30),
      tool("complexity-variables", 25),
      tool("complexity-hidden-costs", 30),
      tool("complexity-space", 25),
      lesson("binary-search-range"),
      lesson("binary-search-rotated"),
      lesson("binary-search-rotated-min"),
      lesson("binary-search-on-answer"),
      lesson("linked-list-reverse", 30),
      lesson("linked-list-reverse-between"),
      lesson("linked-list-cycle-start"),
      lesson("linked-list-remove-nth"),
      lesson("linked-list-merge-sorted", 30),
      lesson("monotonic-stack-next-greater"),
      lesson("monotonic-stack-daily-temperatures"),
      lesson("monotonic-stack-largest-rectangle", 60),
      lesson("design-min-stack"),
      lesson("binary-tree-level-order", 30),
      lesson("tree-invert", 20),
      lesson("tree-right-side-view", 30),
      lesson("tree-validate-bst"),
      lesson("tree-kth-smallest-bst"),
      lesson("tree-diameter"),
      lesson("tree-max-path-sum", 60),
      lesson("tree-lowest-common-ancestor"),
      lesson("tree-build-from-traversals"),
      lesson("tree-serialize-deserialize"),
      lesson("trie-prefix-count"),
      lesson("trie-replace-words"),
      lesson("two-pointers-trapping-rain-water", 60),
      lesson("string-min-window", 60),
      read("bit-manipulation-toolkit", "coding", 30),
      lesson("bits-single-number", 20),
      lesson("bits-missing-number", 20),
      lesson("bits-power-of-two", 20),
      lesson("bits-counting-bits", 30),
      read("math-for-interviews", "coding", 30),
      lesson("math-reverse-integer", 30),
      lesson("math-happy-number", 30),
      lesson("math-excel-column-title", 30),
      lesson("random-shuffle", 20),
      lesson("random-reservoir-sampling", 30),
      read("sd-capacity-estimation", "system design", 30),
      read("sd-load-balancing", "system design"),
      read("sd-caching", "system design"),
      read("sd-cdn", "system design"),
      read("sd-tail-latency", "system design", 30),
      read("oop-basics", "object-oriented design"),
      read("interfaces-abstraction", "object-oriented design"),
      tool("solid-principles", 30),
      tool("threads-processes"),
      tool("race-conditions"),
      tool("stack-heap-gc"),
      tool("memory-hierarchy"),
      tool("kernel-mode-syscalls"),
      tool("cpu-scheduling", 30),
      tool("test-pyramid"),
      flashCards(2),
      gym(3, "Practice, multiple variables and hidden library costs"),
      gym(4, "Practice your weakest categories from the Stats tab"),
      stories(6),
      drill(2),
    ],
  },
  {
    name: "Graphs, heaps and search",
    share: 0.25,
    tasks: [
      lesson("grid-number-of-islands"),
      lesson("grid-max-area-island", 30),
      lesson("grid-rotting-oranges"),
      lesson("graph-course-schedule"),
      lesson("topological-sort"),
      lesson("graph-parallel-courses"),
      lesson("graph-clone"),
      lesson("linked-list-copy-random"),
      lesson("graph-bipartite"),
      lesson("union-find-components"),
      lesson("union-find-redundant-connection"),
      lesson("graph-word-ladder", 60),
      lesson("graph-dijkstra-shortest-path"),
      lesson("graph-network-delay-time"),
      lesson("graph-cheapest-flights"),
      lesson("graph-alien-dictionary", 60),
      lesson("top-k-heap"),
      lesson("heap-k-closest-points"),
      lesson("quickselect-kth-largest"),
      lesson("heap-merge-k-sorted"),
      lesson("heap-running-median", 60),
      lesson("merge-intervals"),
      lesson("intervals-list-intersections"),
      lesson("intervals-insert"),
      lesson("intervals-meeting-rooms"),
      lesson("intervals-non-overlapping"),
      read("greedy-algorithms", "coding", 30),
      lesson("greedy-assign-cookies", 30),
      lesson("greedy-jump-game", 30),
      lesson("greedy-jump-game-ii"),
      lesson("greedy-gas-station"),
      lesson("greedy-partition-labels"),
      lesson("greedy-max-subarray", 30),
      lesson("greedy-max-product-subarray"),
      lesson("backtracking-subsets"),
      lesson("backtracking-subsets-with-duplicates"),
      lesson("backtracking-permutations"),
      lesson("backtracking-combination-sum"),
      lesson("backtracking-generate-parentheses", 30),
      lesson("backtracking-word-search"),
      lesson("sliding-window-maximum", 60),
      lesson("design-lru-cache", 60),
      lesson("design-randomized-set"),
      lesson("design-time-map"),
      read("sd-replication-sharding", "system design"),
      read("sd-consistent-hashing", "system design"),
      read("sd-message-queues", "system design"),
      read("sd-async-systems", "system design", 30),
      read("sd-rate-limiting", "system design"),
      read("sd-cap", "system design"),
      read("sd-consensus-clocks", "system design", 30),
      read("db-nosql-families", "system design", 30),
      read("sd-resilience", "system design", 30),
      read("sd-observability", "system design"),
      read("sd-api-rest-http", "system design"),
      read("sd-api-styles", "system design"),
      read("sd-api-pagination", "system design"),
      read("sd-api-idempotency", "system design"),
      walkthrough("urlShortener", "sd-interview-url-shortener"),
      read("common-design-patterns", "object-oriented design", 30),
      tool("creational-patterns", 30),
      walkthrough("parkingLot", "ood-interview-parking-lot", "object-oriented design"),
      tool("sync-primitives"),
      tool("deadlock"),
      { ...lesson("deadlock-detection"), area: "CS foundations" },
      tool("running-a-program"),
      tool("compiled-vs-interpreted"),
      tool("test-doubles"),
      tool("ai-ml-basics", 30),
      tool("ai-neural-networks", 30),
      flashCards(3),
      gym(5, "Practice, graphs and backtracking"),
      gym(6, "Explain it, three snippets out loud"),
      mixed(1, "warm-up", 30),
      stories(9),
    ],
  },
  {
    name: "Dynamic programming and design depth",
    share: 0.2,
    tasks: [
      lesson("dp-climbing-stairs", 30),
      lesson("dp-house-robber"),
      lesson("dp-house-robber-circular", 30),
      lesson("dp-coin-change"),
      lesson("dp-coin-change-ways"),
      lesson("dp-longest-increasing-subsequence"),
      lesson("knapsack-01"),
      lesson("dp-partition-equal-subset", 30),
      lesson("dp-word-break"),
      lesson("dp-decode-ways"),
      lesson("dp-longest-common-subsequence"),
      lesson("dp-edit-distance", 60),
      lesson("dp-stock-cooldown", 60),
      lesson("backtracking-n-queens", 60),
      lesson("binary-search-split-array", 60),
      lesson("math-count-primes"),
      lesson("math-pow"),
      lesson("math-gcd-lcm"),
      lesson("bits-reverse-bits", 30),
      lesson("bits-sum-of-two-integers"),
      lesson("bits-subsets-bitmask", 30),
      read("range-query-structures", "coding", 40),
      lesson("segment-tree-range-sum-mutable", 60),
      lesson("segment-tree-range-min"),
      lesson("fenwick-range-add-point-query"),
      lesson("fenwick-count-smaller-after-self", 60),
      lesson("fenwick-count-inversions"),
      read("segment-tree-lazy-propagation", "coding", 30),
      walkthrough("newsFeed", "sd-interview-news-feed"),
      walkthrough("chat", "sd-interview-chat"),
      walkthrough("rateLimiter", "sd-interview-rate-limiter"),
      read("sd-api-evolution", "system design"),
      read("sd-api-auth-limits", "system design"),
      walkthrough("apiPhotoSharing", "sd-interview-api-photo-sharing"),
      activity("sd-scale-lab", "sd-scale-lab", "Scale It Yourself lab: pass every scenario", "system design", 60),
      walkthrough("jobScheduler", "sd-interview-job-scheduler"),
      walkthrough("vendingMachine", "ood-interview-vending-machine", "object-oriented design"),
      walkthrough("elevator", "ood-interview-elevator", "object-oriented design"),
      tool("structural-patterns", 30),
      tool("behavioral-patterns", 30),
      patternQuiz(1),
      tool("producer-consumer"),
      tool("async-await"),
      tool("linkers-libraries"),
      tool("tdd-coverage", 30),
      tool("ai-tokens-embeddings", 30),
      tool("ai-transformers-attention", 30),
      tool("ai-llm-training", 30),
      flashCards(4),
      gym(7, "Practice, DP tables and recursion, hard"),
      gym(8, "Practice your weakest categories from the Stats tab"),
      mixed(2, "phone screen", 35),
      mock(1, "any company"),
      drill(3),
    ],
  },
  {
    name: "Mock interviews",
    share: 0.15,
    tasks: [
      mixed(3, "onsite round", 50),
      walkthrough("keyValueStore", "sd-interview-key-value-store"),
      mock(2, "the company you're targeting"),
      patternQuiz(2),
      mixed(4, "onsite round", 50),
      walkthrough("videoStreaming", "sd-interview-video-streaming"),
      mixed(5, "phone screen", 35),
      walkthrough("rideSharing", "sd-interview-ride-sharing"),
      walkthrough("paymentSystem", "sd-interview-payment-system"),
      walkthrough("ticketBooking", "ood-interview-ticket-booking", "object-oriented design"),
      mock(3, "a different company style"),
      tool("ai-using-llms", 30),
      tool("ai-assisted-engineering", 25),
      tool("ai-risks-limits", 30),
      flashCards(5),
      gym(9, "Explain it, hard snippets only"),
      gym(10, "Practice, all categories, hard"),
      mixed(6, "onsite round", 50),
      walkthrough("cardGame", "ood-interview-card-game", "object-oriented design"),
      patternQuiz(3),
      activity("review", "pattern-recognition-drill", "Clear the review queue on the dashboard, then one more drill run", "coding", 60),
    ],
  },
];

// ---- Adapting the plan to the learner ----
//
// Three inputs change the plan: where the learner starts, what the interviews are for, and how
// many hours a week they have. Level and target are adjustments to PHASES above: extra tasks,
// tasks marked optional (shown, but not scheduled or counted), and tasks moved one phase
// earlier. Hours per week decide how many weeks the core material takes, with a slack week
// after every SLACK_EVERY weeks and one at the end for failed attempts, revision and repeat
// mocks. The phases' order is the prerequisite order; PHASE_REQUIRES says what each needs.

export type StartLevel = "new" | "comfortable" | "experienced";
export type PlanTarget = "generalist" | "backend" | "senior";

export interface PlanProfile {
  level: StartLevel;
  target: PlanTarget;
  hoursPerWeek: number;
}

export const DEFAULT_PROFILE: PlanProfile = { level: "comfortable", target: "generalist", hoursPerWeek: 8 };
export const HOURS_OPTIONS = [4, 6, 8, 12, 16, 20];
export const SLACK_EVERY = 4;

export type TaskTier = "prerequisite" | "core" | "optional";

export interface PlannedTask extends PlanTask {
  tier: TaskTier;
  why?: string; // for optional tasks: why this profile can skip it
}

interface Adjustment {
  label: string;
  blurb: string;
  prerequisites?: PlanTask[];
  optional?: string[];
  optionalWhy?: string;
  earlier?: string[];
  extra?: { phase: number; tasks: PlanTask[] }[];
}

const RANGE_QUERIES = [
  "range-query-structures",
  "segment-tree-range-sum-mutable",
  "segment-tree-range-min",
  "fenwick-range-add-point-query",
  "fenwick-count-smaller-after-self",
  "fenwick-count-inversions",
  "segment-tree-lazy-propagation",
];
const BIT_EXTRAS = ["bits-reverse-bits", "bits-sum-of-two-integers", "bits-subsets-bitmask"];
const MATH_EXTRAS = ["math-count-primes", "math-pow", "math-gcd-lcm"];
const AI_DEPTH = ["ai-neural-networks", "ai-tokens-embeddings", "ai-transformers-attention", "ai-llm-training"];
const prereq = (id: string, minutes: number, graded = false): PlanTask =>
  graded ? lesson(id, minutes) : { key: id, lessonId: id, area: "coding", minutes };

export const LEVELS: Record<StartLevel, Adjustment> = {
  new: {
    label: "New to programming",
    blurb:
      "Adds a programming prerequisites block first, including the 16 simple building blocks, and makes the hardest topics optional for a first pass. Turn on Plan first in bare mode: writing the steps in plain English before coding is the habit that helps most early on.",
    prerequisites: [
      prereq("lang-start-here", 20),
      prereq("lang-variables-types", 30),
      prereq("basics-celsius-to-fahrenheit", 20, true),
      prereq("lang-strings", 30),
      prereq("basics-count-vowels", 20, true),
      prereq("lang-conditionals", 30),
      prereq("lang-loops", 30),
      prereq("basics-sum-of-evens", 20, true),
      prereq("basics-fizzbuzz", 20, true),
      prereq("lang-functions", 30),
      prereq("functions-call-stack", 30),
      prereq("lang-collections", 40),
      prereq("basics-word-frequency", 30, true),
      prereq("basics-remove-duplicates", 30, true),
      prereq("lang-classes", 40),
      prereq("basics-rectangle-class", 30, true),
      // The simple constructs from Building Blocks: each one small, graded, and the base of a drill.
      ...BUILDING_BLOCKS.filter((b) => b.tier === 1).map((b) => prereq(b.id, 15, true)),
      prereq("algorithm-intro", 30),
      prereq("array-traversal-sum", 20, true),
      prereq("array-reverse-in-place", 30, true),
      prereq("linked-list-traversal", 30, true),
      prereq("recursion-factorial", 30, true),
    ],
    optional: [
      ...RANGE_QUERIES,
      ...BIT_EXTRAS,
      "backtracking-n-queens",
      "dp-edit-distance",
      "dp-stock-cooldown",
      "binary-search-split-array",
      "heap-running-median",
    ],
    optionalWhy: "hard for a first pass; come back once the core is solid",
  },
  comfortable: {
    label: "Comfortable programmer",
    blurb: "You write code regularly but haven't practised interview problems much. The plan as designed.",
  },
  experienced: {
    label: "Experienced, rusty on interviews",
    blurb: "Easy warm-up lessons become optional checks: solve one from the bare starter; if it passes inside 15 minutes, skip the rest of its kind.",
    optional: [
      "big-o-notation",
      "complexity-analysis",
      "hashmap-two-sum",
      "prefix-sums-range-query",
      "two-pointers-sorted-two-sum",
      "sliding-window-max-sum",
      "stack-valid-parentheses",
      "binary-search-array",
      "linked-list-reverse",
      "linked-list-merge-sorted",
      "binary-tree-level-order",
      "bits-power-of-two",
      "dp-climbing-stairs",
      "greedy-assign-cookies",
      "greedy-jump-game",
      "glossary-terms",
    ],
    optionalWhy: "a warm-up: do it bare as a check, skip if it passes quickly",
  },
};

export const TARGETS: Record<PlanTarget, Adjustment> = {
  generalist: {
    label: "Generalist software engineer",
    blurb: "Broad coding coverage, a standard share of design and behavioral. Niche data structures are optional.",
    optional: [...RANGE_QUERIES, ...AI_DEPTH, "bits-reverse-bits", "bits-sum-of-two-integers"],
    optionalWhy: "rarely asked in a generalist loop",
  },
  backend: {
    label: "Backend engineer",
    blurb: "Adds databases, more design walk-throughs and earlier system design; trims niche algorithms.",
    optional: [...RANGE_QUERIES, ...BIT_EXTRAS, ...MATH_EXTRAS, ...AI_DEPTH, "backtracking-n-queens", "dp-stock-cooldown"],
    optionalWhy: "rarely asked for backend roles",
    earlier: ["sd-replication-sharding", "sd-message-queues", "sd-api-rest-http", "sd-api-idempotency", "sd-interview-url-shortener"],
    extra: [
      {
        phase: 1,
        tasks: [
          read("sql-schema-design", "system design", 30),
          read("sql-indexes", "system design", 30),
          read("sql-transactions", "system design", 30),
          read("db-isolation-anomalies", "system design", 30),
          tool("db-window-functions", 30),
          tool("sql-practice-joins", 40),
          tool("sql-practice-aggregation", 40),
          tool("sql-practice-windows", 50),
        ],
      },
      { phase: 2, tasks: [read("security-authn-authz", "system design", 30), read("sec-web-sessions-identity", "system design", 30), walkthrough("notificationSystem", "sd-interview-notification-system")] },
      { phase: 3, tasks: [walkthrough("webCrawler", "sd-interview-web-crawler"), read("db-nosql-modeling", "system design", 30), read("db-storage-engines", "system design", 30)] },
    ],
  },
  senior: {
    label: "Senior, system design heavy",
    blurb: "System design moves earlier and gets more walk-throughs and repeats, plus extra behavioral rounds; hard algorithm niches are optional.",
    optional: [
      ...RANGE_QUERIES,
      ...BIT_EXTRAS,
      ...MATH_EXTRAS,
      ...AI_DEPTH,
      "backtracking-n-queens",
      "dp-stock-cooldown",
      "dp-edit-distance",
      "greedy-jump-game-ii",
      "greedy-gas-station",
      "bits-counting-bits",
    ],
    optionalWhy: "lower priority when design rounds carry the decision",
    earlier: [
      "sd-replication-sharding",
      "sd-consistent-hashing",
      "sd-message-queues",
      "sd-async-systems",
      "sd-rate-limiting",
      "sd-cap",
      "sd-consensus-clocks",
      "sd-resilience",
      "sd-interview-url-shortener",
      "sd-interview-news-feed",
      "sd-interview-chat",
      "sd-interview-rate-limiter",
    ],
    extra: [
      { phase: 2, tasks: [walkthrough("webCrawler", "sd-interview-web-crawler"), walkthrough("notificationSystem", "sd-interview-notification-system")] },
      {
        phase: 4,
        tasks: [
          activity("sd-repeat-1", "interview-prep-plan", "Repeat your weakest design walk-through: write your answer to each stage before revealing it", "system design", 60),
          mock(4, "leadership and conflict questions"),
          activity("sd-repeat-2", "interview-prep-plan", "Repeat another walk-through, 45 minutes on the clock", "system design", 60),
          mock(5, "the company you're targeting, again"),
        ],
      },
    ],
  },
};

export const PHASE_REQUIRES: Record<string, string> = {
  "Programming prerequisites": "Nothing: start here if loops, functions and lists are new to you.",
  Foundations: "Writing loops, functions, lists and dictionaries in C# or Python without looking them up.",
  "Core data structures": "Big O and the hashing, two pointer and stack lessons from Foundations.",
  "Graphs, heaps and search": "Recursion, stacks, queues and hash maps from the first two phases; trees before graphs.",
  "Dynamic programming and design depth": "Recursion and the graph traversals; the design walk-throughs need the system design building blocks.",
  "Mock interviews": "Most core lessons passed at least once. Use the readiness view to choose what to redo.",
};

export interface PlannedPhase {
  name: string;
  requires: string;
  tasks: PlannedTask[];
}

// The ordered phases for one profile. `exists` drops tasks whose lesson isn't in this build.
export function buildPlan(profile: PlanProfile, exists: (id: string) => boolean): PlannedPhase[] {
  const adjustments = [LEVELS[profile.level], TARGETS[profile.target]];
  const phases = PHASES.map((p) => ({ name: p.name, tasks: [...p.tasks] }));
  const why = new Map<string, string>();
  for (const adj of adjustments) {
    for (const e of adj.extra ?? []) {
      const have = new Set(phases.flatMap((p) => p.tasks.map((t) => t.key)));
      phases[e.phase].tasks.push(...e.tasks.filter((t) => !have.has(t.key)));
    }
    for (const key of adj.earlier ?? []) {
      const from = phases.findIndex((p, i) => i > 0 && p.tasks.some((t) => t.key === key));
      if (from < 1) continue;
      const task = phases[from].tasks.find((t) => t.key === key)!;
      phases[from].tasks = phases[from].tasks.filter((t) => t.key !== key);
      phases[from - 1].tasks.push(task);
    }
    for (const key of adj.optional ?? []) if (!why.has(key)) why.set(key, adj.optionalWhy ?? "optional");
  }
  // Each algorithm building block goes just before the first lesson it is the base of, so its
  // pattern is drilled small before the full problem.
  for (const block of BUILDING_BLOCKS.filter((b) => b.tier === 2)) {
    if (phases.some((p) => p.tasks.some((t) => t.key === block.id))) continue;
    const phase = phases.find((p) => p.tasks.some((t) => block.glue.includes(t.key)));
    if (!phase) continue;
    phase.tasks.splice(
      phase.tasks.findIndex((t) => block.glue.includes(t.key)),
      0,
      lesson(block.id, 20),
    );
  }
  const planned: PlannedPhase[] = phases.map((p) => ({
    name: p.name,
    requires: PHASE_REQUIRES[p.name] ?? "",
    tasks: p.tasks.map((t) => (why.has(t.key) ? { ...t, tier: "optional" as const, why: why.get(t.key) } : { ...t, tier: "core" as const })),
  }));
  const prereqs = LEVELS[profile.level].prerequisites;
  if (prereqs)
    planned.unshift({
      name: "Programming prerequisites",
      requires: PHASE_REQUIRES["Programming prerequisites"],
      tasks: prereqs.map((t) => ({ ...t, tier: "prerequisite" as const })),
    });
  return planned
    .map((p) => ({ ...p, tasks: p.tasks.filter((t) => exists(t.lessonId)) }))
    .filter((p) => p.tasks.length > 0);
}

export interface PlanWeek {
  phase: string;
  firstOfPhase: string | null; // set on the week a phase starts in, to show what it requires
  tasks: PlannedTask[];
  slack: boolean;
  optional: PlannedTask[]; // the phase's optional material, listed on its last week
}

function slackWeek(n: number, minutes: number, final: boolean): PlanWeek {
  const part = (share: number) => Math.max(15, Math.round((minutes * share) / 5) * 5);
  const slack = (key: string, lessonId: string, label: string, share: number): PlannedTask => ({
    ...activity(`slack-${n}-${key}`, lessonId, label, "coding", part(share)),
    tier: "core",
  });
  return {
    phase: final ? "Slack: final revision" : "Slack week",
    firstOfPhase: null,
    slack: true,
    optional: [],
    tasks: [
      slack("retry", "interview-prep-plan", "Redo the lessons you failed or only passed assisted, from the bare starter (the readiness view lists them)", 0.35),
      slack("bugs", "bug-log", "Read your Bug Log: find your most common kind of bug and redo one lesson where you made it", 0.15),
      slack("catch-up", "pattern-recognition-drill", "Catch up on unfinished tasks from earlier weeks, then clear the spaced-review queue on the dashboard", 0.25),
      slack(
        "mock",
        final ? "behavioral-mock-round" : "mixed-interview-set",
        final ? "Repeat the mock you did worst in: a mixed set, a design walk-through or a behavioral round" : "Repeat a mock: one mixed interview set under time",
        0.25,
      ),
    ],
  };
}

// Fills weeks in order at the learner's weekly hours (a task never splits; one bigger than a
// whole week gets a week to itself), inserting a slack week after every SLACK_EVERY study weeks
// and a final one before the interviews. Optional tasks are listed, not scheduled. With
// weeklyReps, every study week starts with one Today's reps session.
export function scheduleByHours(phases: PlannedPhase[], hoursPerWeek: number, weeklyReps = false): PlanWeek[] {
  const capacity = Math.max(60, hoursPerWeek * 60);
  const weeks: PlanWeek[] = [];
  let current: PlanWeek | null = null;
  let used = 0;
  let studyWeeks = 0;
  let slackCount = 0;
  let repsCount = 0;
  const close = () => {
    if (!current || current.tasks.length === 0) return;
    weeks.push(current);
    current = null;
    used = 0;
    studyWeeks++;
    if (studyWeeks % SLACK_EVERY === 0) weeks.push(slackWeek(++slackCount, capacity, false));
  };
  for (const phase of phases) {
    let started = false;
    for (const t of phase.tasks.filter((x) => x.tier !== "optional")) {
      if (current && used + t.minutes > capacity && current.tasks.some((x) => x.doneBy?.kind !== "reps")) close();
      if (!current) {
        current = { phase: phase.name, firstOfPhase: null, tasks: [], slack: false, optional: [] };
        if (weeklyReps) {
          current.tasks.push({ ...reps(++repsCount), tier: "core" });
          used += REPS_MINUTES;
        }
      }
      if (!started) {
        current.firstOfPhase ??= phase.name;
        started = true;
      }
      current.tasks.push(t);
      used += t.minutes;
    }
    const optional = phase.tasks.filter((x) => x.tier === "optional");
    const target: PlanWeek | undefined = current ?? weeks.filter((w) => !w.slack).at(-1);
    if (target) target.optional.push(...optional);
  }
  close();
  if (!weeks.at(-1)?.slack) weeks.push(slackWeek(++slackCount, capacity, true));
  else weeks[weeks.length - 1] = slackWeek(slackCount, capacity, true);
  return weeks;
}
