namespace DsaAcademy.Content.Concepts;

public class BasicsRunningTotal : IConcept
{
    public string Id => "basics-running-total";
    public string Section => Basics.Section;
    public string Track => "basics";
    public int Order => 43;
    public string Title => "Running Total";
    public string OneLiner => "Build a new list where each position holds the sum of everything up to and including that position.";
    public string KeyTakeaway =>
        "Carry one variable across iterations (the total so far) and append its value each time round. Building a new " +
        "output list, rather than changing the input, keeps the function free of surprises for its caller.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Given a list of numbers, return a new list of the same length where position i holds the sum of the input's " +
        "positions 0 to i. [1, 2, 3, 4] gives [1, 3, 6, 10]: 1, then 1 + 2, then 1 + 2 + 3, then 1 + 2 + 3 + 4. An empty " +
        "list gives an empty list. Think of a meter that shows today's production so far after every shift.\n\n" +
        "You don't need to re-add everything for each position (that would be O(n²) work). Keep a running total in a " +
        "variable: for each number, add it to the total, then append the total to the output. One pass, O(n).\n\n" +
        "In C# the result is an int[] the same length as the input (new int[nums.Length]), or build a List<int> and " +
        "call .ToArray(). In Python append to a list. Don't modify the input in place: the caller might still need it. " +
        "The same idea, called a prefix sum, powers fast range-sum queries in the Patterns track.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] RunningTotal(int[] nums)\n" +
            "    {\n" +
            "        var result = new int[nums.Length];\n" +
            "        // TODO: result[i] = nums[0] + ... + nums[i]\n" +
            "        return result;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def running_total(nums):\n" +
            "    result = []\n" +
            "    # TODO: result[i] = nums[0] + ... + nums[i]\n" +
            "    return result\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.RunningTotal",
        ["python"] = "running_total",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([1, 2, 3, 4]), "[1, 3, 6, 10]"),
        new TestCase(Lit.IntArray([]), "[]"),
        new TestCase(Lit.IntArray([5]), "[5]"),
        new TestCase(Lit.IntArray([3, -3, 3]), "[3, 0, 3]"),
        new TestCase(Lit.IntArray([10, 0, 0, 5]), "[10, 10, 10, 15]"),
    ];

    public string CSharpCallTemplate => "Solution.RunningTotal({input})";
    public string PythonCallTemplate => "running_total({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] sample = [40, 25, 0, 35];
        var arr = Basics.Boxed(sample);
        var steps = new List<VisualizationStep> { Basics.Step(arr, [], "[]", "output so far", "Units made per shift. Start with total = 0 and an empty output.") };
        var total = 0;
        var output = new List<int>();
        for (var i = 0; i < sample.Length; i++)
        {
            total += sample[i];
            output.Add(total);
            steps.Add(Basics.Step(arr, [i], "[" + string.Join(", ", output) + "]", "output so far", $"Add {sample[i]}: total is {total}. Append {total}."));
        }
        steps.Add(Basics.Step(arr, [], "[" + string.Join(", ", output) + "]", "output so far", "One pass: each number was added once, never re-summed."));
        return steps;
    }
}
