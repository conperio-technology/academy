namespace DsaAcademy.Content.Concepts;

public class ArrayTraversalSum : IConcept
{
    public string Id => "array-traversal-sum";
    public string Track => "fundamentals";

    // Keeps the whole "fundamentals" track sorted ahead of Trees/Graphs/Sorting/DP/
    // Patterns (all default Order = 100) so Hashing (Order = 60) can slot in right
    // after this track ends, instead of trailing behind every DSA concept.
    public int Order => 50;

    public string Title => "Array Traversal: Sum of an Array";
    public string OneLiner => "Walk an array once with a pointer (here just an index variable marking your position), accumulating as you go.";
    public string KeyTakeaway =>
        "Arrays are contiguous memory (every element stored side by side in one block), so any index is O(1) to read -- the default array technique " +
        "is one pointer, one linear pass, accumulating something as you go.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "The most fundamental move in array algorithms: visit each element exactly once with an " +
        "index, and accumulate something as you go (here, a running sum). Almost every array " +
        "technique you'll learn later -- two pointers, sliding window, prefix sums -- is a variation " +
        "on this single pass. Step through the visualization to see the pointer move and the sum " +
        "build up, then implement it yourself and run it against the test cases.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int SumArray(int[] nums)\n" +
            "    {\n" +
            "        // TODO: walk the array once, adding each element to a running total.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def sum_array(nums):\n" +
            "    # TODO: walk the array once, adding each element to a running total.\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.SumArray",
        ["python"] = "sum_array",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([1, 2, 3]), "6"),
        new TestCase(Lit.IntArray([]), "0"),
        new TestCase(Lit.IntArray([5]), "5"),
        new TestCase(Lit.IntArray([-4, 4, -1, 1]), "0"),
        new TestCase(Lit.IntArray([10, 20, 30, 40, 50]), "150"),
    ];

    public string CSharpCallTemplate => "Solution.SumArray({input})";
    public string PythonCallTemplate => "sum_array({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] sampleArray = [4, 8, 15, 16, 23, 42];
        var steps = new List<VisualizationStep>();
        var running = 0;

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = sampleArray, ["tracker"] = running, ["trackerLabel"] = "running sum" },
            HighlightIndices: [],
            Message: $"Start with an array and a running sum of 0. Array: [{string.Join(", ", sampleArray)}]"
        ));

        for (var i = 0; i < sampleArray.Length; i++)
        {
            running += sampleArray[i];
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = sampleArray, ["tracker"] = running, ["trackerLabel"] = "running sum" },
                HighlightIndices: [i],
                Message: $"Look at index {i} (value {sampleArray[i]}). Add it to the running sum -> {running}."
            ));
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = sampleArray, ["tracker"] = running, ["trackerLabel"] = "running sum" },
            HighlightIndices: [],
            Message: $"Pointer has passed every index once. Final sum: {running}. This one pass, O(n) walk is the shape almost every array algorithm starts from."
        ));

        return steps;
    }
}
