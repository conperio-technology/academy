namespace DsaAcademy.Content.Concepts;

public class SortingMergeTwoSortedArrays : IConcept
{
    public string Id => "sorting-merge-two-sorted-arrays";
    public string Track => "sorting";
    public string Title => "Sorting: Merge Two Sorted Arrays";
    public string OneLiner => "The one move at the heart of merge sort: given two already-sorted lists, weave them into one sorted list in a single pass.";
    public string KeyTakeaway =>
        "Merging two sorted arrays is O(n + m) -- one pointer into each array, always take the smaller " +
        "of the two front values. Merge sort is exactly this merge step applied repeatedly to halves: " +
        "log n levels of splitting, O(n) work to merge at each level, which is where its O(n log n) " +
        "comes from.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Given two arrays that are ALREADY sorted, you never need to look backward to merge them: keep " +
        "one pointer into each array, compare the two values they're pointing at, append the smaller " +
        "one to the result, and advance only that pointer. Once one array runs out, everything " +
        "remaining in the other is guaranteed to belong at the end (it's already sorted, and every " +
        "value already appended is <= everything left), so just copy the rest over. This single merge " +
        "is the building block merge sort is named after: split an array in half recursively down to " +
        "single elements (trivially \"sorted\"), then merge pairs back together on the way up. Watch " +
        "out for the two cleanup loops at the end -- forgetting to copy the leftover tail of whichever " +
        "array didn't run out first is the most common bug here.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] MergeSorted(int[] a, int[] b)\n" +
            "    {\n" +
            "        // TODO: one pointer into each array. Always take the smaller front value.\n" +
            "        // When one array runs out, copy the rest of the other one over.\n" +
            "        return new int[0];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def merge_sorted(a, b):\n" +
            "    # TODO: one pointer into each array. Always take the smaller front value.\n" +
            "    # When one array runs out, copy the rest of the other one over.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MergeSorted",
        ["python"] = "merge_sorted",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([1, 3, 5]), Lit.IntArray([2, 4, 6])), "[1,2,3,4,5,6]"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3]), Lit.IntArray([])), "[1,2,3]"),
        new TestCase(Lit.Args(Lit.IntArray([]), Lit.IntArray([4, 5])), "[4,5]"),
        new TestCase(Lit.Args(Lit.IntArray([1, 1, 2]), Lit.IntArray([1, 3])), "[1,1,1,2,3]"),
    ];

    public string CSharpCallTemplate => "Solution.MergeSorted({input})";
    public string PythonCallTemplate => "merge_sorted({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] a = [1, 4, 6];
        int[] b = [2, 3, 5, 7];
        var steps = new List<VisualizationStep>();
        var merged = new List<int>();

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = merged.ToArray() },
            HighlightIndices: [],
            Message: $"Merging a=[{string.Join(", ", a)}] and b=[{string.Join(", ", b)}]. One pointer into each, empty result so far."
        ));

        var i = 0;
        var j = 0;
        while (i < a.Length && j < b.Length)
        {
            if (a[i] <= b[j])
            {
                merged.Add(a[i]);
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = merged.ToArray() },
                    HighlightIndices: [merged.Count - 1],
                    Message: $"a[{i}]={a[i]} <= b[{j}]={b[j]} -- take {a[i]} from a."
                ));
                i++;
            }
            else
            {
                merged.Add(b[j]);
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = merged.ToArray() },
                    HighlightIndices: [merged.Count - 1],
                    Message: $"b[{j}]={b[j]} < a[{i}]={a[i]} -- take {b[j]} from b."
                ));
                j++;
            }
        }

        while (i < a.Length)
        {
            merged.Add(a[i]);
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = merged.ToArray() },
                HighlightIndices: [merged.Count - 1],
                Message: $"b is exhausted -- copy the rest of a: {a[i]}."
            ));
            i++;
        }

        while (j < b.Length)
        {
            merged.Add(b[j]);
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = merged.ToArray() },
                HighlightIndices: [merged.Count - 1],
                Message: $"a is exhausted -- copy the rest of b: {b[j]}."
            ));
            j++;
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = merged.ToArray() },
            HighlightIndices: [],
            Message: $"Done: [{string.Join(", ", merged)}]. This one merge is O(n + m); merge sort applies it to halves repeatedly, giving O(n log n) overall."
        ));

        return steps;
    }
}
