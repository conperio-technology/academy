namespace DsaAcademy.Content.Concepts;

public class SortingSortColors : IConcept
{
    public string Id => "sorting-sort-colors";
    public string Track => "patterns";
    public string Title => "Three-Way Partition: Sort Colors";
    public string OneLiner => "Sort an array of 0s, 1s and 2s in one pass with three pointers: everything before low is 0, everything after high is 2.";
    public string KeyTakeaway =>
        "Keep three regions with three pointers: [0, low) holds 0s, [low, mid) holds 1s, (high, end] holds " +
        "2s, and mid scans the unknown middle. A 0 swaps to low (both advance), a 1 just advances mid, a 2 " +
        "swaps to high (only high moves, because the value swapped in is still unknown). One pass, O(1) " +
        "space.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "nums contains only 0, 1 and 2 (think red, white and blue). Sort it in place in a single pass and " +
        "return it. Counting the three values and rewriting the array works in two passes; the classic " +
        "interview answer is Dijkstra's Dutch national flag partition, which does it in one.\n\n" +
        "Maintain three pointers and four regions. Everything before low is 0. Everything from low up to mid " +
        "- 1 is 1. Everything after high is 2. Between mid and high is still unknown. Start with low = mid = " +
        "0 and high = n - 1, and look at nums[mid] until mid passes high.\n\n" +
        "If it is 0, swap it with nums[low] and move both low and mid forward: the value that came back from " +
        "low was a 1 (or this same 0), so it is already classified. If it is 1, it is already in the right " +
        "region; just move mid forward. If it is 2, swap it with nums[high] and move only high back. Do not " +
        "advance mid here: the value that just arrived from high has not been looked at yet.\n\n" +
        "Each step either advances mid or shrinks high, so the loop runs at most n times: O(n) time, O(1) " +
        "space. This three-way partition is also what makes quicksort fast on arrays with many equal keys: " +
        "partition into less than, equal to and greater than the pivot, and never recurse into the equal " +
        "block.\n\n" +
        "The visualization runs [2, 0, 2, 1, 1, 0]. The tracker marks mid; highlighted cells are finished " +
        "regions.";

    public List<string> RecognitionSignals => [
        "Only three distinct values (or three classes: less than, equal to, greater than a pivot), sorted in place.",
        "\"One pass\" and \"constant extra space\" on a partition problem.",
    ];

    public List<string> Gotchas => [
        "Advancing mid after swapping with high skips an unexamined value; that is the classic bug.",
        "The loop condition is mid <= high, not mid < high: the element at high is still unknown.",
        "high can go to -1 on an all-zero or one-element array; make sure that ends the loop instead of indexing.",
    ];

    public List<string> ConfusableWith => [
        "Quicksort Partition (Lomuto) splits into two regions with two pointers; this splits into three with three.",
        "Counting sort solves the same input in two passes by counting first; the three-pointer version does it in one and is what interviewers usually want.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] SortColors(int[] nums)\n" +
            "    {\n" +
            "        // TODO: low = 0, mid = 0, high = nums.Length - 1. While mid <= high:\n" +
            "        //   nums[mid] == 0: swap with nums[low], low++, mid++\n" +
            "        //   nums[mid] == 1: mid++\n" +
            "        //   nums[mid] == 2: swap with nums[high], high-- (do not move mid)\n" +
            "        return nums;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def sort_colors(nums):\n" +
            "    # TODO: low = 0, mid = 0, high = len(nums) - 1. While mid <= high:\n" +
            "    #   nums[mid] == 0: swap with nums[low], low += 1, mid += 1\n" +
            "    #   nums[mid] == 1: mid += 1\n" +
            "    #   nums[mid] == 2: swap with nums[high], high -= 1 (do not move mid)\n" +
            "    return nums\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.SortColors",
        ["python"] = "sort_colors",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[2, 0, 2, 1, 1, 0]", "[0,0,1,1,2,2]"),
        new TestCase("[2, 0, 1]", "[0,1,2]"),
        new TestCase("[0]", "[0]"),
        new TestCase("[1, 1]", "[1,1]"),
        new TestCase("[2, 2, 0, 0]", "[0,0,2,2]"),
        new TestCase("[]", "[]"),
        new TestCase("[1, 0, 2, 1, 0, 2, 0]", "[0,0,0,1,1,2,2]"),
        new TestCase("[2, 1, 0, 0, 1, 2]", "[0,0,1,1,2,2]"),
    ];

    public string CSharpCallTemplate => "Solution.SortColors({input})";
    public string PythonCallTemplate => "sort_colors({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] a = [2, 0, 2, 1, 1, 0];
        int low = 0, mid = 0, high = a.Length - 1;
        var steps = new List<VisualizationStep>();
        int[] Done() => Enumerable.Range(0, low).Concat(Enumerable.Range(high + 1, a.Length - high - 1)).ToArray();
        VisualizationStep Step(string message) => new(new() { ["array"] = a.ToArray(), ["tracker"] = mid, ["trackerLabel"] = "mid" }, Done(), message);
        steps.Add(Step("Start with low = 0, mid = 0, high = 5. Everything is unknown."));
        while (mid <= high)
        {
            var value = a[mid];
            if (value == 0)
            {
                (a[low], a[mid]) = (a[mid], a[low]);
                low++;
                mid++;
                steps.Add(Step($"Saw 0: swap it to low, then advance low to {low} and mid to {mid}."));
            }
            else if (value == 1)
            {
                mid++;
                steps.Add(Step($"Saw 1: it belongs in the middle already. Advance mid to {mid}."));
            }
            else
            {
                (a[mid], a[high]) = (a[high], a[mid]);
                high--;
                steps.Add(Step($"Saw 2: swap it to high and shrink high to {high}. mid stays: the value that came back, {a[mid]}, is not checked yet."));
            }
        }
        steps.Add(new(new() { ["array"] = a.ToArray() }, [], "mid passed high, so nothing is unknown: 0s, then 1s, then 2s, in one pass."));
        return steps;
    }
}
