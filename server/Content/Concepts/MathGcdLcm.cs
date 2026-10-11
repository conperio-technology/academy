namespace DsaAcademy.Content.Concepts;

public class MathGcdLcm : IConcept
{
    public string Id => "math-gcd-lcm";
    public string Track => "math";
    public int Order => 121;
    public string Title => "Math: GCD and LCM of an Array (Euclid's Algorithm)";
    public string OneLiner => "Fold Euclid's gcd(a, b) = gcd(b, a % b) across the array, and build the LCM as a / gcd * b so it doesn't overflow.";
    public string KeyTakeaway =>
        "gcd(a, b) = gcd(b, a mod b), stopping when b is 0: the remainders shrink at least as fast as Fibonacci " +
        "numbers, so it takes O(log min(a, b)) steps. lcm(a, b) = a / gcd(a, b) * b. Divide BEFORE multiplying, " +
        "and in C# do it in long: a * b can overflow even when the LCM itself fits. Both fold across an array " +
        "because gcd and lcm are associative.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Given an array of positive integers, return [g, l]: their greatest common divisor (GCD, the largest number " +
        "that divides all of them) and their least common multiple (LCM, the smallest positive number all of them " +
        "divide). For [4, 6, 8] the answer is [2, 24]. Return both as 64-bit integers (long in C#); the LCM in " +
        "the tests always fits.\n\n" +
        "Euclid's algorithm: any number that divides both a and b also divides a - b, and so a % b (the remainder, " +
        "which is a minus some multiple of b). So gcd(a, b) = gcd(b, a % b). Repeat until the second number is 0; " +
        "the first one is the answer. gcd(48, 18) = gcd(18, 12) = gcd(12, 6) = gcd(6, 0) = 6. Each two steps at " +
        "least halve the larger number, so it's O(log n) steps, fast even for 10^18.\n\n" +
        "LCM from GCD: a * b = gcd(a, b) * lcm(a, b), so lcm(a, b) = a * b / gcd(a, b). In code, write it as a / " +
        "gcd(a, b) * b. The division is exact, and doing it first keeps the intermediate value no larger than the " +
        "answer. For a whole array, fold left to right: g = gcd(g, x) and l = lcm(l, x), starting from the first " +
        "element.\n\n" +
        "C# versus Python. In C#, int * int is computed in int and silently wraps when it passes 2,147,483,647, so " +
        "100,000 * 99,999 comes out as 1,409,965,408 instead of 9,999,900,000. Use long. Even long can overflow if " +
        "you multiply first: one test builds an LCM near 4.5 * 10^15 and then folds in a number that shares a big " +
        "factor with it, so l * x would be about 1.9 * 10^22, past long's 9.2 * 10^18, while l / gcd * x is " +
        "exact. Python ints grow as needed, so the order only matters for speed there, and math.gcd and math.lcm " +
        "(Python 3.9+) are built in. .NET has BigInteger.GreatestCommonDivisor in System.Numerics, but no gcd for " +
        "plain ints.\n\n" +
        "The visualization folds [12, 18, 30] and shows the running GCD.";

    public List<string> RecognitionSignals =>
    [
        "\"Largest number that divides\", \"split into equal groups\", \"tile with the biggest square\": GCD.",
        "\"When do the cycles line up again\", \"smallest number divisible by all\": LCM.",
        "Fractions to reduce, or a ratio to put in lowest terms.",
    ];

    public List<string> Gotchas =>
    [
        "Compute lcm as a / gcd(a, b) * b, not a * b / gcd(a, b): the second form overflows first.",
        "In C#, int * int stays int even when you assign it to a long. Cast an operand first: (long)a * b.",
        "gcd(a, 0) = a, so the loop ends when the SECOND value reaches 0; return the first.",
    ];

    public List<string> ConfusableWith =>
    [
        "Prime factorisation also gives GCD and LCM (take the min or max of each prime's exponent), but it's much slower than Euclid for large numbers.",
        "Count Primes (this track) is about many numbers' factors at once; GCD only ever needs the two numbers in front of it.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static long[] GcdAndLcm(int[] nums)\n" +
            "    {\n" +
            "        // TODO: write long Gcd(long a, long b): while b != 0, (a, b) = (b, a % b); return a.\n" +
            "        // Fold over nums: g = Gcd(g, x); l = l / Gcd(l, x) * x  (divide first, all in long).\n" +
            "        // Return new long[] { g, l }.\n" +
            "        return new long[] { 0, 0 };\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def gcd_and_lcm(nums):\n" +
            "    # TODO: write gcd(a, b): while b: a, b = b, a % b; return a.\n" +
            "    # Fold over nums: g = gcd(g, x); l = l // gcd(l, x) * x.\n" +
            "    # Return [g, l]. (Try it by hand before reaching for math.gcd.)\n" +
            "    return [0, 0]\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.GcdAndLcm",
        ["python"] = "gcd_and_lcm",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[12, 18]", "[6, 36]"),
        new TestCase("[4, 6, 8]", "[2, 24]"),
        new TestCase("[7]", "[7, 7]"),
        new TestCase("[5, 7]", "[1, 35]"),
        new TestCase("[48, 18, 30]", "[6, 720]"),
        new TestCase("[100000, 99999]", "[1, 9999900000]"),
        new TestCase("[2, 3, 5, 7, 11, 13, 17, 19, 23]", "[1, 223092870]"),
        new TestCase("[1073741823, 4194304, 4194304]", "[1, 4503599623176192]"),
        new TestCase("[1000000, 250000, 500000]", "[250000, 1000000]"),
    ];

    public string CSharpCallTemplate => "Solution.GcdAndLcm({input})";
    public string PythonCallTemplate => "gcd_and_lcm({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [12, 18, 30];
        var steps = new List<VisualizationStep>();
        long g = nums[0], l = nums[0];

        Dictionary<string, object> State() => new()
        {
            ["array"] = nums,
            ["tracker"] = $"gcd {g}, lcm {l}",
            ["trackerLabel"] = "so far",
        };

        steps.Add(new VisualizationStep(State(), [0], "[12, 18, 30]. Start with g = l = 12."));

        for (var i = 1; i < nums.Length; i++)
        {
            long a = g, b = nums[i];
            var trail = new List<string>();
            while (b != 0)
            {
                trail.Add($"gcd({a}, {b})");
                (a, b) = (b, a % b);
            }
            trail.Add($"gcd({a}, 0) = {a}");
            var gl = Gcd(l, nums[i]);
            var newL = l / gl * nums[i];
            var msg = $"Fold in {nums[i]}: {string.Join(" = ", trail)}, so g = {a}. lcm: {l} / gcd({l}, {nums[i]}) * {nums[i]} = {l} / {gl} * {nums[i]} = {newL}.";
            g = a;
            l = newL;
            steps.Add(new VisualizationStep(State(), Enumerable.Range(0, i + 1).ToArray(), msg));
        }

        steps.Add(new VisualizationStep(State(), [], $"Answer: [{g}, {l}]. 6 divides all three, and 180 is the first number all three divide."));
        return steps;
    }

    private static long Gcd(long a, long b)
    {
        while (b != 0) (a, b) = (b, a % b);
        return a;
    }
}
