# Conperio Academy

**Try it: https://conperio-technology.github.io/academy/** (the static build, no sign-up;
progress stays in your browser).

An app for learning computing from the ground up, from logic gates and electronics to data
structures and algorithms, system design, Linux, networking, security and PLCs: 243 lessons
with interactive widgets and 166 graded coding exercises in C# and Python, with visuals, a
built-in code editor, and progress that persists between sessions. It runs as a static site
or as a small server you host yourself. Third-party licences:
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Design decisions: [docs/adr/](docs/adr/README.md).

## Licence

MIT, see [LICENSE](LICENSE). Bundled third-party parts keep their own licences, listed in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Running it

Two processes, both local, no Docker/DB server needed:

```bash
# Terminal 1 — API (http://localhost:5095), creates server/progress.db on first run
cd server
dotnet run

# Terminal 2 — UI (http://localhost:5173)
cd client
npm install   # first time only
npm run dev
```

C# exercises are graded in your browser by default, by Roslyn running on .NET WebAssembly.
That runtime is built, not committed: run `./wasm-csharp/build.sh` once (about a minute, needs
only the .NET 10 SDK; `npm run build:csharp-wasm` from `client/` does the same) and again after
changing `wasm-csharp/` or `runner/CodePolicy.cs`. Without it everything still works: C# is
then graded by the server's runner, and the exercise page says so. A **Run on server**
checkbox next to "Run Tests" forces the server path. Details:
[wasm-csharp/README.md](wasm-csharp/README.md).

The UI (Vite) is bound to all network interfaces, so the app is also reachable from other
devices on the same LAN — `npm run dev`'s output prints the exact URLs (e.g.
`http://192.168.x.x:5173`), or use this machine's name (`http://your-computer-name:5173`).
If another device can't connect, check that the machine's firewall allows inbound TCP on
5173. Vite's host check is off (`server.allowedHosts: true`) so a hostname works as well as an
IP, and the server's CORS policy admits any origin on port 5173. Only 5173 needs to be
reachable: Vite forwards `/api` to the API on this machine, so the browser never calls
5095 itself (which also keeps Chrome's Private Network Access checks out of the way). The API
listens on `localhost:5095` only, so other machines can't submit code to it directly.

### As one container

```bash
docker build -t conperio-academy .
docker run -p 8080:8080 -v academy-data:/data conperio-academy
```

Then open http://localhost:8080 -- in the image the API serves the built client itself,
so it's one origin and one port. The image build also publishes the in-browser C# runtime
(a `csharp-wasm` build stage) and the API serves it brotli-compressed with long-lived caching.

### As a static site (no server, no database)

The same app also builds as plain files for static hosting: lesson content is exported from
the server's C# classes as JSON at build time, progress is kept in the browser (IndexedDB),
and C# is graded only in the browser. Decision and trade-offs:
[docs/adr/0010-static-hosting-mode.md](docs/adr/0010-static-hosting-mode.md).

```bash
./wasm-csharp/build.sh          # first, so C# can be graded (there is no server to fall back to)
cd client
npm run build:static            # client/dist-static/ (about 33 MB), works at / or under a subpath
npm run preview:static          # http://localhost:4173, or any static file server:
# mkdir -p /tmp/site && ln -s "$PWD/dist-static" /tmp/site/academy
# python3 -m http.server 5802 --directory /tmp/site   -> http://localhost:5802/academy/
```

`VITE_BASE=/academy/ npm run build:static` pins an absolute base path instead of the default
relative one. Lesson links use the URL hash (`#/two-sum`), so deep links and reloads work on
any static host. On the dashboard, **Your progress** exports and imports progress as a JSON
file, because it lives in that one browser: clearing site data or switching browsers loses
it. Pyodide (Python grading), sql.js and the Monaco editor still load from jsdelivr.
`node scripts/check-static.mjs --base <url>` (from `client/`) checks a served build end to end.

`client/dist-static/` works on any static host. The build writes `.nojekyll`, which GitHub
Pages needs to serve `csharp-wasm/_framework/`, and `THIRD_PARTY_NOTICES.txt`, which the
sidebar and the Linux lab link to.

### Publishing to GitHub Pages

The live site (https://conperio-technology.github.io/academy/) is served by GitHub Pages from
the `gh-pages` branch, which holds only build output
([docs/adr/0011](docs/adr/0011-static-site-on-github-pages.md)). It is updated by hand, and
**only with the owner's go**. From an up to date `master` checkout:

```bash
./wasm-csharp/build.sh
(cd client && npm ci && npm run build:static)   # then serve it and run check-static.mjs (above)
git fetch origin gh-pages
git worktree add -B gh-pages ../academy-gh-pages origin/gh-pages
cd ../academy-gh-pages
git rm -rq . && cp -a ../academy/client/dist-static/. .   # ../academy: your checkout
find . -name '*.br' -not -path './.git/*' -delete         # Pages doesn't use the .br copies
git add -A && git commit -m "Static site build from master $(git -C ../academy rev-parse --short HEAD)"
git push origin gh-pages                                  # Pages updates within a few minutes
cd - && git worktree remove ../academy-gh-pages
```

For the two-process dev setup above, open http://localhost:5173. Below a 768px viewport (a phone on the LAN, say) the
sidebar becomes a slide-out drawer instead of a permanent column — tap the ☰ button to
open it, tap the dimmed backdrop or pick a lesson to close it again.

The landing page is a dashboard: overall progress, a "next up" shortcut, one card per section
explaining what it's for, and a **Due for review** queue. Review is spaced repetition -- a lesson
you solved comes due after 1 day, and each time you re-solve it while due the gap grows (3, 7, 14,
then 30 days). Sidebar sections are collapsed by default and remember which you've opened.

Progress is per-user, but there's no real login: the server trusts whatever identity an
upstream reverse proxy already injected in a request header (`UserHeader` setting,
default `x-ms-client-principal-name`),
and falls back to a shared `"guest"` bucket when nothing set it, which is every local
or LAN run. The sidebar footer always shows whose progress you're looking at. See
[ADR 0006](docs/adr/0006-trusted-header-identity.md) for the design and why there's no
actual authentication here on purpose.

## Working on this repo with Claude

The repo is set up for [Claude Code](https://claude.com/claude-code):

- `CLAUDE.md` (root, plus `server/`, `client/`, `runner/`, `tools/linux-image/`): how the app is
  laid out, how to run and check it, the recipes for adding content, and what not to do.
- Skills in `.claude/skills/`: `/add-lesson` (a tool lesson, wired end to end),
  `/add-graded-exercise` (an exercise with tests, complexity answer and reference solutions),
  and `/verify`.
- `scripts/verify.sh`, which `/verify` runs (server mode; the static site has its own
  `client/scripts/check-static.mjs`, see "As a static site" above): builds both sides, runs the client check scripts,
  starts a throwaway API on port 5495, runs every reference solution through the C# and Python
  graders, and checks every lesson for horizontal overflow at 390px and 1300px. It needs
  Playwright with Chromium on `NODE_PATH` (it isn't a dependency of the app); see
  `client/scripts/playwright.mjs`.
- `.claude/agents/content-reviewer.md`: a reviewer for new lesson content.
- `.claude/settings.json`: a shared allowlist of the safe everyday commands (builds, check
  scripts, read-only git) so Claude asks fewer permission questions, and a deny list for
  destructive ones. Personal overrides go in `.claude/settings.local.json` (gitignored).

## Contributing

New to the team? Start with [docs/onboarding.md](docs/onboarding.md) (setup scripts for
Windows and Linux/macOS, and a first PR exercise). Then:
[CONTRIBUTING.md](CONTRIBUTING.md) (branches, PRs, checks, definition of done),
[docs/code-review.md](docs/code-review.md), [docs/ai-usage.md](docs/ai-usage.md) and the
decision records in [docs/adr/](docs/adr/README.md).

## What's here

Sidebar sections, in display order (`server/Content/SectionOrder.cs` controls this):

### Computer Fundamentals (leads — this is the lowest layer, hardware up)

- **Computer Architecture: CPU, RAM, Storage & the OS** — clickable component cards
  (Your Code → OS → CPU/RAM/Storage/Motherboard) plus a memory-hierarchy latency table
- **Logic Gates: AND, OR, XOR & Friends** — pick a gate, toggle inputs, watch the truth
  table highlight the current row live
- **Bits, Bytes & Number Bases** — toggle an 8-bit byte, see binary/hex/decimal update
  live, flip on two's complement to see signed negative numbers
- **Floating Point: IEEE-754** — type a decimal, see the actual sign/exponent/mantissa
  bits and the real stored float32 value (why `0.1` isn't exactly `0.1`)
- **Byte Order: Little vs Big Endian** — see the same 4 bytes land in opposite memory
  positions depending on ordering (this exists because the float calculator above
  actually shipped with an endianness bug during development)
- **Dynamic Arrays: How They Grow** — click `push()` and watch a simulated dynamic
  array's capacity double on demand, with a live "elements ever copied" / "avg copies
  per push" readout showing amortized O(1) stay bounded even though each resize is O(n)

Plus an **operating systems and runtimes** track, filling the OS and "how code runs" gaps
underneath Concurrency & Memory (which it links to rather than repeating):

- **CPU Scheduling: FCFS, SJF, Round Robin and Priority**: an editable workload (or the
  textbook, convoy and starvation presets) run through six algorithms, with a Gantt chart,
  per-process waiting, turnaround and response times, aging, and a side-by-side comparison
- **User Mode, Kernel Mode, System Calls and Interrupts**: step one File.ReadAllBytes across the
  user/kernel boundary (syscalls, a blocking read, the disk interrupt), then a "where does this
  run?" quiz including the vDSO and page-fault trick questions
- **What Happens When You Run a Program**: fork, exec, the dynamic linker, main, exit and
  reaping, with a lifecycle state diagram, in three variants (shell waits, zombie, orphan)
- **Compiled vs Interpreted: How C# and Python Run**: the same function through Roslyn, IL and
  tier 0/tier 1 JIT, through Native AOT, and through CPython's AST, bytecode and eval loop
- **Linkers, Libraries and Loading**: build a link line from object files and libraries and
  see the symbol table resolve, or fail with undefined reference, multiple definition, or the
  archive-order trap; static vs shared libraries
- **Text Encoding: ASCII, Unicode, UTF-8 and UTF-16**: type text and see code points, UTF-8 and
  UTF-16 bytes, the UTF-8 bit layout and surrogate math, three string lengths, three ways to
  reverse a string, and NFC vs NFD

### Programming in C# & Python

Learn to program in both languages at once, for anyone from "never written real code" to
interview prep. Built in stages: the **basics**, **intermediate**, **advanced** and **cheat
sheets** tracks. Lessons are data files in
`client/src/langTrack/` rendered by one component (`LangLesson.tsx`), with a switch for side by
side, C# only or Python only (remembered per browser).

- **Start Here: C# and Python Side by Side**: what each language is for, how code runs (IL and
  the JIT versus bytecode and an interpreter), static versus dynamic typing, braces versus
  indentation, plain-English definitions, and how the editor and language tabs work
- **Eight basics lessons**: Variables, Types and Expressions; Strings; Conditionals and Boolean
  Logic; Loops; Functions; Collections (with a Big O table); Errors and Exceptions (real stack
  traces from both languages); Classes and Objects. Each has side-by-side code, notes, pitfalls
  and 7 to 10 predict-the-output questions
- **Fourteen graded exercises** (`basics-*`), placed right after the lesson they practise, each
  in C# or Python: temperature conversion with rounding, count vowels, reverse words, letter
  grade, sum of evens, FizzBuzz, running total, first index, greeting with a default, word
  frequency, remove duplicates, values in both lists, add up the valid numbers, a Rectangle class
- **Eleven intermediate lessons**: Lambdas and Higher-Order Functions; LINQ and Comprehensions;
  Interfaces, Protocols and Abstract Classes; Generics and Type Hints; Iterators and Generators;
  Records, Dataclasses and Equality; Immutability, Values and References; Files, Formatting and
  Parsing; Async and Await Basics; Unit Testing with xUnit and pytest (samples run with real
  `dotnet test` and pytest); Modules, Namespaces and Packages. Each has 8 to 10 predict-the-output
  questions
- **Thirteen graded intermediate exercises** (`inter-*`), each right after its lesson: compose
  functions, sort by length then alphabetically, group words by length, filter-sort-pick
  passing names, shapes with an abstract base class, generic min and max, a generic stack class,
  chunks with `yield` (including an endless input), an endless Fibonacci generator, distinct
  points with a record or frozen dataclass, change a copy of a grid without touching the
  original, format a report line, and parse key=value settings. Async and test frameworks are
  taught but not graded: the C# runner's allowlist has no `System.Threading.Tasks`, and test
  frameworks can't run in the exercise editor
- **Eleven advanced lessons**: Memory, Allocations and Span<T>; Threads, Locks, the GIL and
  Parallelism; Async in Depth (cancellation, timeouts, async streams); Decorators, Context
  Managers and IDisposable; Dunder Methods, Operators and Reflection; Advanced Generics
  (constraints, variance, `Protocol`, mypy); Pattern Matching in Depth; Functional Style; Error
  Handling Patterns (custom exceptions, wrapping, result types, retries); Profiling and
  Benchmarking; Packaging and Project Structure. Each has 7 to 9 predict-the-output questions
- **Thirteen graded advanced exercises** (`adv-*`), each right after its lesson: sum fields
  with `ReadOnlySpan<char>`, clean-up order with `using` / `ExitStack`, a memoizing wrapper, a
  vector type with operators, an inclusive step range (a billion items, so it must be lazy), a
  generic total over `INumber<T>`, a command router with list patterns, a shipping rate with
  property patterns, run-length encoding of a lazy input, retry with capped backoff, a result
  type for parsing, a slow active-orders report to speed up (a 200,000 item test), and semantic
  version sorting. Threads, tasks and reflection are taught but not graded, because the C#
  runner's allowlist blocks them
- **Cheat sheets**: C#, Python, and a C# vs Python translation table, all from one data set
  (`cheatSheet.ts`): search, topic filters, copy buttons, Big O notes, and a print layout. Stage 2
  added `yield` and more LINQ, plus four topics: lambdas and generics, interfaces and equality,
  files and parsing, and async, tests and modules. Stage 3 added two topics: performance and
  concurrency, and advanced language features

Every code sample, predict-the-output answer and cheat-sheet snippet was run (Python 3 and a
compiled C# console program) to get the outputs shown.

### Interview Prep

- **Study Plan and Readiness**: a readiness view that shows, per area (coding, system design,
  object-oriented design, behavioral, CS foundations), four separate kinds of evidence with the
  source of each figure: coverage (opened, started, worked through), assisted practice (guided
  passes, passes soon after viewing the reference, self-ticked model-answer points), independent
  (bare passes with no reference, quiz and flash card recall) and timed (mixed interview set,
  mock rounds), plus a "focus next" list. The study plan adapts to three inputs: starting level
  (new to programming adds a prerequisites block; experienced turns warm-ups into optional
  checks), target (generalist, backend, senior and system design heavy, each with its own
  optional list, extra tasks and earlier design work) and hours per week, which sets the length.
  Each phase states its prerequisites, optional tasks are listed but not scheduled, and a slack
  week after every four (and one at the end) is reserved for failed attempts, revision and repeat
  mocks. It ticks itself off as you solve lessons, finish
  walk-throughs, write stories and run the pattern quiz. Plan content lives in `prepPlanData.ts`;
  drill, mixed-set, mock-round, pattern-quiz and worked-through history in `practiceHistory.ts`
  (browser only).
- **Two study paths**: the same tool now offers a picker between the FAANG interview plan above
  and a **Well-rounded IT & CS** path (also listed in Start Here as `it-cs-study-path`). That path
  is built from topic families in `studyPathData.ts` (fundamentals, programming, algorithms,
  operating systems, Linux, Windows, networking, security, industrial, databases, Git, cloud,
  system design, AI), each a list of lesson ids; ids the server doesn't have are skipped, so adding
  a lesson to a family adds it to the plan. Five phases over 8, 12, 16 or 24 weeks, plus subnetting
  drills and flash-card sessions. The FAANG plan keeps its `prep-plan` storage key; the new path
  uses `study-path:it-cs` and the chosen path `study-path:selected`.

### Concurrency & Memory

The foundations interviewers probe beneath the code. Every simulator is a deterministic React
state machine (no real threads), with C# examples throughout.

- **Threads vs Processes and the Scheduler**: what a process owns and what its threads share,
  then a round-robin scheduler with adjustable cores and time slice, I/O blocking and a
  context-switch count
- **Race Conditions: Why count++ Isn't Safe**: you play the scheduler, interleaving two threads'
  load, add and store to lose an update (18 of the 20 possible orders do), then add a lock
- **Locks, Mutexes, Semaphores and Atomics**: a comparison of lock, Mutex, SemaphoreSlim,
  Interlocked, ReaderWriterLockSlim and the concurrent collections, a SemaphoreSlim throttle
  you can watch, and a "which would you use?" drill
- **Deadlock: Two Locks, Opposite Order**: step two transfers into a deadlock, watch the
  wait-for graph form a cycle and the four Coffman conditions light up, then fix it with lock
  ordering or TryEnter with back-off; plus dining philosophers
- **Detect a Deadlock in a Wait-For Graph** (graded, C# and Python): return every thread that
  can never finish, in a cycle or stuck behind one, with Kahn's algorithm
- **Producer-Consumer: a Bounded Blocking Queue**: two producers and two consumers on one
  Monitor; replay the `if` instead of `while` crash and the `Pulse` lost wake-up, with Monitor,
  SemaphoreSlim and Channel versions of the code
- **async/await vs Threads**: 12 requests on a thread pool, blocking vs await, I/O-bound vs
  CPU-bound, and a step-through of what one await actually does
- **Stack vs Heap and Garbage Collection**: step a C# program through frames, struct copies
  and shared references, run mark and sweep at any point, and a toy generational heap
- **Virtual Memory, Paging and Cache Locality**: latency numbers scaled to human time, a
  cache-line simulator (row-major 16 misses vs column-major 64), and an address translator with a
  TLB, minor and major page faults, and a segfault

### Data Structures & Algorithms

Opens with **What Is an Algorithm?** — properties of an algorithm (input, output,
definite, finite, effective), pseudocode vs. code, and a "Try it" widget that traces
"Find the Largest of Three Numbers" as live-editable plain-English steps next to the
same logic as real code. Then **Big O Notation: Time & Space Complexity** — a
growth-rate chart, an n-slider with live operation counts, and the two reference tables
everyone ends up needing (data structure operations, sorting algorithms — both time and
space). Both sit above everything else here since they're prerequisite to the rest. Right after Big O
is **How to Analyze Time & Space Complexity** -- the skill of deriving a complexity from real code
(count the trips, price each trip, keep the biggest term), with a 13-snippet drill that explains
every answer in two steps instead of just grading it.
The complexity track then goes deeper, each lesson with its own interactive widget:
**Recursion, Recurrences and the Master Theorem** (a call tree drawn by running the recursion,
with per-level work sums, and a Master theorem calculator), **Amortized Analysis** (the cost of
every append under four growth policies, plus monotonic stack and sliding window tracers),
**What Is n?** (multiple variables, pseudo-polynomial bounds, output-sensitive bounds),
**Hidden Costs in Library Calls** (ten C# and Python traps side by side, predict then reveal),
**Space Complexity in Depth** (DFS stack versus BFS queue on three tree shapes) and **Explaining
Complexity Out Loud** (a seven-step template and weak versus strong answers). It ends with the
**Complexity Gym**: 144 C# and Python snippets in 15 categories, each asking for both time and
space, with Practice, Explain it (write your reasoning, then grade it against a rubric) and Stats
modes. The bank lives in `client/src/complexityGymData.ts`; `node scripts/check-complexity-gym.mjs`
(from `client/`) validates it.

Then Fundamentals (11 concepts) + Trees (6) + Graphs (4) + Sorting (5) + Dynamic
Programming (4) + a Patterns track (70) + Greedy (7), Math (6), Bits (7) and Range Queries (5):
125 gradable concepts in total, each with a
canned step-through visualizer, a "key takeaway" callout, a Monaco editor, and
test-driven completion tracking in SQLite (plus one reference Tool, Hashing, slotted
in right after Two Sum, and a Pattern Recognition Drill at the end of the section):

- Fundamentals: Array Traversal (Sum, Find Max), Array Reversal (two pointers), Linked
  List Traversal, Reverse a Doubly Linked List, Is Palindrome, Valid Parentheses
  (stack), Queues (FIFO, contrasted with the stack's LIFO), Two Sum (hash map),
  Factorial and Fibonacci (recursion — Fibonacci's branching two-call-per-call shape
  is the naive-exponential "before" the Dynamic Programming track memoizes it)
- Plus one reference Tool right here in the order: **Hashing: How a Hash Map Actually
  Works** — type a key, watch it hash into one of 8 buckets, chain on collision, and
  watch the whole table resize (capacity doubles, every key rehashes) once load
  factor crosses 0.75, the exact same amortized-cost shape as the Dynamic Arrays tool
  in Computer Fundamentals. Sits right after Two Sum, not at the end of the section,
  while hash maps are still fresh
- **Trees**: Binary Search Tree Insert/Search/Delete, Binary Tree Inorder Traversal
  (DFS), Binary Tree Level-Order Traversal (BFS) — a real node-and-edge tree diagram,
  positions computed purely from a level-order array index (same math a binary heap's
  array reuses), **Heap**: Push and Pop (sift-up/sift-down, reusing the Tree
  visualizer as-is since a binary heap is a tree with a different invariant than BST)
- **Graphs**: BFS Traversal and DFS Traversal — the same fixed 8-node sample graph
  (two cycles, one deliberately isolated node) and the same start-node test cases for
  both, so the same input visibly produces a different visit order depending on
  queue (BFS) vs. recursive-stack (DFS) exploration order. Plus **Dijkstra's Shortest
  Path** — a separate, smaller 6-node WEIGHTED sample graph (BFS/DFS's is unweighted
  and other concepts pin test cases to its exact shape), replacing BFS's queue with a
  priority queue ordered by current best-known distance and relaxing every edge as
  each closest node gets finalized; every node's live distance and every edge's weight
  render right on the graph
- Sorting: Bubble Sort, Insertion Sort, Selection Sort (the three classic O(n²) ones),
  Merge Two Sorted Arrays and Quick Sort Partition (the core primitives behind merge
  sort's and quicksort's O(n log n)) — backs up the sorting table on the Big O page with
  real, gradeable lessons instead of just reference data
- **Dynamic Programming**: Fibonacci with Memoization (top-down, reuses CallStack —
  directly paired against the plain-recursion Fibonacci above: same n, but repeat
  subtrees become instant `[cached]` frames) and Climbing Stairs (bottom-up
  tabulation, reuses Array — the identical recurrence solved as a left-to-right fill
  instead of top-down recursion, no call stack at all). Plus **Longest Increasing
  Subsequence** (dp[i] = best run ENDING at i, built from every smaller earlier dp[j])
  and **Interval DP: Longest Palindromic Substring** — the first two-dimensional DP
  state in the app (`dp[i][j]`, an interval, not a single index), where processing
  every substring shortest-to-longest matters as much as the recurrence itself
- Patterns (with recognition-signal / gotcha / confusable-pattern callouts on top of the
  usual explanation), grouped by underlying mechanism: Binary Search (Find a Target,
  Find First and Last Position), **Binary Search on Answer** (the Koko-eating-bananas
  problem — binary search over a candidate SPEED instead of an array index); Two
  Pointers (Two Sum on a *sorted* array), **Fast & Slow Pointers** (find a linked
  list's middle in one pass — watch a blue SLOW and amber FAST pointer visibly
  diverge down the same list), Sliding Window (max sum subarray of size k, then the
  variable-size version: longest substring without repeats),
  **Monotonic Stack** (find every element's next-greater value in one O(n) pass);
  **Prefix Sums** (answer a range-sum query in O(1) after an O(n) setup), **Merge
  Intervals** (sort by start, then one pass collapses every overlap); **Top-K
  Elements** (a min-heap capped at size k finds the K largest without a full sort —
  reuses the Heap visualizer); **Union-Find** (merge connected components edge by
  edge, watch the parent array update live), **Topological Sort** (order tasks by
  dependency with Kahn's algorithm, or detect an impossible cycle), **Minimum Spanning
  Tree** (Kruskal: edges cheapest-first, Union-Find skips the ones that close a loop,
  shown on the graph); **0/1 Knapsack**
  (the shape behind subset-sum and equal-partition problems — one descending loop is
  the entire difference from letting an item repeat), **Coin Change** (its unbounded
  sibling, filled upward), **Edit Distance** (the two-string 2-D table); **Trie**
  (prefix counts for autocomplete). The interview-depth batch adds Trapping Rain Water
  (two pointers), Sliding Window Maximum (monotonic deque), Min Stack and LRU Cache
  (design-a-class problems run as operation lists), Validate BST, Tree Diameter and
  Lowest Common Ancestor (LeetCode-style level-order tree inputs), Number of Islands and
  Rotting Oranges (grid DFS/BFS), House Robber and Stock with Cooldown (1-D and
  state-machine DP), Longest Common Subsequence, and Permutations, Word Search and
  N-Queens (backtracking) — the grid lessons use a new Grid visualizer; Backtracking (generate all
  subsets), Bit Manipulation (count set bits, cross-referencing Backtracking's
  bitmask subset trick). A gaps batch adds Merge k Sorted Lists (k-way merge) and Running
  Median (two heaps), Insert Interval, Meeting Rooms (sweep line) and Non-overlapping
  Intervals (greedy), Search in Rotated Sorted Array and Split Array Largest Sum (binary
  search on the answer), Group Anagrams, Minimum Window Substring and KMP string search. A lists and graphs batch adds
  Reverse a Linked List, Linked List Cycle II, Remove Nth Node From End and Merge Two Sorted Lists
  (pointer rewiring), Course Schedule, Clone Graph, Word Ladder and Is Graph Bipartite

- **Greedy, Math and Bits** (three tracks after Patterns, each opened by an explainer tool):
  **Greedy Algorithms** (break greedy coin change, interval rules that fail, fractional vs 0/1
  knapsack, an exchange-argument stepper, "greedy or not?") then Assign Cookies, Jump Game, Jump
  Game II, Gas Station, Partition Labels, Maximum Subarray (Kadane) and its transfer Maximum
  Product Subarray; **Math for Coding
  Interviews** (C# vs Python modulo and division, Euclid, a steppable sieve, square-and-multiply,
  overflow, nCr and Pascal's triangle) then Count Primes, Pow(x, n), GCD and LCM of an Array, Happy
  Number, Excel Column Title and Reverse Integer; **Bit Manipulation Toolkit** (two's complement,
  an operator playground with arithmetic vs logical shifts, the trick table, XOR, subset masks, a
  C# vs Python table) then Single Number, Missing Number, Power of Two, Counting Bits, Reverse Bits,
  Sum of Two Integers and All Subsets by Counting Bitmasks. Each graded lesson calls out where C#
  and Python differ (int overflow, negative %, >> vs >>>, unbounded Python ints)

- **Pattern Recognition Drill**: 87 plain-English problem statements and no code editor: pick
  the technique, then see the signal phrases that gave it away and the sibling technique it's
  most often confused with. The end screen lists what you missed and can re-drill only those

- **Mixed Interview Set** -- random graded problems (54 of them, from Patterns, Graphs and DP) with
  the title, explanation, visualizer, TODO hints and reference solution hidden, on a 25, 30 or
  45 minute clock. You name the technique before the editor opens, solve against the lesson's
  real tests (a pass counts as lesson progress), and the summary links back to each lesson.
  The neutral statements and bare starters live in `mixedSetData.ts`

Every practice lesson also has two optional extras: **Interview mode** (a 20-minute timer, a
seven-step interview checklist, and a notepad for your plan -- notes stay in your browser) and a
**Name the complexity** check under the editor that reveals the standard solution's time and
space with the reasoning. Under the editor, a **Reference solution** (C# and Python, one file
each in `server/Content/Solutions/`) unlocks once you pass, or after three runs -- or straight
away with a deliberate "Stuck? Show it anyway" click.

**Guided or bare.** Above the editor of every DSA exercise a switch picks the starter: guided
(the step-by-step TODO comments) or bare (signature and return stub only, derived from the
guided starter by `client/src/bareStarter.ts`, with the mixed set's hand-written signatures as
overrides). Each pass is recorded on the server as assisted (guided, or the reference solution
opened in the previous 7 days) or independent (bare, no recent reference), and passes inside the
mixed set also as timed (`ProgressEntry` columns added through `Data/SchemaUpgrade.cs`). The
Programming in C# & Python exercises stay guided-only, since their TODOs state the task.

**Transfer exercises** follow an existing lesson with a changed requirement or an unfamiliar
problem, and end with an "explain why the same idea works" prompt. Each names its parent in
`TransferOf`, and the parent links to it under "Next: transfer problem": Copy a List with Random
Pointers (after Clone a Graph), Count Subarrays That Sum to K (after Two Sum), 3Sum (after sorted
Two Sum), Largest Island Area (after Number of Islands), House Robber on a Circular Street,
Intersect Two Interval Lists (after Merge Intervals), K Closest Points (after Top-K), Longest
Repeating Character Replacement (after Longest Substring Without Repeats), Find the Minimum of a
Rotated Sorted Array (after Search a Rotated Sorted Array), Subsets When the Input Has Duplicates
(after Generate All Subsets), Network Delay Time (after Dijkstra), Fewest Semesters to Finish
Every Course (after Topological Sort), Replace Words with Their Shortest Root (after Trie: Prefix
Search), Daily Temperatures (after Next Greater Element), Redundant Connection (after Count
Connected Components), Kth Smallest Value in a BST (after Validate a BST), Coin Change II (after
Coin Change), Reverse Part of a Linked List (after Reverse a Singly Linked List) and Maximum
Product Subarray (after Kadane's Maximum Subarray).

Seven visualizer kinds: Array, LinkedList, Stack, HashMap, CallStack, Tree, and Graph.
CallStack is a literal trace of real recursive push/pop execution (see
`Content/Concepts/RecursionFactorial.cs` — the steps come from *instrumenting the
actual recursive calls*, not a canned animation), which is why the same renderer works
unmodified for linear recursion (factorial), branching recursion (backtracking,
Fibonacci), and memoized recursion (cache hits render as instantly-returning frames).
Tree is an SVG node-and-edge diagram whose layout comes entirely from a node's index in
a level-order array (`2i+1`/`2i+2` for left/right children) — no separate layout
algorithm to keep in sync with the data, and the same encoding a binary heap reuses.
Graph is a fixed hand-laid-out SVG diagram (both node positions and edges are static,
not derived from the data) that colors each node by visited/frontier/current state as
BFS's queue or DFS's recursion stack moves through the same fixed sample graph.

Every lesson works in **C#** (executed server-side via Roslyn) and **Python** (executed
client-side via Pyodide/WASM, no install needed) with a tab switcher between them.
Progress can be reset per-lesson or entirely from the sidebar.

### Software Design & OOP

A different axis from DSA — not "what's the algorithm," but "how do you structure the
code around it." All of them are reference Tools (no code editor, since these are conceptual
and not gradable):

- **OOP Basics: Classes, Objects, and Polymorphism** — the same "shape area" problem
  solved procedurally vs. with OOP; toggle "add a Triangle shape" and watch the
  procedural version need an edit inside existing code while the OOP version only adds
  a brand-new, untouched class
- **Interfaces & Abstraction** — pick an animal (Dog/Cat/Duck/Cow); the same one-line
  calling code runs unchanged for all of them, and the explanation points at this app's
  own `IConcept`/`ITool` as a live example of the same idea
- **Services & Dependency Injection** — toggle between a real and a fake notification
  service; the exact same `OrderProcessor` class and calling code works with either,
  because the dependency is handed in, not constructed internally
- **A Few Design Patterns Worth Knowing** — Strategy, Factory, Observer, and Singleton,
  three of which cite a real example already living in this app (Sorting concepts,
  a React `onClick` handler, `ConceptRegistry`). It stays the short intro and links
  into the track below

The **design patterns** track follows the OOP basics, aimed at big-tech interview prep:

- **SOLID Principles**: each of the five as the smell you would spot in review, a
  violating C# snippet, the refactored version, a real .NET or in-app example and the
  interview angle
- **Creational, Structural and Behavioral Patterns**: three browsable lessons covering
  Factory Method, Abstract Factory, Builder, Singleton (and why DI usually replaces it),
  Prototype; Adapter, Decorator, Facade, Proxy, Composite; Strategy, Observer, Command,
  State, Template Method, Iterator and Chain of Responsibility. Each pattern has its
  intent, when to use it and when not to, a text structure diagram, idiomatic C#, where
  it already lives in .NET or this app (middleware, `IEnumerable`, Stream wrappers,
  `DbContext`), the interview angle and the sibling it is confused with
- **Which Pattern Is This?**: 30 scenarios and snippets in the Pattern Recognition
  Drill's format: pick the pattern, see the signals and the commonly confused sibling,
  and finish on a list of misses that links to the right lesson. Content lives in
  `designPatternsData.ts` and `designPatternQuizData.ts`

Then the "object-oriented design" track: the "design the classes for X" interview round.

- **Design a Parking Lot / Elevator System / Vending Machine / Movie Ticket Booking System /
  Deck of Cards and Blackjack (OOD)**: seven-stage, 45-minute low-level design walk-throughs
  (requirements and use cases, core objects, relationships with a class diagram, key interfaces
  and methods, patterns and trade-offs, walking a scenario, extensions), with C# model answers.
  Same write-first, compare, tick-the-checklist format as the system design walk-throughs.
  Content lives in `oodInterviews.ts`

### Professional Dev Skills

Job-readiness skills a working dev needs regardless of language — a different axis
again from DSA or OOP. Started with SQL; Git and (lower-priority) Postman/API testing
are planned next. All three are reference Tools, each with a real interactive
playground rather than a static explanation:

- **SQL Basics: SELECT, WHERE, ORDER BY, LIMIT** — the logical execution order
  (FROM → WHERE → ORDER BY → LIMIT → SELECT) vs. the order you type clauses in, with a
  real query editor running against a real in-browser SQLite database
- **SQL Joins: Combining Tables** — normalization, INNER JOIN mechanics, the ON clause
  as a matching rule
- **SQL Aggregation: GROUP BY, COUNT, SUM, AVG** — aggregate functions, how GROUP BY
  turns "one number" into "one number per bucket," and HAVING vs. WHERE
- **Schema Design: Keys, Constraints & Normalization** — the same orders stored flat vs.
  normalized, with a live update anomaly; then one button per constraint (PRIMARY KEY, UNIQUE,
  NOT NULL, FOREIGN KEY, CHECK) that tries a violating statement and shows the real error
- **SQL Indexes & Query Plans** — a 200,000-row orders table generated in the browser; toggle
  indexes, run presets, and compare `EXPLAIN QUERY PLAN` (SCAN vs. SEARCH) and measured
  timings, including composite-index column order, functions defeating an index, and the
  write cost of every extra index
- **SQL Transactions & ACID** — a two-UPDATE bank transfer with optional BEGIN/COMMIT and an
  optional crash between the statements, with the bank's total balance watched live; a
  `CHECK (balance >= 0)` rejects overdrafts

The first three share one canned `employees`/`departments` dataset (10 employees, 3
departments) and run entirely client-side via **sql.js** (WASM SQLite, loaded lazily
from a CDN the same way Pyodide is) — nothing typed here touches this app's real
backend or database, and the "reset data" button rebuilds a fresh in-memory database
from the same seed at any time.

Plus a **git** track, same treatment, no embedded real-git engine (nothing as
lightweight as sql.js/Pyodide exists for that) — both widgets simulate the underlying
model directly:

- **Git Basics: Working Directory, Staging, and Commits** — edit a file, `git add` it,
  `git commit` it, and watch it move between three live panels (Working Directory /
  Staging Area / Repository) exactly like a real repo
- **Git Branching & Merging** — an SVG commit graph: create a branch, commit on it,
  switch back, and merge, watching the graph actually fork into two lanes and rejoin at
  a two-parent merge commit
- **Git in a Team: Pull Requests, Reviews and Merge Strategies**: remotes, fetch vs pull, the
  life of a pull request, and merge commit vs squash vs rebase on the same branch, replayed from
  real git runs, plus a push rejected because a teammate pushed first

And a **testing** track, an interview topic and a day-to-day skill, with C# xUnit examples:

- **The Test Pyramid: Unit, Integration and End-to-End**: shape a suite with sliders and watch
  serial run time and the chance of a red build for no reason, a "which level is this test?"
  quiz, and AAA, theory, WebApplicationFactory and Playwright examples
- **Test Doubles: Stubs, Mocks, Fakes and Spies**: one OrderService with each kind of double
  (Moq and NSubstitute), state vs interaction checks, and a "which test double is this?" quiz
- **TDD, What to Test, Flaky Tests and Coverage**: a red-green-refactor stepper whose tests
  really run, a coverage vs mutation-testing demo where 100% coverage still ships a boundary
  bug, and flaky-test causes with fixes

And **Engineering with AI Assistants** (working with AI): what assistants are good and bad at,
reviewing generated diffs, testing, debugging when the AI is wrong, secrets, and when to write it
yourself, with a code review of a generated change containing seven planted problems and eight
"what would you do?" situations.

### Linux & the Command Line

A real Linux machine boots inside the page (the v86 x86 emulator running a tiny kernel and a
BusyBox userland, about 2 MB total), wired to a terminal. Each lesson is a list of tasks that
tick off as you complete them; a hidden second serial port lets the page set up each lesson and
check your work. Restart machine boots a fresh one. The image is built by
`tools/linux-image/build.sh` (see its README).

- **Files and Folders** — pwd, ls, cd, mkdir, cp, mv, rm, find, wildcards
- **Users and Permissions** — reading `ls -l`, chmod (letters and numbers), groups and chgrp
- **Pipes, Redirection and Searching Logs** — grep, wc, sort, uniq, awk, `>` and `>>`, against
  a generated web-app log
- **Processes and Signals** — ps, background jobs, kill and signals, nice/renice

Eight administration lessons share one data-driven renderer (`client/src/opsTrack/`, rendered by
`OpsLesson.tsx`), with a simulator, a quiz and pitfalls each, and a VM lab where BusyBox allows:

- **Shell Scripts: Variables, Quoting and Conditionals** and **Loops, Functions, Exit Codes and
  set -euo pipefail** (two VM labs; word-splitting and strict-mode explorers built from
  real bash 5.2 captures)
- **Text Processing: grep, sed, awk, cut, sort, uniq and xargs** (VM lab and a toolbox of real outputs)
- **systemd Services and journalctl**, **Package Management: apt, dnf and Repositories**,
  **Scheduling with cron and systemd Timers** (a cron expression explainer), **SSH and Keys**,
  **Disks, Filesystems and Logs** (VM lab and a full-disk incident)

Every bash sample with output was run on Ubuntu 24.04; systemctl and journalctl output is written
from the documented format and marked as typical output.

### Windows & PowerShell

Same renderer, nine lessons. Windows can't run here, so PowerShell and Windows output is written
against the documentation and marked as typical output in the page.

- **Windows for IT: Processes, Services and the Registry** (Service Control Manager simulator)
- **Event Viewer and Windows Logs** (a night's events to filter, with Get-WinEvent built live)
- **NTFS Permissions, Inheritance and Shares** (effective access calculator, share vs NTFS)
- **PowerShell: Objects in the Pipeline**, **Cmdlets: Verb-Noun, Get-Help and Get-Member**,
  **Scripting, Remoting and Execution Policy**
- **Active Directory: Domains, OUs, Users and Groups** (directory explorer and AGDLP chain) and
  **Group Policy, Kerberos, NTLM and DNS** (GPO precedence simulator, Kerberos and NTLM walkthroughs)
- **Bash vs PowerShell Side by Side** (a searchable phrasebook)

### Networking

- **The OSI & TCP/IP Models: How Network Layers Stack** — click through the 7 OSI
  layers grouped under the 4 TCP/IP layers they actually map to, each with its data
  unit (bits/frames/packets/segments/data) and example protocols
- **IP Addressing & Subnetting** — enter an IP + CIDR prefix, get network/broadcast
  address, usable host range, and the binary network/host bit split
- **TCP vs UDP: Reliable vs Fire-and-Forget** — send messages over each protocol and
  simulate a dropped packet: watch TCP notice and automatically retransmit while UDP
  silently loses it with no idea it happened
- **DNS & HTTP: From a URL to a Web Page** — step through the full chain behind
  loading a page: DNS cache check → DNS lookup → TCP handshake → TLS handshake →
  HTTP request → HTTP response → parse-and-repeat for every extra resource

Ten more lessons, in the tracks "local networks", "routing", "firewalls & VPNs" and
"troubleshooting". Command output in them was captured from a real Linux network-namespace lab
(anything that couldn't be captured is labelled illustrative), and the subnet math in
`client/src/netMath.ts` was checked against Python's `ipaddress` module.

- **Subnetting Practice: Unlimited Drills**: randomized questions (network, broadcast, host range,
  host count, mask, which prefix fits, same subnet, address kind, splitting) at three difficulties,
  each with the block-size working shown, and per-topic accuracy saved in the browser. The IP
  calculator also gained correct /31 and /32 handling, an address-kind readout and a subnet splitter
- **MAC Addresses, ARP and Switches**, **VLANs**, **DHCP**, **Wi-Fi Basics**
- **Routing and Default Gateways** (longest prefix match), **NAT and Port Forwarding**
- **Firewalls and Ports**, **VPNs and Tunnels**
- **Network Troubleshooting Toolkit**: six broken-network tickets solved by running ping, ip,
  nslookup, traceroute, curl and ss and reading their real output

### System Design

Interactive models of the building blocks, then full interview walk-throughs.

- **Back-of-the-Envelope Estimation** — QPS, storage and bandwidth calculator with the
  arithmetic shown, plus the latency numbers every engineer should know
- **Load Balancing** — round robin, random, least connections and power of two choices on
  mixed-cost traffic; kill servers with and without health checks
- **Caching** — cache-aside hit rates under LRU/LFU/random eviction and skewed popularity,
  invalidation and staleness, and cache stampedes vs. request coalescing
- **CDNs and Edge Caching**: a Cache-Control header builder that explains what the browser and the
  CDN will do, a seeded model of 4 PoPs with TTL, cache-key and origin-shield settings, and three
  ways to ship a changed file
- **Replication and Sharding** — replication lag and read-after-write, failover losing
  unreplicated writes, shard keys, hot shards, and how much data moves when you add a shard
- **Consistent Hashing** — a hash ring with virtual nodes, keys moved vs. mod-N hashing, and
  replica placement
- **Message Queues** — a live queue absorbing spikes, redelivery after a consumer crash,
  idempotent consumers, and a dead-letter queue
- **Distributed Async Systems: Streams, Outbox and Sagas**: a Kafka-style topic with partitions,
  a consumer group you can crash (duplicates vs lost messages by commit timing) and a second group
  that replays; dual write vs transactional outbox with crash points; an order saga with
  compensations, orchestrated or choreographed
- **Rate Limiting** — fixed window, sliding log, sliding counter and token bucket on the
  same traffic, including the fixed-window boundary burst
- **CAP and Consistency** — a partition between two datacenters in CP and AP modes, and a
  quorum (N, W, R) calculator
- **Scaling and reliability** track: **Tail Latency and Request Hedging** (percentiles, fan-out
  turning 1% slow calls into 63% slow requests, hedged and tied requests with the extra load they
  cost); **Timeouts, Retries, Circuit Breakers and Load Shedding** (a retry storm simulator where
  backoff, jitter, retry budgets, a circuit breaker, deadline dropping and a bounded queue each
  change the outcome, a synchronized-retry jitter demo, and a bulkhead calculator using Little's
  law); **Observability and SLOs** (error budget and burn-rate calculator with the SRE Workbook
  alert thresholds, three traces to diagnose, and a RED vs USE sort); **Scale It Yourself** (a
  seeded traffic simulator: add a load balancer and app servers, CDN, cache, read replicas, a
  queue with workers, a rate limiter and timeouts, then watch latency percentiles, errors,
  per-tier saturation and cost through seven guided scenarios and a sandbox). The models live in
  `client/src/scaleLabModel.ts` and `client/src/resilienceModel.ts`
- **Design a URL Shortener / News Feed / Chat App / Rate Limiter / Key-Value Store / Web
  Crawler / Notification System / Video Streaming Service / Ride-Sharing Service / Distributed Job
  Scheduler / Payment System** — seven-stage, 45-minute interview
  walk-throughs: write your answer, then compare with a model answer and a checklist

### Cloud & DevOps

After System Design: where those building blocks run, and how code gets there.

- **Cloud Fundamentals**: IaaS, PaaS and SaaS, a shared responsibility explorer, and a zones and
  regions failure simulator
- **Container Images and Registries**: tags vs digests simulator, this repo's multi-stage Dockerfile
- **Kubernetes in Practice**: label selectors and readiness, probes, requests and limits, pod statuses
- **CI/CD Pipelines**: a GitHub Actions workflow (passes actionlint) and a pipeline simulator
- **Infrastructure as Code: Terraform and Bicep**: real Terraform 1.9.8 plans for create, update,
  replace, drift and rename; the Azure examples pass `terraform validate` and `bicep build`
- **Observability**: an alert you tune on a latency graph, a trace waterfall and the matching logs,
  real jq queries over JSON logs

### AI & Machine Learning

How the AI tools engineers use every day work, for people who use them but never studied ML.
Every demo is deterministic client-side React; nothing calls a real model.

- **Machine Learning Basics**: supervised, unsupervised and reinforcement learning, features and
  labels, training vs inference, and train/validation/test splits; a polynomial curve fit where
  raising the degree visibly overfits (training error falls, validation error climbs), with a
  regularisation toggle and a "which kind of learning?" drill
- **Neural Networks and Gradient Descent**: a single neuron with four activation functions,
  gradient descent on a one-weight loss curve with a learning-rate slider (crawls, settles,
  gets stuck in a local minimum, bounces, diverges), and an epochs and batches calculator
- **Tokens and Embeddings**: a toy byte-pair-encoding tokenizer trained in the browser with a
  merges slider and token counts, and cosine similarity over hand-placed 2-D embeddings
- **Transformers and Self-Attention**: an attention heatmap (illustrative weights) comparing
  causal and bidirectional attention on "the robot couldn't lift the box because it was too
  heavy/weak", a next-token loop, and a context window that drops old messages
- **How an LLM Is Trained**: pretraining, instruction tuning, preference training (RLHF, DPO) and
  deployment as clickable stages, plus a bigram language model that generates fluent sentences
  that are not in its training data
- **Using LLMs Well**: temperature and top-p over a toy distribution with seeded draws, a tool-use
  loop step-through, and a RAG retriever over a mini manual (word-overlap scoring, top-k, the
  assembled prompt)
- **Risks and Limits**: a "can I paste this?" drill, a prompt-injection scenario with mitigations,
  a cost and latency calculator, and where ML fits on a plant floor, linking to Safety &
  Redundancy
- **AI Glossary Quiz**: the Glossary's Term Quiz fixed to its new "AI and machine learning" topic
  (44 terms)

### Behavioral Interviews

- **STAR Answers: What Interviewers Listen For** — three common questions, each with a weak answer
  (reveal what's wrong with it) and a strong one split into Situation, Task, Action, Result and
  Learning, with a note on why each part works
- **Your Story Bank** — write your own stories in STAR form, tag the competencies each shows, and see
  which of the twelve common themes have no story yet. Saved in the browser; copy all as text
- **Behavioral Mock Round** — 3 or 5 questions in general, Amazon (Leadership Principles), Google or
  Meta style, a per-answer timer, pick-your-story, what the interviewer listens for, likely
  follow-ups, and a self-check rubric with a summary of what you miss most. Content lives in
  `behavioralData.ts`

### Glossary

- **Glossary of Industry Terms**: about 1,000 terms across fourteen topics (DSA, system design, databases,
  data and analytics, networking, web and APIs, Linux and operating systems, security, cloud and DevOps,
  IT operations and Windows, software engineering, industrial automation, AI and machine learning, and
  interviews and career), each with a one or two sentence definition, related terms you can jump to,
  and a link to the lesson that covers it. Search by name or definition, filter by topic
- **Flash Cards**: pick topics, flip from term to definition or the reverse, and mark Got it or Not
  yet. Leitner boxes (due after 1, 2, 4, 8 and 16 days) saved in the browser under `glossary:cards`
- **Term Quiz**: 10 multiple-choice questions, term to definition, definition to term or mixed, with
  wrong answers from the same topic; ends with your score and the definitions of every miss.
  Content lives in `glossaryData.ts`; `node scripts/check-glossary.mjs` (from `client/`) checks it

### Security

- **Authentication vs. Authorization** — follow a request through the ingress login and the
  app's rules, including a forged identity header and the network policy that stops it
- **Hashing vs. Encryption (and Storing Passwords)** — the browser's real Web Crypto: SHA-256's
  avalanche effect, AES-GCM with the right and wrong key, and a stolen password table stored
  plain, as SHA-256, and as salted PBKDF2
- **HTTPS, TLS & Certificates** — the browser's three certificate checks against a sample chain,
  with expired, wrong-host, self-signed and missing-intermediate cases
- **SQL Injection** — log in to a real sql.js database with string-built SQL, then with a
  parameterized query
- **Cross-Site Scripting (XSS)** — post comments into a sandboxed "victim's page", with and
  without escaping
- **The OWASP Top 10, in Plain English**: both the 2021 and 2025 editions, with examples, fixes
  and a "which category is it?" quiz
- **Broken Access Control: IDOR, CSRF and SSRF**, **Insecure Deserialization and Security
  Misconfiguration**, **Secrets Management and Least Privilege**
- **Threat Modeling with STRIDE**: a data-flow diagram to find threats on
- **Passwords, MFA and Password Managers**, **Phishing and Social Engineering**
- **Incident Response, Logging and Monitoring**: write a detection rule against a log, then a
  ransomware tabletop exercise
- **OT/ICS Security: the Purdue Model and Segmentation**: place plant systems on the levels and
  decide which flows the zone firewalls allow

### Industrial & Embedded Systems

- **PLCs: How They're Different From a Normal Computer** — the scan cycle (read
  inputs → execute the whole program → write outputs → housekeeping → repeat,
  forever) vs. an OS's preemptive multitasking; a live scan-cycle stepper you can
  run continuously and watch loop with a completed-scans counter
- **Ladder Logic: Reading Rungs** — a real two-rail rung diagram; toggle contacts and
  watch the wire path light up live as series (AND), parallel (OR), and
  normally-closed (NOT) contacts energize (or don't) their coils
- **Digital vs. Analog I/O** — flip a digital switch to see the single bit it
  produces, or drag a 4-20mA slider and watch it scale into an engineering value —
  drop below 4mA and watch it flag a FAULT instead of a false reading
- **PLC Memory Addressing** — pick a region (I/Q/M/T/C), a slot, and a bit; the
  composed address and its plain-English meaning update live
- **Industrial Networking: Modbus & Deterministic Polling** — poll sample holding
  registers and watch a request/response log show the master always initiating,
  the slave only ever responding, and raw integers getting scaled into real units
- **Safety & Redundancy** — toggle system power to see an "energize-to-run" motor and
  an "energize-to-release" brake both land safe despite opposite ON/OFF states, and
  toggle a primary controller's health to watch a standby take over

Plus a hands-on **PLC programming** track (IEC 61131-3, vendor-neutral), taught in Structured
Text with the equivalent ladder alongside and run in an in-browser scan-cycle simulator
(`client/src/plc/`: an ST interpreter with the standard timers, counters and edge detectors, a
simulated clock, steppable read/execute/write phases, a live ladder view and a timing chart):

- **Nine lessons**: the IEC 61131-3 languages; the scan cycle in practice (statement order, last
  write wins, one-scan pulses); contacts, coils and the start/stop seal-in with a normally closed
  stop; timers (TON, TOF, TP); edge detection; counters (CTU, CTD, CTUD); state machines with CASE
  (a simulated tank sequence and a conveyor sorter); analog scaling and alarms with deadband; good
  practice, interlocks, fail-safe design and where a standard PLC must not be used for safety
- **Ten graded exercises**, placed after the lesson they practise: write ST in the editor, and
  the grader drives scripted inputs over simulated time, checks the outputs on every scan, and
  shows the failing step on a timing chart. Attempts and passes are kept in the browser.
  `node scripts/check-plc-st.mjs` (from `client/`) checks the interpreter and every exercise.
- **Micro850 labs** (track "micro850 labs", after the exercises): eleven step-by-step guides for
  the team's Allen-Bradley Micro850 controllers in Connected Components Workbench (CCW), from the
  kit and bench safety through first connection, I/O and forcing, the seal-in in ladder and ST,
  timers and counters, a state machine, a user-defined function block, optional analog scaling,
  Modbus TCP with a pymodbus script, and troubleshooting. Each has objectives, a wiring table,
  numbered steps with expected results, a "check yourself" list kept in the browser, common
  mistakes, a stretch task, instructor notes and the matching simulator exercise for anyone
  without a unit. 24 V DC training boards only; mains wiring is out of scope.

## Architecture

- `server/` — ASP.NET Core minimal API.
  - `Content/Concepts/` — one file per practice concept, each implementing `IConcept`
    (explanation, starter code per language, test cases, visualization steps). Adding a
    concept means adding a file here and listing it in `ConceptRegistry.cs` — nothing
    else changes.
  - `Content/Tools/` — one file per reference/calculator lesson, each implementing
    `ITool`. Deliberately a separate interface from `IConcept` — no code editor, no test
    cases, no completion tracking, since "used the calculator" isn't pass/fail. See
    `server/Content/ITool.cs`.
  - `Content/SectionOrder.cs` + the `Order` property on both interfaces — control which
    Section leads, and which item leads within its section, independently.
  - `Execution/CSharpExecutor.cs`: the fallback C# grader (C# normally runs in the
    browser, see `wasm-csharp/` below): runs submitted C# against a concept's test cases in a
    separate, short-lived `runner` process per submission (see below), comparing results
    as parsed JSON (so it works for `int`, `int[]`, nested lists, etc., not just one
    return shape). The child is killed on a per-test timeout, gets a capped GC heap, and
    at most 4 run at once (`Runner` settings in `RunnerOptions`).
  - `Content/ComplexityCatalog.cs` — canonical time/space complexity (plus accepted alternatives
    and a reason) for every concept, behind the "Name the complexity" check.
  - `Data/` — EF Core + SQLite progress store, one row per (user, concept, language)
    attempted, plus the spaced-repetition rung and next-review date. `Data/SchemaUpgrade.cs` adds
    columns to an existing database in place (the app uses `EnsureCreated`, not migrations).
    `UserId` comes from `Program.cs`'s `CurrentUserId()`, never
    authenticated by this app itself (see [ADR 0006](docs/adr/0006-trusted-header-identity.md)).
- `runner/` — the sandboxed C# runner (Roslyn scripting). `CodePolicy.cs` rejects any
  code that reaches outside plain computation (files, network, processes, reflection,
  threads, `dynamic`, `#r`) before it runs, using Roslyn's semantic model against a
  namespace allowlist. An infinite loop, stack overflow, or runaway allocation only ever
  takes down the runner, never the API.
- `wasm-csharp/`: the default C# grader, the same compile (Roslyn) and the same
  `CodePolicy.cs`, published for the .NET WebAssembly runtime and run in a Web Worker in the
  learner's browser (`client/src/csharpWasmWorker.ts` / `csharpWasmRunner.ts`), with a 5 s
  per-test timeout that terminates the worker. It also answers the C# editor's autocomplete
  and its live error squiggles.
  `build.sh` publishes it into `client/public/csharp-wasm/` (gitignored). See its README.
- `client/` — React + TypeScript + Vite.
  - `useStepScrubber.ts` + `ScrubberControls.tsx` — the generic play/pause/step
    machinery every visualizer sits on top of.
  - `ArrayVisualizer.tsx` / `LinkedListVisualizer.tsx` / `StackVisualizer.tsx` /
    `HashMapVisualizer.tsx` / `CallStackVisualizer.tsx` / `TreeVisualizer.tsx` /
    `GraphVisualizer.tsx` — picked at runtime by the lesson's `visualizerKind`.
  - `components/tools/` — one component per `ToolKind` (the folder has them all; early ones
    include BigOChart, LogicGates,
    ComputerArchitecture, DynamicArrayGrowth, PlcScanCycle, LadderLogicBasics,
    DigitalAnalogIo, PlcMemoryAddressing, IndustrialNetworking, PlcSafetyRedundancy,
    OopBasics, InterfacesAbstraction, ServicesDependencyInjection,
    CommonDesignPatterns, SolidPrinciples, DesignPatternCatalog (one component for the
    three pattern family lessons), DesignPatternQuiz, NetworkLayers, TcpVsUdp, DnsHttpTrace, HashTableSim,
    BitCalculator, FloatCalculator, EndiannessCalculator, IpSubnetCalculator,
    ComplexityAnalysis, PatternDrill (its questions live in `patternDrillData.ts`),
    MixedSet (its problem pool lives in `mixedSetData.ts`), PrepPlan, SqlBasics,
    SqlJoins, SqlAggregation — the SQL three all thin wrappers around one
    shared `SqlPlayground.tsx` engine — plus GitBasics and GitBranching, both
    self-contained React-state simulations with no execution engine underneath).
  - `sqljsLoader.ts` — lazy CDN loader for sql.js (WASM SQLite), same pattern as
    `pyodideLoader.ts`. `sqlSampleData.ts` — the one shared employees/departments
    dataset reused by all three SQL tools.
  - `CSharpRunner.tsx` / `PythonRunner.tsx` / `LanguageRunner.tsx` — the editor + test
    runner per language, and the tab switcher between them. `CSharpRunner` grades in the
    browser (`csharpWasmRunner.ts`), falls back to `POST /api/execute/csharp` when the
    runtime can't load, and offers a "Run on server" switch. `PythonRunner` runs entirely
    in-browser, in a Web Worker (`pythonWorker.ts`, loading Pyodide via
    `pyodideLoader.ts`) with fresh globals per test and a 5 s per-test timeout that
    terminates the worker, and reports results to `POST /api/progress/record` (there's
    no server round trip for Python execution).

## Next up

All of Phase 2's original DSA gaps (Trees, Heap, Hashing, Graphs, Dynamic Programming),
the full PLC/Industrial track, the Software Design & OOP section's first four lessons,
nine more Patterns (fast/slow pointers, prefix sums, merge intervals, top-K/heap,
monotonic stack, binary search on answer, union-find, 0/1 knapsack, topological sort),
the SQL & Databases and Git tracks (Professional Dev Skills, a new top-level section),
the DP/Graph coverage gaps (LIS, interval DP, Dijkstra), and the learning loop around
them (spaced-repetition review queue, the complexity-analysis lesson and per-lesson
complexity check, the pattern-recognition drill, interview mode, a dashboard, and
collapsible navigation) are now done. Still open: an AI-generated practice-problem feature (blocked on an API
key/cost decision and on defining a minimal admin role).
