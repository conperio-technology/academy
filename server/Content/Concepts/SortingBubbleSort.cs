namespace DsaAcademy.Content.Concepts;

public class SortingBubbleSort : IConcept
{
    public string Id => "sorting-bubble-sort";
    public string Track => "sorting";
    public string Title => "Sorting: Bubble Sort";
    public string OneLiner => "Repeatedly compare neighbors and swap if they're out of order -- the biggest unsorted value \"bubbles\" to the end each pass.";
    public string KeyTakeaway =>
        "Bubble sort is O(n^2) -- up to n passes, each up to n comparisons -- and does almost nothing " +
        "useful until the very end of each pass. It's simple to reason about, but the first sort to " +
        "replace once performance on anything but a tiny or nearly-sorted input actually matters.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Walk the array comparing each adjacent pair; if they're out of order, swap them. One full " +
        "pass like this guarantees the largest remaining value has \"bubbled\" all the way to the end " +
        "-- so each pass can safely look at one fewer element than the last (the tail is already " +
        "sorted). Repeat until a full pass makes zero swaps, which means the array is sorted. Watch " +
        "out for the early-exit check: without it, bubble sort still works, it just wastes passes " +
        "re-scanning an already-sorted array -- always O(n^2) instead of O(n) on the already-sorted " +
        "best case.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] BubbleSort(int[] nums)\n" +
            "    {\n" +
            "        // TODO: repeatedly walk the array, swapping adjacent out-of-order pairs.\n" +
            "        // Stop early if a full pass makes no swaps.\n" +
            "        return nums;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def bubble_sort(nums):\n" +
            "    # TODO: repeatedly walk the array, swapping adjacent out-of-order pairs.\n" +
            "    # Stop early if a full pass makes no swaps.\n" +
            "    return nums\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.BubbleSort",
        ["python"] = "bubble_sort",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([5, 2, 4, 1, 3]), "[1,2,3,4,5]"),
        new TestCase(Lit.IntArray([1]), "[1]"),
        new TestCase(Lit.IntArray([]), "[]"),
        new TestCase(Lit.IntArray([3, 1]), "[1,3]"),
        new TestCase(Lit.IntArray([9, 5, 1, 4, 3]), "[1,3,4,5,9]"),
    ];

    public string CSharpCallTemplate => "Solution.BubbleSort({input})";
    public string PythonCallTemplate => "bubble_sort({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] arr = [5, 2, 4, 1, 3];
        var steps = new List<VisualizationStep>();

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = arr.ToArray() },
            HighlightIndices: [],
            Message: $"Starting array: [{string.Join(", ", arr)}]. Each pass compares neighbors and swaps if out of order."
        ));

        var n = arr.Length;
        for (var pass = 0; pass < n - 1; pass++)
        {
            var swapped = false;
            for (var j = 0; j < n - 1 - pass; j++)
            {
                var outOfOrder = arr[j] > arr[j + 1];
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = arr.ToArray() },
                    HighlightIndices: [j, j + 1],
                    Message: outOfOrder
                        ? $"{arr[j]} > {arr[j + 1]} -- out of order, swap."
                        : $"{arr[j]} <= {arr[j + 1]} -- already in order, leave it."
                ));

                if (outOfOrder)
                {
                    (arr[j], arr[j + 1]) = (arr[j + 1], arr[j]);
                    swapped = true;
                    steps.Add(new VisualizationStep(
                        State: new Dictionary<string, object> { ["array"] = arr.ToArray() },
                        HighlightIndices: [j, j + 1],
                        Message: $"Swapped -> [{string.Join(", ", arr)}]."
                    ));
                }
            }

            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = arr.ToArray() },
                HighlightIndices: [n - 1 - pass],
                Message: $"End of pass {pass + 1}: index {n - 1 - pass} (value {arr[n - 1 - pass]}) is now in its final sorted position."
            ));

            if (!swapped)
            {
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = arr.ToArray() },
                    HighlightIndices: [],
                    Message: "No swaps this pass -- the array is already sorted, stop early."
                ));
                break;
            }
        }

        return steps;
    }
}
