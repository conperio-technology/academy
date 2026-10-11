namespace DsaAcademy.Content.Concepts;

// Transfer exercise after Search a Rotated Sorted Array: there is no target any more; the search
// is for the drop itself, so each step keeps the half that still contains it.
public class BinarySearchRotatedMin : IConcept
{
    public string Id => "binary-search-rotated-min";
    public string Track => "patterns";
    public string Title => "Transfer: Find the Minimum of a Rotated Sorted Array";
    public string OneLiner => "No target this time: find the smallest value of a rotated sorted array in O(log n) by keeping whichever half still holds the drop.";
    public string KeyTakeaway =>
        "The minimum sits just after the one drop. Compare nums[mid] with nums[hi]: if nums[mid] > nums[hi], " +
        "the drop is to the right of mid, so lo = mid + 1; otherwise mid..hi is sorted and the minimum is at " +
        "mid or to its left, so hi = mid. Stop when lo == hi.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;
    public string? TransferOf => "binary-search-rotated";

    public string Explanation =>
        "This follows Search a Rotated Sorted Array with the requirement changed: there is no target. Given " +
        "a sorted array of distinct integers that was rotated an unknown number of times (possibly zero), " +
        "return its smallest value in O(log n). For [4, 5, 6, 7, 0, 1, 2] the answer is 0. The array has at " +
        "least one element.\n\n" +
        "The parent lesson's insight still holds: the array is two sorted runs with a single drop between " +
        "them, and the minimum is the first value after the drop. So instead of asking \"which half could " +
        "hold the target?\", ask \"which half holds the drop?\".\n\n" +
        "Compare nums[mid] with nums[hi]. If nums[mid] > nums[hi], the values drop somewhere between mid and " +
        "hi, so the drop, and the minimum, are strictly to the right of mid: lo = mid + 1. Otherwise " +
        "nums[mid] < nums[hi], so mid..hi is one sorted run; the minimum is mid itself or something to its " +
        "left: hi = mid (not mid - 1, because mid may be the answer). Loop while lo < hi; when they meet, " +
        "nums[lo] is the minimum.\n\n" +
        "Why compare with hi and not lo, as the parent did? Because nums[lo] < nums[mid] is true both for " +
        "[4, 5, 6, 7, 0, 1, 2] cut at 7 (minimum to the right) and for an array that was never rotated, " +
        "[1, 2, 3, 4] (minimum at lo). One comparison can't tell those apart. nums[mid] versus nums[hi] " +
        "always can, since the right end is the last value of whichever run it sits in.\n\n" +
        "The loop shape changes too: while lo < hi with hi = mid, rather than while lo <= hi with mid " +
        "excluded on both sides. You are not checking for equality with a target; you are narrowing a range " +
        "that always contains the answer until it has one element.\n\n" +
        "The visualization runs [4, 5, 6, 7, 0, 1, 2]; the highlighted cells are the range lo..hi.\n\n" +
        "Explain why the same idea works: before you move on, write two or three sentences comparing this " +
        "with the parent lesson. Why is half the range still safe to throw away each step, why is it " +
        "hi = mid here instead of hi = mid - 1, and what does comparing with nums[hi] tell you that " +
        "comparing with nums[lo] can't?";

    public List<string> RecognitionSignals =>
    [
        "\"Sorted, then rotated\", and the question is about the rotation itself: the minimum, the maximum, or how many times it was rotated.",
        "An O(log n) requirement on an array that is sorted except for one drop.",
    ];

    public List<string> Gotchas =>
    [
        "Setting hi = mid - 1 when nums[mid] < nums[hi] can step past the minimum, because mid itself may be it.",
        "Comparing nums[mid] with nums[lo] can't tell \"rotated, minimum on the right\" from \"not rotated, minimum at lo\".",
        "Use while lo < hi, not lo <= hi: with hi = mid, lo <= hi never ends once they meet.",
    ];

    public List<string> ConfusableWith =>
    [
        "Binary Search: Search a Rotated Sorted Array looks for a target, so it checks which half is sorted and whether the target is inside it. Here there is no target, so each step just keeps the half that contains the drop.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int FindMin(int[] nums)\n" +
            "    {\n" +
            "        // TODO: lo = 0, hi = nums.Length - 1. While lo < hi: mid = lo + (hi - lo) / 2.\n" +
            "        // If nums[mid] > nums[hi], the drop is right of mid: lo = mid + 1.\n" +
            "        // Otherwise mid..hi is sorted, so the minimum is mid or left of it:\n" +
            "        // hi = mid. Return nums[lo].\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def find_min(nums):\n" +
            "    # TODO: lo, hi = 0, len(nums) - 1. While lo < hi: mid = (lo + hi) // 2.\n" +
            "    # If nums[mid] > nums[hi], the drop is right of mid: lo = mid + 1.\n" +
            "    # Otherwise mid..hi is sorted, so the minimum is mid or left of it:\n" +
            "    # hi = mid. Return nums[lo].\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.FindMin",
        ["python"] = "find_min",
    };

    // 334 values, rotated so the minimum (1) sits two thirds of the way in.
    private static readonly int[] Big = [.. Enumerable.Range(0, 234).Select(i => 300 + 3 * i), .. Enumerable.Range(0, 100).Select(i => 1 + 3 * i)];

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([3, 4, 5, 1, 2]), "1"),
        new TestCase(Lit.IntArray([4, 5, 6, 7, 0, 1, 2]), "0"),
        new TestCase(Lit.IntArray([11, 13, 15, 17]), "11"),
        new TestCase(Lit.IntArray([1]), "1"),
        new TestCase(Lit.IntArray([2, 1]), "1"),
        new TestCase(Lit.IntArray([1, 2]), "1"),
        new TestCase(Lit.IntArray([5, 1, 2, 3, 4]), "1"),
        new TestCase(Lit.IntArray([2, 3, 4, 5, 1]), "1"),
        new TestCase(Lit.IntArray([-3, -1, 4, 9, -8, -5]), "-8"),
        new TestCase(Lit.IntArray(Big), "1"),
    ];

    public string CSharpCallTemplate => "Solution.FindMin({input})";
    public string PythonCallTemplate => "find_min({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [4, 5, 6, 7, 0, 1, 2];
        var arr = nums.Select(v => (object)v).ToArray();
        var steps = new List<VisualizationStep>();
        int lo = 0, hi = nums.Length - 1;

        int[] Range(int from, int to) => Enumerable.Range(from, to - from + 1).ToArray();

        steps.Add(new VisualizationStep(
            new Dictionary<string, object> { ["array"] = arr },
            Range(lo, hi),
            $"Find the minimum. The range lo = {lo}, hi = {hi} always contains it; shrink it until one cell is left."
        ));

        while (lo < hi)
        {
            var mid = lo + (hi - lo) / 2;
            var dropRight = nums[mid] > nums[hi];
            var message = dropRight
                ? $"mid = {mid}: nums[mid] = {nums[mid]} > nums[hi] = {nums[hi]}, so the values drop somewhere after mid. The minimum is right of mid: lo = {mid + 1}."
                : $"mid = {mid}: nums[mid] = {nums[mid]} < nums[hi] = {nums[hi]}, so mid..hi is sorted. The minimum is mid or left of it: hi = {mid}.";
            if (dropRight) lo = mid + 1; else hi = mid;
            steps.Add(new VisualizationStep(
                new Dictionary<string, object> { ["array"] = arr, ["tracker"] = nums[mid], ["trackerLabel"] = $"nums[mid = {mid}]" },
                Range(lo, hi),
                message
            ));
        }

        steps.Add(new VisualizationStep(
            new Dictionary<string, object> { ["array"] = arr, ["tracker"] = nums[lo], ["trackerLabel"] = "minimum" },
            [lo],
            $"lo == hi == {lo}: one cell left, so nums[{lo}] = {nums[lo]} is the minimum. {steps.Count - 1} comparisons for {nums.Length} values."
        ));
        return steps;
    }
}
