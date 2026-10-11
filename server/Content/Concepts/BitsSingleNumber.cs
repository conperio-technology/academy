namespace DsaAcademy.Content.Concepts;

public class BitsSingleNumber : IConcept
{
    public string Id => "bits-single-number";
    public string Track => "bits";
    public int Order => 131;
    public string Title => "Bits: Single Number (XOR Cancels Pairs)";
    public string OneLiner => "Every value appears twice except one: XOR everything together and the pairs cancel, leaving the single one.";
    public string KeyTakeaway =>
        "XOR has three properties that make this work: x ^ x = 0, x ^ 0 = x, and order doesn't matter. So XOR-ing " +
        "the whole array pairs every duplicate with its twin (giving 0) and leaves the lone value. O(n) time, O(1) " +
        "space, where a hash set or counting map would need O(n) memory.";
    public VisualizerKind VisualizerKind => VisualizerKind.Grid;

    public string Explanation =>
        "Given a non-empty integer array where every element appears exactly twice except for one, find that " +
        "one. Use O(n) time and O(1) extra space. For [4, 1, 2, 1, 2] the answer is 4.\n\n" +
        "A hash set would work (add a value the first time, remove it the second, and one value is left over) but " +
        "that's O(n) memory. Sorting and checking neighbours is O(n log n). The bit trick needs neither.\n\n" +
        "XOR (exclusive or, ^ in both C# and Python) compares two numbers bit by bit and gives 1 where the bits " +
        "DIFFER and 0 where they match. That means x ^ x = 0 for any x (every bit matches itself), x ^ 0 = x (XOR " +
        "with 0 changes nothing), and a ^ b ^ a = b because XOR is commutative and associative: you can reorder " +
        "and regroup it freely. XOR every element into one accumulator starting at 0. Mentally rearrange so twins " +
        "sit together: each pair becomes 0, and 0 ^ single = single.\n\n" +
        "Another way to see it: look at one bit position at a time. Each pair contributes its bit twice, which " +
        "flips that position twice and leaves it as it was. Only the single number's bits flip an odd number of " +
        "times, so they are what's left.\n\n" +
        "Negative numbers work unchanged. In C# an int is 32 bits in two's complement, " +
        "where -k is stored as the bit pattern of 2^32 - k, and XOR just works on those bits. Python ints " +
        "behave as if they had infinitely many sign bits, and XOR still cancels pairs exactly, so -2 comes out as " +
        "-2.\n\n" +
        "The visualization XORs [5, 3, 5, 6, 3] as 4-bit rows. The bottom row is the running XOR.";

    public List<string> RecognitionSignals =>
    [
        "\"Every element appears twice except one\" (or an even number of times except one).",
        "O(1) extra space ruling out a hash set, on a problem that is really about counting occurrences.",
        "Pairs that should cancel out: XOR is the operation where combining something with itself gives nothing.",
    ];

    public List<string> Gotchas =>
    [
        "Start the accumulator at 0, the XOR identity, not at nums[0] plus a loop that XORs nums[0] again.",
        "It only works for \"twice\" (or any even count). If others appear three times, count each bit position modulo 3 instead.",
        "^ is XOR in C# and Python, not exponentiation. Powers are Math.Pow in C# and ** in Python.",
    ];

    public List<string> ConfusableWith =>
    [
        "Hash Map counting solves the general \"which value appears an odd number of times\" problem with O(n) space.",
        "Missing Number (this track) uses the same cancellation, XOR-ing the indexes 0..n against the values.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int SingleNumber(int[] nums)\n" +
            "    {\n" +
            "        // TODO: acc = 0; XOR every element into it (acc ^= x).\n" +
            "        // Pairs cancel (x ^ x == 0), so acc ends as the single value.\n" +
            "        return int.MinValue + 1;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def single_number(nums):\n" +
            "    # TODO: acc = 0; XOR every element into it (acc ^= x).\n" +
            "    # Pairs cancel (x ^ x == 0), so acc ends as the single value.\n" +
            "    return None\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.SingleNumber",
        ["python"] = "single_number",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[2, 2, 1]", "1"),
        new TestCase("[4, 1, 2, 1, 2]", "4"),
        new TestCase("[1]", "1"),
        new TestCase("[-1, -1, -2]", "-2"),
        new TestCase("[0, 5, 5]", "0"),
        new TestCase("[7, 3, 5, 3, 7]", "5"),
        new TestCase("[2147483647, -2147483648, 2147483647]", "-2147483648"),
    ];

    public string CSharpCallTemplate => "Solution.SingleNumber({input})";
    public string PythonCallTemplate => "single_number({input})";

    internal static object[] Bits(int value, int width) =>
        Enumerable.Range(0, width).Select(i => (object)((value >> (width - 1 - i)) & 1)).ToArray();

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [5, 3, 5, 6, 3];
        const int width = 4;
        var rows = new List<object[]>();
        var labels = new List<object>();
        var steps = new List<VisualizationStep>();
        var acc = 0;

        Dictionary<string, object> State(int highlightRow) => new()
        {
            ["grid"] = rows.Append(Bits(acc, width)).ToArray(),
            ["rowLabels"] = labels.Append($"acc = {acc}").ToArray(),
            ["colLabels"] = new object[] { "8", "4", "2", "1" },
            ["highlight"] = highlightRow < 0 ? Array.Empty<int[]>() : Enumerable.Range(0, width).Select(c => new[] { highlightRow, c }).ToArray(),
            ["visited"] = Enumerable.Range(0, width).Where(c => ((acc >> (width - 1 - c)) & 1) == 1).Select(c => new[] { rows.Count, c }).ToArray(),
            ["tracker"] = acc,
            ["trackerLabel"] = "acc",
        };

        steps.Add(new VisualizationStep(State(-1), [],
            "nums = [5, 3, 5, 6, 3]. Columns are bit values 8, 4, 2, 1. acc starts at 0 (bottom row); its 1 bits are shown in green."));

        foreach (var x in nums)
        {
            var before = acc;
            acc ^= x;
            rows.Add(Bits(x, width));
            labels.Add(x);
            steps.Add(new VisualizationStep(State(rows.Count - 1), [],
                $"acc ^= {x}: {Convert.ToString(before, 2).PadLeft(width, '0')} ^ {Convert.ToString(x, 2).PadLeft(width, '0')} = {Convert.ToString(acc, 2).PadLeft(width, '0')} (acc = {acc}). Each 1 in {x} flips that bit of acc."));
        }

        steps.Add(new VisualizationStep(State(-1), [],
            $"Done: acc = {acc}. Both 5s and both 3s flipped their bits twice, which cancels; only 6's bits are left."));
        return steps;
    }
}
