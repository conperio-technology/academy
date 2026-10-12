namespace DsaAcademy.Content.Concepts;

public class DpFibonacciMemo : IConcept
{
    public string Id => "dp-fibonacci-memo";
    public string Track => "dynamic-programming";
    public string Title => "Dynamic Programming: Fibonacci with Memoization";
    public string OneLiner => "Same recursive fib(n) = fib(n-1) + fib(n-2) as before -- but check a cache before recursing, and the exponential blowup disappears.";
    public string KeyTakeaway =>
        "Memoization turns Recursion: Fibonacci's O(2^n) into O(n): every fib(k) gets computed at " +
        "most ONCE, cached, and every later call that needs it again returns instantly instead of " +
        "re-expanding the whole subtree underneath it. The exact same recursive structure, but every " +
        "value computed exactly once -- that's the entire idea behind top-down Dynamic Programming.";
    public VisualizerKind VisualizerKind => VisualizerKind.CallStack;

    public string Explanation =>
        "Recursion: Fibonacci's recursive definition is correct but wasteful -- fib(4) gets computed " +
        "from scratch by BOTH fib(6)'s call to fib(5) (which needs fib(4)) AND fib(6)'s direct call to " +
        "fib(4), completely independently, with zero memory that the other branch already solved it. " +
        "Memoization fixes this with one addition: before doing any real recursion, check whether this " +
        "exact input has already been computed and cached -- if so, return the cached value " +
        "immediately; if not, compute it the normal recursive way, then cache the result before " +
        "returning. This is called TOP-DOWN dynamic programming: the recursive structure stays exactly " +
        "the same as the naive version, \"top\" (the original call) recursing \"down\" toward the base " +
        "cases, just with a cache remembering everything along the way.\n\n" +
        "Step through the visualization and compare it directly against Recursion: Fibonacci's for the " +
        "same-shaped problem: every fib(k) that would have been recomputed from scratch instead shows " +
        "up as a \"[cached]\" frame that returns INSTANTLY, with no further recursion underneath it -- " +
        "fib(1), fib(2), fib(3), and fib(4) each get computed exactly once here despite being needed " +
        "multiple times across the call tree. For a small n like this the difference in step COUNT " +
        "looks modest, but the shape is what matters: naive Fibonacci's call count roughly DOUBLES " +
        "with every increase in n (true exponential growth), while memoized Fibonacci computes each " +
        "value from 0 to n exactly once -- linear, not exponential. At n = 30, naive Fibonacci makes " +
        "over a million recursive calls; memoized Fibonacci computes only 31 distinct values (about 59 calls, because every fib(k) above fib(1) still calls both children; the repeat calls return straight from the cache).\n\n" +
        "The same idea generalizes far beyond Fibonacci: ANY recursive problem where the same " +
        "sub-problem gets solved multiple times independently (\"overlapping subproblems\") is a " +
        "memoization candidate -- caching turns repeated expensive recomputation into \"compute once, " +
        "look up everything else.\" See Dynamic Programming: Climbing Stairs (Bottom-Up) for the same " +
        "underlying recurrence solved the other direction, without recursion at all.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    private static readonly Dictionary<int, int> Memo = new();\n" +
            "\n" +
            "    public static int Fibonacci(int n)\n" +
            "    {\n" +
            "        // TODO: if n is 0 or 1, return n.\n" +
            "        // Otherwise: if Memo already has n, return the cached value.\n" +
            "        // Otherwise compute Fibonacci(n - 1) + Fibonacci(n - 2), store it in\n" +
            "        // Memo[n], and return it.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "_memo = {}\n" +
            "\n" +
            "def fibonacci(n):\n" +
            "    # TODO: if n is 0 or 1, return n.\n" +
            "    # Otherwise: if n is already in _memo, return the cached value.\n" +
            "    # Otherwise compute fibonacci(n - 1) + fibonacci(n - 2), store it in\n" +
            "    # _memo[n], and return it.\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Fibonacci",
        ["python"] = "fibonacci",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Int(0), "0"),
        new TestCase(Lit.Int(1), "1"),
        new TestCase(Lit.Int(2), "1"),
        new TestCase(Lit.Int(5), "5"),
        new TestCase(Lit.Int(7), "13"),
        new TestCase(Lit.Int(10), "55"),
        new TestCase(Lit.Int(20), "6765"),
    ];

    public string CSharpCallTemplate => "Solution.Fibonacci({input})";
    public string PythonCallTemplate => "fibonacci({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const int n = 6; // small enough to keep the trace readable, big enough to show real cache hits
        var steps = new List<VisualizationStep>();
        var frames = new List<string>();
        var memo = new Dictionary<int, int>();

        int Fib(int k)
        {
            if (memo.TryGetValue(k, out var cached))
            {
                frames.Add($"fib({k}) [cached]");
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["frames"] = frames.ToArray() },
                    HighlightIndices: [frames.Count - 1],
                    Message: $"fib({k}) already in the memo -- return {cached} instantly, no recursion."
                ));
                frames.RemoveAt(frames.Count - 1);
                return cached;
            }

            frames.Add($"fib({k})");
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["frames"] = frames.ToArray() },
                HighlightIndices: [frames.Count - 1],
                Message: k <= 1
                    ? $"fib({k}) -- base case. Return {k}."
                    : $"fib({k}) -- not cached, not a base case. Call fib({k - 1}) first, then fib({k - 2})."
            ));

            var result = k <= 1 ? k : Fib(k - 1) + Fib(k - 2);
            memo[k] = result;

            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["frames"] = frames.ToArray() },
                HighlightIndices: [frames.Count - 1],
                Message: $"fib({k}) = {result}. Cache it and return."
            ));
            frames.RemoveAt(frames.Count - 1);

            return result;
        }

        Fib(n);
        return steps;
    }
}
