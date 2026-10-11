namespace DsaAcademy.Content.Concepts;

public class MathCountPrimes : IConcept
{
    public string Id => "math-count-primes";
    public string Track => "math";
    public int Order => 121;
    public string Title => "Math: Count Primes (Sieve of Eratosthenes)";
    public string OneLiner => "Count the primes below n by crossing out multiples instead of testing each number on its own.";
    public string KeyTakeaway =>
        "Testing every number for primality costs about n times the square root of n. The Sieve of Eratosthenes " +
        "flips it round: for each prime p with p * p < n, cross out p * p, p * p + p, and so on. Whatever survives " +
        "is prime. Total work is O(n log log n), which is practically linear, for O(n) memory.";
    public VisualizerKind VisualizerKind => VisualizerKind.Grid;

    public string Explanation =>
        "Return how many prime numbers are strictly less than n. A prime is a whole number greater than 1 whose " +
        "only divisors are 1 and itself: 2, 3, 5, 7, 11 and so on. 1 is not prime, and neither is 0. For n = 10 " +
        "the answer is 4 (2, 3, 5, 7).\n\n" +
        "The direct approach checks each k below n by trying divisors from 2 up to the square root of k (if k = a " +
        "* b, one of the two is at most the square root, so you never need to look further). That is roughly " +
        "n * sqrt(n) work: about a billion steps for n = 2,000,000, too slow here.\n\n" +
        "The Sieve of Eratosthenes works the other way. Make a boolean array isPrime[0..n-1], all true except 0 " +
        "and 1. Walk p = 2, 3, 4, ... while p * p < n. If isPrime[p] is still true, p is prime, so cross out its " +
        "multiples: p * p, p * p + p, p * p + 2p, up to n - 1. Start at p * p because every smaller multiple, " +
        "such as 2p or 3p, has a smaller prime factor and was already crossed out. When the loop ends, count the " +
        "trues.\n\n" +
        "Why O(n log log n)? Prime p crosses out about n / p numbers, and the sum of 1 / p over primes up to n " +
        "grows like log log n, which is under 4 for any n you'll meet. Memory is one flag per number, O(n). In C# a " +
        "bool[] costs a byte per flag; in Python a bytearray is far smaller and faster than a list of bools, and " +
        "slice assignment (flags[p*p::p] = bytes(...)) crosses out a whole run in one step.\n\n" +
        "Overflow: in C#, 46,341 * 46,341 is past int.MaxValue (2,147,483,647), so the int product wraps round to a " +
        "negative number. For n above 2,147,395,600 the test p * p < n would stay true at p = 46,341 and the inner " +
        "loop would index a negative position. The tests here stop at 2,000,000, but (long)p * p < n, or p <= n / " +
        "p, is the habit to build. Python ints never overflow, so p * p is always exact there.\n\n" +
        "The visualization sieves the numbers below 30.";

    public List<string> RecognitionSignals =>
    [
        "\"Count / list all primes up to n\", or many primality questions about numbers in one known range.",
        "n is large (around a million) and checking each number separately is too slow.",
        "The same divisibility facts are needed for many numbers at once: precompute them in one table.",
    ];

    public List<string> Gotchas =>
    [
        "\"Less than n\" excludes n itself: n = 2 has no primes below it, and n = 0 or 1 must return 0 without indexing past the array.",
        "Start crossing out at p * p, and only for p with p * p < n; starting at 2p is still correct but does extra work.",
        "In C#, p * p can overflow int for large p; compare (long)p * p or use p <= n / p.",
    ];

    public List<string> ConfusableWith =>
    [
        "Prime factorisation of ONE number only needs trial division up to its square root; the sieve pays off when you need many numbers' answers.",
        "Prefix Sums: once you have the sieve, a prefix count array answers \"how many primes in [a, b]?\" in O(1) per query.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int CountPrimes(int n)\n" +
            "    {\n" +
            "        // TODO: if n < 3 there are no primes below n.\n" +
            "        // isPrime = new bool[n], all true except 0 and 1.\n" +
            "        // For p = 2 while (long)p * p < n: if isPrime[p], cross out p*p, p*p + p, ...\n" +
            "        // Return how many entries are still true.\n" +
            "        return -1;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def count_primes(n):\n" +
            "    # TODO: if n < 3 there are no primes below n.\n" +
            "    # is_prime = bytearray([1]) * n, then set is_prime[0] = is_prime[1] = 0.\n" +
            "    # For p = 2 while p * p < n: if is_prime[p], cross out p*p, p*p + p, ...\n" +
            "    # Return how many entries are still 1 (sum(is_prime)).\n" +
            "    return -1\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CountPrimes",
        ["python"] = "count_primes",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Int(10), "4"),
        new TestCase(Lit.Int(0), "0"),
        new TestCase(Lit.Int(1), "0"),
        new TestCase(Lit.Int(2), "0"),
        new TestCase(Lit.Int(3), "1"),
        new TestCase(Lit.Int(100), "25"),
        new TestCase(Lit.Int(1000), "168"),
        new TestCase(Lit.Int(1000000), "78498"),
        new TestCase(Lit.Int(2000000), "148933"),
    ];

    public string CSharpCallTemplate => "Solution.CountPrimes({input})";
    public string PythonCallTemplate => "count_primes({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const int n = 30, cols = 10;
        var isPrime = Enumerable.Range(0, n).Select(k => k >= 2).ToArray();
        var grid = Enumerable.Range(0, n / cols)
            .Select(r => Enumerable.Range(0, cols).Select(c => (object)(r * cols + c)).ToArray())
            .ToArray();
        var confirmed = new List<int>();
        var steps = new List<VisualizationStep>();

        int[][] Cells(IEnumerable<int> ks) => ks.Select(k => new[] { k / cols, k % cols }).ToArray();

        Dictionary<string, object> State(IEnumerable<int> highlight) => new()
        {
            ["grid"] = grid,
            ["visited"] = Cells(confirmed),
            ["rejected"] = Cells(Enumerable.Range(0, n).Where(k => !isPrime[k])),
            ["highlight"] = Cells(highlight),
            ["tracker"] = isPrime.Count(b => b),
            ["trackerLabel"] = "numbers not crossed out",
        };

        steps.Add(new VisualizationStep(State([]), [],
            "Numbers 0 to 29 (n = 30). 0 and 1 are not prime (red). Everything else starts as a candidate."));

        for (var p = 2; p * p < n; p++)
        {
            if (!isPrime[p]) continue;
            confirmed.Add(p);
            var multiples = new List<int>();
            for (var m = p * p; m < n; m += p) multiples.Add(m);
            steps.Add(new VisualizationStep(State(multiples.Prepend(p)), [],
                $"{p} is still uncrossed, so it is prime (green). Cross out its multiples from {p} * {p} = {p * p}: {string.Join(", ", multiples)}."));
            foreach (var m in multiples) isPrime[m] = false;
            steps.Add(new VisualizationStep(State([]), [],
                $"Multiples of {p} crossed out. Next p: the next uncrossed number, while p * p < 30."));
        }

        confirmed.AddRange(Enumerable.Range(0, n).Where(k => isPrime[k] && !confirmed.Contains(k)));
        steps.Add(new VisualizationStep(State([]), [],
            $"6 * 6 = 36 is past 30, so stop: every survivor is prime. {isPrime.Count(b => b)} primes below 30: {string.Join(", ", Enumerable.Range(0, n).Where(k => isPrime[k]))}."));
        return steps;
    }
}
