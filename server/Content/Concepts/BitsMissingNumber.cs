namespace DsaAcademy.Content.Concepts;

public class BitsMissingNumber : IConcept
{
    public string Id => "bits-missing-number";
    public string Track => "bits";
    public int Order => 131;
    public string Title => "Bits: Missing Number";
    public string OneLiner => "n distinct numbers from 0..n, one missing: XOR every index and every value together and the only thing that doesn't cancel is the missing number.";
    public string KeyTakeaway =>
        "XOR together 0, 1, ..., n and every element of the array. Each present number appears twice (once as a " +
        "possible value, once in the array) and cancels; the missing one appears once and survives. O(n) time, " +
        "O(1) space, and unlike the sum formula n(n + 1) / 2 it can never overflow.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "nums holds n distinct numbers taken from the range 0 to n (that's n + 1 possible values), so exactly one " +
        "value is missing. Return it. For [3, 0, 1], n = 3 and the values 0..3 are 0, 1, 2, 3; 2 is missing.\n\n" +
        "Three approaches, all fine in an interview, in increasing order of cleverness. A hash set of the values, " +
        "then check 0..n: O(n) space. Sorting, then look for the first index where nums[i] != i: O(n log n). Or " +
        "arithmetic: the sum of 0..n is n(n + 1) / 2 (the Gauss pairing trick), and subtracting the array's sum " +
        "leaves the missing value. That's O(n) and O(1), but in C# n(n + 1) overflows an int once n passes about " +
        "46,000 unless you use long. Python has no such limit.\n\n" +
        "The XOR version has the same O(n) and O(1) and no overflow at all. XOR (^) gives 0 when you combine a " +
        "number with itself and leaves a number unchanged when you combine it with 0, and the order of XORs " +
        "doesn't matter. Start with acc = n, then for each index i do acc ^= i ^ nums[i]. Over the loop, acc " +
        "collects every index 0..n - 1, plus n from the start, which is every value in the range once, and every " +
        "array element once. Each present value therefore appears twice and cancels, and only the missing one is " +
        "left.\n\n" +
        "It's the Single Number trick in disguise: imagine appending 0..n to the array, and now every value " +
        "appears twice except the missing one.\n\n" +
        "The visualization runs [3, 0, 1]. The tracker is acc.";

    public List<string> RecognitionSignals =>
    [
        "\"Numbers 0..n (or 1..n) with one missing\", or one duplicated, and O(1) extra space.",
        "The array's values are a known range, so the indexes themselves can be paired against the values.",
        "A sum-based answer exists but you're asked about overflow, or values are large.",
    ];

    public List<string> Gotchas =>
    [
        "The range is 0..n inclusive, which is one more value than the array holds: seed acc with n (or loop i to n).",
        "If you use the sum formula in C#, compute it in long: n * (n + 1) as int overflows for n above 46,340.",
        "Sorting and scanning works but changes the input and is O(n log n); say so if you choose it.",
    ];

    public List<string> ConfusableWith =>
    [
        "Single Number (this track): same XOR cancellation, but there the pairs are already in the array.",
        "Cyclic sort / index marking (\"first missing positive\") puts each value at its own index; it handles harder variants but rewrites the array.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int MissingNumber(int[] nums)\n" +
            "    {\n" +
            "        // TODO: acc = nums.Length (the value n, which no index covers).\n" +
            "        // For each index i: acc ^= i ^ nums[i].\n" +
            "        // Every present value cancels; return acc.\n" +
            "        return -1;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def missing_number(nums):\n" +
            "    # TODO: acc = len(nums) (the value n, which no index covers).\n" +
            "    # For each index i: acc ^= i ^ nums[i].\n" +
            "    # Every present value cancels; return acc.\n" +
            "    return -1\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MissingNumber",
        ["python"] = "missing_number",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[3, 0, 1]", "2"),
        new TestCase("[0, 1]", "2"),
        new TestCase("[9, 6, 4, 2, 3, 5, 7, 0, 1]", "8"),
        new TestCase("[0]", "1"),
        new TestCase("[1]", "0"),
        new TestCase("[1, 2]", "0"),
        new TestCase("[2, 0]", "1"),
    ];

    public string CSharpCallTemplate => "Solution.MissingNumber({input})";
    public string PythonCallTemplate => "missing_number({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [3, 0, 1];
        var steps = new List<VisualizationStep>();
        var acc = nums.Length;

        Dictionary<string, object> State() => new()
        {
            ["array"] = nums,
            ["tracker"] = acc,
            ["trackerLabel"] = "acc",
        };

        steps.Add(new VisualizationStep(State(), [],
            "nums = [3, 0, 1], n = 3, so the values should be 0, 1, 2, 3. No index equals 3, so seed acc = 3."));
        for (var i = 0; i < nums.Length; i++)
        {
            var before = acc;
            acc ^= i ^ nums[i];
            steps.Add(new VisualizationStep(State(), [i],
                $"i = {i}: acc = {before} ^ {i} ^ {nums[i]} = {acc}."));
        }
        steps.Add(new VisualizationStep(State(), [],
            $"Altogether acc = 3 ^ 0 ^ 3 ^ 1 ^ 0 ^ 2 ^ 1: the 0s, 1s and 3s cancel in pairs, leaving {acc}, the missing number."));
        return steps;
    }
}
