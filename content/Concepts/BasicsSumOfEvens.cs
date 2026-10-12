namespace DsaAcademy.Content.Concepts;

public class BasicsSumOfEvens : IConcept
{
    public string Id => "basics-sum-of-evens";
    public string Section => Basics.Section;
    public string Track => "basics";
    public int Order => 41;
    public string Title => "Sum of the Even Numbers";
    public string OneLiner => "Loop over a list, keep only the even numbers, and add them up, negative numbers included.";
    public string KeyTakeaway =>
        "Test evenness with n % 2 == 0, never with n % 2 == 1 for odd: in C# a negative odd number gives -1, not 1. " +
        "Loop, filter with an if, accumulate into a variable that starts at 0.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Return the sum of the even numbers in the list. An empty list, or one with no even numbers, sums to 0. The list " +
        "can contain negative numbers, and negative even numbers count.\n\n" +
        "This is the loop-filter-accumulate shape you'll use constantly: start a total at 0, loop over every number, and " +
        "add it only if it passes a test. A number is even when dividing by 2 leaves no remainder: n % 2 == 0.\n\n" +
        "Watch the negative case. In C#, -3 % 2 is -1 (the remainder takes the sign of the left side), so an \"is it " +
        "odd?\" test written as n % 2 == 1 misses negative odd numbers. In Python -3 % 2 is 1, so the same test happens " +
        "to work there. Testing n % 2 == 0 is correct in both. When it passes, try the one-line versions: " +
        "nums.Where(n => n % 2 == 0).Sum() in C#, sum(n for n in nums if n % 2 == 0) in Python.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int SumOfEvens(int[] nums)\n" +
            "    {\n" +
            "        // TODO: add up only the even numbers.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def sum_of_evens(nums):\n" +
            "    # TODO: add up only the even numbers.\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.SumOfEvens",
        ["python"] = "sum_of_evens",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([1, 2, 3, 4]), "6"),
        new TestCase(Lit.IntArray([]), "0"),
        new TestCase(Lit.IntArray([1, 3, 5]), "0"),
        new TestCase(Lit.IntArray([-2, -3, 4]), "2"),
        new TestCase(Lit.IntArray([10]), "10"),
        new TestCase(Lit.IntArray([0, 7, 8, -7]), "8"),
    ];

    public string CSharpCallTemplate => "Solution.SumOfEvens({input})";
    public string PythonCallTemplate => "sum_of_evens({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] sample = [5, -4, 7, 10, -3];
        var arr = Basics.Boxed(sample);
        var steps = new List<VisualizationStep> { Basics.Step(arr, [], 0, "sum of evens", "Start the total at 0.") };
        var total = 0;
        for (var i = 0; i < sample.Length; i++)
        {
            var n = sample[i];
            var even = n % 2 == 0;
            if (even) total += n;
            steps.Add(Basics.Step(arr, [i], total, "sum of evens",
                even ? $"{n} % 2 is 0: even, add it. Total {total}." : $"{n} % 2 is {n % 2} (in C#): odd, skip it."));
        }
        steps.Add(Basics.Step(arr, [], total, "sum of evens", $"Done: {total}. Note -3 % 2 is -1 in C#, which is why \"== 1\" is the wrong odd test."));
        return steps;
    }
}
