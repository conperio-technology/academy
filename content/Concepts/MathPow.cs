namespace DsaAcademy.Content.Concepts;

public class MathPow : IConcept
{
    public string Id => "math-pow";
    public string Track => "math";
    public int Order => 121;
    public string Title => "Math: Pow(x, n) by Fast Exponentiation";
    public string OneLiner => "Compute x to the power n in O(log n) multiplications by squaring, and survive n = int.MinValue in C#.";
    public string KeyTakeaway =>
        "x^n = (x^2)^(n/2) when n is even, and x * x^(n-1) when it's odd. Walk n's bits from the lowest: square " +
        "the base every step, and multiply it into the result when the current bit is 1. That's O(log n) " +
        "multiplications instead of n. For negative n use 1 / x and |n|, and in C# widen n to long first, because " +
        "-int.MinValue doesn't fit in an int.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Implement pow(x, n): x raised to the integer power n, where x is a double (a 64-bit floating-point " +
        "number) and n is a 32-bit int that may be negative. Don't call Math.Pow or **. The tests round your " +
        "answer to 5 decimal places, because different multiplication orders can differ in the last bits of a " +
        "double.\n\n" +
        "Multiplying x by itself n times is O(n): two billion steps for n = 2,147,483,647, far too slow. Fast " +
        "exponentiation (also called binary exponentiation or square-and-multiply) uses the binary digits of n. " +
        "Take n = 13, which is 1101 in binary: 13 = 8 + 4 + 1, so x^13 = x^8 * x^4 * x^1. The powers x, x^2, x^4, " +
        "x^8 come from squaring the previous one, so you need one squaring per bit of n and one extra multiply " +
        "per 1 bit. Loop while n > 0: if n is odd (n & 1 is 1), result *= base; then base *= base and n >>= 1. " +
        "That's about 2 * log2(n) multiplications, so 31 bits mean at most about 62.\n\n" +
        "Negative exponents: x^-n = 1 / x^n, so set x = 1 / x and work with -n. Here C# and Python differ. A C# " +
        "int runs from -2,147,483,648 to 2,147,483,647, so -(-2,147,483,648) doesn't fit: in the default unchecked " +
        "context it wraps straight back to -2,147,483,648, the loop condition n > 0 is false at once, and you " +
        "return 1. Copy n into a long before negating it. Python ints have no fixed size, so -n is always exact.\n\n" +
        "The same loop works with integers modulo m (take result * base % m and base * base % m each step), " +
        "which is how interview problems that say \"return the answer modulo 1,000,000,007\" compute huge powers, " +
        "and how RSA encryption works. Python has it built in as pow(base, exp, mod).\n\n" +
        "The visualization computes 3^13: the cells are the bits of 13, lowest first.";

    public List<string> RecognitionSignals =>
    [
        "A power with a huge exponent, or \"return the answer modulo 1e9+7\" for something like a^b.",
        "The exponent is too large to loop over, but its binary representation is short.",
        "Repeated squaring of something other than a number: matrices (Fibonacci in O(log n)) use the same loop.",
    ];

    public List<string> Gotchas =>
    [
        "In C#, negating int.MinValue overflows back to itself. Use long exp = n; then negate exp.",
        "Handle the negative exponent by inverting x once, not by dividing on every step.",
        "With integers, reduce modulo m after EVERY multiplication; in C# use long so a product of two values below m (up to about 10^18) still fits.",
    ];

    public List<string> ConfusableWith =>
    [
        "Binary search also halves something each step for O(log n), but it discards half of a search range; here every bit of n contributes.",
        "Plain recursion pow(x, n) = x * pow(x, n - 1) is linear and also hits a stack overflow for large n.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static double MyPow(double x, int n)\n" +
            "    {\n" +
            "        // TODO: long exp = n (so negating int.MinValue doesn't overflow).\n" +
            "        // If exp < 0: x = 1 / x, exp = -exp.\n" +
            "        // result = 1; while exp > 0: if (exp & 1) == 1, result *= x;\n" +
            "        // then x *= x and exp >>= 1. Return result.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def my_pow(x, n):\n" +
            "    # TODO: if n < 0: x = 1 / x, n = -n.\n" +
            "    # result = 1.0; while n > 0: if n & 1, result *= x;\n" +
            "    # then x *= x and n >>= 1. Return result.\n" +
            "    # (Don't use x ** n or math.pow.)\n" +
            "    return 0.0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MyPow",
        ["python"] = "my_pow",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("2.0, 10", "1024"),
        new TestCase("2.1, 3", "9.261"),
        new TestCase("2.0, -2", "0.25"),
        new TestCase("2.0, 0", "1"),
        new TestCase("0.5, 4", "0.0625"),
        new TestCase("-2.0, 3", "-8"),
        new TestCase("-2.0, 2", "4"),
        new TestCase("1.0, 2147483647", "1"),
        new TestCase("1.00001, 123456", "3.43684"),
        new TestCase("2.0, -2147483648", "0"),
        new TestCase("-1.0, -2147483648", "1"),
    ];

    // Rounded so harmless floating-point differences in the last bits don't fail a correct answer.
    public string CSharpCallTemplate => "Math.Round(Solution.MyPow({input}), 5)";
    public string PythonCallTemplate => "round(my_pow({input}), 5)";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const int x = 3, n = 13;
        var bits = Enumerable.Range(0, 4).Select(i => (n >> i) & 1).ToArray(); // lowest bit first
        var steps = new List<VisualizationStep>();
        long result = 1, b = x;
        var power = 1;

        Dictionary<string, object> State() => new()
        {
            ["array"] = bits,
            ["tracker"] = result,
            ["trackerLabel"] = "result",
        };

        steps.Add(new VisualizationStep(State(), [],
            "3^13. 13 in binary is 1101; the cells list its bits lowest first (1, 0, 1, 1), so 13 = 1 + 4 + 8. result = 1, base = 3."));

        for (var i = 0; i < bits.Length; i++)
        {
            string msg;
            if (bits[i] == 1)
            {
                result *= b;
                msg = $"Bit {i} is 1: multiply in base = 3^{power} = {b}. result = {result}.";
            }
            else
            {
                msg = $"Bit {i} is 0: 3^{power} isn't part of 13, so result stays {result}.";
            }
            if (i < bits.Length - 1)
            {
                b *= b;
                power *= 2;
                msg += $" Square the base: 3^{power} = {b}.";
            }
            steps.Add(new VisualizationStep(State(), [i], msg));
        }

        steps.Add(new VisualizationStep(State(), [],
            $"3^13 = 3^1 * 3^4 * 3^8 = {result}, in 3 squarings and 3 multiplies instead of 12 multiplies."));
        return steps;
    }
}
