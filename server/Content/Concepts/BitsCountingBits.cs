namespace DsaAcademy.Content.Concepts;

public class BitsCountingBits : IConcept
{
    public string Id => "bits-counting-bits";
    public string Track => "bits";
    public int Order => 131;
    public string Title => "Bits: Counting Bits for 0 to n";
    public string OneLiner => "Return the number of 1 bits in every number from 0 to n in one O(n) pass, reusing the answer for i >> 1.";
    public string KeyTakeaway =>
        "i >> 1 is i with its lowest bit dropped, and it's smaller than i, so its count is already known: " +
        "bits[i] = bits[i >> 1] + (i & 1). That turns n separate popcounts into a one-line dynamic programming " +
        "fill, O(n) total. The same idea works with i & (i - 1), which clears the lowest set bit: bits[i] = " +
        "bits[i & (i - 1)] + 1.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Given n, return an array ans of length n + 1 where ans[i] is the number of 1 bits in the binary form of " +
        "i (its popcount, short for population count). For n = 5: 0, 1, 10, 11, 100, 101 have 0, 1, 1, 2, 1, 2 " +
        "ones, so the answer is [0, 1, 1, 2, 1, 2].\n\n" +
        "Counting each number's bits separately (the Count Set Bits lesson in the Patterns track) costs about " +
        "log n per number, O(n log n) in total. You can do better by reusing earlier answers, which is dynamic " +
        "programming on bits.\n\n" +
        "Shifting right by one, i >> 1, throws away the lowest bit: 13 is 1101, and 13 >> 1 is 110, which is 6. " +
        "So 13 has the same 1 bits as 6, plus one more if its lowest bit was 1. The lowest bit is i & 1 (AND with " +
        "1 keeps only that bit). Since i >> 1 is smaller than i, ans[i >> 1] is already filled in when you get to " +
        "i: ans[i] = ans[i >> 1] + (i & 1). One pass from 1 to n, constant work each.\n\n" +
        "Second recurrence, same speed: i & (i - 1) is i with its LOWEST SET bit cleared (subtracting 1 turns the " +
        "lowest 1 into 0 and every 0 below it into 1, so the AND wipes exactly that bit). That number is smaller " +
        "and has exactly one fewer 1, so ans[i] = ans[i & (i - 1)] + 1.\n\n" +
        "Built-ins, for when you only need one count: BitOperations.PopCount((uint)x) in System.Numerics, or " +
        "int.PopCount(x) in .NET 7 and later; x.bit_count() in Python 3.10 and later, or bin(x).count(\"1\") " +
        "before that. Note that bin() of a negative Python int is \"-0b101\", the sign and magnitude, not a " +
        "two's complement bit pattern, so its 1s are not the 32-bit popcount. Mask with x & 0xFFFFFFFF first.\n\n" +
        "The visualization fills ans for n = 8.";

    public List<string> RecognitionSignals =>
    [
        "A per-bit property (popcount, parity) needed for EVERY number in a range, not just one.",
        "\"Can you do it in O(n) without a built-in?\": reuse the answer for a smaller number with one bit removed.",
        "A number's answer depends on the same number with one bit removed: a DP over i >> 1 or i & (i - 1).",
    ];

    public List<string> Gotchas =>
    [
        "The result has n + 1 entries, from 0 to n inclusive.",
        "Write (i >> 1) and (i & 1) with brackets: in C# and Python, + binds tighter than >> and &, so ans[i >> 1] + i & 1 parses as (ans[i >> 1] + i) & 1.",
        "In Python, bin(-5).count('1') counts the bits of 5, not the 32-bit two's complement pattern of -5.",
    ];

    public List<string> ConfusableWith =>
    [
        "Bit Manipulation: Count Set Bits (Patterns track) counts ONE number's bits by shifting; this lesson needs all of 0..n and reuses earlier answers.",
        "Climbing Stairs and other 1-D DP fill an array left to right from earlier cells; here the earlier cell is i >> 1 instead of i - 1.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] CountBits(int n)\n" +
            "    {\n" +
            "        // TODO: ans = new int[n + 1]; ans[0] = 0.\n" +
            "        // For i from 1 to n: ans[i] = ans[i >> 1] + (i & 1).\n" +
            "        return new int[0];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def count_bits(n):\n" +
            "    # TODO: ans = [0] * (n + 1).\n" +
            "    # For i from 1 to n: ans[i] = ans[i >> 1] + (i & 1).\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CountBits",
        ["python"] = "count_bits",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Int(2), "[0, 1, 1]"),
        new TestCase(Lit.Int(5), "[0, 1, 1, 2, 1, 2]"),
        new TestCase(Lit.Int(0), "[0]"),
        new TestCase(Lit.Int(1), "[0, 1]"),
        new TestCase(Lit.Int(16), "[0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4, 1]"),
    ];

    public string CSharpCallTemplate => "Solution.CountBits({input})";
    public string PythonCallTemplate => "count_bits({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const int n = 8;
        var ans = new int[n + 1];
        var filled = 1;
        var steps = new List<VisualizationStep>();

        Dictionary<string, object> State() => new()
        {
            ["array"] = ans.Take(filled).Select(v => (object)v).Concat(Enumerable.Repeat((object)"?", n + 1 - filled)).ToArray(),
            ["tracker"] = filled - 1,
            ["trackerLabel"] = "filled up to i",
        };

        steps.Add(new VisualizationStep(State(), [0], "n = 8. ans[0] = 0 (0 has no 1 bits). Index i of the array is the number i."));
        for (var i = 1; i <= n; i++)
        {
            ans[i] = ans[i >> 1] + (i & 1);
            filled = i + 1;
            var bin = Convert.ToString(i, 2);
            var half = Convert.ToString(i >> 1, 2);
            steps.Add(new VisualizationStep(State(), [i >> 1, i],
                $"i = {i} ({bin}). i >> 1 = {i >> 1} ({half}) already has {ans[i >> 1]}; the dropped lowest bit i & 1 = {i & 1}. ans[{i}] = {ans[i >> 1]} + {i & 1} = {ans[i]}."));
        }
        steps.Add(new VisualizationStep(State(), [], $"Done: [{string.Join(", ", ans)}], one O(1) step per number."));
        return steps;
    }
}
