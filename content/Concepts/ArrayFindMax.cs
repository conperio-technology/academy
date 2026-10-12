namespace DsaAcademy.Content.Concepts;

public class ArrayFindMax : IConcept
{
    public string Id => "array-find-max";
    public string Track => "fundamentals";

    // See ArrayTraversalSum.cs -- keeps this track ahead of Trees/Graphs/Sorting/DP/
    // Patterns so Hashing (Order = 60) can slot in right after it.
    public int Order => 50;

    public string Title => "Array Traversal: Find the Maximum";
    public string OneLiner => "Same single pass, different accumulator: track the best-seen value instead of a sum.";
    public string KeyTakeaway =>
        "The \"one pass, one accumulator\" shape isn't just for sums -- swap the accumulator's update " +
        "rule (compare-and-replace instead of add) and the same loop finds a max, min, or first match.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Same shape as the last lesson -- one pass, one pointer -- but instead of accumulating a " +
        "sum you're accumulating a \"best value seen so far.\" This compare-and-maybe-replace move " +
        "shows up constantly: finding a max/min, finding the first element that satisfies some " +
        "condition, tracking a running best for a greedy algorithm. Watch out for the seed value: " +
        "starting your \"best so far\" at 0 silently breaks on an all-negative array.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int FindMax(int[] nums)\n" +
            "    {\n" +
            "        // TODO: walk the array once, keeping track of the largest value seen.\n" +
            "        // Careful with the starting value -- what if every element is negative?\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def find_max(nums):\n" +
            "    # TODO: walk the array once, keeping track of the largest value seen.\n" +
            "    # Careful with the starting value -- what if every element is negative?\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.FindMax",
        ["python"] = "find_max",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([3, 7, 2, 9, 4]), "9"),
        new TestCase(Lit.IntArray([5]), "5"),
        new TestCase(Lit.IntArray([-8, -3, -15, -1]), "-1"),
        new TestCase(Lit.IntArray([1, 1, 1]), "1"),
        new TestCase(Lit.IntArray([-2, 0, 2]), "2"),
    ];

    public string CSharpCallTemplate => "Solution.FindMax({input})";
    public string PythonCallTemplate => "find_max({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] sampleArray = [3, 9, 2, 17, 6, 11];
        var steps = new List<VisualizationStep>();
        var best = sampleArray[0];

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = sampleArray, ["tracker"] = best, ["trackerLabel"] = "best so far" },
            HighlightIndices: [0],
            Message: $"Seed \"best so far\" with the first element ({best}) -- never seed it with 0, an all-negative array would break that."
        ));

        for (var i = 1; i < sampleArray.Length; i++)
        {
            var isBetter = sampleArray[i] > best;
            if (isBetter) best = sampleArray[i];
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = sampleArray, ["tracker"] = best, ["trackerLabel"] = "best so far" },
                HighlightIndices: [i],
                Message: isBetter
                    ? $"Index {i} (value {sampleArray[i]}) beats the current best -- new best is {best}."
                    : $"Index {i} (value {sampleArray[i]}) doesn't beat {best} -- best stays the same."
            ));
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = sampleArray, ["tracker"] = best, ["trackerLabel"] = "best so far" },
            HighlightIndices: [],
            Message: $"Done in one pass. Maximum: {best}."
        ));

        return steps;
    }
}
