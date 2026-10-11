// Hand-written problem statements for the Pattern Recognition Drill. Each one names the
// technique it's an instance of (`answer`, which must match an entry in TECHNIQUES), the
// phrases in the statement that give it away (`signals`), and the sibling technique it's
// most likely to be confused with (`trap`, also from TECHNIQUES) -- used as one of the
// wrong options so the distractors are the realistic ones, not random noise. `alsoAccept`
// lists techniques the explanation calls equally valid; they're never drawn as random fillers,
// so a correct alternative is never graded wrong.

export const TECHNIQUES = [
  "Binary Search",
  "Binary Search on the Answer",
  "Two Pointers",
  "Fast & Slow Pointers",
  "Sliding Window",
  "Prefix Sums",
  "Monotonic Stack",
  "Monotonic Deque",
  "Merge Intervals",
  "Top-K with a Heap",
  "Union-Find",
  "Minimum Spanning Tree",
  "Topological Sort",
  "BFS",
  "DFS",
  "Dijkstra's Algorithm",
  "Backtracking",
  "Dynamic Programming (1-D)",
  "Dynamic Programming (0/1 Knapsack)",
  "Dynamic Programming (Unbounded Knapsack)",
  "Dynamic Programming (2-D, two sequences)",
  "Dynamic Programming (State Machine)",
  "Interval DP",
  "Hash Map",
  "Hash Map + Doubly Linked List",
  "Augmented Stack",
  "Trie",
  "Bit Manipulation",
  "K-way Merge",
  "Two Heaps",
  "Sweep Line",
  "Greedy",
  "String Matching (KMP)",
  "Linked List Pointer Manipulation",
  "Math (Number Theory)",
] as const;

export type Technique = (typeof TECHNIQUES)[number];

export interface DrillQuestion {
  statement: string;
  answer: Technique;
  trap: Technique;
  alsoAccept?: Technique[];
  signals: string[];
  why: string;
}

export const DRILL_QUESTIONS: DrillQuestion[] = [
  {
    statement:
      "You're given a sorted array of room numbers and a target room. Return its index, or -1 if it isn't there. The array has 10 million entries and the checker times out on anything slower than logarithmic.",
    answer: "Binary Search",
    trap: "Two Pointers",
    signals: ["\"sorted\"", "find one specific value", "a time limit that rules out scanning every element"],
    why: "Sorted input plus a lookup lets you throw away half the remaining range every step.",
  },
  {
    statement:
      "A delivery company can drive any speed from 1 to 1,000 km/h. Given the lengths of n road segments and a deadline in hours, find the minimum constant speed that still finishes every segment in time.",
    answer: "Binary Search on the Answer",
    trap: "Binary Search",
    signals: ["\"minimum value that still works\"", "the answer is a number in a range, not an element in an array", "easy to CHECK whether a candidate speed works"],
    why: "There's no array to search -- but \"is speed k fast enough?\" is monotonic (if 50 works, so does 60), so you can binary search the answer itself.",
  },
  {
    statement:
      "Given a SORTED array of prices and a budget, find two different items whose prices sum to exactly the budget. You must use O(1) extra space.",
    answer: "Two Pointers",
    trap: "Hash Map",
    signals: ["\"sorted\"", "pair that sums to a target", "O(1) extra space rules out a hash map"],
    why: "One pointer at each end: too big, move the right pointer in; too small, move the left one in. A hash map would work on unsorted input, but the space limit and sorted order point to pointers.",
  },
  {
    statement:
      "Given the head of a singly linked list, return the middle node in a single pass without first counting the list's length.",
    answer: "Fast & Slow Pointers",
    trap: "Two Pointers",
    signals: ["linked list (no random access)", "\"single pass\"", "find the middle / detect a cycle"],
    why: "Move one pointer two steps for every one step of the other; when the fast one hits the end, the slow one is at the middle.",
  },
  {
    statement:
      "Given an array of daily sales and a number k, find the highest total sales over any k consecutive days, using O(1) extra space.",
    answer: "Sliding Window",
    trap: "Prefix Sums",
    signals: ["\"k consecutive\"", "contiguous subarray of FIXED size", "O(1) extra space rules out a prefix-sum array"],
    why: "Slide the window one day at a time: add the new day, subtract the day that fell off. No re-summing k values at every position. Prefix sums also find it in O(n) time, but the prefix array takes O(n) extra space.",
  },
  {
    statement:
      "Given an array of numbers, you'll receive 100,000 queries, each asking for the sum of the elements between two given positions. Answer every query as fast as possible.",
    answer: "Prefix Sums",
    trap: "Sliding Window",
    signals: ["\"many queries\"", "sum of an ARBITRARY range", "the same array is queried repeatedly"],
    why: "Precompute running totals once; every range sum afterwards is one subtraction. A sliding window only helps when the range size is fixed and you're scanning, not querying at random.",
  },
  {
    statement:
      "For each day's temperature, find how many days you have to wait until a warmer day. If there is no future warmer day, the answer is 0.",
    answer: "Monotonic Stack",
    trap: "Sliding Window",
    signals: ["\"next greater / next warmer\"", "for EACH element, look to one side for the first one that beats it", "looks like a nested loop but each element should be handled once"],
    why: "Keep a stack of days still waiting for a warmer one; each new day pops every colder day off it and resolves them. Each index is pushed and popped once: O(n).",
  },
  {
    statement:
      "Given a list of meeting time ranges like [9,11], [10,12], [14,15], combine any that overlap and return the minimal list of busy blocks.",
    answer: "Merge Intervals",
    trap: "Sliding Window",
    signals: ["ranges / intervals", "\"overlap\" or \"combine\"", "output is a smaller list of ranges"],
    why: "Sort by start time, then sweep once: either the next range overlaps the current block (extend it) or it starts a new one.",
  },
  {
    statement:
      "A stream of 50 million scores arrives and you need the 10 highest, but you can't afford to sort or even store all of them.",
    answer: "Top-K with a Heap",
    trap: "Binary Search",
    signals: ["\"the k largest / k most frequent\"", "k is much smaller than n", "can't sort everything"],
    why: "Keep a min-heap capped at size k. A new score only matters if it beats the smallest of your current top k, so each score costs O(log k) instead of sorting n.",
  },
  {
    statement:
      "n computers start unconnected, and direct cables are installed one at a time. After each new cable, report how many separate networks (groups that can reach each other) there are.",
    answer: "Union-Find",
    trap: "DFS",
    signals: ["\"connected components\" / \"are these two in the same group\"", "relationships arrive as pairs", "groups merge over time"],
    why: "Start with n networks; union the two ends of each new cable, and if they had different roots, one fewer network remains. DFS would work for a one-time count, but rerunning it after every cable costs O(n + m) each time, while each union is nearly O(1).",
  },
  {
    statement:
      "You must take n courses; some have prerequisites (course 2 requires course 0). Output a valid order to take all of them, or report that it's impossible.",
    answer: "Topological Sort",
    trap: "DFS",
    signals: ["dependencies / prerequisites", "\"a valid order\"", "\"impossible\" meaning a cycle"],
    why: "Repeatedly take whatever has no unmet prerequisites. If you run out of such courses before finishing, there's a cycle. A DFS that records courses in reverse finishing order (with a check for cycles) is also a correct way to get the order; either way, the pattern is topological sort.",
  },
  {
    statement:
      "In a maze grid where every step costs the same, find the fewest steps from the start cell to the exit.",
    answer: "BFS",
    trap: "DFS",
    signals: ["\"fewest steps\" / shortest path", "every move costs the SAME", "grid or unweighted graph"],
    why: "BFS explores in rings of increasing distance, so the first time it reaches the exit is by the shortest route. DFS can find a path but not necessarily the shortest.",
  },
  {
    statement:
      "In a grid of land and water, count how many separate islands there are (land cells connected up/down/left/right form one island).",
    answer: "DFS",
    trap: "Union-Find",
    alsoAccept: ["BFS"],
    signals: ["\"count regions / islands / areas\"", "flood-fill a connected region", "no distance or shortest-path requirement"],
    why: "For each unvisited land cell, flood-fill its whole island (marking cells visited) and count one. BFS works equally well; there's no shortest-path need that would pick between them. Union-Find also gives the right count, with more code; it pays off when land is added over time.",
  },
  {
    statement:
      "A road network has cities connected by roads of different lengths. Find the shortest total distance from the capital to every other city.",
    answer: "Dijkstra's Algorithm",
    trap: "BFS",
    signals: ["shortest path", "edges have DIFFERENT weights/lengths/costs", "all weights are non-negative"],
    why: "BFS only minimizes the NUMBER of roads, not total length. Dijkstra always finalizes whichever unfinished city is currently closest, using a priority queue.",
  },
  {
    statement:
      "Given a set of distinct numbers, return every possible subset of it.",
    answer: "Backtracking",
    trap: "Dynamic Programming (1-D)",
    signals: ["\"all possible\" / \"every combination\"", "the answer is a list of choices, not a single number", "decide include/exclude at each step"],
    why: "Build each answer one choice at a time, recurse, then undo the choice and try the other branch. DP would only help if you were counting subsets or optimizing over them, not listing them.",
  },
  {
    statement:
      "How many distinct ways can you climb a staircase of n steps if you can take 1 or 2 steps at a time?",
    answer: "Dynamic Programming (1-D)",
    trap: "Backtracking",
    signals: ["\"how many ways\"", "the answer for n is built from the answers for smaller n", "plain recursion would recompute the same sub-answers"],
    why: "ways(n) = ways(n-1) + ways(n-2). Backtracking would enumerate every path (exponential); you only need the COUNT, which a simple array fill gives in O(n).",
  },
  {
    statement:
      "Given items with weights and values and a bag that holds at most W weight, choose items (each at most once) to maximize total value.",
    answer: "Dynamic Programming (0/1 Knapsack)",
    trap: "Backtracking",
    signals: ["\"each item at most once\" with a capacity limit", "maximize value under a budget", "choose-or-skip decisions"],
    why: "State is (item, remaining capacity). Trying every subset (backtracking) is 2ⁿ; the DP table collapses it to n × W.",
  },
  {
    statement:
      "Given a string, find the length of the longest substring that reads the same forwards and backwards.",
    answer: "Interval DP",
    trap: "Two Pointers",
    signals: ["a CONTIGUOUS range of a string", "whether a range works depends on a smaller range inside it", "two indices (i, j) describe the state"],
    why: "s[i..j] is a palindrome if the ends match and s[i+1..j-1] already was. Filling intervals shortest-to-longest is the interval-DP shape. Expanding two pointers outward from each center is also correct, in the same O(n²) time with O(1) space; the DP is the general shape that also handles harder range questions.",
  },
  {
    statement:
      "Given an array, find the length of the longest subsequence whose elements are strictly increasing. Elements don't have to be adjacent.",
    answer: "Dynamic Programming (1-D)",
    trap: "Sliding Window",
    signals: ["\"subsequence\" (not subarray) -- order matters but adjacency doesn't", "longest/best run", "the best answer ending at i depends on earlier answers"],
    why: "dp[i] = 1 + the best dp[j] for earlier j with a smaller value. A sliding window needs contiguous elements; \"subsequence\" is the tell that it isn't one.",
  },
  {
    statement:
      "Given a list of words, report whether any two of them are anagrams of each other. Group the words in a single pass.",
    answer: "Hash Map",
    trap: "Two Pointers",
    signals: ["\"group by\" / \"have we seen this before\"", "an easily computed key for each item (its sorted letters)", "one pass with O(1) lookups"],
    why: "Use the sorted letters as a key and group words under it. Anytime you ask \"have I seen this?\" or \"group these by X\", reach for a hash map first.",
  },
  {
    statement:
      "Given an array where every number appears twice except one, find the one that appears once, using O(1) extra space.",
    answer: "Bit Manipulation",
    trap: "Hash Map",
    signals: ["pairs that cancel out", "\"exactly one\" odd-one-out", "O(1) space rules out the obvious hash map"],
    why: "XOR-ing a number with itself gives 0, so XOR-ing the whole array cancels every pair and leaves the single one. A hash map works but uses O(n) space.",
  },
  {
    statement:
      "Given an unsorted array and a target, return the indices of two numbers that add up to the target. Do it in one pass, and extra memory is fine.",
    answer: "Hash Map",
    trap: "Two Pointers",
    signals: ["pair summing to a target", "UNSORTED input", "extra memory allowed"],
    why: "For each number, check whether target - number was already seen. Two pointers would need the array sorted first (and would lose the original indices).",
  },
  {
    statement:
      "Given a sorted array that has been rotated at an unknown pivot (like [6,7,1,2,3,4,5]), find a target value in O(log n).",
    answer: "Binary Search",
    trap: "Two Pointers",
    signals: ["still essentially sorted", "required O(log n)", "find a value"],
    why: "At any midpoint one half is still properly sorted; check whether the target lies in that half and discard the other. The log-n requirement is the giveaway.",
  },
  {
    statement:
      "Find the smallest window (contiguous) in a string that contains every character of a given pattern string.",
    answer: "Sliding Window",
    trap: "Hash Map",
    signals: ["\"smallest / longest contiguous\" satisfying a condition", "window expands until valid, then shrinks", "a hash map of counts is the SUPPORTING structure"],
    why: "Grow the right edge until the window is valid, then shrink the left edge as far as possible. The hash map tracks character counts, but the technique is the window.",
  },
  {
    statement:
      "A search box should suggest how many product names in a catalog of 2 million start with whatever the user has typed so far, updating on every keystroke.",
    answer: "Trie",
    trap: "Hash Map",
    signals: ["\"start with\" (prefixes, not exact matches)", "the same fixed dictionary queried over and over", "each query should cost about the length of what was typed"],
    why: "A trie stores shared prefixes once and keeps a count on each node, so a prefix query is a walk of its own length. A hash set of names only answers exact matches. A hash map from every prefix of every name to its count would also answer each query in about the length typed, but it stores each prefix separately, where the trie shares them.",
  },
  {
    statement:
      "A vending machine has unlimited coins of a few denominations. Find the fewest coins that make exactly a given amount, or say it's impossible.",
    answer: "Dynamic Programming (Unbounded Knapsack)",
    trap: "Dynamic Programming (0/1 Knapsack)",
    signals: ["an exact total", "\"unlimited\" -- each piece can be reused", "fewest pieces (greedy fails for some coin sets)"],
    why: "dp[x] = 1 + min over coins of dp[x - coin], filled for x going UP so the same coin can be used again. 0/1 knapsack would forbid that reuse.",
  },
  {
    statement:
      "Given a user's typo and a dictionary word, compute the minimum number of single-letter insertions, deletions or substitutions to turn one into the other.",
    answer: "Dynamic Programming (2-D, two sequences)",
    trap: "Two Pointers",
    signals: ["two strings compared", "minimum number of edit operations", "a choice at the end of both strings shrinks the problem"],
    why: "dp[i][j] = cost to turn the first i letters into the first j. Two pointers can't decide between insert, delete and replace; the table tries all three.",
  },
  {
    statement:
      "Twelve offices need to be linked by fibre so every office can reach every other, possibly through others. You have the cost of each possible direct link. Minimize the total cost.",
    answer: "Minimum Spanning Tree",
    trap: "Dijkstra's Algorithm",
    signals: ["connect EVERYTHING", "minimize the TOTAL cost of links used", "no particular start or end point"],
    why: "Take links cheapest-first, skipping any that join already-connected offices (Kruskal with Union-Find). Dijkstra finds shortest paths from one source, which is a different question.",
  },
  {
    statement:
      "Given a string of server log characters, return the length of the longest stretch in which no character repeats.",
    answer: "Sliding Window",
    trap: "Hash Map",
    signals: ["longest CONTIGUOUS stretch", "a rule the stretch must satisfy (no repeats)", "breaking the rule means shrinking from the left"],
    why: "Grow the window to the right; when a character repeats, move the left edge past its earlier copy. The set of characters is supporting state; the technique is the variable-size window.",
  },
  {
    statement:
      "A satellite image of a coastline is given as a grid where 1 is land and 0 is water. Cells touching up, down, left or right belong to the same landmass. Report how many separate landmasses the image contains.",
    answer: "DFS",
    trap: "Union-Find",
    alsoAccept: ["BFS"],
    signals: ["a 2-D grid of two kinds of cells", "\"separate landmasses\" = connected groups", "the grid is fixed, nothing is added over time"],
    why: "Each cell is a node with edges to its 4 neighbours, so this is counting connected components: scan, and every unvisited land cell starts a flood fill that marks its whole island. Union-Find also works but is only worth it when land is added one cell at a time.",
  },
  {
    statement:
      "A warehouse floor plan marks each square as empty, holding a dry crate, or holding a wet crate. Every hour, moisture spreads from each wet crate to the dry crates directly beside it. How many hours until every dry crate is wet, or -1 if some never get wet?",
    answer: "BFS",
    trap: "DFS",
    signals: ["spreads from SEVERAL starting squares at once", "\"how many hours\" = number of equal-speed steps", "-1 if some square is unreachable"],
    why: "Put every wet crate in the queue before starting (multi-source BFS); each BFS layer is one hour. DFS reaches squares along long paths first and records the wrong times.",
  },
  {
    statement:
      "A word-puzzle app shows a grid of letters. Given a word, decide whether it can be traced by moving between horizontally or vertically adjacent tiles, without using any tile twice in the same trace.",
    answer: "Backtracking",
    trap: "DFS",
    signals: ["a PATH through a grid", "\"without using any tile twice in the same trace\"", "a tile that fails on one path may be needed by another"],
    why: "It's a DFS whose visited marks belong to the current path: mark a tile when you step on it and unmark it when you step back. A plain visited set (as in flood fill) wrongly blocks tiles that a later path needs.",
  },
  {
    statement:
      "A museum has an n × n grid of display rooms. A guard in a room can see along its whole row, its whole column and both diagonals. Count the number of ways to station n guards so that no guard can see another. n is at most 12.",
    answer: "Backtracking",
    trap: "Dynamic Programming (1-D)",
    signals: ["place items so that no two conflict", "count all valid arrangements", "n is tiny (12 or less), so an exponential search with pruning is expected"],
    why: "It's N-Queens: one guard per row, try each column not blocked by an earlier guard's column, r - c diagonal or r + c anti-diagonal, recurse, then undo. \"Count the ways\" sounds like DP, but the conflicts depend on every earlier placement, so there are no small overlapping subproblems to cache.",
  },
  {
    statement:
      "Two versions of a config file are given as lists of lines. Find the maximum number of lines that appear in both versions in the same relative order (other lines may appear between them), so a diff tool can show everything else as added or removed.",
    answer: "Dynamic Programming (2-D, two sequences)",
    trap: "Two Pointers",
    signals: ["two sequences compared against each other", "\"in the same relative order\" with gaps allowed = common subsequence", "maximum number, not the minimum edits"],
    why: "This is Longest Common Subsequence: dp[i][j] is the answer for the first i and j lines; a match extends the diagonal by 1, otherwise take max(up, left). Greedily matching with two pointers can lock in an early match that blocks a longer one.",
  },
  {
    statement:
      "An org-chart service stores reporting lines as a binary tree, keyed so that every employee ID in someone's left reports is lower than theirs and every ID on the right is higher. After a botched import, write a check that confirms the whole chart still obeys that rule -- not just between each manager and their direct reports.",
    answer: "DFS",
    trap: "Binary Search",
    signals: ["a rule over a node's ENTIRE subtree, not just its children", "\"confirm the whole tree obeys\" means visiting every node", "information (allowed ID range) flows from the root down"],
    why: "Walk the tree depth-first passing an allowed (low, high) range: going left, the node's ID becomes the upper bound; going right, the lower bound. Binary search only applies when you trust the ordering -- here you're verifying it, so every node must be visited.",
  },
  {
    statement:
      "A company's network is a tree of routers, each with at most two downstream links. Find the largest number of hops between any two routers, which may well be two routers deep in the same branch, nowhere near the core.",
    answer: "DFS",
    trap: "BFS",
    signals: ["\"longest path between ANY two nodes\" in a tree", "the path may not go through the root", "each node needs its children's answers first (bottom-up)"],
    why: "A post-order DFS returns each subtree's height to its parent and updates a global best with left + right at every node, in one pass. Two BFS passes also work on a tree (find the router farthest from any start, then the farthest from that one), but each pass must be able to walk back up toward the core, so you'd first add parent links to the downstream-only tree.",
  },
  {
    statement:
      "In a family-tree app every person has at most two listed children, and names are unique. Given two people, find the most recent ancestor they share (a person can count as their own ancestor). The tree is not sorted in any way.",
    answer: "DFS",
    trap: "Binary Search",
    signals: ["\"most recent / lowest common ancestor\"", "\"not sorted\" rules out the BST shortcut", "you need to know which side each person is on"],
    why: "Search both subtrees depth-first; each call reports whether it found one of the two people. The first node that hears back from BOTH sides is the answer. The compare-and-go-one-way trick only works when the tree is a BST.",
  },
  {
    statement:
      "A DJ has 7 songs and wants to audition every possible running order for a set, where the same songs in a different order count as a different set. Generate all of them in dictionary order.",
    answer: "Backtracking",
    trap: "Dynamic Programming (1-D)",
    signals: ["\"every possible order\" -- order matters", "n is tiny and the output is n! items", "each slot can take any song not used yet"],
    why: "Fill one slot at a time with any unused song, recurse, then un-use it and try the next. There are no overlapping subproblems to cache -- every arrangement is a distinct answer -- so DP doesn't help.",
  },
  {
    statement:
      "A city skyline is given as building heights of equal width, left to right. After a storm, water pools between taller buildings. Compute the total pooled water using constant extra memory.",
    answer: "Two Pointers",
    trap: "Monotonic Stack",
    signals: ["each position depends on the tallest to its LEFT and the tallest to its RIGHT", "\"constant extra memory\"", "settling from both ends inward"],
    why: "Water at a spot is min(tallest left, tallest right) minus its height. Walk pointers in from both ends, always settling the lower side, since its own running max already decides its water level. A monotonic stack also solves it but uses O(n) space.",
  },
  {
    statement:
      "A web server keeps at most 10,000 rendered pages in memory. Fetching a page that's in memory must be O(1), adding a page must be O(1), and when memory is full the page that hasn't been requested for the longest time is thrown out.",
    answer: "Hash Map + Doubly Linked List",
    trap: "Top-K with a Heap",
    signals: ["fixed capacity with eviction", "\"hasn't been requested for the longest time\" (recency order)", "both operations O(1)"],
    why: "The map finds a page's node in O(1); the doubly linked list keeps pages in recency order so moving one to the front or dropping the oldest is O(1). A heap by timestamp would cost O(log n) per access.",
  },
  {
    statement:
      "A text editor's undo history is a stack of document versions, each tagged with a word count. Besides push and pop, the UI needs the smallest word count among all versions currently in the history, refreshed instantly after every push or pop.",
    answer: "Augmented Stack",
    trap: "Monotonic Stack",
    signals: ["a stack whose elements all stay (push/pop only at the top)", "a running minimum after every push AND pop", "\"instantly\" (O(1) per operation)"],
    why: "Store the minimum-so-far alongside each entry at push time. Because everything below an entry is frozen while it's on the stack, popping restores the previous minimum for free. A monotonic stack would throw away elements the history still needs.",
  },
  {
    statement:
      "Along a street, each building has a value you could collect. Collecting from two buildings next to each other triggers the neighborhood watch. Return the most value you can collect.",
    answer: "Dynamic Programming (1-D)",
    trap: "Dynamic Programming (0/1 Knapsack)",
    signals: ["choose a subset of items in a line", "taking one item forbids its immediate neighbor", "maximize a total"],
    why: "best[i] = max(best[i-1], best[i-2] + value[i]): skip this building or take it and fall back two. Only adjacency constrains the choice, so there's no capacity dimension like knapsack, and two rolling variables suffice.",
  },
  {
    statement:
      "Given a list of daily electricity prices, you can buy a battery charge and later sell it back as many times as you like, holding at most one charge at a time. After selling, the grid makes you wait one full day before you can buy again. Maximize total profit.",
    answer: "Dynamic Programming (State Machine)",
    trap: "Dynamic Programming (1-D)",
    signals: ["unlimited buy/sell transactions", "\"wait one full day\" after a sale (a cooldown)", "what you may do today depends on what you did yesterday"],
    why: "Track the best profit for each state (holding, just sold, resting) per day; buying is only allowed from resting. One value per day can't tell whether you're allowed to buy today.",
  },
  {
    statement:
      "A monitoring dashboard shows CPU readings once per second. For every 60-second window, it must display the peak reading in that window. Process a day's worth of readings in a single linear pass.",
    answer: "Monotonic Deque",
    trap: "Sliding Window",
    signals: ["the MAX of every fixed-size window", "a single linear pass (rules out rescanning each window or a log-factor heap)", "the max can't be updated by subtraction when a reading leaves"],
    why: "Keep a deque of indices with decreasing readings: pop smaller readings off the back when a new one arrives, pop the front when it ages out of the window, and the front is the peak. A plain running-sum window can't 'un-max' the element that leaves.",
  },
  {
    statement:
      "Twelve servers each write a log file whose entries are already sorted by timestamp. Produce one combined log in timestamp order. The files are long, and you can only keep a handful of entries in memory at a time.",
    answer: "K-way Merge",
    trap: "Top-K with a Heap",
    signals: ["several inputs that are EACH already sorted", "one combined sorted output", "memory for only about one entry per input"],
    why: "The next entry in the combined log must be the current head of one of the 12 files. Keep those 12 heads in a min-heap, pop the smallest, and replace it with the next entry from the same file: O(n log k).",
  },
  {
    statement:
      "Given an n x n matrix where every row and every column is sorted ascending, return the k-th smallest value in the whole matrix.",
    answer: "K-way Merge",
    trap: "Two Heaps",
    alsoAccept: ["Binary Search on the Answer", "Binary Search"],
    signals: ["n sorted rows", "the k-th smallest OVERALL", "you'd be happy to read the values in order and stop at the k-th"],
    why: "Each row is a sorted list, so seed a min-heap with every row's first value and pop k times, pushing the next value from the popped row each time. (Binary search on the value range also works, but the merge is the direct reading of the problem.)",
  },
  {
    statement:
      "A fitness tracker receives heart-rate readings one at a time. After every reading, the app shows the median of all readings so far. Millions of readings arrive per day, so re-sorting each time is out.",
    answer: "Two Heaps",
    trap: "Top-K with a Heap",
    signals: ["the MEDIAN, recomputed after every new value", "a growing stream", "re-sorting is ruled out"],
    why: "Keep the lower half in a max-heap and the upper half in a min-heap, balanced to within one. The median is on the tops, and each insert is O(log n).",
  },
  {
    statement:
      "You are given project profits and the capital each one needs. Starting with capital w, you can finish at most k projects one after another; each finished project adds its profit to your capital. Choose projects to maximize your final capital.",
    answer: "Two Heaps",
    trap: "Dynamic Programming (0/1 Knapsack)",
    signals: ["two groups that change over time: projects you can afford and ones you can't yet", "repeatedly take the best of one group", "items move from one group to the other as capital grows"],
    why: "A min-heap of projects by required capital and a max-heap of affordable projects by profit: move everything you can now afford into the profit heap, take its top, repeat k times. It looks like a knapsack, but the order of choices and growing capital make the greedy two-heap approach correct.",
  },
  {
    statement:
      "A calendar holds a person's busy blocks, sorted by start time with no overlaps. A new meeting [start, end] gets added. Return the updated list of busy blocks, still sorted and non-overlapping, in a single linear pass.",
    answer: "Merge Intervals",
    trap: "Binary Search",
    signals: ["intervals that are ALREADY sorted and disjoint", "add one interval and merge what it touches", "a single linear pass"],
    why: "Copy the blocks that end before the new meeting starts, absorb the run that overlaps it (min of starts, max of ends), then copy the rest. Binary search could find the insertion point, but the output still has to be rebuilt, so it doesn't beat O(n).",
  },
  {
    statement:
      "A list of reserved IP ranges is kept sorted and non-overlapping. Each request reserves one more range [lo, hi]; afterwards the list must again be sorted and non-overlapping, with ranges that touch or overlap combined.",
    answer: "Merge Intervals",
    trap: "Sweep Line",
    signals: ["ranges", "sorted, non-overlapping list kept up to date", "\"combined\" overlapping ranges in the output"],
    why: "This is interval insertion: the ranges that overlap the new one form one contiguous run, so one pass copies, merges, copies. A sweep line counts overlaps at each point; here the output is the merged ranges themselves.",
  },
  {
    statement:
      "A hospital has a list of surgeries, each with a start and end time. A surgery that ends at time t frees its operating room for one that starts at t. What is the smallest number of operating rooms that lets every surgery happen as scheduled?",
    answer: "Sweep Line",
    trap: "Merge Intervals",
    signals: ["intervals with a start and end", "\"smallest number of rooms\" so overlapping ones never share", "the answer is a count, not a list of ranges"],
    why: "The rooms needed equal the most surgeries running at once. Sort the starts and the ends separately and sweep: a start either reuses a room freed by the earliest end (end <= start) or opens a new one. Merging the intervals would count busy stretches, not rooms.",
  },
  {
    statement:
      "Given the check-in and check-out times of every guest at a hotel in one day, find the maximum number of guests in the building at the same time. Someone checking out at 3:00 and someone checking in at 3:00 are not in the building together.",
    answer: "Sweep Line",
    trap: "Sliding Window",
    signals: ["start and end events", "the MAXIMUM number active at once", "a tie rule for events at the same time"],
    why: "Turn each stay into a +1 at check-in and a -1 at check-out, sort the events (check-outs first on ties), and track the running count's peak. There's no fixed or contiguous window to slide here, just events in time order.",
  },
  {
    statement:
      "You have a list of time slots people asked to book in a single studio. Some requests overlap. Reject as few requests as possible so the remaining ones never overlap; a booking ending at t and one starting at t are fine together. Return how many you reject.",
    answer: "Greedy",
    trap: "Merge Intervals",
    signals: ["remove the FEWEST intervals (keep the most)", "only one resource, so kept intervals can't overlap at all", "touching endpoints are allowed"],
    why: "Sort by END time and always keep the booking that finishes earliest among those that fit; count the rest as rejected. Finishing early leaves the most room for later bookings. Merging would combine overlapping bookings, which isn't allowed here.",
  },
  {
    statement:
      "Balloons are taped to a wall, each spanning a horizontal range [x_start, x_end]. An arrow shot straight up at position x bursts every balloon whose range includes x. What is the minimum number of arrows that bursts them all?",
    answer: "Greedy",
    trap: "Sweep Line",
    signals: ["intervals", "a MINIMUM number of points that cover (stab) every interval", "one choice can be made locally and never revisited"],
    why: "Sort by end, shoot the first arrow at the earliest end, skip every balloon that arrow hits, and repeat from the next unhit balloon. It's the same earliest-finish rule as removing overlapping intervals; a sweep line would count overlaps, not choose points.",
  },
  {
    statement:
      "A circular playlist stores track IDs in increasing order starting from some unknown track, so the stored list looks like [40, 52, 77, 3, 9, 21]. All IDs are distinct. Given an ID, return its position in the list or -1, in O(log n).",
    answer: "Binary Search",
    trap: "Two Pointers",
    signals: ["sorted, but starting from an unknown point (rotated)", "find one specific value", "O(log n) required"],
    why: "Any midpoint splits the list into two halves and at least one of them is sorted. Check whether the ID falls in that sorted half's range, and drop the other half.",
  },
  {
    statement:
      "A sensor log was sorted by timestamp, then a bug moved some block from the front to the back, leaving [t5, t6, t7, t1, t2, t3, t4]. Find the earliest timestamp without scanning the whole log.",
    answer: "Binary Search",
    trap: "Binary Search on the Answer",
    signals: ["sorted then rotated", "\"without scanning the whole log\"", "the answer is a position in the array, not a value from a range of candidates"],
    why: "Compare nums[mid] with nums[hi]: if it's bigger, the drop (and the minimum) is to the right; otherwise it's at mid or to the left. You're still searching array indices, so it's ordinary binary search.",
  },
  {
    statement:
      "A book has chapters with given page counts, in order. Assign them to k students so each student reads a contiguous run of chapters, and minimize the most pages any one student has to read.",
    answer: "Binary Search on the Answer",
    trap: "Dynamic Programming (1-D)",
    signals: ["\"minimize the maximum\"", "contiguous parts in a fixed order", "easy to check a candidate: can k students cover it if nobody reads more than X pages?"],
    why: "For a cap X, a greedy pass gives the fewest students needed, and that count only drops as X grows. Binary search X between the largest chapter and the total. DP works too but costs O(k·n²).",
  },
  {
    statement:
      "Packages with given weights must ship in order over D days, one contiguous batch per day. Find the smallest ship capacity that gets everything delivered within D days.",
    answer: "Binary Search on the Answer",
    trap: "Sliding Window",
    signals: ["\"smallest capacity such that\"", "the answer is a number in a range [max weight, total weight]", "a greedy day count checks any candidate in O(n)"],
    why: "Days needed is monotonic in capacity, so binary search the capacity and check each candidate with a greedy pass. There is no window to slide: the batches are decided by the cap, not by a fixed size.",
  },
  {
    statement:
      "Given a list of product codes, return them bucketed so that codes made of exactly the same letters (with the same counts, in any order) end up in the same bucket.",
    answer: "Hash Map",
    trap: "Trie",
    signals: ["\"bucket\" / \"group\"", "\"same letters in any order\"", "a key computed from one item alone identifies its group"],
    why: "Sort each code's letters (or count them) to get a key that every member of the group shares, and append to that key's list in a map. A trie groups by shared prefixes, which anagrams don't have.",
  },
  {
    statement:
      "You get 200,000 short words. Return how many distinct groups there are, where two words are in the same group if one is a rearrangement of the other's letters.",
    answer: "Hash Map",
    trap: "Sliding Window",
    signals: ["\"rearrangement\" equivalence", "many separate items, not one long string", "comparing every pair would be O(n²)"],
    why: "Map each word to its sorted letters (or a 26-count signature) and count distinct keys. A sliding window is for anagrams of a pattern INSIDE one long string, not for grouping separate words.",
  },
  {
    statement:
      "Given a long log line s and a set of required characters t (with repeats, so \"aab\" needs two a's), return the shortest contiguous piece of s that contains all of them, or an empty string if none does.",
    answer: "Sliding Window",
    trap: "Two Pointers",
    signals: ["\"shortest contiguous\" substring", "the condition is about character counts", "a valid window stays valid if you grow it"],
    why: "Expand right until the window covers t, then shrink left while it still does, recording the best. A count map plus a \"missing\" counter makes each step O(1), so the whole scan is O(n + m). The window is held by two pointers, but both move in the same direction to keep a condition true, which is what Sliding Window names here.",
  },
  {
    statement:
      "A security camera log lists, minute by minute, which guard was at the gate. Find the shortest stretch of consecutive minutes in which every one of a given list of guards appears at least as many times as they're listed.",
    answer: "Sliding Window",
    trap: "Hash Map",
    signals: ["\"shortest stretch of consecutive\"", "every required item at least a given number of times", "one pass over a sequence"],
    why: "It's minimum window substring in disguise. A hash map of counts is part of the solution, but what makes it linear is the window that grows on the right and shrinks on the left.",
  },
  {
    statement:
      "Given a DNA sequence of 10 million bases and a motif of 50,000 bases, return every position where the motif starts, overlaps included. Worst-case inputs like long runs of the same base must still run in linear time.",
    answer: "String Matching (KMP)",
    trap: "Sliding Window",
    signals: ["find every occurrence of a pattern in a text", "\"overlaps included\"", "a worst-case linear guarantee on repetitive input"],
    why: "KMP's prefix function tells you how much of the pattern still matches after a mismatch, so the text pointer never moves back: O(n + m) even for \"aaaa...ab\". A naive window compare is O(n·m) there.",
  },
  {
    statement:
      "Given a string s, find the length of its longest proper prefix that is also a suffix (for \"abcab\" it's 2, \"ab\"), and use it to decide whether s is just a smaller block repeated several times.",
    answer: "String Matching (KMP)",
    trap: "Dynamic Programming (1-D)",
    signals: ["\"prefix that is also a suffix\"", "periodicity / repeated block", "linear time on one string"],
    why: "That length is exactly the last value of KMP's prefix function. s is a repetition iff p = n - lps[n - 1] is a proper divisor of n. The prefix function is filled left to right like a DP, but it's the KMP failure function specifically.",
  },
  {
    statement:
      "Given the head of a singly linked list, return the list in reverse order. You may not create new nodes or copy the values into an array; only rearrange the nodes you were given.",
    answer: "Linked List Pointer Manipulation",
    trap: "Two Pointers",
    signals: ["singly linked list", "reverse order", "no new nodes and no array, so the links themselves have to change"],
    why: "There's no back end to swap from, so walk front to back with prev and curr, saving curr.Next before pointing it at prev. Two pointers swapping from both ends needs an array's random access.",
  },
  {
    statement:
      "Given the head of a singly linked list and two positions left <= right, reverse only the nodes from position left to position right and return the head. Do it in one pass, leaving every node outside that range where it was.",
    answer: "Linked List Pointer Manipulation",
    trap: "Two Pointers",
    signals: ["reverse a piece of a linked list", "one pass", "the nodes before and after the range must be reconnected"],
    why: "Walk to the node before position left, reverse the next right - left + 1 nodes with the usual prev/curr/next loop, then reconnect both ends. It's careful rewiring of Next pointers, not a meeting of two pointers.",
  },
  {
    statement:
      "A singly linked list may have its last node pointing back to some earlier node instead of to null. Return the node where that loop begins, or null if there is no loop, using O(1) extra memory.",
    answer: "Fast & Slow Pointers",
    trap: "Hash Map",
    signals: ["a linked list that might loop", "WHERE the loop begins, not just whether there is one", "O(1) extra memory rules out a visited set"],
    why: "Move one pointer one step and another two steps until they meet inside the loop. Then restart one from the head and move both one step at a time: they meet exactly at the loop's entrance. A visited set finds it too, but costs O(n) memory.",
  },
  {
    statement:
      "An array of n + 1 integers contains only values from 1 to n, so at least one value appears more than once. Return a repeated value without modifying the array and using O(1) extra space.",
    answer: "Fast & Slow Pointers",
    trap: "Binary Search",
    signals: ["n + 1 values squeezed into the range 1..n", "can't modify the array", "O(1) extra space rules out a seen set"],
    why: "Treat each index i as a node whose next is nums[i]. Two indices pointing at the same value form a loop, and the loop's entrance is the duplicate, so Floyd's two phases find it in O(n). Binary searching the value range by counting also works but is O(n log n).",
  },
  {
    statement:
      "Given the head of a singly linked list and k, delete the k-th node counted from the END of the list and return the head. You may only walk the list once, and k can equal the list's length.",
    answer: "Two Pointers",
    trap: "Sliding Window",
    signals: ["position counted from the end of a singly linked list", "\"walk the list once\" rules out counting the length first", "the head itself might be the one deleted"],
    why: "Start two pointers on a dummy node before head, move one k + 1 steps ahead, then move both until the leader falls off the end. The follower is just before the node to delete. Nothing is being summed or tracked over a range, so it isn't a window problem.",
  },
  {
    statement:
      "Return the value of the k-th to last node in a singly linked list. You can scan the list only once and may use O(1) extra space.",
    answer: "Two Pointers",
    trap: "Hash Map",
    signals: ["\"k-th to last\"", "a single scan", "O(1) extra space rules out storing nodes by position"],
    why: "Give one pointer a k-node head start, then advance both together; when the leader reaches the end, the follower is k from the end. Storing every node by index in a map works but uses O(n) space.",
  },
  {
    statement:
      "Two singly linked lists of order IDs are each sorted ascending. Combine them into one sorted list by relinking the existing nodes, without creating any new ones, in time proportional to the total number of orders.",
    answer: "Linked List Pointer Manipulation",
    trap: "K-way Merge",
    signals: ["two linked lists, each already sorted", "one combined sorted list", "relink existing nodes, no new ones"],
    why: "Keep a dummy head and a tail pointer, attach whichever front node is smaller, and when one list runs out attach the rest of the other in one step. With only two inputs, one comparison picks the next node, so a heap of fronts adds nothing.",
  },
  {
    statement:
      "Two playlists are stored as singly linked lists, each sorted by track length. Splice them into a single list sorted by length. Memory is tight: you may not copy the tracks into an array or create new nodes.",
    answer: "Linked List Pointer Manipulation",
    trap: "Top-K with a Heap",
    signals: ["two sorted linked lists", "one sorted output", "no array copy and no new nodes"],
    why: "The next track in the result is always the shorter of the two current fronts, so splice it onto a tail pointer and move on: O(n + m) time, O(1) space. Pushing every track into a heap would cost O(n log n) and extra memory.",
  },
  {
    statement:
      "A build system has n modules, and each dependency pair [a, b] says module b must be built before module a. Before scheduling anything, report whether a full build is possible at all, or whether some modules depend on each other in a loop.",
    answer: "DFS",
    trap: "Union-Find",
    alsoAccept: ["Topological Sort"],
    signals: ["one-way dependencies between items", "only WHETHER it's possible, not an order", "\"depend on each other in a loop\" = a directed cycle"],
    why: "Treat dependencies as directed edges and look for a cycle: DFS with three states (unvisited, on the current path, done) reports a cycle the moment it reaches a node on its own path. Kahn's in-degree counting also works. Union-Find only detects cycles in undirected graphs.",
  },
  {
    statement:
      "A spreadsheet stores formulas that reference other cells. Before recalculating, the app must reject the sheet if any cell ends up depending on itself through a chain of references. Return whether the sheet is safe to evaluate.",
    answer: "DFS",
    trap: "BFS",
    signals: ["references go one way (A uses B)", "\"depends on itself through a chain\" = a cycle in a directed graph", "yes/no answer, no order required"],
    why: "Each reference is a directed edge. Run DFS from every cell, keeping track of the cells on the current path; reaching one of them again means a circular reference. A plain BFS with one visited set can't tell a cycle from two chains meeting at the same cell. Kahn's in-degree counting, which processes cells in a BFS-like queue, does detect it: if some cells never reach in-degree 0, there's a cycle.",
  },
  {
    statement:
      "A social network gives you one user object; each user holds a list of references to their friends (friendship is mutual, and the network is connected). Build an independent duplicate of the whole network for a test environment, with new user objects and the same friendships, sharing no object with the original.",
    answer: "Hash Map",
    trap: "Backtracking",
    alsoAccept: ["BFS", "DFS"],
    signals: ["duplicate a structure of objects that point at each other", "friendships form cycles", "no object may be shared with the original"],
    why: "Walk the network with BFS or DFS and keep a map from each original user to its duplicate. The map is the visited set and the way to find a user's copy when wiring friendships, so cycles never cause a user to be copied twice.",
  },
  {
    statement:
      "Each node of a linked list has a next pointer and an extra pointer that can point to any node in the list (or null). Return a deep copy of the list in which both kinds of pointer refer only to the new nodes.",
    answer: "Hash Map",
    trap: "Fast & Slow Pointers",
    signals: ["\"deep copy\"", "pointers that can lead to any node, including earlier ones", "the copy must point at copies, never originals"],
    why: "First pass: create a copy of every node and store original -> copy in a map. Second pass: set copy.next = map[node.next] and copy.extra = map[node.extra]. It is the same old-object-to-new-object map used for cloning a graph.",
  },
  {
    statement:
      "A combination lock shows four digits, each wheel turning one step up or down at a time (9 wraps to 0). Some combinations jam the lock and can't be passed through. Starting from 0000, what is the fewest number of single-wheel turns to reach the target code, or -1 if it can't be reached?",
    answer: "BFS",
    trap: "Dynamic Programming (1-D)",
    signals: ["\"fewest number of turns\" where every turn costs the same", "states (codes) with neighbours you generate yourself", "forbidden states to avoid"],
    why: "Each code is a node and each single-wheel turn an edge, but the graph is never given: generate the 8 neighbours of a code on the fly. BFS from 0000, skipping jammed codes, reaches the target first along a shortest sequence.",
  },
  {
    statement:
      "You have a start gene string, an end gene string, and a bank of valid genes, all 8 characters long over the letters A, C, G, T. One mutation changes a single character, and every gene along the way must be in the bank. Return the minimum number of mutations needed, or -1 if it is impossible.",
    answer: "BFS",
    trap: "DFS",
    signals: ["\"minimum number of mutations\", each costing one step", "one-character changes between strings", "every intermediate state must come from an allowed list"],
    why: "Genes are nodes and one mutation is an edge, so this is a shortest path in an unweighted, implicit graph. BFS finds the minimum; DFS can wander down a long chain of mutations first and doesn't guarantee the shortest.",
  },
  {
    statement:
      "n people have listed pairs of others they refuse to share a room with. There are exactly two dormitories. Decide whether everyone can be assigned to one of them so that no such pair ends up in the same dormitory.",
    answer: "BFS",
    trap: "Union-Find",
    alsoAccept: ["DFS"],
    signals: ["exactly TWO groups", "pairs that must be in DIFFERENT groups", "people may form several unrelated clusters"],
    why: "Each dislike is an edge, and the two dormitories are two colours. Colour any unassigned person, give every neighbour the opposite colour, and fail if an edge ends up with the same colour on both ends. Repeat from every uncoloured person. DFS works the same way, and Union-Find can do it too, but grouping connected people together (the usual Union-Find move) is the opposite of what is needed.",
  },
  {
    statement:
      "A tournament organiser has a list of match-ups between players and wants every match to be between a player from the Red league and a player from the Blue league. Given the players and match-ups, can the players be split into the two leagues so that this holds?",
    answer: "DFS",
    trap: "Greedy",
    alsoAccept: ["BFS"],
    signals: ["split into two sides", "every pair must cross between the sides", "the answer is yes or no"],
    why: "This is checking whether the match-up graph is bipartite. A traversal from every unassigned player gives each opponent the other league and stops at the first match-up with both players in the same league. BFS works equally well. Assigning players one by one without propagating the consequences can paint itself into a corner.",
  },
  {
    statement:
      "A warehouse robot stands on shelf 0 of a row. Each shelf is labelled with the most shelves the robot may move forward from it. Decide whether the robot can reach the last shelf.",
    answer: "Greedy",
    trap: "Dynamic Programming (1-D)",
    signals: ["the MOST it may move, so any shorter move is allowed too", "only yes or no, not the route", "one pass should do"],
    why: "Track the farthest shelf reachable so far; if the scan reaches a shelf beyond it, the robot is stuck. A DP over \"can I reach the end from i\" is correct but O(n^2), and the reachable shelves always form one unbroken block, so a single running maximum is enough.",
  },
  {
    statement:
      "Children each need a sticker of at least a certain size to be happy, and you have a pile of stickers of various sizes. Each child gets at most one sticker. Make as many children happy as possible.",
    answer: "Greedy",
    trap: "Dynamic Programming (0/1 Knapsack)",
    signals: ["two lists matched by a size comparison", "each item used at most once", "a bigger item can always stand in for a smaller one"],
    why: "Sort both lists and give each sticker, smallest first, to the least demanding child it satisfies. An exchange argument shows the smallest sticker that works is never a waste, so no DP is needed.",
  },
  {
    statement:
      "A sensor log contains every reading ID twice, because each reading is sent on two radios, except for one reading whose second copy was lost. Find that ID using constant extra memory.",
    answer: "Bit Manipulation",
    trap: "Hash Map",
    signals: ["everything appears twice except one", "constant extra memory", "pairs that should cancel"],
    why: "XOR all the IDs together: x ^ x = 0, so every pair cancels and only the lost one is left. A hash set finds it too, but needs O(n) memory.",
  },
  {
    statement:
      "A feature flag service stores, for each user, which of 12 optional features they have turned on. List every possible combination of features so a tester can try each one.",
    answer: "Bit Manipulation",
    trap: "Backtracking",
    signals: ["a small fixed number of yes/no choices", "every combination", "on/off flags per item"],
    why: "Each combination is a 12-bit number: count from 0 to 2^12 minus 1 and read bit i as feature i. Backtracking builds the same subsets and is also fine, but the bitmask is simpler and gives a compact key for each combination.",
  },
  {
    statement:
      "Count how many numbers below 5,000,000 have no divisors other than 1 and themselves. Checking each number separately is too slow.",
    answer: "Math (Number Theory)",
    trap: "Hash Map",
    signals: ["divisors and primes", "a whole range of numbers at once", "per-number checking is too slow"],
    why: "The Sieve of Eratosthenes crosses out multiples of each prime once, O(n log log n) for the whole range, instead of trial-dividing every number.",
  },
  {
    statement:
      "Compute 3 raised to the power 1,000,000,000, and return the answer modulo 1,000,000,007.",
    answer: "Math (Number Theory)",
    trap: "Dynamic Programming (1-D)",
    signals: ["a huge exponent", "\"modulo 1,000,000,007\"", "multiplying a billion times is too slow"],
    why: "Fast exponentiation squares the base once per bit of the exponent, about 30 squarings, taking the remainder after every multiply so the numbers stay small.",
  },
];
