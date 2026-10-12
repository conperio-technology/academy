namespace DsaAcademy.Content.Concepts;

public class InterFibonacciGenerator : IConcept
{
    public string Id => "inter-fibonacci-generator";
    public string Section => Basics.Section;
    public string Track => Inter.Track;
    public int Order => 1402;
    public string Title => "An Endless Fibonacci Generator";
    public string OneLiner => "Write a generator that yields the Fibonacci numbers forever, and let the caller decide how many to take.";
    public string KeyTakeaway =>
        "An endless loop with yield inside is fine, because the caller pulls only as many items as it needs (Take, " +
        "islice). The generator keeps just the last two numbers between yields: O(1) memory however far it runs. Use " +
        "long in C#; the numbers pass int's limit after 46 of them.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write Fibonacci(), which yields 0, 1, 1, 2, 3, 5, 8, 13, ... forever: each number after the first two is the " +
        "sum of the two before it. It takes no arguments and never stops on its own. Each test takes the first n " +
        "numbers with Fibonacci().Take(n) in C# or itertools.islice(fibonacci(), n) in Python, so n = 10 gives [0, 1, " +
        "1, 2, 3, 5, 8, 13, 21, 34] and n = 0 gives [].\n\n" +
        "Keep two variables, a = 0 and b = 1. Loop forever (while (true) / while True): yield a, then move both along " +
        "at once, a becomes b and b becomes a + b. Python's tuple assignment a, b = b, a + b does that in one line; in " +
        "C#, (a, b) = (b, a + b) does the same.\n\n" +
        "In C#, the method returns IEnumerable<long>: the 48th Fibonacci number is too big for an int, which would " +
        "silently wrap around to a negative number, and the longest test takes 50. Python's ints never overflow. Don't " +
        "try to build a list inside the generator: it would never finish.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static IEnumerable<long> Fibonacci()\n" +
            "    {\n" +
            "        long a = 0, b = 1;\n" +
            "        // TODO: loop forever, yield return a, then move a and b along.\n" +
            "        yield break;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def fibonacci():\n" +
            "    a, b = 0, 1\n" +
            "    # TODO: loop forever, yield a, then move a and b along.\n" +
            "    yield from ()\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Fibonacci",
        ["python"] = "fibonacci",
    };

    // Each test takes the first n numbers from the endless sequence.
    public string? CSharpHarnessPreamble =>
        "public static class FibonacciCheck\n" +
        "{\n" +
        "    public static List<long> Check(int n) => Solution.Fibonacci().Take(n).ToList();\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "import itertools as _itertools\n" +
        "\n" +
        "\n" +
        "def check_fibonacci(n):\n" +
        "    return list(_itertools.islice(fibonacci(), n))\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Int(1), "[0]"),
        new TestCase(Lit.Int(2), "[0, 1]"),
        new TestCase(Lit.Int(10), "[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]"),
        new TestCase(Lit.Int(0), "[]"),
        new TestCase(Lit.Int(50), "[0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765, 10946, 17711, 28657, 46368, 75025, 121393, 196418, 317811, 514229, 832040, 1346269, 2178309, 3524578, 5702887, 9227465, 14930352, 24157817, 39088169, 63245986, 102334155, 165580141, 267914296, 433494437, 701408733, 1134903170, 1836311903, 2971215073, 4807526976, 7778742049]"),
    ];

    public string CSharpCallTemplate => "FibonacciCheck.Check({input})";
    public string PythonCallTemplate => "check_fibonacci({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        var shown = new List<object>();
        var steps = new List<VisualizationStep> { Basics.Step([], [], "a = 0, b = 1", "state", "Nothing runs until the caller asks for the first number.") };
        long a = 0, b = 1;
        for (var i = 0; i < 6; i++)
        {
            shown.Add(a);
            steps.Add(Basics.Step(shown.ToArray(), [i], $"a = {a}, b = {b}", "state", $"Asked for item {i + 1}: yield {a}, then pause. Next time, a becomes {b} and b becomes {a + b}."));
            (a, b) = (b, a + b);
        }
        steps.Add(Basics.Step(shown.ToArray(), [], "a = 8, b = 13", "state", "Take(6) stops asking, so the endless loop simply never resumes. Only two numbers were ever stored."));
        return steps;
    }
}
