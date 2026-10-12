namespace DsaAcademy.Content.Concepts;

public class SortingSelectionSort : IConcept
{
    public string Id => "sorting-selection-sort";
    public string Track => "sorting";
    public string Title => "Sorting: Selection Sort";
    public string OneLiner => "Repeatedly find the smallest remaining value and swap it into place -- the opposite instinct from bubble sort's constant neighbor-swapping.";
    public string KeyTakeaway =>
        "Selection sort is O(n^2) like bubble and insertion sort, but for a different reason: it " +
        "always does a full scan every pass to find the minimum, regardless of how sorted the input " +
        "already is -- it can't finish early the way insertion sort can. In exchange, it makes at most " +
        "n swaps total (one per pass), far fewer than bubble sort's swap-on-every-out-of-order-pair " +
        "approach -- useful when swaps (not comparisons) are the expensive operation.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "For each index i starting at 0, scan the entire remaining unsorted slice [i..n-1] to find the " +
        "index of its SMALLEST value -- then, after the scan finishes, swap that minimum into position " +
        "i. After processing index i, [0..i] holds the i+1 smallest values in sorted order, done for " +
        "good. Watch out for the common shortcut bug: swapping immediately every time you find a " +
        "smaller value during the scan, instead of tracking the minimum's INDEX and doing exactly one " +
        "swap at the end of the pass -- the immediate-swap version still happens to sort correctly, " +
        "but it's not selection sort's actual algorithm (and does needless extra swaps).";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] SelectionSort(int[] nums)\n" +
            "    {\n" +
            "        // TODO: for each i from 0, find the index of the minimum value in\n" +
            "        // nums[i..], then swap it into position i.\n" +
            "        return nums;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def selection_sort(nums):\n" +
            "    # TODO: for each i from 0, find the index of the minimum value in\n" +
            "    # nums[i:], then swap it into position i.\n" +
            "    return nums\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.SelectionSort",
        ["python"] = "selection_sort",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([5, 2, 4, 1, 3]), "[1,2,3,4,5]"),
        new TestCase(Lit.IntArray([1]), "[1]"),
        new TestCase(Lit.IntArray([]), "[]"),
        new TestCase(Lit.IntArray([3, 1]), "[1,3]"),
        new TestCase(Lit.IntArray([9, 5, 1, 4, 3]), "[1,3,4,5,9]"),
    ];

    public string CSharpCallTemplate => "Solution.SelectionSort({input})";
    public string PythonCallTemplate => "selection_sort({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] arr = [5, 2, 4, 1, 3];
        var steps = new List<VisualizationStep>();

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = arr.ToArray() },
            HighlightIndices: [],
            Message: $"Starting array: [{string.Join(", ", arr)}]. Each pass finds the minimum of the remaining unsorted slice and swaps it into place."
        ));

        var n = arr.Length;
        for (var i = 0; i < n - 1; i++)
        {
            var minIndex = i;
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = arr.ToArray(), ["tracker"] = arr[minIndex], ["trackerLabel"] = "current min" },
                HighlightIndices: [i],
                Message: $"Pass {i + 1}: scan [{i}..{n - 1}] for the smallest value. Start assuming index {i} (value {arr[i]}) is the min."
            ));

            for (var j = i + 1; j < n; j++)
            {
                var currentMinValue = arr[minIndex];
                var better = arr[j] < currentMinValue;
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = arr.ToArray(), ["tracker"] = currentMinValue, ["trackerLabel"] = "current min" },
                    HighlightIndices: [minIndex, j],
                    Message: better
                        ? $"arr[{j}]={arr[j]} < current min {currentMinValue} -- new min index is {j}."
                        : $"arr[{j}]={arr[j]} >= current min {currentMinValue} -- min index stays {minIndex}."
                ));
                if (better) minIndex = j;
            }

            if (minIndex != i)
            {
                (arr[i], arr[minIndex]) = (arr[minIndex], arr[i]);
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = arr.ToArray() },
                    HighlightIndices: [i],
                    Message: $"Swap index {i} with the found minimum -> [{string.Join(", ", arr)}]. Index {i} is now in its final sorted position."
                ));
            }
            else
            {
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = arr.ToArray() },
                    HighlightIndices: [i],
                    Message: $"Index {i} was already the minimum -- no swap needed. Index {i} is now in its final sorted position."
                ));
            }
        }

        return steps;
    }
}
