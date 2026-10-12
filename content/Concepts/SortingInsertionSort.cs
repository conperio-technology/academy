namespace DsaAcademy.Content.Concepts;

public class SortingInsertionSort : IConcept
{
    public string Id => "sorting-insertion-sort";
    public string Track => "sorting";
    public string Title => "Sorting: Insertion Sort";
    public string OneLiner => "Grow a sorted prefix one element at a time, sliding each new element back to where it belongs.";
    public string KeyTakeaway =>
        "Insertion sort is O(n^2) worst case, same as bubble sort -- but O(n) on already-nearly-sorted " +
        "input, because it does genuinely useful, permanent work as it goes (the sorted prefix is " +
        "really done, not just \"the biggest value found its spot\"). That's why real-world sorts " +
        "often fall back to insertion sort for small subarrays inside a faster algorithm.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Treat index 0 as a trivially-sorted prefix of length one. For every next index i, pull out " +
        "nums[i] and slide it leftward past anything bigger in the sorted prefix, shifting those " +
        "bigger elements one slot to the right as you go -- then drop nums[i] into the gap it opened " +
        "up. After processing index i, indices [0..i] are fully sorted. Watch out for the shifting " +
        "direction: you're moving BIGGER elements right to make room, not moving the new element " +
        "right -- get that backwards and you'll sort in the wrong order or overwrite data.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] InsertionSort(int[] nums)\n" +
            "    {\n" +
            "        // TODO: for each index i from 1, slide nums[i] left past bigger elements\n" +
            "        // in the sorted prefix [0..i-1], shifting them right to make room.\n" +
            "        return nums;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def insertion_sort(nums):\n" +
            "    # TODO: for each index i from 1, slide nums[i] left past bigger elements\n" +
            "    # in the sorted prefix [0..i-1], shifting them right to make room.\n" +
            "    return nums\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.InsertionSort",
        ["python"] = "insertion_sort",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([5, 2, 4, 1, 3]), "[1,2,3,4,5]"),
        new TestCase(Lit.IntArray([1, 2, 3]), "[1,2,3]"),
        new TestCase(Lit.IntArray([]), "[]"),
        new TestCase(Lit.IntArray([2, 1]), "[1,2]"),
        new TestCase(Lit.IntArray([4, 3, 2, 1]), "[1,2,3,4]"),
    ];

    public string CSharpCallTemplate => "Solution.InsertionSort({input})";
    public string PythonCallTemplate => "insertion_sort({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] arr = [5, 2, 4, 1, 3];
        var steps = new List<VisualizationStep>();

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = arr.ToArray() },
            HighlightIndices: [0],
            Message: $"Starting array: [{string.Join(", ", arr)}]. Index 0 is trivially a sorted prefix of length 1."
        ));

        for (var i = 1; i < arr.Length; i++)
        {
            var key = arr[i];
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = arr.ToArray() },
                HighlightIndices: [i],
                Message: $"Take arr[{i}] = {key}. Slide it left past anything bigger in the sorted prefix [0..{i - 1}]."
            ));

            var j = i - 1;
            while (j >= 0 && arr[j] > key)
            {
                arr[j + 1] = arr[j];
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = arr.ToArray() },
                    HighlightIndices: [j, j + 1],
                    Message: $"{arr[j]} > {key} -- shift it right."
                ));
                j--;
            }

            arr[j + 1] = key;
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = arr.ToArray() },
                HighlightIndices: [j + 1],
                Message: $"{key} belongs at index {j + 1}. Sorted prefix is now [0..{i}]."
            ));
        }

        return steps;
    }
}
