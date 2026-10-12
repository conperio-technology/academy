namespace DsaAcademy.Content.Concepts;

public class BinarySearchRotated : IConcept
{
    public string Id => "binary-search-rotated";
    public string Track => "patterns";
    public string Title => "Binary Search: Search a Rotated Sorted Array";
    public string OneLiner => "A sorted array that was rotated is no longer sorted, but whichever way you cut it at the midpoint, at least one half still is.";
    public string KeyTakeaway =>
        "Cut a rotated sorted array at any midpoint and at least one of the two halves is fully sorted. " +
        "Compare nums[lo] with nums[mid] to find out which one, then check whether the target falls inside " +
        "that sorted half's range. If it does, search there; if not, it can only be in the other half. Either " +
        "way half the range is gone after one comparison, so it stays O(log n).";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Take a sorted array of distinct integers and rotate it: [0, 1, 2, 4, 5, 6, 7] rotated by 4 becomes " +
        "[4, 5, 6, 7, 0, 1, 2]. Given the rotated array and a target, return the target's index, or -1 if it " +
        "isn't there, in O(log n). A linear scan is O(n), and plain binary search breaks: at the midpoint 7 " +
        "with target 0, \"0 is smaller than 7, go left\" sends you the wrong way.\n\n" +
        "The array is two sorted runs glued together, with one drop between them (7 to 0 above). Any midpoint " +
        "falls in one of the runs, so the drop is on at most one side of mid. That means at least one of " +
        "[lo, mid] and [mid, hi] contains no drop and is sorted. You can tell which with one comparison: if " +
        "nums[lo] <= nums[mid], the left half is sorted; otherwise the drop is on the left, so the right half " +
        "is sorted.\n\n" +
        "A sorted half is useful because you can test membership by its endpoints. If the left half is sorted " +
        "and nums[lo] <= target < nums[mid], the target can only be on the left, so set hi = mid - 1. Otherwise " +
        "it can only be on the right, so set lo = mid + 1. The mirror rule applies when the right half is " +
        "sorted: if nums[mid] < target <= nums[hi], go right, else go left. You never need to know where the " +
        "rotation point is; each step just asks which half is the clean one.\n\n" +
        "Use the inclusive loop (while lo <= hi) and check nums[mid] == target first, exactly as in Binary " +
        "Search: Find a Target. The <= in nums[lo] <= nums[mid] matters when lo == mid (a range of one or two " +
        "elements): then the \"left half\" is just nums[lo], which is trivially sorted. Common follow-ups: " +
        "find the minimum of a rotated array (the same half test, but you move toward the unsorted side, where " +
        "the drop is), find the rotation count (the index of that minimum), and the version with duplicates, " +
        "where nums[lo] == nums[mid] no longer tells you which half is sorted and the worst case degrades to " +
        "O(n) because you can only shrink lo by one.\n\n" +
        "The visualization searches [4, 5, 6, 7, 0, 1, 2] for 0. Each step highlights the sorted half that the " +
        "decision is based on.";

    public List<string> RecognitionSignals =>
    [
        "\"Sorted, then rotated\" (or shifted, or wrapped around) at an unknown pivot, plus a requirement of O(log n).",
        "The array is almost sorted except for one drop, and you need to find a value or the drop itself.",
    ];

    public List<string> Gotchas =>
    [
        "Using < instead of <= in nums[lo] <= nums[mid]: when lo == mid the left half is one element and is sorted, and getting this wrong sends two-element searches like [3, 1] for 1 the wrong way.",
        "The range checks must include the known end and exclude mid: nums[lo] <= target < nums[mid] for the left half, nums[mid] < target <= nums[hi] for the right. mid was already checked, so its side of the comparison doesn't matter, but dropping the = at lo or hi misses targets sitting at the ends.",
        "This trick needs DISTINCT values. With duplicates, nums[lo] == nums[mid] == nums[hi] can't tell you which half is sorted, and you have to fall back to lo++.",
    ];

    public List<string> ConfusableWith =>
    [
        "Binary Search: Find a Target (this track) works on a fully sorted array, where comparing target with nums[mid] alone picks the side. Here that comparison is not enough; you first have to find the sorted half.",
        "Binary Search on Answer: Minimum Eating Speed (this track) also bends binary search to a problem that doesn't look sorted, but it searches a range of candidate answers with a feasibility check. This one still searches array indices.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int SearchRotated(int[] nums, int target)\n" +
            "    {\n" +
            "        // TODO: lo = 0, hi = nums.Length - 1; while lo <= hi: mid = lo + (hi - lo) / 2.\n" +
            "        // If nums[mid] == target, return mid. If nums[lo] <= nums[mid], the left half\n" +
            "        // is sorted: go left if nums[lo] <= target < nums[mid], else go right.\n" +
            "        // Otherwise the right half is sorted: go right if\n" +
            "        // nums[mid] < target <= nums[hi], else go left. Return -1 if not found.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def search_rotated(nums, target):\n" +
            "    # TODO: lo, hi = 0, len(nums) - 1; while lo <= hi: mid = (lo + hi) // 2.\n" +
            "    # If nums[mid] == target, return mid. If nums[lo] <= nums[mid], the left half\n" +
            "    # is sorted: go left if nums[lo] <= target < nums[mid], else go right.\n" +
            "    # Otherwise the right half is sorted: go right if\n" +
            "    # nums[mid] < target <= nums[hi], else go left. Return -1 if not found.\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.SearchRotated",
        ["python"] = "search_rotated",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([4, 5, 6, 7, 0, 1, 2]), Lit.Int(0)), "4"),
        new TestCase(Lit.Args(Lit.IntArray([4, 5, 6, 7, 0, 1, 2]), Lit.Int(3)), "-1"),
        new TestCase(Lit.Args(Lit.IntArray([1]), Lit.Int(1)), "0"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3, 4, 5, 6]), Lit.Int(4)), "3"),
        new TestCase(Lit.Args(Lit.IntArray([5, 1, 3]), Lit.Int(5)), "0"),
        new TestCase(Lit.Args(Lit.IntArray([3, 1]), Lit.Int(1)), "1"),
        new TestCase(Lit.Args(Lit.IntArray([6, 7, 8, 1, 2, 3, 4, 5]), Lit.Int(8)), "2"),
        new TestCase(Lit.Args(Lit.IntArray([]), Lit.Int(5)), "-1"),
    ];

    public string CSharpCallTemplate => "Solution.SearchRotated({input})";
    public string PythonCallTemplate => "search_rotated({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [4, 5, 6, 7, 0, 1, 2];
        const int target = 0;
        var arr = nums.Select(v => (object)v).ToArray();
        var steps = new List<VisualizationStep>();
        int lo = 0, hi = nums.Length - 1;

        int[] Range(int from, int to) => from > to ? [] : Enumerable.Range(from, to - from + 1).ToArray();

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = arr },
            HighlightIndices: Range(lo, hi),
            Message: $"Search for {target}. The array is sorted but rotated: 7 then 0 is the one drop. lo = {lo}, hi = {hi}."
        ));

        while (lo <= hi)
        {
            var mid = lo + (hi - lo) / 2;
            if (nums[mid] == target)
            {
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = arr, ["tracker"] = nums[mid], ["trackerLabel"] = $"nums[mid = {mid}]" },
                    HighlightIndices: [mid],
                    Message: $"nums[{mid}] = {nums[mid]} is the target. Return {mid}."
                ));
                return steps;
            }

            var leftSorted = nums[lo] <= nums[mid];
            var sortedHalf = leftSorted ? Range(lo, mid) : Range(mid, hi);
            var inSorted = leftSorted
                ? nums[lo] <= target && target < nums[mid]
                : nums[mid] < target && target <= nums[hi];
            var halfText = leftSorted
                ? $"nums[lo] = {nums[lo]} <= nums[mid] = {nums[mid]}, so the left half [{lo}..{mid}] is sorted"
                : $"nums[lo] = {nums[lo]} > nums[mid] = {nums[mid]}, so the drop is on the left and the right half [{mid}..{hi}] is sorted";
            var rangeText = leftSorted ? $"[{nums[lo]}, {nums[mid]})" : $"({nums[mid]}, {nums[hi]}]";

            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = arr, ["tracker"] = nums[mid], ["trackerLabel"] = $"nums[mid = {mid}]" },
                HighlightIndices: sortedHalf,
                Message: $"mid = {mid}. {halfText}. Is {target} in its range {rangeText}? {(inSorted ? "Yes" : "No")}."
            ));

            if (leftSorted == inSorted) hi = mid - 1; else lo = mid + 1;

            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = arr },
                HighlightIndices: Range(lo, hi),
                Message: inSorted
                    ? $"So the target can only be in the sorted half. Keep [{lo}..{hi}]."
                    : $"So the target can only be in the other half. Keep [{lo}..{hi}]."
            ));
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = arr },
            HighlightIndices: [],
            Message: "lo passed hi, so the target isn't in the array. Return -1."
        ));
        return steps;
    }
}
