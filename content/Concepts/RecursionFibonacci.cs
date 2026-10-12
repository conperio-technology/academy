namespace DsaAcademy.Content.Concepts;

public class RecursionFibonacci : IConcept
{
    public string Id => "recursion-fibonacci";
    public string Track => "fundamentals";

    // See ArrayTraversalSum.cs -- keeps this track ahead of Trees/Graphs/Sorting/DP/
    // Patterns so Hashing (Order = 60) can slot in right after it.
    public int Order => 50;

    public string Title => "Recursion: Fibonacci";
    public string OneLiner => "Factorial calls itself once per call. This calls itself TWICE -- and that branching is where recursion's cost can quietly explode.";
    public string KeyTakeaway =>
        "fib(n) = fib(n-1) + fib(n-2) branches into two recursive calls at every step (unlike " +
        "Factorial's one), and those two calls share massive overlap -- fib(n-1) and fib(n-2) both " +
        "end up separately recomputing fib(n-3), fib(n-4), and so on, all the way down. The call " +
        "count roughly doubles per level, giving O(2^n) -- the exact kind of explosion Big O's chart " +
        "shows pulling away from everything else. Remembering (memoizing) results already computed is " +
        "the fix, and it's the entire idea behind Dynamic Programming.";
    public VisualizerKind VisualizerKind => VisualizerKind.CallStack;

    public string Explanation =>
        "The Fibonacci sequence is defined recursively: fib(0) = 0, fib(1) = 1, and every fib(n) after " +
        "that is fib(n-1) + fib(n-2) -- each term is the sum of the two before it (0, 1, 1, 2, 3, 5, 8, " +
        "13, ...). Written exactly as defined, the recursive implementation calls itself TWICE per " +
        "call instead of Factorial's once, which changes the shape entirely: the call tree branches, " +
        "and the SAME smaller sub-calls (fib(2), fib(3), ...) get recomputed from scratch by many " +
        "different branches independently, with zero memory that they were already solved. Step " +
        "through the visualization and watch how many times small values like fib(1) get computed " +
        "completely separately -- that repeated, wasted work is exactly what memoization (caching each " +
        "fib(n) the first time it's computed, then returning the cached value instead of recursing " +
        "again) eliminates, which is a later lesson's whole point. Watch out for the TWO base cases -- " +
        "fib(0) = 0 AND fib(1) = 1 both need to stop the recursion, not just one of them.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int Fibonacci(int n)\n" +
            "    {\n" +
            "        // TODO: base cases -- if n is 0 or 1, return n.\n" +
            "        // Otherwise, return Fibonacci(n - 1) + Fibonacci(n - 2).\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def fibonacci(n):\n" +
            "    # TODO: base cases -- if n is 0 or 1, return n.\n" +
            "    # Otherwise, return fibonacci(n - 1) + fibonacci(n - 2).\n" +
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
    ];

    public string CSharpCallTemplate => "Solution.Fibonacci({input})";
    public string PythonCallTemplate => "fibonacci({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const int n = 4; // small enough to keep the branching trace readable
        var steps = new List<VisualizationStep>();
        var frames = new List<string>();

        int Fib(int k)
        {
            frames.Add($"fib({k})");
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["frames"] = frames.ToArray() },
                HighlightIndices: [frames.Count - 1],
                Message: k <= 1
                    ? $"fib({k}) -- base case. Return {k}."
                    : $"fib({k}) -- not a base case. Call fib({k - 1}) first, then fib({k - 2})."
            ));

            var result = k <= 1 ? k : Fib(k - 1) + Fib(k - 2);

            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["frames"] = frames.ToArray() },
                HighlightIndices: [frames.Count - 1],
                Message: $"fib({k}) returns {result}."
            ));
            frames.RemoveAt(frames.Count - 1);

            return result;
        }

        Fib(n);
        return steps;
    }
}
