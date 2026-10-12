namespace DsaAcademy.Content.Concepts;

public class DpClimbingStairs : IConcept
{
    public string Id => "dp-climbing-stairs";
    public string Track => "dynamic-programming";
    public string Title => "Dynamic Programming: Climbing Stairs (Bottom-Up)";
    public string OneLiner => "How many distinct ways to climb n stairs, taking 1 or 2 steps at a time? Build the answer bottom-up in an array instead of recursing top-down.";
    public string KeyTakeaway =>
        "Reaching stair i only has two possibilities: arrive via a 1-step from stair i-1, or a 2-step " +
        "from stair i-2 -- so ways(i) = ways(i-1) + ways(i-2), the EXACT SAME recurrence as Fibonacci. " +
        "This is BOTTOM-UP dynamic programming (tabulation): instead of recursing top-down from n and " +
        "caching along the way, fill an array from the base cases UP to n directly -- no recursion, no " +
        "call stack, no memo dictionary, just a loop.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Climbing n stairs one or two steps at a time, how many distinct sequences of steps reach the " +
        "top? Think about the LAST step taken to land on stair i: it was either a 1-step from stair " +
        "i-1, or a 2-step from stair i-2 -- there's no other way to arrive. So the number of ways to " +
        "reach stair i is the number of ways to reach i-1 PLUS the number of ways to reach i-2: " +
        "ways(i) = ways(i-1) + ways(i-2). That's the exact same recurrence as Fibonacci (see Recursion: " +
        "Fibonacci and Dynamic Programming: Fibonacci with Memoization) wearing a different problem's " +
        "clothes -- recognizing \"this recurrence IS Fibonacci\" is a genuinely useful pattern-matching " +
        "skill once you've solved Fibonacci once.\n\n" +
        "This lesson solves it BOTTOM-UP instead of top-down: rather than starting at ways(n) and " +
        "recursing down to base cases (with or without a memo cache), build an array dp where dp[i] " +
        "holds ways(i), filling it in order from the base cases (dp[0] = 1, dp[1] = 1) up to dp[n] " +
        "directly -- each new cell only needs the two cells immediately before it, already computed. " +
        "This is called TABULATION, and it has a real advantage over the top-down memoized version: no " +
        "recursion means no call stack at all, which matters for large n where deep recursion could " +
        "hit a stack limit that a simple loop never would.\n\n" +
        "Watch the array fill left to right below -- each new cell's value is read directly off the " +
        "two cells immediately behind it, exactly like the recurrence says.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int ClimbStairs(int n)\n" +
            "    {\n" +
            "        // TODO: dp[0] = 1 (one way to stand on the ground: do nothing), dp[1] = 1\n" +
            "        // (one way to reach stair 1). For i from 2 to n: dp[i] = dp[i - 1] + dp[i - 2]\n" +
            "        // (reach stair i either by a 1-step from i-1, or a 2-step from i-2).\n" +
            "        // Return dp[n].\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def climb_stairs(n):\n" +
            "    # TODO: dp[0] = 1 (one way to stand on the ground: do nothing), dp[1] = 1\n" +
            "    # (one way to reach stair 1). For i from 2 to n: dp[i] = dp[i - 1] + dp[i - 2]\n" +
            "    # (reach stair i either by a 1-step from i-1, or a 2-step from i-2).\n" +
            "    # Return dp[n].\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.ClimbStairs",
        ["python"] = "climb_stairs",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Int(1), "1"),
        new TestCase(Lit.Int(2), "2"),
        new TestCase(Lit.Int(3), "3"),
        new TestCase(Lit.Int(4), "5"),
        new TestCase(Lit.Int(5), "8"),
        new TestCase(Lit.Int(10), "89"),
    ];

    public string CSharpCallTemplate => "Solution.ClimbStairs({input})";
    public string PythonCallTemplate => "climb_stairs({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const int n = 6;
        var steps = new List<VisualizationStep>();
        var dp = new int?[n + 1];

        object[] Snapshot() => dp.Select(d => d.HasValue ? (object)d.Value : "").ToArray();

        dp[0] = 1;
        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = Snapshot() },
            HighlightIndices: [0],
            Message: "dp[0] = 1 -- one way to be standing at the bottom (do nothing)."
        ));

        dp[1] = 1;
        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = Snapshot() },
            HighlightIndices: [1],
            Message: "dp[1] = 1 -- one way to reach stair 1 (a single 1-step)."
        ));

        for (var i = 2; i <= n; i++)
        {
            dp[i] = dp[i - 1] + dp[i - 2];
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = Snapshot() },
                HighlightIndices: [i, i - 1, i - 2],
                Message: $"dp[{i}] = dp[{i - 1}] + dp[{i - 2}] = {dp[i - 1]} + {dp[i - 2]} = {dp[i]}."
            ));
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = Snapshot() },
            HighlightIndices: [n],
            Message: $"Done -- {dp[n]} distinct ways to climb {n} stairs."
        ));

        return steps;
    }
}
