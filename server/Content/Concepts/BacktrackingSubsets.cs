namespace DsaAcademy.Content.Concepts;

public class BacktrackingSubsets : IConcept
{
    public string Id => "backtracking-subsets";
    public string Track => "patterns";
    public string Title => "Backtracking: Generate All Subsets";
    public string OneLiner => "Recursion with a choice at every step: include this element or don't, then undo and try the other branch.";
    public string KeyTakeaway =>
        "Backtracking is recursion plus \"try a choice, recurse, then undo the choice before trying " +
        "the next one\" -- the undo step is what lets the same current-state variable be reused across " +
        "every branch instead of copying it. Reach for it whenever a problem wants \"all possible " +
        "ways to do X\", not just one answer.";
    public VisualizerKind VisualizerKind => VisualizerKind.CallStack;

    public string Explanation =>
        "Generating every subset of a set is a classic backtracking problem. At each recursive call, " +
        "first record the current partial selection as one valid subset (every prefix of choices is " +
        "itself a valid subset -- including the empty one). Then, for each remaining element (starting " +
        "from wherever you left off, so you never re-pick an earlier element and never produce the " +
        "same subset twice), add it to the current selection, recurse, and then REMOVE it again before " +
        "trying the next element -- that removal is the \"backtrack\" step. Because the same `current` " +
        "list is shared and mutated across the whole recursion (added to on the way down, removed from " +
        "on the way back up), this uses way less memory than building a fresh copy at every call. " +
        "Watch out for that exact bug: if you forget to remove the element after recursing (the " +
        "backtrack step), every subsequent subset silently keeps everything from earlier branches.";

    public List<string> RecognitionSignals =>
    [
        "The problem asks for ALL possible ways to do something (all subsets, all permutations, all valid boards/paths) rather than one answer or a count.",
        "You're making a sequence of choices where each choice needs to be tried, then undone, before trying the next.",
        "A brute-force recursive tree naturally represents the problem, and pruning branches early (backtracking out of a bad partial answer) would help.",
    ];

    public List<string> Gotchas =>
    [
        "Forgetting to undo the choice (remove what you just added) after the recursive call returns -- every later branch then silently carries leftovers from earlier ones.",
        "Appending a COPY of the current list when you record an answer, not a reference to the shared mutable list -- otherwise every recorded \"answer\" ends up pointing at the same list, which later mutates out from under all of them.",
        "The starting index for the inner loop must move forward (start from i + 1, not 0) or you'll regenerate permutations of the same subset instead of each subset once.",
    ];

    public List<string> ConfusableWith =>
    [
        "Recursion (Fundamentals) is the umbrella concept; backtracking is recursion with the specific \"choose, recurse, un-choose\" shape used for exploring all possibilities, usually with a shared mutable state instead of passing a new copy down each call.",
        "Dynamic programming (a later lesson) also explores a space of choices, but caches overlapping subproblems to avoid redoing work -- backtracking recomputes everything, which is fine because it's visiting every distinct answer anyway, not solving the same subproblem repeatedly.",
    ];

    // Order isn't well-defined for "all subsets" -- different correct backtracking
    // implementations can legally produce the same subsets in different orders. The
    // harness normalizes (sort each subset, then sort the list of subsets by
    // length-then-lexicographic) before comparing, so any correct implementation
    // passes regardless of generation order.
    public string? CSharpHarnessPreamble =>
        "public static class SubsetNormalizer\n" +
        "{\n" +
        "    public static List<List<int>> Normalize(List<List<int>> subsets)\n" +
        "    {\n" +
        "        var sorted = subsets.Select(s => { var c = new List<int>(s); c.Sort(); return c; }).ToList();\n" +
        "        sorted.Sort((a, b) =>\n" +
        "        {\n" +
        "            if (a.Count != b.Count) return a.Count - b.Count;\n" +
        "            for (var i = 0; i < a.Count; i++) if (a[i] != b[i]) return a[i] - b[i];\n" +
        "            return 0;\n" +
        "        });\n" +
        "        return sorted;\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "def normalize_subsets(subsets):\n" +
        "    sorted_subsets = [sorted(s) for s in subsets]\n" +
        "    sorted_subsets.sort(key=lambda s: (len(s), s))\n" +
        "    return sorted_subsets\n";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static List<List<int>> Subsets(int[] nums)\n" +
            "    {\n" +
            "        var result = new List<List<int>>();\n" +
            "        var current = new List<int>();\n" +
            "        Backtrack(0, nums, current, result);\n" +
            "        return result;\n" +
            "    }\n" +
            "\n" +
            "    private static void Backtrack(int start, int[] nums, List<int> current, List<List<int>> result)\n" +
            "    {\n" +
            "        // TODO: record a COPY of `current` as one subset.\n" +
            "        // Then for i from start to nums.Length - 1: add nums[i] to current,\n" +
            "        // recurse with start = i + 1, then remove nums[i] again (backtrack).\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def subsets(nums):\n" +
            "    result = []\n" +
            "    current = []\n" +
            "\n" +
            "    def backtrack(start):\n" +
            "        # TODO: record a COPY of `current` as one subset.\n" +
            "        # Then for i in range(start, len(nums)): append nums[i] to current,\n" +
            "        # recurse with start = i + 1, then pop it again (backtrack).\n" +
            "        pass\n" +
            "\n" +
            "    backtrack(0)\n" +
            "    return result\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Subsets",
        ["python"] = "subsets",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([1, 2, 3]), "[[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]"),
        new TestCase(Lit.IntArray([]), "[[]]"),
        new TestCase(Lit.IntArray([5]), "[[],[5]]"),
        new TestCase(Lit.IntArray([1, 2]), "[[],[1],[2],[1,2]]"),
    ];

    public string CSharpCallTemplate => "SubsetNormalizer.Normalize(Solution.Subsets({input}))";
    public string PythonCallTemplate => "normalize_subsets(subsets({input}))";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [1, 2, 3];
        var steps = new List<VisualizationStep>();
        var frames = new List<string>();
        var current = new List<int>();
        var subsetCount = 0;

        void Backtrack(int start)
        {
            var currentLabel = current.Count == 0 ? "[]" : $"[{string.Join(",", current)}]";
            frames.Add($"backtrack(start={start}, current={currentLabel})");
            subsetCount++;

            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["frames"] = frames.ToArray() },
                HighlightIndices: [frames.Count - 1],
                Message: $"Record {currentLabel} as subset #{subsetCount}. Then try adding each element from index {start} onward."
            ));

            for (var i = start; i < nums.Length; i++)
            {
                current.Add(nums[i]);
                Backtrack(i + 1);
                current.RemoveAt(current.Count - 1);
            }

            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["frames"] = frames.ToArray() },
                HighlightIndices: [frames.Count - 1],
                Message: start >= nums.Length
                    ? "No elements left to try -- backtrack (undo the last add) and return to the caller."
                    : $"Tried every element from index {start} onward -- backtrack (undo the last add) and return to the caller."
            ));
            frames.RemoveAt(frames.Count - 1);
        }

        Backtrack(0);
        return steps;
    }
}
