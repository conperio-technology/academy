import type { Technique } from "./patternDrillData";

// The problem pool for the Mixed Interview Set. Each entry points at an existing graded
// lesson (same tests, same runner) but supplies what the lesson itself gives away: a
// statement that doesn't name the technique, and, where the lesson's starter code hints
// at the approach through its helpers, a bare signature to start from instead. Entries
// without a `starter` override get the lesson's own starter with its comments stripped.
//
// `technique` is the answer the reveal shows; `alsoAccept` lists other approaches that
// are genuinely fine for this problem, so naming one of them still counts as a good call.

export type Difficulty = "easy" | "medium" | "hard";

export interface MixedProblem {
  lessonId: string;
  difficulty: Difficulty;
  statement: string;
  technique: Technique;
  alsoAccept?: Technique[];
  starter?: { csharp: string; python: string };
}

export const MIXED_PROBLEMS: MixedProblem[] = [
  {
    lessonId: "hashmap-two-sum",
    difficulty: "easy",
    statement:
      "Given an unsorted array of integers nums and a target, return the indices [i, j] (i < j) of the two numbers that add up to the target. Exactly one pair works, and you can't use the same element twice.",
    technique: "Hash Map",
  },
  {
    lessonId: "binary-search-array",
    difficulty: "easy",
    statement:
      "nums is sorted in ascending order and has no duplicates. Return the index of target, or -1 if it isn't there. Your solution has to beat a linear scan.",
    technique: "Binary Search",
  },
  {
    lessonId: "binary-search-range",
    difficulty: "medium",
    statement:
      "nums is sorted in ascending order and may contain repeats. Return [first, last]: the first and last index where target appears, or [-1, -1] if it doesn't appear. Aim for O(log n) even when the target repeats thousands of times.",
    technique: "Binary Search",
  },
  {
    lessonId: "binary-search-on-answer",
    difficulty: "medium",
    statement:
      "Koko has piles of bananas (piles[i] bananas in pile i) and h hours before the guards return. Each hour she picks one pile and eats up to k bananas from it; if the pile has fewer than k she finishes it and waits out the hour. Return the smallest whole number k that lets her finish every pile within h hours. h is at least the number of piles.",
    technique: "Binary Search on the Answer",
  },
  {
    lessonId: "two-pointers-sorted-two-sum",
    difficulty: "easy",
    statement:
      "nums is sorted in ascending order. Return the indices [i, j] (i < j) of the two numbers that add up to target, using O(1) extra space. Exactly one pair works.",
    technique: "Two Pointers",
    alsoAccept: ["Binary Search"],
  },
  {
    lessonId: "two-pointers-trapping-rain-water",
    difficulty: "hard",
    statement:
      "height[i] is the height of a bar of width 1 in an elevation map. After it rains, how many units of water are trapped between the bars? Water above a bar can only stay there if there are taller bars somewhere on both sides of it.",
    technique: "Two Pointers",
    alsoAccept: ["Prefix Sums", "Monotonic Stack"],
  },
  {
    lessonId: "fast-slow-pointers-middle",
    difficulty: "easy",
    statement:
      "You get the head of a singly linked list (you don't know its length). Return the value of the middle node. With an even number of nodes, return the second of the two middle ones. Do it in one pass.",
    technique: "Fast & Slow Pointers",
  },
  {
    lessonId: "sliding-window-max-sum",
    difficulty: "easy",
    statement:
      "Given an array of integers nums and a number k, return the largest sum of any k consecutive elements. Avoid re-adding all k numbers for every starting position.",
    technique: "Sliding Window",
    alsoAccept: ["Prefix Sums"],
  },
  {
    lessonId: "sliding-window-longest-unique",
    difficulty: "medium",
    statement:
      "Given a string s, return the length of the longest stretch of consecutive characters in which no character appears twice.",
    technique: "Sliding Window",
  },
  {
    lessonId: "monotonic-stack-next-greater",
    difficulty: "medium",
    statement:
      "For each element of nums, find the first element to its right that is strictly larger. Return those values as an array, with -1 where nothing to the right is larger. The checker expects better than O(n²).",
    technique: "Monotonic Stack",
  },
  {
    lessonId: "sliding-window-maximum",
    difficulty: "hard",
    statement:
      "A window of size k slides across nums from the left end to the right end, one position at a time. Return the maximum inside the window at each position (n - k + 1 values). Aim for O(n) overall.",
    technique: "Monotonic Deque",
    alsoAccept: ["Top-K with a Heap"],
    starter: {
      csharp:
        "public class Solution\n{\n    public static int[] MaxSlidingWindow(int[] nums, int k)\n    {\n        return new int[0];\n    }\n}\n",
      python: "def max_sliding_window(nums, k):\n    return []\n",
    },
  },
  {
    lessonId: "prefix-sums-range-query",
    difficulty: "easy",
    statement:
      "In production this function is called millions of times against the same array, so whatever it does to nums up front can be reused. Return the sum of nums[left..right], both ends included. Explain how each call after the first would be O(1).",
    technique: "Prefix Sums",
  },
  {
    lessonId: "merge-intervals",
    difficulty: "medium",
    statement:
      "You get a list of meetings as [start, end] pairs, in no particular order. Combine every group of meetings that overlap (touching at an endpoint counts) and return the combined blocks sorted by start time.",
    technique: "Merge Intervals",
  },
  {
    lessonId: "top-k-heap",
    difficulty: "medium",
    statement:
      "Return the k largest values in nums, in ascending order. nums might be a stream far too big to sort, so think about what you need to keep in memory while you read it.",
    technique: "Top-K with a Heap",
  },
  {
    lessonId: "design-min-stack",
    difficulty: "medium",
    statement:
      "Design a stack with push(val), pop(), top() and getMin(), where every one of the four operations runs in O(1), including getMin, which returns the smallest value currently in the stack. pop, top and getMin are only called on a non-empty stack. The tests drive your class with a list of operation names and their arguments.",
    technique: "Augmented Stack",
  },
  {
    lessonId: "design-lru-cache",
    difficulty: "hard",
    statement:
      "Design a cache with a fixed capacity. get(key) returns the value, or -1 if the key is missing. put(key, value) inserts or updates a key. When an insert would exceed the capacity, evict the key that was used (read or written) longest ago. Both operations must be O(1), and in Python don't use OrderedDict. The tests build the cache with a capacity, then drive it with a list of operations.",
    technique: "Hash Map + Doubly Linked List",
    starter: {
      csharp:
        "public class LRUCache\n{\n    public LRUCache(int capacity)\n    {\n    }\n\n    public int Get(int key)\n    {\n        return -1;\n    }\n\n    public void Put(int key, int value)\n    {\n    }\n}\n",
      python:
        "class LRUCache:\n    def __init__(self, capacity):\n        pass\n\n    def get(self, key):\n        return -1\n\n    def put(self, key, value):\n        pass\n",
    },
  },
  {
    lessonId: "tree-validate-bst",
    difficulty: "medium",
    statement:
      "Given the root of a binary tree, return whether it is a valid binary search tree: for every node, every value in its left subtree is strictly smaller and every value in its right subtree is strictly larger. Values can be anywhere in the int range. Tests write the tree level by level, with null for a missing child.",
    technique: "DFS",
    alsoAccept: ["BFS"],
    starter: {
      csharp:
        "public class Solution\n{\n    public static bool IsValidBst(TreeNode? root)\n    {\n        return false;\n    }\n}\n",
      python: "def is_valid_bst(root):\n    return False\n",
    },
  },
  {
    lessonId: "tree-diameter",
    difficulty: "medium",
    statement:
      "Given the root of a binary tree, return the number of edges on the longest path between any two nodes. The path doesn't have to pass through the root. Tests write the tree level by level, with null for a missing child.",
    technique: "DFS",
    starter: {
      csharp:
        "public class Solution\n{\n    public static int DiameterOfBinaryTree(TreeNode? root)\n    {\n        return 0;\n    }\n}\n",
      python: "def diameter_of_binary_tree(root):\n    return 0\n",
    },
  },
  {
    lessonId: "tree-lowest-common-ancestor",
    difficulty: "medium",
    statement:
      "Given the root of a binary tree (not a search tree) and two values p and q that are both in it, return the value of the deepest node that has both p and q in its subtree. A node counts as being in its own subtree. Tests write the tree level by level, with null for a missing child.",
    technique: "DFS",
    starter: {
      csharp:
        "public class Solution\n{\n    public static int LowestCommonAncestor(TreeNode? root, int p, int q)\n    {\n        return -1;\n    }\n}\n",
      python: "def lowest_common_ancestor(root, p, q):\n    return -1\n",
    },
  },
  {
    lessonId: "union-find-components",
    difficulty: "medium",
    statement:
      "There are n computers numbered 0 to n - 1, and edges lists the cables between pairs of them. Return how many separate networks there are, where computers in the same network can reach each other through any chain of cables.",
    technique: "Union-Find",
    alsoAccept: ["DFS", "BFS"],
  },
  {
    lessonId: "grid-number-of-islands",
    difficulty: "medium",
    statement:
      "You get a map as a 2-D grid of 1s (land) and 0s (water). Land cells that touch up, down, left or right belong to the same island; diagonal doesn't count. Return the number of islands.",
    technique: "DFS",
    alsoAccept: ["BFS", "Union-Find"],
  },
  {
    lessonId: "grid-rotting-oranges",
    difficulty: "medium",
    statement:
      "Each cell of a grid is 0 (empty), 1 (fresh orange) or 2 (rotten orange). Every minute, each fresh orange next to a rotten one (up, down, left, right) turns rotten. Return the number of minutes until no fresh orange is left, or -1 if some never rot.",
    technique: "BFS",
  },
  {
    lessonId: "dp-climbing-stairs",
    difficulty: "easy",
    statement:
      "A staircase has n steps and you can climb 1 or 2 steps at a time. In how many different ways can you reach the top? n can be large enough that trying every sequence of moves is far too slow.",
    technique: "Dynamic Programming (1-D)",
  },
  {
    lessonId: "dp-house-robber",
    difficulty: "medium",
    statement:
      "Houses along a street hold nums[i] in cash. You can rob any set of houses except two that are next to each other, which would trip the alarm. Return the most cash you can take.",
    technique: "Dynamic Programming (1-D)",
  },
  {
    lessonId: "dp-longest-increasing-subsequence",
    difficulty: "medium",
    statement:
      "Return the length of the longest subsequence of nums (elements in their original order, but not necessarily next to each other) in which every element is strictly larger than the one before.",
    technique: "Dynamic Programming (1-D)",
    alsoAccept: ["Binary Search"],
  },
  {
    lessonId: "dp-stock-cooldown",
    difficulty: "medium",
    statement:
      "prices[i] is a stock's price on day i. You can buy and sell as many times as you like, but you can hold at most one share at a time, and after selling you must wait one full day before buying again. Return the maximum profit.",
    technique: "Dynamic Programming (State Machine)",
  },
  {
    lessonId: "dp-coin-change",
    difficulty: "medium",
    statement:
      "Given coin denominations (you have unlimited coins of each) and an amount, return the fewest coins that add up to exactly the amount, or -1 if it can't be done. Picking the biggest coin first doesn't always work.",
    technique: "Dynamic Programming (Unbounded Knapsack)",
    alsoAccept: ["BFS", "Dynamic Programming (1-D)"],
  },
  {
    lessonId: "dp-longest-common-subsequence",
    difficulty: "medium",
    statement:
      "Given two strings a and b, return the length of the longest sequence of characters that appears in both, in the same order but not necessarily next to each other.",
    technique: "Dynamic Programming (2-D, two sequences)",
  },
  {
    lessonId: "dp-edit-distance",
    difficulty: "hard",
    statement:
      "Return the minimum number of single-character edits (insert one character, delete one, or replace one) needed to turn string a into string b.",
    technique: "Dynamic Programming (2-D, two sequences)",
  },
  {
    lessonId: "dp-longest-palindromic-substring",
    difficulty: "medium",
    statement:
      "Return the length of the longest stretch of consecutive characters in s that reads the same forwards and backwards.",
    technique: "Interval DP",
    alsoAccept: ["Two Pointers"],
  },
  {
    lessonId: "trie-prefix-count",
    difficulty: "medium",
    statement:
      "An autocomplete service has a list of words. For each query string in prefixes, return how many of the words start with it. Assume there are a lot of words and a lot of queries, so re-scanning every word for every query is too slow.",
    technique: "Trie",
    alsoAccept: ["Hash Map"],
    starter: {
      csharp:
        "public class Solution\n{\n    public static int[] CountPrefixes(string[] words, string[] prefixes)\n    {\n        return new int[prefixes.Length];\n    }\n}\n",
      python: "def count_prefixes(words, prefixes):\n    return [0] * len(prefixes)\n",
    },
  },
  {
    lessonId: "backtracking-subsets",
    difficulty: "medium",
    statement:
      "Given an array of distinct integers, return every possible subset, the empty one included, in any order (for [1, 2, 3] that's 8 subsets).",
    technique: "Backtracking",
    alsoAccept: ["Bit Manipulation"],
    starter: {
      csharp:
        "public class Solution\n{\n    public static List<List<int>> Subsets(int[] nums)\n    {\n        return new List<List<int>>();\n    }\n}\n",
      python: "def subsets(nums):\n    return []\n",
    },
  },
  {
    lessonId: "backtracking-permutations",
    difficulty: "medium",
    statement:
      "Given an array of distinct integers, return every ordering of them, in lexicographic order of positions (for [1, 2, 3]: [1, 2, 3], [1, 3, 2], [2, 1, 3], and so on).",
    technique: "Backtracking",
    starter: {
      csharp:
        "public class Solution\n{\n    public static List<List<int>> Permute(int[] nums)\n    {\n        return new List<List<int>>();\n    }\n}\n",
      python: "def permute(nums):\n    return []\n",
    },
  },
  {
    lessonId: "backtracking-word-search",
    difficulty: "medium",
    statement:
      "board is a grid of letters, given as one string per row. Return whether word can be spelled by a path of cells that each touch the previous one up, down, left or right, without using any cell twice.",
    technique: "Backtracking",
    alsoAccept: ["DFS"],
  },
  {
    lessonId: "backtracking-n-queens",
    difficulty: "hard",
    statement:
      "Return how many ways there are to place n chess queens on an n × n board so that no two attack each other (no shared row, column or diagonal).",
    technique: "Backtracking",
  },
  {
    lessonId: "bit-manipulation-count-set-bits",
    difficulty: "easy",
    statement:
      "Given a non-negative integer n, return how many 1s appear in its binary representation, without converting it to a string.",
    technique: "Bit Manipulation",
  },
  {
    lessonId: "heap-merge-k-sorted",
    difficulty: "medium",
    statement:
      "You get k arrays of integers, each sorted in ascending order (some may be empty). Return one array with every value from all of them, sorted ascending. Aim for better than O(n log n) when k is much smaller than the total number of values n.",
    technique: "K-way Merge",
    starter: {
      csharp:
        "public class Solution\n{\n    public static int[] MergeKSorted(int[][] lists)\n    {\n        return new int[0];\n    }\n}\n",
      python: "def merge_k_sorted(lists):\n    return []\n",
    },
  },
  {
    lessonId: "heap-running-median",
    difficulty: "hard",
    statement:
      "Integers arrive one at a time, given here as an array in arrival order. After each arrival, record the median of all values received so far (the average of the two middle values when the count is even). Return the list of medians. Each arrival should cost O(log n).",
    technique: "Two Heaps",
    starter: {
      csharp:
        "public class Solution\n{\n    public static double[] RunningMedian(int[] stream)\n    {\n        return new double[0];\n    }\n}\n",
      python: "def running_median(stream):\n    return []\n",
    },
  },
  {
    lessonId: "intervals-insert",
    difficulty: "medium",
    statement:
      "intervals is a list of [start, end] pairs sorted by start, and no two of them overlap. Add newInterval to the list so that it is still sorted and non-overlapping, combining any intervals that now overlap (touching at an endpoint counts). Do it in O(n).",
    technique: "Merge Intervals",
  },
  {
    lessonId: "intervals-meeting-rooms",
    difficulty: "medium",
    statement:
      "Each meeting is a [start, end) pair: a meeting ending at time t leaves its room free for one starting at t. Return the smallest number of rooms needed so that no two meetings in the same room overlap.",
    technique: "Sweep Line",
    alsoAccept: ["Top-K with a Heap"],
  },
  {
    lessonId: "intervals-non-overlapping",
    difficulty: "medium",
    statement:
      "Given a list of [start, end] intervals, return the smallest number of them you must delete so that none of the remaining intervals overlap. Intervals that only share an endpoint, like [1, 2] and [2, 3], do not overlap.",
    technique: "Greedy",
  },
  {
    lessonId: "binary-search-rotated",
    difficulty: "medium",
    statement:
      "nums was sorted in ascending order (all values distinct) and then rotated at an unknown index, for example [4, 5, 6, 7, 0, 1, 2]. Return the index of target in nums, or -1 if it isn't there. Your solution must run in O(log n).",
    technique: "Binary Search",
  },
  {
    lessonId: "binary-search-split-array",
    difficulty: "hard",
    statement:
      "Given an array of non-negative integers nums and an integer k (1 <= k <= nums.length), split nums into k non-empty contiguous subarrays so that the largest subarray sum is as small as possible. Return that largest sum.",
    technique: "Binary Search on the Answer",
  },
  {
    lessonId: "string-group-anagrams",
    difficulty: "medium",
    statement:
      "Given an array of lowercase words, group together the words that use exactly the same letters with the same counts, and return the groups. The order of the groups and of the words within each group doesn't matter.",
    technique: "Hash Map",
  },
  {
    lessonId: "string-min-window",
    difficulty: "hard",
    statement:
      "Given strings s and t (t non-empty), return the shortest substring of s that contains every character of t, including repeats. If there is none, return \"\". If several shortest substrings exist, return the leftmost one. Aim for time linear in the lengths of s and t.",
    technique: "Sliding Window",
  },
  {
    lessonId: "string-kmp-search",
    difficulty: "hard",
    statement:
      "Given a text and a non-empty pattern, return every index where the pattern starts in the text, in increasing order, including overlapping occurrences. It must run in O(n + m) in the worst case, even for inputs like a text of 2,000 a's followed by a b and a pattern of 1,000 a's followed by a b.",
    technique: "String Matching (KMP)",
  },  {
    lessonId: "linked-list-reverse",
    difficulty: "easy",
    statement:
      "You get the head of a singly linked list. Return the head of the same list in reverse order. Rearrange the existing nodes rather than creating new ones, and use O(1) extra space.",
    technique: "Linked List Pointer Manipulation",
  },
  {
    lessonId: "linked-list-cycle-start",
    difficulty: "medium",
    statement:
      "You get the head of a singly linked list whose last node may point back to an earlier node instead of to null. Return the node where that loop begins, or null if the list ends normally. Values can repeat, so return the node itself, and use O(1) extra space. (The tests build the list from an array and the index the tail links back to, -1 for none; your function only receives the head.)",
    technique: "Fast & Slow Pointers",
  },
  {
    lessonId: "linked-list-remove-nth",
    difficulty: "medium",
    statement:
      "You get the head of a singly linked list and an integer n between 1 and the list's length. Remove the n-th node counted from the end (n = 1 is the last node) and return the head of the result. Make only one pass over the list.",
    technique: "Two Pointers",
    alsoAccept: ["Fast & Slow Pointers"],
  },
  {
    lessonId: "linked-list-merge-sorted",
    difficulty: "easy",
    statement:
      "You get the heads of two singly linked lists, each sorted in ascending order (either may be empty). Return the head of one sorted list made of all their nodes, relinking the existing nodes instead of creating new ones, in O(n + m) time.",
    technique: "Linked List Pointer Manipulation",
  },
  {
    lessonId: "graph-course-schedule",
    difficulty: "medium",
    statement:
      "There are numCourses courses, numbered 0 to numCourses - 1. Each pair [a, b] in prerequisites means course b has to be taken before course a. Return true if it is possible to take every course, false otherwise. A pair like [3, 3] means a course requires itself.",
    technique: "DFS",
    alsoAccept: ["Topological Sort"],
  },
  {
    lessonId: "graph-clone",
    difficulty: "medium",
    statement:
      "You get one node of a connected undirected graph (or null for an empty graph). Each Node has an int value (Val / val) and a list of neighbouring nodes (Neighbors / neighbors), and node i has value i. Return a deep copy: a new Node for every node, connected the same way with each neighbour list in its original order, and no Node object shared with the input. The tests write the graph as an adjacency list, build the nodes for you, and pass in node 0.",
    technique: "BFS",
    alsoAccept: ["DFS", "Hash Map"],
    starter: {
      csharp:
        "public class Solution\n{\n    // Node: public int Val; public List<Node> Neighbors;\n    public static Node? CloneGraph(Node? node)\n    {\n        return null;\n    }\n}\n",
      python: "# Node: node.val, node.neighbors\ndef clone_graph(node):\n    return None\n",
    },
  },
  {
    lessonId: "graph-word-ladder",
    difficulty: "hard",
    statement:
      "Given beginWord, endWord and a list of words, all the same length and lowercase, find the length of the shortest sequence of words that starts at beginWord and ends at endWord, where each word differs from the previous one in exactly one letter and every word after beginWord is in the list. The length counts both ends (hit, hot is 2). Return 0 if there is no such sequence. The list can hold thousands of words, so comparing every pair of words is too slow.",
    technique: "BFS",
  },
  {
    lessonId: "graph-bipartite",
    difficulty: "medium",
    statement:
      "graph is an undirected graph with n nodes given as an adjacency list: graph[i] lists the neighbours of node i, with no self-loops or repeated edges. The graph may be disconnected. Return true if the nodes can be split into two sets so that every edge connects a node in one set to a node in the other.",
    technique: "BFS",
    alsoAccept: ["DFS", "Union-Find"],
  },
  {
    lessonId: "sliding-window-char-replacement",
    difficulty: "medium",
    statement:
      "s is a string of uppercase letters. You may change any character into any other uppercase letter, at most k times in total. Return the length of the longest stretch of one repeated letter you can end up with.",
    technique: "Sliding Window",
  },
  {
    lessonId: "binary-search-rotated-min",
    difficulty: "medium",
    statement:
      "nums held distinct integers in ascending order, then was rotated at an unknown point (possibly not at all), so it might look like [4, 5, 6, 7, 0, 1, 2]. Return its smallest value. The checker expects O(log n).",
    technique: "Binary Search",
  },
  {
    lessonId: "backtracking-subsets-with-duplicates",
    difficulty: "medium",
    statement:
      "Given an array of integers that may contain repeats, return every distinct subset, the empty one included, in any order. Two subsets with the same values count once: [1, 2, 2] has 6 distinct subsets, not 8.",
    technique: "Backtracking",
    starter: {
      csharp:
        "public class Solution\n{\n    public static List<List<int>> SubsetsWithDup(int[] nums)\n    {\n        return new List<List<int>>();\n    }\n}\n",
      python: "def subsets_with_dup(nums):\n    return []\n",
    },
  },
  {
    lessonId: "graph-network-delay-time",
    difficulty: "medium",
    statement:
      "A network has n nodes numbered 0 to n - 1. times[i] = [u, v, w] means a message sent from u reaches v after w milliseconds (links are one way). A message starts at node k and every node forwards it on all its links as soon as it arrives. Return how long until every node has it, or -1 if some node never gets it.",
    technique: "Dijkstra's Algorithm",
  },
  {
    lessonId: "graph-parallel-courses",
    difficulty: "medium",
    statement:
      "There are n courses numbered 0 to n - 1. Each pair [a, b] in prerequisites means a must be finished before b. Each semester you may take any number of courses whose prerequisites were all finished in earlier semesters. Return the fewest semesters needed to take every course, or -1 if that's impossible.",
    technique: "Topological Sort",
    alsoAccept: ["BFS"],
  },
  {
    lessonId: "trie-replace-words",
    difficulty: "medium",
    statement:
      "You get a list of word roots and a sentence of lowercase words separated by single spaces. Replace every word that starts with a root by the shortest root it starts with, and return the new sentence. With roots cat and bat, \"the cattle battery\" becomes \"the cat bat\". Both inputs can be large.",
    technique: "Trie",
    alsoAccept: ["Hash Map"],
    starter: {
      csharp:
        "public class Solution\n{\n    public static string ReplaceWords(string[] dictionary, string sentence)\n    {\n        return sentence;\n    }\n}\n",
      python: "def replace_words(dictionary, sentence):\n    return sentence\n",
    },
  },
  {
    lessonId: "monotonic-stack-daily-temperatures",
    difficulty: "medium",
    statement:
      "temperatures[i] is the temperature on day i. For each day, return how many days you have to wait until a strictly warmer day, or 0 if none comes. The checker expects better than O(n²).",
    technique: "Monotonic Stack",
  },
  {
    lessonId: "union-find-redundant-connection",
    difficulty: "medium",
    statement:
      "A network of n computers numbered 0 to n - 1 was wired as a tree, then one extra cable was added between two different computers, so edges (n cables, in the order they were laid) now contains a loop. Return a cable whose removal makes it a tree again; if several would, return the one laid last.",
    technique: "Union-Find",
    alsoAccept: ["DFS"],
  },
  {
    lessonId: "tree-kth-smallest-bst",
    difficulty: "medium",
    statement:
      "You get the root of a valid binary search tree and a number k (1 is the smallest). Return the kth smallest value in the tree without copying all the values out and sorting them. The tests write the tree as a level-order array with null for missing children and build the nodes for you.",
    technique: "DFS",
  },
  {
    lessonId: "dp-coin-change-ways",
    difficulty: "medium",
    statement:
      "Given coin denominations (unlimited coins of each) and an amount, return how many different combinations of coins add up to exactly the amount. Order doesn't matter: 1 + 2 and 2 + 1 are the same combination. Amount 0 has one way.",
    technique: "Dynamic Programming (Unbounded Knapsack)",
    alsoAccept: ["Dynamic Programming (1-D)"],
  },
  {
    lessonId: "linked-list-reverse-between",
    difficulty: "medium",
    statement:
      "You get the head of a singly linked list and two positions left <= right, counted from 1. Reverse the nodes from position left to position right and return the head of the list, in one pass and without copying values into an array. The tests build the list for you and read it back as an array.",
    technique: "Linked List Pointer Manipulation",
  },
  {
    lessonId: "greedy-max-product-subarray",
    difficulty: "medium",
    statement:
      "Given an integer array (it may hold zeros and negative numbers), return the largest product of any non-empty run of neighbouring elements. Trying every start and end is too slow for the checker.",
    technique: "Dynamic Programming (1-D)",
    alsoAccept: ["Greedy"],
  },
  {
    lessonId: "linked-list-copy-random",
    difficulty: "medium",
    statement:
      "Each node of a singly linked list has a value, a next pointer and a random pointer that can point at any node in the list (itself included) or be null. Return a deep copy: new nodes only, with next and random wired exactly like the original, and the original left unchanged. The tests write the list as [value, random index] pairs (-1 for null), build the nodes for you, and pass in the head.",
    technique: "Hash Map",
    alsoAccept: ["Linked List Pointer Manipulation"],
    starter: {
      csharp:
        "public class Solution\n{\n    // Node: public int Val; public Node? Next; public Node? Random; new Node(val)\n    public static Node? CopyRandomList(Node? head)\n    {\n        return null;\n    }\n}\n",
      python: "# Node: node.val, node.next, node.random; create one with Node(val)\ndef copy_random_list(head):\n    return None\n",
    },
  },
  {
    lessonId: "hashmap-subarray-sum-k",
    difficulty: "medium",
    statement:
      "Given an array of integers nums (negatives and zeros allowed) and an integer k, return how many contiguous subarrays add up to exactly k. Checking every start and end pair is O(n²); aim for one pass.",
    technique: "Prefix Sums",
    alsoAccept: ["Hash Map"],
  },
  {
    lessonId: "two-pointers-three-sum",
    difficulty: "medium",
    statement:
      "Given an unsorted array nums, return every distinct triplet [a, b, c] of values at three different positions with a + b + c = 0. Write each triplet in ascending order, list the triplets in ascending order, and don't repeat a triplet. Beat O(n³).",
    technique: "Two Pointers",
    alsoAccept: ["Hash Map"],
  },
  {
    lessonId: "grid-max-area-island",
    difficulty: "easy",
    statement:
      "You get a map as a 2-D grid of 1s (land) and 0s (water). Land cells that touch up, down, left or right belong to the same island. Return the number of cells in the largest island, or 0 if there is no land.",
    technique: "DFS",
    alsoAccept: ["BFS", "Union-Find"],
  },
  {
    lessonId: "dp-house-robber-circular",
    difficulty: "medium",
    statement:
      "Houses stand in a circle, so the first and the last house are neighbours. House i holds nums[i] in cash, and robbing two neighbouring houses trips the alarm. Return the most cash you can take.",
    technique: "Dynamic Programming (1-D)",
  },
  {
    lessonId: "intervals-list-intersections",
    difficulty: "medium",
    statement:
      "You get two lists a and b of closed intervals [start, end]. Each list is sorted by start and has no overlaps inside itself. Return every interval where a and b overlap, in order; endpoints count, so [1, 5] and [5, 10] meet in [5, 5]. Aim for time linear in the total number of intervals.",
    technique: "Two Pointers",
    alsoAccept: ["Merge Intervals", "Sweep Line"],
  },
  {
    lessonId: "heap-k-closest-points",
    difficulty: "medium",
    statement:
      "Given points as [x, y] pairs and an integer k, return the k points closest to (0, 0), nearest first. A tie in distance goes to the smaller x, then the smaller y. There may be far more points than k, so avoid sorting all of them.",
    technique: "Top-K with a Heap",
  },

];

export interface SetFormat {
  id: string;
  label: string;
  minutes: number;
  difficulties: Difficulty[][];
  blurb: string;
}

// One inner array per problem slot: the difficulties that slot may draw from.
export const SET_FORMATS: SetFormat[] = [
  {
    id: "phone",
    label: "Phone screen",
    minutes: 30,
    difficulties: [["medium"]],
    blurb: "One medium problem in 30 minutes, the shape of most first-round screens.",
  },
  {
    id: "onsite",
    label: "Onsite coding round",
    minutes: 45,
    difficulties: [["medium"], ["medium", "hard"]],
    blurb: "Two problems in 45 minutes. The second one is usually harder, and finishing both is the bar.",
  },
  {
    id: "warmup",
    label: "Warm-up",
    minutes: 25,
    difficulties: [["easy"], ["easy", "medium"]],
    blurb: "An easy one and an easy-to-medium one in 25 minutes, for getting back into it.",
  },
];

// Drops whole-line comments, which is where the lessons' TODO hints live, and the blank
// lines they leave behind.
export function stripComments(code: string, language: string): string {
  const marker = language === "python" ? "#" : "//";
  return code
    .split("\n")
    .filter((line) => !line.trimStart().startsWith(marker))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\{\n\n/g, "{\n");
}
