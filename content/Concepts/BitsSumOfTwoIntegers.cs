namespace DsaAcademy.Content.Concepts;

public class BitsSumOfTwoIntegers : IConcept
{
    public string Id => "bits-sum-of-two-integers";
    public string Track => "bits";
    public int Order => 131;
    public string Title => "Bits: Sum of Two Integers Without + or -";
    public string OneLiner => "Add like a circuit does: XOR is the sum without carries, AND shifted left is the carry, and you repeat until there's no carry left.";
    public string KeyTakeaway =>
        "a ^ b adds each bit position ignoring carries; (a & b) << 1 is exactly the carries, moved to the column " +
        "they carry into. Replace a with the first and b with the second until b is 0. In C# this just works on " +
        "32-bit ints, negatives included. In Python, ints have no fixed width, so mask every step with " +
        "0xFFFFFFFF and convert the final 32-bit pattern back to a signed value.";
    public VisualizerKind VisualizerKind => VisualizerKind.Grid;

    public string Explanation =>
        "Return a + b for two 32-bit signed integers without using + or - (the tests can't check that, so it's on " +
        "your honour). The result should behave like 32-bit int arithmetic: 2,147,483,647 + 1 wraps round to " +
        "-2,147,483,648, as it does in C# by default.\n\n" +
        "Binary addition by hand: in each column, 0 + 0 = 0, 0 + 1 = 1, and 1 + 1 = 0 carry 1. The digit you " +
        "write down is 1 exactly when the two bits differ, which is XOR. A carry happens exactly when both bits " +
        "are 1, which is AND, and the carry lands one column to the left, which is << 1. So a + b = (a ^ b) + ((a " +
        "& b) << 1). That still has a +, but the carry part has moved left, so repeat: set a = a ^ b and b = (a & " +
        "b) << 1 (computed from the old values) until b is 0. Each round pushes the carries at least one column " +
        "further left, so at most 32 rounds, O(1). This is what a ripple-carry adder in a CPU does with logic " +
        "gates (see Logic Gates in Computer Fundamentals).\n\n" +
        "Negative numbers. Two's complement stores -k as the bit pattern of 2^32 - k, and the point of that " +
        "encoding is that ordinary binary addition gives the right answer for negatives too. In C#, int is " +
        "exactly 32 bits, the carry out of bit 31 simply falls off, and the loop handles every case unchanged.\n\n" +
        "Python is the trap. Python ints have unlimited width, and a negative int behaves as if it had infinitely " +
        "many 1 bits on the left. With a negative input the carry keeps marching left for ever and the loop never " +
        "ends. Fix it by working in 32 bits explicitly: AND every intermediate result with 0xFFFFFFFF (32 one " +
        "bits), which throws away everything above bit 31. At the end the answer is an unsigned pattern from 0 to " +
        "2^32 - 1; if it's above 0x7FFFFFFF (bit 31 set, so negative in two's complement), convert it with ~(a ^ " +
        "0xFFFFFFFF), which flips the low 32 bits twice and the infinite high bits once, sign-extending it. (a - " +
        "2**32 also works, but uses a minus.)\n\n" +
        "The visualization adds 5 + 3 in 4-bit rows.";

    public List<string> RecognitionSignals =>
    [
        "\"Without using + or -\" or \"without arithmetic operators\": rebuild the operation from bitwise ones.",
        "Questions about how hardware adds, or why two's complement makes negative addition free.",
        "Any bit loop on possibly negative numbers in Python: think about masking to a fixed width.",
    ];

    public List<string> Gotchas =>
    [
        "Compute the carry from the OLD a and b: in C# use a temporary (var carry = (a & b) << 1; a ^= b; b = carry;).",
        "In Python, without masking with 0xFFFFFFFF a negative input loops for ever, and the final value must be sign-extended back from 32 bits.",
        "In C#, if you use >> anywhere on negatives remember it's an arithmetic shift; this solution only needs <<.",
    ];

    public List<string> ConfusableWith =>
    [
        "Single Number (this track) uses XOR alone, as \"addition with no carries\" that makes pairs cancel; here the carries matter and AND plus a shift supplies them.",
        "Multiplying without * is the same idea one level up: shift-and-add over the bits of one operand, like fast exponentiation uses shift-and-multiply.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int GetSum(int a, int b)\n" +
            "    {\n" +
            "        // TODO: while b != 0: carry = (a & b) << 1; a = a ^ b; b = carry.\n" +
            "        // Return a. (No + or -: C# ints are 32-bit, so negatives just work.)\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def get_sum(a, b):\n" +
            "    # TODO: mask = 0xFFFFFFFF. While b != 0:\n" +
            "    #   a, b = (a ^ b) & mask, ((a & b) << 1) & mask\n" +
            "    # Then if a > 0x7FFFFFFF it's negative in 32 bits: return ~(a ^ mask).\n" +
            "    # (No + or -.)\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.GetSum",
        ["python"] = "get_sum",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("1, 2", "3"),
        new TestCase("2, 3", "5"),
        new TestCase("-1, 1", "0"),
        new TestCase("-2, -3", "-5"),
        new TestCase("0, 0", "0"),
        new TestCase("123, -456", "-333"),
        new TestCase("-1000, 1000", "0"),
        new TestCase("2147483647, 1", "-2147483648"),
        new TestCase("-2147483648, -1", "2147483647"),
    ];

    public string CSharpCallTemplate => "Solution.GetSum({input})";
    public string PythonCallTemplate => "get_sum({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const int width = 4;
        int a = 5, b = 3, round = 0;
        var cols = new object[] { "8", "4", "2", "1" };
        var steps = new List<VisualizationStep>();

        int[][] Ones(int row, int v) => Enumerable.Range(0, width).Where(c => ((v >> (width - 1 - c)) & 1) == 1).Select(c => new[] { row, c }).ToArray();

        Dictionary<string, object> State() => new()
        {
            ["grid"] = new[] { BitsSingleNumber.Bits(a, width), BitsSingleNumber.Bits(b, width) },
            ["rowLabels"] = new object[] { $"a = {a}", $"b = {b}" },
            ["colLabels"] = cols,
            ["visited"] = Ones(0, a),
            ["highlight"] = Ones(1, b),
            ["tracker"] = round,
            ["trackerLabel"] = "rounds",
        };

        steps.Add(new VisualizationStep(State(), [],
            "a = 5 (0101), b = 3 (0011). Each round: a becomes a ^ b (sum without carries) and b becomes (a & b) << 1 (the carries, moved one column left)."));
        while (b != 0)
        {
            var carry = (a & b) << 1;
            var sum = a ^ b;
            var msg = $"a ^ b = {Convert.ToString(sum, 2).PadLeft(width, '0')}, (a & b) << 1 = {Convert.ToString(carry, 2).PadLeft(width, '0')}.";
            a = sum;
            b = carry & ((1 << width) - 1);
            round++;
            steps.Add(new VisualizationStep(State(), [], msg + (b == 0 ? " No carries left." : $" Still {b} to add in.")));
        }
        steps.Add(new VisualizationStep(State(), [], $"b is 0, so a = {a} is the sum: 5 + 3 = 8, after {round} rounds."));
        return steps;
    }
}
