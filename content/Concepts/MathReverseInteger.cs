namespace DsaAcademy.Content.Concepts;

public class MathReverseInteger : IConcept
{
    public string Id => "math-reverse-integer";
    public string Track => "math";
    public int Order => 121;
    public string Title => "Math: Reverse Integer (Overflow and Negative Modulo)";
    public string OneLiner => "Reverse a 32-bit integer's digits, returning 0 if the result doesn't fit: the lesson where C# and Python disagree about both % and overflow.";
    public string KeyTakeaway =>
        "Pop digits with x % 10 and push them with result * 10 + digit, checking BEFORE the multiply that result " +
        "can't pass int.MaxValue / 10. In C#, % keeps the sign of x, so negatives just work and an unchecked " +
        "overflow wraps silently. In Python, % follows the divisor's sign and ints never overflow, so handle the " +
        "sign yourself and compare against the 32-bit limits explicitly.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Given a signed 32-bit integer x, return x with its digits reversed. If the reversed value is outside the " +
        "32-bit signed range, -2,147,483,648 to 2,147,483,647, return 0. Pretend the environment can't store " +
        "64-bit integers, so the check has to happen without a bigger type. 123 becomes 321, -123 becomes -321, " +
        "120 becomes 21, and 1,534,236,469 becomes 0 (9,646,324,351 is too big).\n\n" +
        "The digit loop: digit = x % 10 takes the last digit, x /= 10 drops it, and result = result * 10 + digit " +
        "pushes it onto the end of the answer. The overflow guard goes right before the push: if result > " +
        "int.MaxValue / 10 (214,748,364), multiplying by 10 is already too big. If result equals 214,748,364 " +
        "exactly, the push only fits if digit <= 7 (the last digit of 2,147,483,647). The negative side is the " +
        "mirror image with int.MinValue / 10 and -8.\n\n" +
        "C#: integer division truncates toward zero and % takes the sign of the left operand, so -123 % 10 is -3 " +
        "and -123 / 10 is -12. The same loop handles negative x with no special case. Without the guard, result * " +
        "10 wraps round silently (C# arithmetic is unchecked by default) and you return garbage instead of 0. " +
        "Wrapping the expression in checked(...) would throw an OverflowException instead, which also works if you " +
        "catch it.\n\n" +
        "Python: // rounds DOWN and % takes the sign of the right operand, so -123 % 10 is 7 and -123 // 10 is -13. " +
        "Running the C# loop on a negative number gives nonsense. Take the sign first, reverse abs(x), then put the " +
        "sign back. And since Python ints never overflow, nothing will stop you at 2^31: compare against " +
        "2**31 - 1 and -2**31 yourself.\n\n" +
        "The visualization reverses -123, with the C# view of % and /.";

    public List<string> RecognitionSignals =>
    [
        "\"Assume a 32-bit environment\" or \"return 0 if the result overflows\".",
        "Building a number digit by digit with result * 10 + digit (also atoi, string to integer).",
        "Negative inputs combined with % or integer division.",
    ];

    public List<string> Gotchas =>
    [
        "Check for overflow BEFORE result * 10, not after: after the multiply the damage is done (C# wraps, the comparison is meaningless).",
        "Python's % and // round toward negative infinity: -123 % 10 is 7, not -3. Strip the sign first.",
        "abs(int.MinValue) overflows in C# (Math.Abs throws OverflowException). The C# loop never needs abs because % keeps the sign.",
    ];

    public List<string> ConfusableWith =>
    [
        "Palindrome Number reverses digits the same way (or only half of them) but compares instead of returning.",
        "String to Integer (atoi) has the identical result * 10 + digit overflow guard, with parsing on top.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int Reverse(int x)\n" +
            "    {\n" +
            "        // TODO: result = 0. While x != 0: digit = x % 10; x /= 10;\n" +
            "        // before result * 10 + digit, return 0 if it would pass int.MaxValue\n" +
            "        // (result > int.MaxValue / 10, or == and digit > 7) or int.MinValue\n" +
            "        // (result < int.MinValue / 10, or == and digit < -8).\n" +
            "        return x;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def reverse(x):\n" +
            "    # TODO: sign = -1 if x < 0 else 1; x = abs(x).\n" +
            "    # Pop digits with x % 10 and x //= 10, building result = result * 10 + digit.\n" +
            "    # Python ints don't overflow, so compare against 2**31 - 1 and -2**31 yourself:\n" +
            "    # return 0 if sign * result is outside that range.\n" +
            "    return x\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Reverse",
        ["python"] = "reverse",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Int(123), "321"),
        new TestCase(Lit.Int(-123), "-321"),
        new TestCase(Lit.Int(120), "21"),
        new TestCase(Lit.Int(0), "0"),
        new TestCase(Lit.Int(1534236469), "0"),
        new TestCase(Lit.Int(-2147483648), "0"),
        new TestCase(Lit.Int(2147483647), "0"),
        new TestCase(Lit.Int(1463847412), "2147483641"),
        new TestCase(Lit.Int(-1463847412), "-2147483641"),
        new TestCase(Lit.Int(1000000003), "0"),
        new TestCase(Lit.Int(-10), "-1"),
    ];

    public string CSharpCallTemplate => "Solution.Reverse({input})";
    public string PythonCallTemplate => "reverse({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        var x = -123;
        var result = 0;
        var popped = new List<int>();
        var steps = new List<VisualizationStep>();

        Dictionary<string, object> State() => new()
        {
            ["array"] = popped.ToArray(),
            ["tracker"] = result,
            ["trackerLabel"] = "result",
        };

        steps.Add(new VisualizationStep(State(), [],
            "x = -123. In C#, x % 10 keeps x's sign and x / 10 truncates toward zero, so the loop works for negatives unchanged. The cells are the digits popped so far."));
        while (x != 0)
        {
            var digit = x % 10;
            var before = x;
            x /= 10;
            result = result * 10 + digit;
            popped.Add(digit);
            steps.Add(new VisualizationStep(State(), [popped.Count - 1],
                $"{before} % 10 = {digit} and {before} / 10 = {x}. Guard: |result| is far below 214,748,364, so result * 10 + {digit} = {result} is safe."));
        }
        steps.Add(new VisualizationStep(State(), [],
            $"x is 0: answer {result}. In Python, -123 % 10 is 7 and -123 // 10 is -13, so the same loop would go wrong there: reverse abs(x) and restore the sign."));
        return steps;
    }
}
