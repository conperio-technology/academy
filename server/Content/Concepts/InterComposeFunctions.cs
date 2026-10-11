namespace DsaAcademy.Content.Concepts;

public class InterComposeFunctions : IConcept
{
    public string Id => "inter-compose-functions";
    public string Section => Basics.Section;
    public string Track => Inter.Track;
    public int Order => 1001;
    public string Title => "Compose Functions";
    public string OneLiner => "Write a higher-order function that takes a list of functions and returns one function that applies them all in order.";
    public string KeyTakeaway =>
        "A function can build and return a new function. The returned lambda is a closure: it keeps the list of steps " +
        "alive and loops over them each time it's called. An empty list of steps gives the identity function, x => x.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write Compose(steps), which takes a list of functions from int to int and returns a single function that runs " +
        "its input through every step in order. With steps [inc, double], the result does double(inc(x)): Compose([inc, " +
        "double])(3) is (3 + 1) × 2 = 8. With no steps it returns its input unchanged.\n\n" +
        "Each test builds the steps from names (inc adds 1, double multiplies by 2, square multiplies a number by " +
        "itself, negate flips the sign), calls your Compose once, then calls the function it returned twice: on the " +
        "test's x and on 0. So the test ([\"inc\", \"double\"], 3) expects [8, 2].\n\n" +
        "In C# the steps arrive as a List<Func<int, int>> and you return a Func<int, int>; in Python they're a list of " +
        "callables and you return a function. The neat solution returns a lambda that loops over the steps: x => { " +
        "foreach (var step in steps) x = step(x); return x; } in C#, or a nested def in Python. The lambda captures " +
        "steps, which is a closure. Python's functools.reduce can also do it in one line, but write the loop first.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    // Compose([f, g]) returns a function that computes g(f(x)).\n" +
            "    public static Func<int, int> Compose(List<Func<int, int>> steps)\n" +
            "    {\n" +
            "        // TODO: return a function that runs x through each step in turn.\n" +
            "        return x => x;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def compose(steps):\n" +
            "    # compose([f, g]) returns a function that computes g(f(x)).\n" +
            "    # TODO: return a function that runs x through each step in turn.\n" +
            "    return lambda x: x\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Compose",
        ["python"] = "compose",
    };

    // Each test turns step names into functions, composes them once, and calls the result on x and on 0.
    public string? CSharpHarnessPreamble =>
        "public static class ComposeCheck\n" +
        "{\n" +
        "    private static readonly Dictionary<string, Func<int, int>> Steps = new()\n" +
        "    {\n" +
        "        [\"inc\"] = x => x + 1,\n" +
        "        [\"double\"] = x => x * 2,\n" +
        "        [\"square\"] = x => x * x,\n" +
        "        [\"negate\"] = x => -x,\n" +
        "    };\n" +
        "\n" +
        "    public static int[] Check(string[] names, int x)\n" +
        "    {\n" +
        "        var f = Solution.Compose(names.Select(n => Steps[n]).ToList());\n" +
        "        return [f(x), f(0)];\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "_COMPOSE_STEPS = {\n" +
        "    \"inc\": lambda x: x + 1,\n" +
        "    \"double\": lambda x: x * 2,\n" +
        "    \"square\": lambda x: x * x,\n" +
        "    \"negate\": lambda x: -x,\n" +
        "}\n" +
        "\n" +
        "\n" +
        "def check_compose(names, x):\n" +
        "    f = compose([_COMPOSE_STEPS[n] for n in names])\n" +
        "    return [f(x), f(0)]\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Basics.StrArray("inc", "double"), Lit.Int(3)), "[8, 2]"),
        new TestCase(Lit.Args(Basics.StrArray("double", "inc"), Lit.Int(3)), "[7, 1]"),
        new TestCase(Lit.Args(Basics.StrArray(), Lit.Int(5)), "[5, 0]"),
        new TestCase(Lit.Args(Basics.StrArray("square", "negate", "inc"), Lit.Int(4)), "[-15, 1]"),
        new TestCase(Lit.Args(Basics.StrArray("inc", "inc", "inc"), Lit.Int(10)), "[13, 3]"),
        new TestCase(Lit.Args(Basics.StrArray("negate", "square"), Lit.Int(-3)), "[9, 0]"),
    ];

    public string CSharpCallTemplate => "ComposeCheck.Check({input})";
    public string PythonCallTemplate => "check_compose({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        object[] names = ["inc", "double", "square"];
        return
        [
            Basics.Step(names, [], "3", "x", "Compose([inc, double, square]) returns one new function. Call it with x = 3."),
            Basics.Step(names, [0], "4", "x", "First step, inc: 3 + 1 = 4."),
            Basics.Step(names, [1], "8", "x", "Second step, double: 4 × 2 = 8."),
            Basics.Step(names, [2], "64", "x", "Third step, square: 8 × 8 = 64. That's the result."),
            Basics.Step(names, [], "0, 1, 2, 4", "f(0)", "The same function works on any x: f(0) goes 0, 1, 2, then 4. The steps list lives on inside it (a closure)."),
        ];
    }
}
