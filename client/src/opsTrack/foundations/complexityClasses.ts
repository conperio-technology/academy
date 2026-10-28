import { type OpsLessonData } from "../types.ts";

export const complexityClasses: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Big O tells you how fast an algorithm is. Complexity classes ask a bigger question: how fast can any algorithm for this problem be? Some problems have fast solutions, some seem to need time that explodes exponentially, and some can't be solved by any program at all. Knowing the difference stops you hunting for a perfect fast algorithm that probably doesn't exist, and tells you when to reach for heuristics, approximations or a smaller version of the problem instead.",
        "In interviews this comes up as \"is this NP-hard?\", in the knapsack \"isn't that polynomial?\" trick question, and in why a scheduler or route planner uses a good-enough answer. This lesson keeps it informal: what P, NP, NP-complete and NP-hard mean, what a reduction is, and what undecidable means.",
      ],
    },
    {
      kind: "terms",
      title: "The classes, informally",
      terms: [
        { term: "Polynomial time", meaning: "running time bounded by n^k for some fixed k: O(n), O(n log n), O(n³). Treated as \"efficiently solvable\", because doubling the input multiplies the time by a constant, not squares it." },
        { term: "P", meaning: "yes or no problems that can be solved in polynomial time. Sorting-based questions, shortest paths with Dijkstra, \"is there a path from A to B\", and matching are in P." },
        { term: "NP", meaning: "yes or no problems where a proposed answer (a certificate) can be checked in polynomial time. Given a filled-in Sudoku, checking it is quick, even if finding it isn't. Every problem in P is also in NP." },
        { term: "NP-complete", meaning: "the hardest problems in NP: every NP problem can be translated into them in polynomial time. A fast algorithm for any one of them would give a fast algorithm for all of NP. SAT, 3-colouring, subset sum and the decision version of the travelling salesman are examples." },
        { term: "NP-hard", meaning: "at least as hard as NP-complete, but not necessarily in NP itself; optimization versions (find the shortest tour, not \"is there one shorter than k\") and problems that aren't yes or no are often NP-hard." },
        { term: "P versus NP", meaning: "the open question of whether P = NP: whether every problem whose answers are quick to check is also quick to solve. Most researchers believe P ≠ NP; nobody has proved it, and a proof is worth a million dollar Millennium Prize." },
        { term: "Undecidable", meaning: "no algorithm can answer the question correctly for every input, however much time it gets. The halting problem is the famous one." },
      ],
    },
    {
      kind: "text",
      title: "Reductions: how hardness is proved",
      paragraphs: [
        "A reduction turns any instance of problem A into an instance of problem B, quickly, so that the answers agree. If you can do that, B is at least as hard as A: a fast solver for B would solve A too. In everyday programming you reduce problems constantly (\"this scheduling question is really a shortest path in a graph\"), which is how you find an existing algorithm.",
        "Hardness proofs run the same machinery the other way. To show a new problem is NP-hard, reduce a known NP-complete problem to it. In interviews you rarely prove it, but recognising the shape matters: \"choose a subset to hit a target exactly\" smells of subset sum, \"visit every city once\" of the travelling salesman, \"assign colours so neighbours differ\" of graph colouring.",
      ],
    },
    {
      kind: "table",
      title: "Easy and hard problems that look alike",
      head: ["In P (fast)", "NP-hard (no known fast algorithm)"],
      rows: [
        ["Shortest path between two points", "Longest simple path; the shortest tour visiting every city (travelling salesman)"],
        ["Euler path: use every edge once", "Hamiltonian path: visit every vertex once"],
        ["Minimum spanning tree", "Steiner tree: connect only some required points as cheaply as possible"],
        ["2-colouring a graph (is it bipartite?)", "3-colouring a graph"],
        ["2-SAT: clauses of two variables", "3-SAT: clauses of three variables"],
        ["Fractional knapsack (greedy by value per weight)", "0/1 knapsack, subset sum, bin packing"],
      ],
      notes: ["A small change in the rules can move a problem from easy to hard. When an interview problem sounds like the right column, the expected answer is usually a backtracking search with pruning, a DP over a small dimension, or a greedy heuristic, not a polynomial algorithm."],
    },
    {
      kind: "text",
      title: "Pseudo-polynomial: why knapsack DP isn't a contradiction",
      paragraphs: [
        "The 0/1 knapsack DP runs in O(n · W) time, where W is the capacity. That looks polynomial, yet 0/1 knapsack is NP-complete. The catch is that complexity is measured against the size of the input in bits, and W takes only about log W bits to write down. Doubling the number of digits in W squares its value, so O(n · W) is exponential in the input's length. Algorithms like this are called pseudo-polynomial: fast while the numbers are small, hopeless when the capacity is 10^18.",
        "The same applies to subset sum, coin change and partition equal subset sum. In practice it's good news: real inputs often have small numbers, so the DP is perfectly usable.",
      ],
    },
    {
      kind: "steps",
      title: "What to do with an NP-hard problem",
      steps: [
        "Check the size: exponential algorithms are fine for small n. Bitmask DP handles about 20 items, backtracking with good pruning often more.",
        "Exploit structure: on trees, bipartite graphs, small capacities or bounded degree, many NP-hard problems become polynomial.",
        "Approximate: some problems have algorithms with a guaranteed ratio, such as a tour at most 1.5 times optimal for metric TSP (Christofides).",
        "Use heuristics: greedy choices, local search, simulated annealing or genetic algorithms find good answers with no guarantee; route planners and schedulers work this way.",
        "Hand it to a solver: SAT, constraint programming and integer linear programming solvers (OR-Tools, Gurobi, Z3) solve large real instances surprisingly well.",
      ],
    },
    {
      kind: "text",
      title: "Undecidable: the halting problem",
      paragraphs: [
        "Turing proved in 1936 that no program can decide, for every program and input, whether that program eventually stops. The argument is a contradiction: if halts(program, input) existed, build a program that calls halts on itself and then does the opposite (loops forever if told it halts, stops if told it loops). Neither answer can be right, so halts can't exist.",
        "Rice's theorem extends this to any non-trivial question about what a program does. That is why compilers and linters can't catch every infinite loop or every null dereference: they approximate, flagging some correct code and missing some bugs. It's also why the grader on this site stops a run after a timeout instead of predicting that it would never finish.",
      ],
    },
  ],
  quiz: [
    {
      question: "What does it mean for a problem to be in NP?",
      answer: "A proposed solution can be checked in polynomial time",
      distractors: ["It can't be solved in polynomial time", "It takes exponential time to check", "It is \"not polynomial\""],
      why: "NP stands for nondeterministic polynomial time, not \"not polynomial\". Everything in P is in NP too.",
    },
    {
      question: "Someone finds a polynomial-time algorithm for one NP-complete problem. What follows?",
      answer: "Every problem in NP can be solved in polynomial time: P = NP",
      distractors: ["Only that problem becomes easy", "All NP-hard problems, including undecidable ones, become easy", "Nothing, NP-complete problems are independent"],
      why: "Every NP problem reduces to any NP-complete problem in polynomial time, so a fast solver for one is a fast solver for all of NP.",
    },
    {
      question: "0/1 knapsack has an O(n · W) dynamic programming solution. Why is it still NP-complete?",
      answer: "W is a number whose size in bits is log W, so O(n · W) is exponential in the input length",
      distractors: ["The DP is wrong for some inputs", "O(n · W) isn't polynomial in n", "Knapsack isn't actually NP-complete"],
      why: "That is pseudo-polynomial time: polynomial in the value of W, exponential in the number of digits needed to write it.",
    },
    {
      question: "Which of these is NP-hard?",
      answer: "Finding the shortest route that visits every city once and returns home",
      distractors: ["Finding the shortest path between two cities", "Finding a minimum spanning tree", "Checking whether a graph is bipartite"],
      why: "That is the travelling salesman problem. The other three have well-known polynomial algorithms: Dijkstra, Kruskal or Prim, and BFS 2-colouring.",
    },
  ],
  pitfalls: [
    "Reading NP as \"not polynomial\"; it means quickly checkable.",
    "Spending an interview hunting for a polynomial solution to a problem that is NP-hard; say so, then give backtracking with pruning or a DP over the small dimension.",
    "Calling an O(n · W) knapsack solution polynomial without the pseudo-polynomial caveat.",
    "Confusing NP-hard with undecidable: NP-hard problems can be solved, just (as far as anyone knows) not quickly.",
  ],
  next: [
    { id: "big-o-notation", label: "Big O Notation: Time & Space Complexity" },
    { id: "knapsack-01", label: "0/1 Knapsack: The Shape Behind Subset-Sum Problems" },
    { id: "backtracking-n-queens", label: "Backtracking with Pruning: N-Queens" },
  ],
};
