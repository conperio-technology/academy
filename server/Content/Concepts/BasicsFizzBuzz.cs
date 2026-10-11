namespace DsaAcademy.Content.Concepts;

public class BasicsFizzBuzz : IConcept
{
    public string Id => "basics-fizzbuzz";
    public string Section => Basics.Section;
    public string Track => "basics";
    public int Order => 42;
    public string Title => "FizzBuzz as a List";
    public string OneLiner => "The classic screening question, returning a list of strings instead of printing, so the order of the checks really matters.";
    public string KeyTakeaway =>
        "Check the most specific condition first: a multiple of 15 is also a multiple of 3 and of 5, so test it (or build " +
        "the string from both parts) before the single checks. Returning a list rather than printing makes code testable.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "For each number from 1 to n inclusive, produce a string: \"Fizz\" if the number is a multiple of 3, \"Buzz\" if " +
        "it's a multiple of 5, \"FizzBuzz\" if it's a multiple of both, and otherwise the number itself as text. Return " +
        "them all as a list, in order. For n = 5 that's [\"1\", \"2\", \"Fizz\", \"4\", \"Buzz\"]; for n = 0 it's an empty " +
        "list.\n\n" +
        "Two things trip people up. The range: it's 1 to n including n, so for (int i = 1; i <= n; i++) in C# and " +
        "range(1, n + 1) in Python. And the order of the checks: if you test i % 3 == 0 first, 15 becomes \"Fizz\" and " +
        "never reaches the FizzBuzz branch. Test i % 15 == 0 first, or build the string: start empty, add \"Fizz\" for " +
        "multiples of 3, add \"Buzz\" for multiples of 5, and if it's still empty use the number.\n\n" +
        "In C# return a List<string> and use i.ToString(); in Python return a list and use str(i).";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static List<string> FizzBuzz(int n)\n" +
            "    {\n" +
            "        var result = new List<string>();\n" +
            "        // TODO: for 1..n add \"Fizz\", \"Buzz\", \"FizzBuzz\" or the number as text.\n" +
            "        return result;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def fizz_buzz(n):\n" +
            "    result = []\n" +
            "    # TODO: for 1..n add \"Fizz\", \"Buzz\", \"FizzBuzz\" or the number as text.\n" +
            "    return result\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.FizzBuzz",
        ["python"] = "fizz_buzz",
    };

    private static string Expected(int n) =>
        Basics.StrArray(Enumerable.Range(1, n).Select(i => i % 15 == 0 ? "FizzBuzz" : i % 3 == 0 ? "Fizz" : i % 5 == 0 ? "Buzz" : i.ToString()).ToArray());

    public List<TestCase> TestCases =>
    [
        new TestCase("5", Expected(5)),
        new TestCase("1", Expected(1)),
        new TestCase("0", "[]"),
        new TestCase("15", Expected(15)),
        new TestCase("16", Expected(16)),
    ];

    public string CSharpCallTemplate => "Solution.FizzBuzz({input})";
    public string PythonCallTemplate => "fizz_buzz({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] picks = [1, 3, 5, 15];
        var nums = Basics.Boxed(picks);
        var steps = new List<VisualizationStep> { Basics.Step(nums, [], "[]", "result", "Four of the numbers from 1 to 15 that show every rule. Watch 15 especially.") };
        for (var k = 0; k < picks.Length; k++)
        {
            var i = picks[k];
            var word = i % 15 == 0 ? "FizzBuzz" : i % 3 == 0 ? "Fizz" : i % 5 == 0 ? "Buzz" : i.ToString();
            var why = i switch
            {
                1 => "1 is a multiple of neither: add \"1\" as text.",
                3 => "3 % 3 == 0: \"Fizz\".",
                5 => "5 % 5 == 0: \"Buzz\".",
                _ => "15 is a multiple of 3 AND 5. If the % 3 check came first it would wrongly be \"Fizz\"; checking 15 first gives \"FizzBuzz\".",
            };
            steps.Add(Basics.Step(nums, [k], word, "this number gives", why));
        }
        return steps;
    }
}
