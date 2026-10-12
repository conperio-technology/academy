namespace DsaAcademy.Content.Concepts;

public class BacktrackingPermutations : IConcept
{
    public string Id => "backtracking-permutations";
    public string Track => "patterns";
    public string Title => "Backtracking: Generate All Permutations";
    public string OneLiner => "Fill one position at a time with any number not used yet, recurse, then un-use it and try the next.";
    public string KeyTakeaway =>
        "Permutations are subsets' sibling with one change: every call loops over ALL indices from 0 and skips " +
        "the ones already used, instead of starting from i + 1. A used[] array is the state you choose and " +
        "un-choose alongside the current list. Record an answer only when the list is full: n! answers.";
    public VisualizerKind VisualizerKind => VisualizerKind.CallStack;

    public string Explanation =>
        "Given distinct integers in ascending order, return every ordering of them. For [1, 2, 3] that is six " +
        "lists: [1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]. Return them in exactly that lexicographic " +
        "(dictionary) order, which the standard algorithm below produces on its own because the input is " +
        "sorted. (The empty input has one permutation, the empty list, so the answer is [[]].)\n\n" +
        "Picture building the answer one slot at a time. For the first slot you can pick any of the n numbers. " +
        "For the second, any of the n - 1 that are left, and so on. That is a recursion tree with n! leaves, " +
        "and backtracking walks it with one shared list. Keep a boolean used[i] for each index. In each call, " +
        "loop i from 0 to n - 1; skip i if used[i]; otherwise mark it used, append nums[i], recurse, then pop " +
        "it and mark it unused again. When the list has n elements, append a COPY of it to the result and " +
        "return.\n\n" +
        "Compare this with Backtracking: Generate All Subsets. Subsets loop from start = i + 1 because order " +
        "doesn't matter there: {1, 2} and {2, 1} are the same subset. In permutations order IS the point, so " +
        "every call considers every index again, and used[] is what stops a number from appearing twice. " +
        "Subsets record every node of the tree; permutations record only the leaves.\n\n" +
        "Cost: n! permutations, each copied in O(n), so O(n · n!) time; the recursion is n deep. Interview " +
        "follow-ups: with DUPLICATE numbers, sort first and skip nums[i] when it equals nums[i - 1] and " +
        "nums[i - 1] is not currently used, so equal values are always placed in one fixed order. A swap-based " +
        "version avoids used[] but doesn't produce lexicographic order.";

    public List<string> RecognitionSignals =>
    [
        "\"All orderings\", \"all arrangements\", \"every possible schedule\" -- where [a, b] and [b, a] count as different answers.",
        "The output size is n! and n is small (usually 8 or less), which only makes sense if you are expected to enumerate.",
        "Each slot can take any remaining item, so you need to remember which items are already placed.",
    ];

    public List<string> Gotchas =>
    [
        "Starting the loop at i + 1 (copied from subsets) produces only one ordering, not all of them. Permutations loop from 0 and skip used indices.",
        "Undo BOTH pieces of state after the recursive call: pop the list AND set used[i] back to false.",
        "Append a copy of the current list at the leaf, not the list itself, or every stored answer will end up as the same emptied list.",
    ];

    public List<string> ConfusableWith =>
    [
        "Backtracking: Generate All Subsets (this track) uses the same choose, recurse, un-choose loop, but starts each loop at i + 1 and records every call, because order doesn't matter there.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static List<List<int>> Permute(int[] nums)\n" +
            "    {\n" +
            "        var result = new List<List<int>>();\n" +
            "        var current = new List<int>();\n" +
            "        var used = new bool[nums.Length];\n" +
            "        Backtrack(nums, used, current, result);\n" +
            "        return result;\n" +
            "    }\n" +
            "\n" +
            "    private static void Backtrack(int[] nums, bool[] used, List<int> current, List<List<int>> result)\n" +
            "    {\n" +
            "        // TODO: if current is full (Count == nums.Length), add a COPY to\n" +
            "        // result and return. Otherwise for i from 0 to nums.Length - 1 (this\n" +
            "        // index order gives lexicographic output): skip used[i]; else set\n" +
            "        // used[i] = true, add nums[i], recurse, then remove it and set\n" +
            "        // used[i] = false (backtrack).\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def permute(nums):\n" +
            "    result = []\n" +
            "    current = []\n" +
            "    used = [False] * len(nums)\n" +
            "\n" +
            "    def backtrack():\n" +
            "        # TODO: if current is full (len == len(nums)), append a COPY to\n" +
            "        # result and return. Otherwise for i in range(len(nums)) (this index\n" +
            "        # order gives lexicographic output): skip used[i]; else set\n" +
            "        # used[i] = True, append nums[i], recurse, then pop it and set\n" +
            "        # used[i] = False (backtrack).\n" +
            "        pass\n" +
            "\n" +
            "    backtrack()\n" +
            "    return result\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Permute",
        ["python"] = "permute",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([1, 2, 3]), "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]"),
        new TestCase(Lit.IntArray([0, 1]), "[[0,1],[1,0]]"),
        new TestCase(Lit.IntArray([1]), "[[1]]"),
        new TestCase(Lit.IntArray([]), "[[]]"),
        new TestCase(Lit.IntArray([-3, 0, 7]), "[[-3,0,7],[-3,7,0],[0,-3,7],[0,7,-3],[7,-3,0],[7,0,-3]]"),
        new TestCase(Lit.IntArray([1, 2, 3, 4]),
            "[[1,2,3,4],[1,2,4,3],[1,3,2,4],[1,3,4,2],[1,4,2,3],[1,4,3,2]," +
            "[2,1,3,4],[2,1,4,3],[2,3,1,4],[2,3,4,1],[2,4,1,3],[2,4,3,1]," +
            "[3,1,2,4],[3,1,4,2],[3,2,1,4],[3,2,4,1],[3,4,1,2],[3,4,2,1]," +
            "[4,1,2,3],[4,1,3,2],[4,2,1,3],[4,2,3,1],[4,3,1,2],[4,3,2,1]]"),
    ];

    public string CSharpCallTemplate => "Solution.Permute({input})";
    public string PythonCallTemplate => "permute({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [1, 2, 3];
        var steps = new List<VisualizationStep>();
        var frames = new List<string>();
        var current = new List<int>();
        var used = new bool[nums.Length];
        var found = 0;

        string Label()
        {
            var unused = nums.Where((_, i) => !used[i]);
            return $"backtrack(current=[{string.Join(",", current)}], unused={{{string.Join(",", unused)}}})";
        }

        void Backtrack()
        {
            frames.Add(Label());
            if (current.Count == nums.Length)
            {
                found++;
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["frames"] = frames.ToArray() },
                    HighlightIndices: [frames.Count - 1],
                    Message: $"current is full: record a copy of [{string.Join(", ", current)}] as permutation #{found}. Return, then the caller pops its choice and tries its next unused number."
                ));
            }
            else if (current.Count == 0)
            {
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["frames"] = frames.ToArray() },
                    HighlightIndices: [frames.Count - 1],
                    Message: "Start with an empty list and nothing used. The first slot can take any of 1, 2, 3 -- try them in index order."
                ));
            }
            else if (current.Count == 1)
            {
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["frames"] = frames.ToArray() },
                    HighlightIndices: [frames.Count - 1],
                    Message: $"Placed {current[0]} first and marked it used. The next slot loops over ALL indices again from 0, skipping used ones."
                ));
            }

            if (current.Count < nums.Length)
            {
                for (var i = 0; i < nums.Length; i++)
                {
                    if (used[i]) continue;
                    used[i] = true;
                    current.Add(nums[i]);
                    Backtrack();
                    current.RemoveAt(current.Count - 1);
                    used[i] = false;
                }
            }
            frames.RemoveAt(frames.Count - 1);
        }

        Backtrack();

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["frames"] = frames.ToArray() },
            HighlightIndices: [],
            Message: $"Every branch has been tried and undone: {found} = 3! permutations, already in lexicographic order because the loop always tries smaller indices first."
        ));
        return steps;
    }
}
