namespace DsaAcademy.Content.Concepts;

public class QuickselectKthLargest : IConcept
{
    public string Id => "quickselect-kth-largest";
    public string Track => "patterns";
    public string Title => "Quickselect: Kth Largest Element";
    public string OneLiner => "Find the k-th largest value without sorting: partition like quicksort, then continue only into the side that holds the answer. O(n) on average.";
    public string KeyTakeaway =>
        "The k-th largest is the element that would sit at index n - k after sorting. Partition puts one " +
        "pivot exactly where it belongs; if that index is n - k you are done, otherwise recurse into only the " +
        "side containing n - k. Throwing away half the range each round gives n + n/2 + n/4 + ... = O(n) on " +
        "average.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Return the k-th largest element of nums (1-based, so k = 1 is the maximum). Duplicates count: in [3, " +
        "2, 3, 1, 2, 4, 5, 5, 6] the 4th largest is 4 (6, 5, 5, 4). Sorting and reading index n - k is O(n " +
        "log n). A min-heap of size k (Top K with a Heap) is O(n log k). Quickselect is O(n) on average.\n\n" +
        "In ascending sorted order the k-th largest sits at index target = n - k. Partition the whole array " +
        "around a pivot (Lomuto, with the middle element swapped to the end first). The pivot lands at its " +
        "final sorted index p. If p == target, the pivot is the answer. If p < target, the answer is to the " +
        "right, so repeat on [p + 1, hi]. If p > target, repeat on [lo, p - 1]. Unlike quicksort, you only " +
        "ever continue into one side, so a loop is enough.\n\n" +
        "Each round costs the size of the current range. If pivots split roughly in half, the total is n + " +
        "n/2 + n/4 + ..., which is under 2n: O(n) on average. Bad pivots every time give O(n²), the same risk " +
        "as quicksort; a random or middle pivot makes that unlikely, and the median-of-medians pivot rule " +
        "guarantees O(n) at the price of a large constant.\n\n" +
        "When to use which: quickselect for one answer from data you can rearrange; a size-k heap when the " +
        "data streams in or must stay untouched; sorting when you need many order statistics.\n\n" +
        "The visualization finds the 2nd largest in [3, 2, 1, 5, 6, 4]: target index 6 - 2 = 4.";

    public List<string> RecognitionSignals => [
        "\"K-th largest\" or \"k-th smallest\", or the median, from an unsorted array, asked for in better than O(n log n).",
        "Any \"find the element that would be at position p if sorted\" question.",
    ];

    public List<string> Gotchas => [
        "Mixing up k-th largest with k-th smallest: target index is n - k for largest, k - 1 for smallest.",
        "Recursing into both sides turns it back into quicksort, O(n log n).",
        "Using the last element as pivot on sorted input makes every round shrink by one: O(n²).",
    ];

    public List<string> ConfusableWith => [
        "Top K with a Heap returns the k largest values and works on a stream, in O(n log k); quickselect returns one order statistic in O(n) average but needs the whole array in memory and rearranges it.",
        "Quicksort recurses into both sides of each partition; quickselect into one.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int FindKthLargest(int[] nums, int k)\n" +
            "    {\n" +
            "        var a = nums.ToArray();\n" +
            "        int target = a.Length - k, lo = 0, hi = a.Length - 1;\n" +
            "        // TODO: loop: swap the middle of [lo, hi] into a[hi], Lomuto-partition\n" +
            "        // a[lo..hi] around a[hi] to get pivot index p. If p == target return a[p];\n" +
            "        // if p < target set lo = p + 1, else set hi = p - 1.\n" +
            "        return a[0];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def find_kth_largest(nums, k):\n" +
            "    a = list(nums)\n" +
            "    target, lo, hi = len(a) - k, 0, len(a) - 1\n" +
            "    # TODO: loop: swap the middle of [lo, hi] into a[hi], Lomuto-partition\n" +
            "    # a[lo..hi] around a[hi] to get pivot index p. If p == target return a[p];\n" +
            "    # if p < target set lo = p + 1, else set hi = p - 1.\n" +
            "    return a[0]\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.FindKthLargest",
        ["python"] = "find_kth_largest",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[3, 2, 1, 5, 6, 4], 2", "5"),
        new TestCase("[3, 2, 3, 1, 2, 4, 5, 5, 6], 4", "4"),
        new TestCase("[1], 1", "1"),
        new TestCase("[7, 7, 7], 2", "7"),
        new TestCase("[-1, -5, 3], 3", "-5"),
        new TestCase("[9, 1, 8, 2, 7, 3], 1", "9"),
        new TestCase("[5, 5, 4, 4, 3, 3, 2, 2], 5", "3"),
    ];

    public string CSharpCallTemplate => "Solution.FindKthLargest({input})";
    public string PythonCallTemplate => "find_kth_largest({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] a = [3, 2, 1, 5, 6, 4];
        int target = a.Length - 2, lo = 0, hi = a.Length - 1;
        var steps = new List<VisualizationStep>
        {
            new(new() { ["array"] = a.ToArray(), ["tracker"] = target, ["trackerLabel"] = "target" }, [],
                "Find the 2nd largest in [3, 2, 1, 5, 6, 4]. Sorted ascending, it would sit at index 6 - 2 = 4."),
        };
        while (true)
        {
            var mid = (lo + hi) / 2;
            (a[mid], a[hi]) = (a[hi], a[mid]);
            var pivot = a[hi];
            var i = lo;
            for (var j = lo; j < hi; j++)
            {
                if (a[j] < pivot)
                {
                    (a[i], a[j]) = (a[j], a[i]);
                    i++;
                }
            }
            (a[i], a[hi]) = (a[hi], a[i]);
            var range = $"positions {lo} to {hi}";
            if (i == target)
            {
                steps.Add(new(new() { ["array"] = a.ToArray(), ["tracker"] = target, ["trackerLabel"] = "target" }, [i],
                    $"Partition {range} around {pivot}: it lands at index {i}, the target. The 2nd largest is {pivot}."));
                break;
            }
            var side = i < target ? "right" : "left";
            steps.Add(new(new() { ["array"] = a.ToArray(), ["tracker"] = target, ["trackerLabel"] = "target" }, [i],
                $"Partition {range} around {pivot}: it lands at index {i}. The target {target} is to the {side}, so drop the other side entirely."));
            if (i < target) lo = i + 1;
            else hi = i - 1;
        }
        return steps;
    }
}
