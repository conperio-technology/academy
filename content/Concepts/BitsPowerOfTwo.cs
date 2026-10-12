namespace DsaAcademy.Content.Concepts;

public class BitsPowerOfTwo : IConcept
{
    public string Id => "bits-power-of-two";
    public string Track => "bits";
    public int Order => 131;
    public string Title => "Bits: Power of Two";
    public string OneLiner => "A power of two has exactly one 1 bit, and n & (n - 1) clears the lowest 1 bit, so n > 0 && (n & (n - 1)) == 0 answers it in O(1).";
    public string KeyTakeaway =>
        "n & (n - 1) removes n's lowest set bit. A power of two has only one set bit, so the result is 0 exactly " +
        "for powers of two. The n > 0 check is not optional: 0 & -1 is 0, and in C# int.MinValue & int.MaxValue " +
        "is 0 too, yet neither is a power of two.";
    public VisualizerKind VisualizerKind => VisualizerKind.Grid;

    public string Explanation =>
        "Return true if n is a power of two: 1, 2, 4, 8, ..., 2^30 for a 32-bit int. Negative numbers and 0 are " +
        "not.\n\n" +
        "The loop answer divides by 2 while n is even and checks whether you end at 1, which is O(log n). The bit " +
        "answer is O(1). In binary, a power of two is a single 1 followed by zeros: 8 is 1000, 64 is 1000000. " +
        "Subtracting 1 turns that 1 into 0 and every 0 below it into 1: 8 - 1 = 7 is 0111. They share no 1 bits, " +
        "so 8 & 7 = 0. For a number with two or more 1 bits, such as 12 (1100), subtracting 1 only changes the " +
        "lowest one and the zeros below it (11 is 1011), so the higher 1 bits survive the AND: 12 & 11 = 8, not 0. " +
        "That's the general rule: n & (n - 1) is n with its lowest set bit cleared.\n\n" +
        "Why n > 0 matters. 0 & (0 - 1) = 0 & -1 = 0, so without the check 0 counts as a power of two. In C#, " +
        "int.MinValue is -2,147,483,648, whose two's complement pattern is a 1 in bit 31 followed by 31 zeros, a " +
        "single set bit just like a power of two. n - 1 wraps round to int.MaxValue (0 followed by 31 ones), and " +
        "the AND is 0 again. Python ints are unbounded, so -2147483648 - 1 is simply -2147483649, but the n > 0 " +
        "check is still what rules negatives out.\n\n" +
        "Related tricks: n & -n isolates the lowest set bit (in two's complement, -n is ~n + 1, the bits flipped " +
        "plus one); a power of four is a power of two whose bit sits in an even position, (n & 0x55555555) != 0; " +
        "and BitOperations.IsPow2 in C# or n > 0 and n.bit_count() == 1 in Python do it for you.\n\n" +
        "The visualization shows n and n - 1 for 8, then 12.";

    public List<string> RecognitionSignals =>
    [
        "\"Is n a power of two\", \"exactly one bit set\", or sizes that must be powers of two (hash table capacities, buffer sizes).",
        "A follow-up asks for O(1) without loops or recursion.",
        "Anything about the lowest set bit: n & (n - 1) clears it, n & -n keeps only it.",
    ];

    public List<string> Gotchas =>
    [
        "Check n > 0 first: 0 and, in C#, int.MinValue both pass the bare (n & (n - 1)) == 0 test.",
        "In C#, == binds tighter than &, so n & (n - 1) == 0 means n & ((n - 1) == 0) and doesn't compile for ints: write (n & (n - 1)) == 0. Python is the other way round (& binds tighter than ==), so the unbracketed form happens to work there, but the brackets cost nothing.",
        "Comparing with Math.Log(n, 2) and rounding is fragile: floating-point logs aren't exact.",
    ];

    public List<string> ConfusableWith =>
    [
        "Count Set Bits (Patterns track) uses n & (n - 1) in a loop to count ones; here you only need to know whether a second one exists.",
        "Power of Three has no bit trick (3 doesn't line up with binary); the O(1) answer there is checking whether the largest power of three in range is divisible by n.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static bool IsPowerOfTwo(int n)\n" +
            "    {\n" +
            "        // TODO: a power of two is positive and has exactly one 1 bit.\n" +
            "        // n & (n - 1) clears the lowest 1 bit. Mind operator precedence.\n" +
            "        return n % 2 == 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def is_power_of_two(n):\n" +
            "    # TODO: a power of two is positive and has exactly one 1 bit.\n" +
            "    # n & (n - 1) clears the lowest 1 bit.\n" +
            "    return n % 2 == 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.IsPowerOfTwo",
        ["python"] = "is_power_of_two",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Int(1), "true"),
        new TestCase(Lit.Int(16), "true"),
        new TestCase(Lit.Int(3), "false"),
        new TestCase(Lit.Int(0), "false"),
        new TestCase(Lit.Int(-16), "false"),
        new TestCase(Lit.Int(-2147483648), "false"),
        new TestCase(Lit.Int(1073741824), "true"),
        new TestCase(Lit.Int(2147483647), "false"),
        new TestCase(Lit.Int(6), "false"),
    ];

    public string CSharpCallTemplate => "Solution.IsPowerOfTwo({input})";
    public string PythonCallTemplate => "is_power_of_two({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const int width = 4;
        var cols = new object[] { "8", "4", "2", "1" };
        var steps = new List<VisualizationStep>();

        int[][] Ones(int row, int v) => Enumerable.Range(0, width).Where(c => ((v >> (width - 1 - c)) & 1) == 1).Select(c => new[] { row, c }).ToArray();

        Dictionary<string, object> State(int n, bool showAnd) => new()
        {
            ["grid"] = showAnd
                ? new[] { BitsSingleNumber.Bits(n, width), BitsSingleNumber.Bits(n - 1, width), BitsSingleNumber.Bits(n & (n - 1), width) }
                : new[] { BitsSingleNumber.Bits(n, width), BitsSingleNumber.Bits(n - 1, width) },
            ["rowLabels"] = showAnd ? new object[] { $"n = {n}", $"n-1 = {n - 1}", $"AND = {n & (n - 1)}" } : new object[] { $"n = {n}", $"n-1 = {n - 1}" },
            ["colLabels"] = cols,
            ["visited"] = Ones(0, n).Concat(Ones(1, n - 1)).ToArray(),
            ["highlight"] = showAnd ? Ones(2, n & (n - 1)) : Array.Empty<int[]>(),
            ["tracker"] = showAnd ? ((n & (n - 1)) == 0 ? "true" : "false") : "?",
            ["trackerLabel"] = "power of two",
        };

        steps.Add(new VisualizationStep(State(8, false), [],
            "n = 8 is 1000: one 1 bit. n - 1 = 7 is 0111: the 1 became 0 and every zero below it became 1 (1 bits in green)."));
        steps.Add(new VisualizationStep(State(8, true), [],
            "8 & 7: no column has a 1 in both rows, so the AND is 0000. n > 0 and (n & (n - 1)) == 0: a power of two."));
        steps.Add(new VisualizationStep(State(12, false), [],
            "n = 12 is 1100: two 1 bits. n - 1 = 11 is 1011: only the LOWEST 1 (the 4s bit) and the zeros below it changed."));
        steps.Add(new VisualizationStep(State(12, true), [],
            "12 & 11 = 1000 = 8: the higher 1 bit survives. Not zero, so 12 is not a power of two. In general n & (n - 1) is n with its lowest 1 bit cleared."));
        return steps;
    }
}
