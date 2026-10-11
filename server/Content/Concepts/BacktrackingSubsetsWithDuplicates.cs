namespace DsaAcademy.Content.Concepts;

// Transfer exercise after Generate All Subsets: the input may now hold repeats, and each distinct
// subset must still come out once. Sorting plus "skip an equal sibling" prunes the duplicates.
public class BacktrackingSubsetsWithDuplicates : IConcept
{
    public string Id => "backtracking-subsets-with-duplicates";
    public string Track => "patterns";
    public string Title => "Transfer: Subsets When the Input Has Duplicates";
    public string OneLiner => "Every distinct subset of a list that may repeat values, each exactly once: the same backtracking, plus one rule about equal siblings.";
    public string KeyTakeaway =>
        "Sort first, so equal values sit side by side. Then at one level of the recursion, after trying " +
        "nums[i] as the next element, skip any later nums[j] equal to it (j > start and nums[j] == nums[j - 1]): " +
        "it would grow exactly the same subtree again. Going deeper with an equal value is still allowed, which " +
        "is how [2, 2] gets built.";
    public VisualizerKind VisualizerKind => VisualizerKind.CallStack;
    public string? TransferOf => "backtracking-subsets";

    public string Explanation =>
        "This follows Generate All Subsets with the requirement changed: nums may contain repeated values, " +
        "and the answer must list every distinct subset exactly once. For [1, 2, 2] that is [], [1], [2], " +
        "[1, 2], [2, 2] and [1, 2, 2]: six subsets, not the eight that treating the two 2s as different " +
        "would give. Order doesn't matter; the tests sort each subset and then the list before comparing.\n\n" +
        "Run the parent lesson's code on [1, 2, 2] and you get [2] twice and [1, 2] twice. Look at where they " +
        "come from: at the top level the loop tries index 1 (the first 2) and then index 2 (the second 2) as " +
        "the next element. Both choices start with the same value and have the same options after them, so " +
        "they grow identical subtrees.\n\n" +
        "The fix is one line in the loop, after sorting nums so equal values are neighbours: inside " +
        "backtrack(start), skip index i when i > start and nums[i] == nums[i - 1]. In words: at this level, " +
        "only the first copy of a value may be chosen next. The condition is i > start, not i > 0, so the " +
        "second 2 can still be added right after the first one, one level deeper; that branch is how [2, 2] " +
        "and [1, 2, 2] appear. Everything else (record a copy, choose, recurse with i + 1, undo) is " +
        "unchanged.\n\n" +
        "Removing duplicates at the end with a set of sorted tuples also gives the right answer, but it " +
        "still builds every repeated subtree first. With [2, 2, 2, 2, 2] that is 32 subsets built to keep 6. " +
        "Skipping while you recurse never builds them. The worst case is still O(n · 2ⁿ) when all values " +
        "differ.\n\n" +
        "The visualization runs [1, 2, 2] and shows the call stack, including the branches that are skipped.\n\n" +
        "Explain why the same idea works: before you move on, write two or three sentences comparing this " +
        "with Generate All Subsets. Why does skipping an equal sibling never lose a subset, why must the test " +
        "be i > start rather than i > 0, and why does sorting have to happen first?";

    public List<string> RecognitionSignals =>
    [
        "\"All unique subsets\" or \"all unique combinations\" when the input can contain repeated values.",
        "Generating everything is the job, but equal elements would otherwise produce the same answer more than once.",
    ];

    public List<string> Gotchas =>
    [
        "Sort before recursing; the skip rule only works when equal values are adjacent.",
        "Skip when i > start, not i > 0: the second copy of a value must still be usable one level deeper, or [2, 2] is lost.",
        "As in the parent lesson, record a copy of current, not current itself.",
    ];

    public List<string> ConfusableWith =>
    [
        "Backtracking: Generate All Subsets assumes distinct values, so every branch is a new subset. Here two branches can be the same subset, and the sorted skip rule prunes the second one.",
        "3Sum skips equal neighbours for the same reason: sorted input turns \"don't repeat an answer\" into \"don't start from the same value twice at one position\".",
    ];

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
            "    public static List<List<int>> SubsetsWithDup(int[] nums)\n" +
            "    {\n" +
            "        var sorted = (int[])nums.Clone();\n" +
            "        Array.Sort(sorted);\n" +
            "        var result = new List<List<int>>();\n" +
            "        Backtrack(0, sorted, new List<int>(), result);\n" +
            "        return result;\n" +
            "    }\n" +
            "\n" +
            "    private static void Backtrack(int start, int[] nums, List<int> current, List<List<int>> result)\n" +
            "    {\n" +
            "        // TODO: record a COPY of current. Then for i from start to the end:\n" +
            "        // skip i when i > start and nums[i] == nums[i - 1] (an equal sibling\n" +
            "        // grows the same subtree). Otherwise add nums[i], recurse with\n" +
            "        // i + 1, and remove it again.\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def subsets_with_dup(nums):\n" +
            "    nums = sorted(nums)\n" +
            "    result = []\n" +
            "    current = []\n" +
            "\n" +
            "    def backtrack(start):\n" +
            "        # TODO: record a COPY of current. Then for i in range(start, len(nums)):\n" +
            "        # skip i when i > start and nums[i] == nums[i - 1] (an equal sibling\n" +
            "        # grows the same subtree). Otherwise append nums[i], recurse with\n" +
            "        # i + 1, and pop it again.\n" +
            "        pass\n" +
            "\n" +
            "    backtrack(0)\n" +
            "    return result\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.SubsetsWithDup",
        ["python"] = "subsets_with_dup",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([1, 2, 2]), "[[],[1],[2],[1,2],[2,2],[1,2,2]]"),
        new TestCase(Lit.IntArray([0]), "[[],[0]]"),
        new TestCase(Lit.IntArray([]), "[[]]"),
        new TestCase(Lit.IntArray([2, 2, 2]), "[[],[2],[2,2],[2,2,2]]"),
        new TestCase(Lit.IntArray([1, 2, 3]), "[[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]"),
        new TestCase(Lit.IntArray([3, 1, 3, 1]), "[[],[1],[3],[1,1],[1,3],[3,3],[1,1,3],[1,3,3],[1,1,3,3]]"),
        new TestCase(Lit.IntArray([4, 4, 4, 1, 4]), "[[],[1],[4],[1,4],[4,4],[1,4,4],[4,4,4],[1,4,4,4],[4,4,4,4],[1,4,4,4,4]]"),
    ];

    public string CSharpCallTemplate => "SubsetNormalizer.Normalize(Solution.SubsetsWithDup({input}))";
    public string PythonCallTemplate => "normalize_subsets(subsets_with_dup({input}))";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [1, 2, 2];
        var steps = new List<VisualizationStep>();
        var frames = new List<string>();
        var current = new List<int>();
        var subsetCount = 0;

        string Label(List<int> list) => list.Count == 0 ? "[]" : $"[{string.Join(",", list)}]";

        void Backtrack(int start)
        {
            frames.Add($"backtrack(start={start}, current={Label(current)})");
            subsetCount++;
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["frames"] = frames.ToArray() },
                HighlightIndices: [frames.Count - 1],
                Message: $"Record {Label(current)} as subset #{subsetCount}. Then try each index from {start} onward as the next element."
            ));

            for (var i = start; i < nums.Length; i++)
            {
                if (i > start && nums[i] == nums[i - 1])
                {
                    steps.Add(new VisualizationStep(
                        State: new Dictionary<string, object> { ["frames"] = frames.ToArray() },
                        HighlightIndices: [frames.Count - 1],
                        Message: $"Index {i} holds {nums[i]}, the same value just tried at index {i - 1} on this level. It would grow the same subtree again, so skip it."
                    ));
                    continue;
                }
                current.Add(nums[i]);
                Backtrack(i + 1);
                current.RemoveAt(current.Count - 1);
            }

            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["frames"] = frames.ToArray() },
                HighlightIndices: [frames.Count - 1],
                Message: start >= nums.Length
                    ? "No elements left to try. Return, and the caller undoes its last add."
                    : $"Every choice from index {start} onward is done. Return, and the caller undoes its last add."
            ));
            frames.RemoveAt(frames.Count - 1);
        }

        Backtrack(0);
        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["frames"] = Array.Empty<string>() },
            HighlightIndices: [],
            Message: $"Done: {subsetCount} distinct subsets. Without the skip rule the same code records 8, with [2] and [1,2] twice each."
        ));
        return steps;
    }
}
