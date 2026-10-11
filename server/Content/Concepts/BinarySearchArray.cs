namespace DsaAcademy.Content.Concepts;

public class BinarySearchArray : IConcept
{
    public string Id => "binary-search-array";
    public string Track => "patterns";
    public string Title => "Binary Search: Find a Target";
    public string OneLiner => "Cut the search space in half every step -- O(log n) instead of O(n), but only works on sorted data.";
    public string KeyTakeaway =>
        "Binary search only works because the array is sorted: comparing the middle element to the " +
        "target tells you which HALF the target could possibly be in, so the other half gets thrown " +
        "away entirely, every single step -- that's exactly what turns a linear scan into O(log n).";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Keep two pointers, left and right, spanning the whole array to start. While left <= right: " +
        "look at the middle index (left + (right - left) / 2), and compare its value to the target. " +
        "Equal -- found it, done. Too small -- the target (if present) has to be to the right, so move " +
        "left to mid + 1. Too big -- it has to be to the left, so move right to mid - 1. Each " +
        "comparison eliminates HALF the remaining candidates, which is why this takes at most about log2(n) " +
        "comparisons (the number of times n can be halved before one candidate is left: 20 for a million items) instead of up to n. Watch out for the loop condition being `left <= right`, not " +
        "`left < right` -- with strict `<` you can stop one comparison too early and miss checking the " +
        "single remaining candidate when left and right meet.";

    public List<string> RecognitionSignals =>
    [
        "The input is sorted (or you're allowed to sort it) and you need to find a specific value or a boundary.",
        "You need better than O(n) search, and the brute-force approach is an obvious linear scan.",
        "The problem is phrased as \"find the smallest/largest X such that some condition holds\" -- often solvable by binary searching on the ANSWER itself, not just an array.",
    ];

    public List<string> Gotchas =>
    [
        "Loop condition must be `left <= right`, not `left < right` -- with `<` you can miss checking the last remaining candidate.",
        "Update to `mid + 1` / `mid - 1` for the next boundary, not `mid` itself -- reusing mid causes an infinite loop once left and right converge on it.",
        "`(left + right) / 2` can overflow (exceed the largest value the integer type can hold and wrap around) in fixed-width-integer languages on huge arrays -- `left + (right - left) / 2` avoids it. Python ints can't overflow, but a C# `int` is 32-bit, so `left + right` can pass int.MaxValue on very large arrays or wide answer ranges -- that's the reason the safer form exists and shows up in interviews.",
    ];

    public List<string> ConfusableWith =>
    [
        "Two Pointers (this track) also uses two indices, but moves them toward each other, inspecting values along the way; binary search only ever looks at the midpoint and discards half the remaining space without inspecting it. The tell: do you need to examine a range (two pointers), or can you safely skip most of it based on one comparison (binary search)?",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int Search(int[] nums, int target)\n" +
            "    {\n" +
            "        // TODO: left = 0, right = nums.Length - 1.\n" +
            "        // While left <= right: check mid, narrow to the half that could contain target.\n" +
            "        // Return the index if found, -1 if the search space runs out.\n" +
            "        return -1;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def search(nums, target):\n" +
            "    # TODO: left = 0, right = len(nums) - 1.\n" +
            "    # While left <= right: check mid, narrow to the half that could contain target.\n" +
            "    # Return the index if found, -1 if the search space runs out.\n" +
            "    return -1\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Search",
        ["python"] = "search",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([-1, 0, 3, 5, 9, 12]), Lit.Int(9)), "4"),
        new TestCase(Lit.Args(Lit.IntArray([-1, 0, 3, 5, 9, 12]), Lit.Int(2)), "-1"),
        new TestCase(Lit.Args(Lit.IntArray([5]), Lit.Int(5)), "0"),
        new TestCase(Lit.Args(Lit.IntArray([]), Lit.Int(5)), "-1"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3, 4, 5]), Lit.Int(1)), "0"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3, 4, 5]), Lit.Int(5)), "4"),
    ];

    public string CSharpCallTemplate => "Solution.Search({input})";
    public string PythonCallTemplate => "search({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [-1, 0, 3, 5, 9, 12, 15, 18];
        const int target = 9;
        var steps = new List<VisualizationStep>();
        var left = 0;
        var right = nums.Length - 1;

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = nums },
            HighlightIndices: [left, right],
            Message: $"Searching for {target} in a SORTED array. left = 0, right = {right}."
        ));

        while (left <= right)
        {
            var mid = left + (right - left) / 2;
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = nums },
                HighlightIndices: [left, mid, right],
                Message: $"mid = {mid} (value {nums[mid]})."
            ));

            if (nums[mid] == target)
            {
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = nums },
                    HighlightIndices: [mid],
                    Message: $"nums[{mid}] == {target} -- found it at index {mid}."
                ));
                return steps;
            }

            if (nums[mid] < target)
            {
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = nums },
                    HighlightIndices: [left, mid, right],
                    Message: $"nums[{mid}]={nums[mid]} < {target} -- target must be in the right half. left = {mid + 1}."
                ));
                left = mid + 1;
            }
            else
            {
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = nums },
                    HighlightIndices: [left, mid, right],
                    Message: $"nums[{mid}]={nums[mid]} > {target} -- target must be in the left half. right = {mid - 1}."
                ));
                right = mid - 1;
            }
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = nums },
            HighlightIndices: [],
            Message: $"left > right -- search space exhausted. {target} isn't in the array. Return -1."
        ));

        return steps;
    }
}
