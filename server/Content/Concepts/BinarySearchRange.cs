namespace DsaAcademy.Content.Concepts;

public class BinarySearchRange : IConcept
{
    public string Id => "binary-search-range";
    public string Track => "patterns";
    public string Title => "Binary Search: Find First and Last Position";
    public string OneLiner => "The same divide-in-half idea, aimed at a BOUNDARY instead of one exact match -- find where a value's range starts and ends.";
    public string KeyTakeaway =>
        "Binary search doesn't require an exact-match target -- it works on any sorted true/false " +
        "condition (\"is nums[i] >= target\"), which is why it can find the FIRST or LAST occurrence of " +
        "a duplicated value just as easily as finding one occurrence: instead of stopping the moment " +
        "you find a match, keep narrowing toward whichever end of the match-range you're after.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "With duplicates in a sorted array, a plain binary search finds A match, but not necessarily " +
        "the first or last one. Fix: run the same left/right/mid search, but don't stop on a match -- " +
        "record it as the best answer so far, then keep searching. To find the FIRST occurrence, keep " +
        "searching the LEFT half after a match (right = mid - 1); to find the LAST occurrence, keep " +
        "searching the RIGHT half after a match (left = mid + 1). Run both (a first-search and a " +
        "last-search) to get the whole range. Watch out for the two failure directions: no match found " +
        "at all (return [-1, -1]), versus a match found but the OTHER end still needs its own separate " +
        "search -- finding the first occurrence tells you nothing about where the last one is without " +
        "actually running the mirrored search.";

    public List<string> RecognitionSignals =>
    [
        "The array is sorted but has DUPLICATES, and you need the boundary of a run of equal values, not just any one match.",
        "The problem can be reframed as \"find the first index where some condition becomes true\" (or stops being true) in sorted/monotonic data.",
    ];

    public List<string> Gotchas =>
    [
        "Finding one occurrence and assuming it's the first (or last) is wrong with duplicates -- a plain binary search can land anywhere inside the matching run.",
        "The first-search and last-search are mirror images of each other (which side you keep narrowing into after a match) -- easy to copy-paste one and forget to flip the direction for the other.",
        "If the target isn't present at all, both searches need to correctly report \"not found\" (e.g. -1) rather than returning wherever the search happened to stop.",
    ];

    public List<string> ConfusableWith =>
    [
        "Binary Search: Find a Target (this track) is the building block -- this lesson is that same search run twice with a small bias added, not a different algorithm.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] SearchRange(int[] nums, int target)\n" +
            "    {\n" +
            "        // TODO: binary search for target, but on a match keep narrowing LEFT\n" +
            "        // (right = mid - 1) to find the first occurrence, remembering it as you go.\n" +
            "        // Do it again, narrowing RIGHT (left = mid + 1) instead, for the last occurrence.\n" +
            "        // Return [first, last], or [-1, -1] if target isn't present.\n" +
            "        return new[] { -1, -1 };\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def search_range(nums, target):\n" +
            "    # TODO: binary search for target, but on a match keep narrowing LEFT\n" +
            "    # (right = mid - 1) to find the first occurrence, remembering it as you go.\n" +
            "    # Do it again, narrowing RIGHT (left = mid + 1) instead, for the last occurrence.\n" +
            "    # Return [first, last], or [-1, -1] if target isn't present.\n" +
            "    return [-1, -1]\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.SearchRange",
        ["python"] = "search_range",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([5, 7, 7, 8, 8, 10]), Lit.Int(8)), "[3,4]"),
        new TestCase(Lit.Args(Lit.IntArray([5, 7, 7, 8, 8, 10]), Lit.Int(6)), "[-1,-1]"),
        new TestCase(Lit.Args(Lit.IntArray([]), Lit.Int(0)), "[-1,-1]"),
        new TestCase(Lit.Args(Lit.IntArray([1, 1, 1, 1]), Lit.Int(1)), "[0,3]"),
        new TestCase(Lit.Args(Lit.IntArray([2, 2]), Lit.Int(2)), "[0,1]"),
    ];

    public string CSharpCallTemplate => "Solution.SearchRange({input})";
    public string PythonCallTemplate => "search_range({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [5, 7, 7, 8, 8, 8, 10];
        const int target = 8;
        var steps = new List<VisualizationStep>();
        var left = 0;
        var right = nums.Length - 1;
        var firstIndex = -1;

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = nums },
            HighlightIndices: [left, right],
            Message: $"Finding the FIRST occurrence of {target}. Same binary search, but on a match, don't stop -- keep searching the LEFT half in case there's an earlier one."
        ));

        while (left <= right)
        {
            var mid = left + (right - left) / 2;
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = nums, ["tracker"] = firstIndex, ["trackerLabel"] = "earliest match so far" },
                HighlightIndices: [left, mid, right],
                Message: $"mid = {mid} (value {nums[mid]})."
            ));

            if (nums[mid] == target)
            {
                firstIndex = mid;
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = nums, ["tracker"] = firstIndex, ["trackerLabel"] = "earliest match so far" },
                    HighlightIndices: [mid],
                    Message: $"nums[{mid}] == {target} -- record index {mid} as a candidate, but keep searching left in case there's an earlier one: right = {mid - 1}."
                ));
                right = mid - 1;
            }
            else if (nums[mid] < target)
            {
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = nums, ["tracker"] = firstIndex, ["trackerLabel"] = "earliest match so far" },
                    HighlightIndices: [left, mid, right],
                    Message: $"nums[{mid}]={nums[mid]} < {target} -- too small, search right. left = {mid + 1}."
                ));
                left = mid + 1;
            }
            else
            {
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = nums, ["tracker"] = firstIndex, ["trackerLabel"] = "earliest match so far" },
                    HighlightIndices: [left, mid, right],
                    Message: $"nums[{mid}]={nums[mid]} > {target} -- too big, search left. right = {mid - 1}."
                ));
                right = mid - 1;
            }
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = nums, ["tracker"] = firstIndex, ["trackerLabel"] = "first occurrence" },
            HighlightIndices: firstIndex >= 0 ? [firstIndex] : [],
            Message: firstIndex >= 0
                ? $"Search space exhausted. First occurrence of {target} is at index {firstIndex}. A mirror-image search (keep going RIGHT on a match instead of left) finds the last occurrence the same way."
                : $"Search space exhausted -- {target} isn't in the array. Return [-1, -1]."
        ));

        return steps;
    }
}
