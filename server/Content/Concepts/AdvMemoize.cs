namespace DsaAcademy.Content.Concepts;

public class AdvMemoize : IConcept
{
    public string Id => "adv-memoize";
    public string Section => Basics.Section;
    public string Track => Adv.Track;
    public int Order => 2302;
    public string Title => "A Memoizing Wrapper";
    public string OneLiner => "Write Memoize, which wraps any int-to-long function so each argument is computed only once, with its own cache per wrapped function, fast enough to make a naive recursive Fibonacci instant.";
    public string KeyTakeaway =>
        "A memoizing wrapper is a closure over a dictionary: look the argument up, compute and store it on a miss, " +
        "return the stored value on a hit. Each call to Memoize must create a new dictionary, or two wrapped functions " +
        "share answers. Recursive calls must go through the wrapper for the recursion itself to be cached.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write Memoize(f), which takes a function from int to long and returns a new function that gives the same " +
        "results but calls f at most once per distinct argument, remembering every result. In Python write it as a " +
        "decorator, memoize(func), that can be used as @memoize, and copy the wrapped function's name onto the " +
        "wrapper with functools.wraps.\n\n" +
        "Each test wraps three functions. cube counts how often it really runs; the test calls the wrapper with the " +
        "given arguments and reports the results and that count, so [2, 3, 2, 2] must give [8, 27, 8, 8] with 2 real " +
        "calls. negate is wrapped separately and called with the first argument: if your cache is shared between " +
        "wrappers (a static field, a global dict), it returns cube's answer instead. Finally fib, a plain recursive " +
        "Fibonacci whose recursive calls go through the wrapper, is called with 70: without memoization that takes " +
        "longer than the age of the universe; with it, 71 real calls. The last value is true in C#; in Python it " +
        "checks that the wrapper's __name__ is \"cube\", which functools.wraps takes care of.\n\n" +
        "In C#, return a lambda that captures a Dictionary<int, long> created inside Memoize, and use TryGetValue. In " +
        "Python, create the dict inside memoize, and in the wrapper check \"if n not in cache\" before calling func. " +
        "(functools.cache does all this in real code; here you write it yourself.)";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static Func<int, long> Memoize(Func<int, long> f)\n" +
            "    {\n" +
            "        // TODO: a dictionary captured by the returned lambda.\n" +
            "        return n => f(n);\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "import functools\n" +
            "\n" +
            "\n" +
            "def memoize(func):\n" +
            "    # TODO: a dict of results, checked before calling func.\n" +
            "    @functools.wraps(func)\n" +
            "    def wrapper(n):\n" +
            "        return func(n)\n" +
            "    return wrapper\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Memoize",
        ["python"] = "memoize",
    };

    public string? CSharpHarnessPreamble =>
        "public static class MemoCheck\n" +
        "{\n" +
        "    public static List<object> Check(int[] args)\n" +
        "    {\n" +
        "        int cubeCalls = 0, fibCalls = 0;\n" +
        "        var cube = Solution.Memoize(n => { cubeCalls++; return (long)n * n * n; });\n" +
        "        var negate = Solution.Memoize(n => -n);\n" +
        "        Func<int, long> fib = null!;\n" +
        "        fib = Solution.Memoize(n => { fibCalls++; return n < 2 ? n : fib(n - 1) + fib(n - 2); });\n" +
        "        var results = new List<object>();\n" +
        "        foreach (var a in args) results.Add(cube(a));\n" +
        "        results.Add(cubeCalls);\n" +
        "        results.Add(negate(args[0]));\n" +
        "        results.Add(fib(70));\n" +
        "        results.Add(fibCalls);\n" +
        "        results.Add(true);\n" +
        "        return results;\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "def check_memoize(args):\n" +
        "    calls = {\"cube\": 0, \"fib\": 0}\n" +
        "\n" +
        "    def cube(n):\n" +
        "        calls[\"cube\"] += 1\n" +
        "        return n * n * n\n" +
        "\n" +
        "    def negate(n):\n" +
        "        return -n\n" +
        "\n" +
        "    def fib(n):\n" +
        "        calls[\"fib\"] += 1\n" +
        "        return n if n < 2 else memo_fib(n - 1) + memo_fib(n - 2)\n" +
        "\n" +
        "    memo_cube = memoize(cube)\n" +
        "    memo_negate = memoize(negate)\n" +
        "    memo_fib = memoize(fib)\n" +
        "    results = [memo_cube(a) for a in args]\n" +
        "    results.append(calls[\"cube\"])\n" +
        "    results.append(memo_negate(args[0]))\n" +
        "    results.append(memo_fib(70))\n" +
        "    results.append(calls[\"fib\"])\n" +
        "    results.append(memo_cube.__name__ == \"cube\")\n" +
        "    return results\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([2, 3, 2, 2]), "[8, 27, 8, 8, 2, -2, 190392490709135, 71, true]"),
        new TestCase(Lit.IntArray([5]), "[125, 1, -5, 190392490709135, 71, true]"),
        new TestCase(Lit.IntArray([-1, 0, -1, 0, 1]), "[-1, 0, -1, 0, 1, 3, 1, 190392490709135, 71, true]"),
        new TestCase(Lit.IntArray([1000, 1000, 1000]), "[1000000000, 1000000000, 1000000000, 1, -1000, 190392490709135, 71, true]"),
        new TestCase(Lit.IntArray([7, 6, 5, 6, 7]), "[343, 216, 125, 216, 343, 3, -7, 190392490709135, 71, true]"),
    ];

    public string CSharpCallTemplate => "MemoCheck.Check({input})";
    public string PythonCallTemplate => "check_memoize({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        object[] calls = [2, 3, 2, 2];
        return
        [
            Basics.Step(calls, [], "{}", "cache", "Four calls to the memoized cube: 2, 3, 2, 2. The cache starts empty."),
            Basics.Step(calls, [0], "{2: 8}", "cache", "2 isn't cached: call the real cube (call 1), store 8, return it."),
            Basics.Step(calls, [1], "{2: 8, 3: 27}", "cache", "3 isn't cached: call cube (call 2), store 27."),
            Basics.Step(calls, [2], "{2: 8, 3: 27}", "cache", "2 is cached: return 8 without calling cube."),
            Basics.Step(calls, [3], "{2: 8, 3: 27}", "cache", "Cached again. Two real calls for four answers; memoized fib(70) needs only 71 real calls instead of hundreds of trillions."),
        ];
    }
}
