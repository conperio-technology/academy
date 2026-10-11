namespace DsaAcademy.Content.Concepts;

public class RecursionFactorial : IConcept
{
    public string Id => "recursion-factorial";
    public string Track => "fundamentals";

    // See ArrayTraversalSum.cs -- keeps this track ahead of Trees/Graphs/Sorting/DP/
    // Patterns so Hashing (Order = 60) can slot in right after it.
    public int Order => 50;

    public string Title => "Recursion: Factorial";
    public string OneLiner => "A function that calls itself, with a stopping condition -- the call stack does the bookkeeping.";
    public string KeyTakeaway =>
        "Recursion is just the call stack (the list of function calls that have started but not yet returned, newest on top) keeping track of \"what to do when this call finally " +
        "returns\" for you. Every recursive function needs a base case that stops the recursion -- " +
        "without one, it's an infinite loop that happens to crash with a stack overflow (the memory reserved " +
        "for the call stack running out) instead of hanging forever.";
    public VisualizerKind VisualizerKind => VisualizerKind.CallStack;

    public string Explanation =>
        "factorial(n) = n x (n-1) x (n-2) x ... x 1, and it has a natural recursive definition: " +
        "factorial(n) = n * factorial(n - 1), with factorial(0) = 1 as the base case (the thing that " +
        "stops the recursion). Each call to factorial(n) can't finish until factorial(n - 1) returns " +
        "-- so calls pile up on the call stack (factorial(5) waiting on factorial(4) waiting on " +
        "factorial(3)...) until the base case is hit, and then they unwind, each one multiplying its " +
        "own n by the result it got back. Step through the visualization to see the stack grow " +
        "(calling down to the base case) and then shrink (returning back up, computing as it goes). " +
        "Watch out for the base case being wrong in either direction: missing it entirely means " +
        "infinite recursion (stack overflow), and an off-by-one base case can do the same: stopping " +
        "only at n == 1 works for factorial(5), but factorial(0) (which this lesson tests) then calls " +
        "factorial(-1), factorial(-2), ... and never reaches it. A base case of n <= 1 catches both 0 " +
        "and 1.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int Factorial(int n)\n" +
            "    {\n" +
            "        // TODO: base case -- if n is 0, return 1.\n" +
            "        // Otherwise, return n * Factorial(n - 1).\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def factorial(n):\n" +
            "    # TODO: base case -- if n is 0, return 1.\n" +
            "    # Otherwise, return n * factorial(n - 1).\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Factorial",
        ["python"] = "factorial",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Int(0), "1"),
        new TestCase(Lit.Int(1), "1"),
        new TestCase(Lit.Int(3), "6"),
        new TestCase(Lit.Int(5), "120"),
        new TestCase(Lit.Int(6), "720"),
    ];

    public string CSharpCallTemplate => "Solution.Factorial({input})";
    public string PythonCallTemplate => "factorial({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const int n = 5;
        var steps = new List<VisualizationStep>();
        var frames = new List<string>();

        int Factorial(int k)
        {
            frames.Add($"factorial({k})");
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["frames"] = frames.ToArray() },
                HighlightIndices: [frames.Count - 1],
                Message: k == 0
                    ? $"factorial({k}) -- base case reached. Return 1 without recursing further."
                    : $"factorial({k}) -- not the base case, so call factorial({k - 1}) and wait for it to return."
            ));

            var result = k == 0 ? 1 : k * Factorial(k - 1);

            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["frames"] = frames.ToArray() },
                HighlightIndices: [frames.Count - 1],
                Message: k == 0
                    ? $"factorial({k}) returns {result}."
                    : $"factorial({k - 1}) returned. factorial({k}) computes {k} * {result / k} = {result} and returns."
            ));
            frames.RemoveAt(frames.Count - 1);

            return result;
        }

        Factorial(n);
        return steps;
    }
}
