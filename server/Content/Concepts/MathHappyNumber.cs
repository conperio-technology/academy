namespace DsaAcademy.Content.Concepts;

public class MathHappyNumber : IConcept
{
    public string Id => "math-happy-number";
    public string Track => "math";
    public int Order => 121;
    public string Title => "Math: Happy Number (Digit Math and Cycle Detection)";
    public string OneLiner => "Repeatedly replace n by the sum of the squares of its digits; it either reaches 1 or loops forever, and a seen-set or Floyd's two pointers tells which.";
    public string KeyTakeaway =>
        "Peel digits with n % 10 and n / 10 (n // 10 in Python), no string conversion needed. The sequence can't " +
        "grow without bound (a number with d digits maps to at most 81 * d), so it must eventually repeat: either " +
        "it hits 1 or it cycles. Detect the cycle with a hash set, or with Floyd's slow and fast pointers in O(1) " +
        "space.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "A number is happy if repeatedly replacing it with the sum of the squares of its digits eventually reaches " +
        "1. 19 is happy: 1 + 81 = 82, 64 + 4 = 68, 36 + 64 = 100, 1 + 0 + 0 = 1. 2 is not: 2, 4, 16, 37, 58, 89, " +
        "145, 42, 20, 4, and 4 has been seen before, so it loops for ever without reaching 1. Return true if n is " +
        "happy.\n\n" +
        "Digit math: n % 10 is the last digit and n / 10 drops it (integer division). Loop while n > 0 to visit " +
        "every digit, lowest first. That's O(number of digits) = O(log n), and it avoids building a string. In C# " +
        "/ on two ints already truncates; in Python use //, because / always gives a float. Both languages agree " +
        "here since n is never negative. (With negative numbers they don't: in C#, -7 / 2 is -3 and -7 % 2 is -1, " +
        "while in Python -7 // 2 is -4 and -7 % 2 is 1. Python rounds down, C# rounds toward zero.)\n\n" +
        "Why it must end: a number with d digits has a digit-square sum of at most 81 * d. For any number with 4 " +
        "or more digits that's smaller than the number itself, so the sequence drops below 1,000 and stays below " +
        "about 1,000 from then on. A sequence trapped in a finite range must repeat a value, and once it repeats " +
        "it cycles. So the question is only \"does the cycle contain 1?\".\n\n" +
        "Two ways to detect the repeat. Keep a hash set of values seen: if the next value is already there, it's " +
        "a cycle without 1. Or use Floyd's cycle detection, the same idea as Linked List Cycle: slow takes one " +
        "step, fast takes two; if there's a cycle they meet inside it. Since 1 maps to 1, the happy case is also a " +
        "\"cycle\" (of length one), so loop until slow == fast and check whether they met at 1.\n\n" +
        "The visualization follows 2 until it repeats.";

    public List<string> RecognitionSignals =>
    [
        "\"Repeat this transformation until ...\" with no obvious bound on the number of steps.",
        "Digit-by-digit processing of an integer: sums of digits, reversing, palindromic numbers.",
        "A sequence where each value determines the next one, so a repeat means an infinite loop: think cycle detection.",
    ];

    public List<string> Gotchas =>
    [
        "Without a seen-set or Floyd's pointers, an unhappy number loops for ever.",
        "In Python use // for integer division; n / 10 makes a float, so the digits come out fractional and the sum is wrong.",
        "With Floyd's method, advance fast by TWO applications of the digit-square function per step, and test for 1 when they meet.",
    ];

    public List<string> ConfusableWith =>
    [
        "Linked List Cycle II (Patterns track) uses the same slow and fast pointers on real nodes; here the \"next pointer\" is a function of the number.",
        "Reverse Integer (this track) uses the same % 10 and / 10 digit loop, but must also guard against overflow.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static bool IsHappy(int n)\n" +
            "    {\n" +
            "        // TODO: write Next(n): sum of (n % 10)^2 while n > 0, n /= 10.\n" +
            "        // Then either keep a HashSet<int> of values seen until you reach 1 or a repeat,\n" +
            "        // or run slow = Next(slow), fast = Next(Next(fast)) until they meet.\n" +
            "        // Return true if the sequence reaches 1.\n" +
            "        return false;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def is_happy(n):\n" +
            "    # TODO: write nxt(n): sum of (n % 10) ** 2 while n > 0, n //= 10.\n" +
            "    # Then either keep a set of values seen until you reach 1 or a repeat,\n" +
            "    # or run slow = nxt(slow), fast = nxt(nxt(fast)) until they meet.\n" +
            "    # Return True if the sequence reaches 1.\n" +
            "    return False\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.IsHappy",
        ["python"] = "is_happy",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Int(19), "true"),
        new TestCase(Lit.Int(2), "false"),
        new TestCase(Lit.Int(1), "true"),
        new TestCase(Lit.Int(7), "true"),
        new TestCase(Lit.Int(4), "false"),
        new TestCase(Lit.Int(100), "true"),
        new TestCase(Lit.Int(116), "false"),
        new TestCase(Lit.Int(1111111), "true"),
        new TestCase(Lit.Int(2147483647), "false"),
        new TestCase(Lit.Int(13), "true"),
    ];

    public string CSharpCallTemplate => "Solution.IsHappy({input})";
    public string PythonCallTemplate => "is_happy({input})";

    private static int Next(int n)
    {
        var sum = 0;
        for (; n > 0; n /= 10) sum += (n % 10) * (n % 10);
        return sum;
    }

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        var seq = new List<int> { 2 };
        var seen = new HashSet<int> { 2 };
        var steps = new List<VisualizationStep>();

        Dictionary<string, object> State() => new()
        {
            ["array"] = seq.ToArray(),
            ["tracker"] = seen.Count,
            ["trackerLabel"] = "values in the seen-set",
        };

        steps.Add(new VisualizationStep(State(), [0], "Start at n = 2. Put it in the seen-set."));
        while (true)
        {
            var cur = seq[^1];
            var next = Next(cur);
            var digits = string.Join(" + ", cur.ToString().Select(ch => $"{ch}^2"));
            if (next == 1)
            {
                seq.Add(next);
                steps.Add(new VisualizationStep(State(), [seq.Count - 1], $"{digits} = 1: happy."));
                break;
            }
            if (!seen.Add(next))
            {
                seq.Add(next);
                var first = seq.IndexOf(next);
                steps.Add(new VisualizationStep(State(), [first, seq.Count - 1],
                    $"{digits} = {next}, which is already in the seen-set (index {first}). From here it repeats for ever and never reaches 1: 2 is not happy."));
                break;
            }
            seq.Add(next);
            steps.Add(new VisualizationStep(State(), [seq.Count - 1], $"{digits} = {next}. Not 1 and not seen before: add it and continue."));
        }
        return steps;
    }
}
