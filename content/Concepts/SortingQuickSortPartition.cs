namespace DsaAcademy.Content.Concepts;

public class SortingQuickSortPartition : IConcept
{
    public string Id => "sorting-quicksort-partition";
    public string Track => "sorting";
    public string Title => "Sorting: Quick Sort Partition";
    public string OneLiner => "The core move behind quicksort: pick a pivot, then rearrange so everything smaller ends up left of it and everything bigger ends up right.";
    public string KeyTakeaway =>
        "Partitioning drops the pivot into its FINAL sorted position in one pass, with everything " +
        "smaller to its left and everything bigger to its right -- recursively partitioning each side " +
        "(that's quicksort) sorts the whole array without ever allocating a second array. That's why " +
        "quicksort usually beats merge sort in practice despite sharing the same O(n log n) average " +
        "case: no extra O(n) space for a merge step.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "This uses the Lomuto partition scheme: pick the LAST element as the pivot. Keep a boundary " +
        "index i marking the end of the \"confirmed smaller than pivot\" region, starting one before " +
        "the array (i = -1, nothing confirmed yet). Walk a second pointer j across everything except " +
        "the pivot itself: whenever nums[j] <= pivot, the boundary grows -- increment i, then swap " +
        "nums[i] and nums[j] to pull that small value into the confirmed region. Once j has scanned " +
        "everything, the pivot itself still needs to move: swap it from the end into position i + 1, " +
        "which is now exactly where it belongs. Watch out for that last swap specifically -- it's easy " +
        "to write the scan correctly and then forget the algorithm isn't done until the pivot itself " +
        "actually moves into its final spot.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] Partition(int[] nums)\n" +
            "    {\n" +
            "        // TODO: pivot = nums[last]. i starts at -1 (boundary of the \"smaller\" region).\n" +
            "        // For j from 0 to second-to-last: if nums[j] <= pivot, i++ and swap(nums[i], nums[j]).\n" +
            "        // Finally swap(nums[i + 1], nums[last]) to drop the pivot into place.\n" +
            "        return nums;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def partition(nums):\n" +
            "    # TODO: pivot = nums[-1]. i starts at -1 (boundary of the \"smaller\" region).\n" +
            "    # For j from 0 to second-to-last: if nums[j] <= pivot, i += 1 and swap nums[i], nums[j].\n" +
            "    # Finally swap nums[i + 1] and nums[-1] to drop the pivot into place.\n" +
            "    return nums\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Partition",
        ["python"] = "partition",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([3, 6, 2, 8, 4]), "[3,2,4,8,6]"),
        new TestCase(Lit.IntArray([5, 2, 4, 1, 3]), "[2,1,3,5,4]"),
        new TestCase(Lit.IntArray([7]), "[7]"),
        new TestCase(Lit.IntArray([2, 1]), "[1,2]"),
    ];

    public string CSharpCallTemplate => "Solution.Partition({input})";
    public string PythonCallTemplate => "partition({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] arr = [3, 6, 2, 8, 4];
        var steps = new List<VisualizationStep>();
        var pivot = arr[^1];
        var i = -1;

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = arr.ToArray() },
            HighlightIndices: [arr.Length - 1],
            Message: $"Starting array: [{string.Join(", ", arr)}]. Pivot = last element = {pivot}. Boundary i = -1 (nothing confirmed smaller yet)."
        ));

        for (var j = 0; j < arr.Length - 1; j++)
        {
            var smaller = arr[j] <= pivot;
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = arr.ToArray() },
                HighlightIndices: i >= 0 ? [j, i] : [j],
                Message: smaller
                    ? $"nums[{j}]={arr[j]} <= pivot ({pivot}) -- grow the boundary: i becomes {i + 1}, then swap nums[{i + 1}] and nums[{j}]."
                    : $"nums[{j}]={arr[j]} > pivot ({pivot}) -- leave it, it already belongs in the \"bigger\" region."
            ));

            if (smaller)
            {
                i++;
                (arr[i], arr[j]) = (arr[j], arr[i]);
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = arr.ToArray() },
                    HighlightIndices: [i, j],
                    Message: $"Swapped -> [{string.Join(", ", arr)}]."
                ));
            }
        }

        (arr[i + 1], arr[^1]) = (arr[^1], arr[i + 1]);
        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = arr.ToArray() },
            HighlightIndices: [i + 1],
            Message: $"Scan done -- drop the pivot into place: swap nums[{i + 1}] and the last index -> [{string.Join(", ", arr)}]. Pivot {pivot} is now at its final sorted index ({i + 1}): everything left is <= it, everything right is bigger."
        ));

        return steps;
    }
}
