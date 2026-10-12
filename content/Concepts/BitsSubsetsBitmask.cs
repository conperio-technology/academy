namespace DsaAcademy.Content.Concepts;

public class BitsSubsetsBitmask : IConcept
{
    public string Id => "bits-subsets-bitmask";
    public string Track => "bits";
    public int Order => 131;
    public string Title => "Bits: All Subsets by Counting Bitmasks";
    public string OneLiner => "Every number from 0 to 2^n - 1 is a different subset: bit i set means \"take nums[i]\". Count through them in order.";
    public string KeyTakeaway =>
        "A bitmask is an integer used as a row of yes/no switches. With n elements, the masks 0 to (1 << n) - 1 are " +
        "exactly the 2^n subsets, and (mask >> i) & 1 says whether element i is in. Two nested loops and no " +
        "recursion: O(n * 2^n), the same as backtracking, and the order comes out fixed.";
    public VisualizerKind VisualizerKind => VisualizerKind.Grid;

    public string Explanation =>
        "Return every subset of nums (the power set) in this exact order: for mask = 0, 1, 2, ..., 2^n - 1, the " +
        "subset holds nums[i] for every bit i that is set in mask, listed in index order. For [1, 2, 3] that is " +
        "[[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]]. Duplicate values are treated as different " +
        "elements, so [4, 4] gives [[], [4], [4], [4, 4]].\n\n" +
        "Why it works: a subset is n independent yes/no choices, one per element, and an n-bit number is n " +
        "independent 0/1 digits. Bit 0 (the 1s place) decides nums[0], bit 1 (the 2s place) decides nums[1], and " +
        "so on. Counting from 0 to 2^n - 1 visits every combination of n bits exactly once, so it visits every " +
        "subset exactly once. Mask 5 is 101 in binary: bits 0 and 2, so the subset [nums[0], nums[2]].\n\n" +
        "Code: total = 1 << n (that's 2^n; shifting 1 left by n places multiplies it by 2 n times). For each mask " +
        "below total, loop i from 0 to n - 1 and include nums[i] when (mask >> i) & 1 is 1, or equivalently when " +
        "(mask & (1 << i)) != 0. That's 2^n masks times n bit checks, O(n * 2^n) time, and the output itself is " +
        "O(n * 2^n) in size.\n\n" +
        "C# versus Python. In C#, 1 << n on an int only works for n up to 30 (1 << 31 is negative, and the shift " +
        "count is taken modulo 32, so 1 << 32 is 1 again, not 2^32); use 1L << n for a long. Python ints grow, so " +
        "1 << 40 is just a big number. In practice 2^n subsets is only feasible for n up to about 20 anyway.\n\n" +
        "Compared with backtracking (Backtracking: Generate All Subsets in the Patterns track), bitmasks need no " +
        "recursion and the mask is a compact key: an int can stand for \"which items are used\" in a hash map or a " +
        "DP table, which is how bitmask DP solves problems like the travelling salesman on small n.\n\n" +
        "The visualization lists the masks for [1, 2, 3]: one row per mask, one column per bit.";

    public List<string> RecognitionSignals =>
    [
        "\"All subsets / combinations\" with n small (about 20 or fewer), where 2^n is affordable.",
        "A state that is \"which of these n items have been used\": store it as an int mask (bitmask DP).",
        "The required output order is by mask value, or the problem talks about binary representations of choices.",
    ];

    public List<string> Gotchas =>
    [
        "Loop mask from 0 to (1 << n) - 1 inclusive; mask 0 is the empty subset and must be included.",
        "Bit i corresponds to nums[i] with bit 0 the LOWEST bit, so mask 1 is [nums[0]], not [nums[n - 1]].",
        "In C#, 1 << n overflows int past n = 30 and the shift count wraps at 32; use 1L << n for larger n.",
    ];

    public List<string> ConfusableWith =>
    [
        "Backtracking: Generate All Subsets (Patterns track) builds the same 2^n subsets with include/exclude recursion; its order is different and it extends more naturally to pruning.",
        "Combinations of size k: you can filter masks by popcount == k, but backtracking that stops at size k is faster when k is small.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "using System.Collections.Generic;\n\n" +
            "public class Solution\n" +
            "{\n" +
            "    public static List<List<int>> SubsetsByMask(int[] nums)\n" +
            "    {\n" +
            "        // TODO: for mask from 0 to (1 << nums.Length) - 1:\n" +
            "        //   build a list with nums[i] for every i where ((mask >> i) & 1) == 1.\n" +
            "        // Add each list in mask order and return them all.\n" +
            "        return new List<List<int>>();\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def subsets_by_mask(nums):\n" +
            "    # TODO: for mask from 0 to (1 << len(nums)) - 1:\n" +
            "    #   build a list with nums[i] for every i where (mask >> i) & 1 is 1.\n" +
            "    # Append each list in mask order and return them all.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.SubsetsByMask",
        ["python"] = "subsets_by_mask",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[1, 2, 3]", "[[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]]"),
        new TestCase("[]", "[[]]"),
        new TestCase("[5]", "[[], [5]]"),
        new TestCase("[0, -1]", "[[], [0], [-1], [0, -1]]"),
        new TestCase("[4, 4]", "[[], [4], [4], [4, 4]]"),
        new TestCase("[1, 2, 3, 4]",
            "[[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3], [4], [1, 4], [2, 4], [1, 2, 4], [3, 4], [1, 3, 4], [2, 3, 4], [1, 2, 3, 4]]"),
    ];

    public string CSharpCallTemplate => "Solution.SubsetsByMask({input})";
    public string PythonCallTemplate => "subsets_by_mask({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [1, 2, 3];
        const int n = 3;
        var rows = new List<object[]>();
        var labels = new List<object>();
        var ones = new List<int[]>();
        var steps = new List<VisualizationStep>();

        Dictionary<string, object> State(int current) => new()
        {
            ["grid"] = rows.Count == 0 ? new[] { new object[] { "", "", "" } } : rows.ToArray(),
            ["rowLabels"] = labels.ToArray(),
            ["colLabels"] = new object[] { "bit 2: 3", "bit 1: 2", "bit 0: 1" },
            ["visited"] = ones.ToArray(),
            ["highlight"] = current < 0 ? Array.Empty<int[]>() : Enumerable.Range(0, n).Select(c => new[] { current, c }).ToArray(),
            ["tracker"] = rows.Count,
            ["trackerLabel"] = "subsets so far",
        };

        steps.Add(new VisualizationStep(State(-1), [],
            "nums = [1, 2, 3], n = 3, so masks run from 0 to (1 << 3) - 1 = 7. Columns are bits 2, 1, 0 and the element each one controls."));
        for (var mask = 0; mask < 1 << n; mask++)
        {
            var subset = Enumerable.Range(0, n).Where(i => ((mask >> i) & 1) == 1).Select(i => nums[i]).ToList();
            rows.Add(Enumerable.Range(0, n).Select(c => (object)((mask >> (n - 1 - c)) & 1)).ToArray());
            labels.Add($"mask {mask} = [{string.Join(", ", subset)}]");
            for (var c = 0; c < n; c++)
                if (((mask >> (n - 1 - c)) & 1) == 1) ones.Add([mask, c]);
            steps.Add(new VisualizationStep(State(mask), [],
                $"mask = {mask} = {Convert.ToString(mask, 2).PadLeft(n, '0')} in binary. Set bits: {(subset.Count == 0 ? "none" : string.Join(", ", Enumerable.Range(0, n).Where(i => ((mask >> i) & 1) == 1)))}, so the subset is [{string.Join(", ", subset)}]."));
        }
        steps.Add(new VisualizationStep(State(-1), [], "All 8 masks, all 8 subsets, each exactly once, in mask order."));
        return steps;
    }
}
