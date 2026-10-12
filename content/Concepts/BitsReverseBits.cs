namespace DsaAcademy.Content.Concepts;

public class BitsReverseBits : IConcept
{
    public string Id => "bits-reverse-bits";
    public string Track => "bits";
    public int Order => 131;
    public string Title => "Bits: Reverse Bits of a 32-bit Unsigned Integer";
    public string OneLiner => "Mirror all 32 bits: pop the lowest bit of n, push it onto the result from the right, exactly 32 times.";
    public string KeyTakeaway =>
        "result = (result << 1) | (n & 1), then n >>= 1, repeated exactly 32 times, not \"until n is 0\" (leading " +
        "zeros become trailing zeros and still count). Use an unsigned type in C# (uint) so >> shifts in zeros; " +
        "in Python, ints have no width, so the fixed loop count is what makes it 32-bit.";
    public VisualizerKind VisualizerKind => VisualizerKind.Grid;

    public string Explanation =>
        "Reverse the bits of a 32-bit unsigned integer: bit 0 swaps with bit 31, bit 1 with bit 30, and so on. " +
        "Unsigned means all 32 bits are value bits, so the range is 0 to 4,294,967,295 and there are no negative " +
        "numbers. 1 (only bit 0 set) becomes 2,147,483,648 (only bit 31 set), and 43,261,596 becomes 964,176,192.\n\n" +
        "The loop treats n as a stack of bits. n & 1 reads the lowest bit. n >> 1 shifts every bit one place to " +
        "the right, dropping that bit. result << 1 shifts the result left to make room, and | (OR) drops the new " +
        "bit into the empty lowest place. So each round moves one bit from the bottom of n to the bottom of " +
        "result, and after 32 rounds the first bit taken (n's bit 0) has been pushed all the way up to bit 31. " +
        "Run exactly 32 rounds: if you stop when n becomes 0, the zeros at the top of n never get moved to the " +
        "bottom, and 1 would come out as 1 instead of 2,147,483,648.\n\n" +
        "Signed versus unsigned shifts. In C#, >> on a signed int is an arithmetic shift: it copies the sign bit " +
        "into the top, so a negative number stays negative and never reaches 0. On a uint, >> is a logical shift " +
        "that fills with zeros, which is why this lesson's C# signature takes and returns uint. C# 11 also added " +
        ">>>, a logical right shift for signed types. Python has no >>> and no fixed width: >> on a negative int " +
        "is arithmetic, and a left shift just makes the number bigger. Here the input is non-negative, so " +
        "Python's >> is fine, and the 32-round loop is what keeps the result 32 bits wide.\n\n" +
        "If the function is called many times, cache the reversal of every byte (256 entries) and combine four " +
        "lookups; or swap halves, then quarters, with masks like 0xFFFF0000, 0xFF00FF00, 0xF0F0F0F0, 0xCCCCCCCC " +
        "and 0xAAAAAAAA, five steps with no loop.\n\n" +
        "The visualization reverses an 8-bit number, 0b00001101 (13), so it fits on screen; the real thing is the " +
        "same loop with 32 rounds.";

    public List<string> RecognitionSignals =>
    [
        "\"Reverse the bits\", \"mirror\", or anything defined per bit POSITION within a fixed width.",
        "The input is described as unsigned or as a fixed-width bit string.",
        "Repeated calls hint at a lookup table of byte reversals.",
    ];

    public List<string> Gotchas =>
    [
        "Loop exactly 32 times; stopping when n == 0 loses the bits that should become trailing zeros.",
        "In C#, use uint (or >>>): >> on a negative int copies the sign bit and the value never empties.",
        "Shift result left BEFORE OR-ing in the new bit, or the last bit gets shifted one place too far.",
    ];

    public List<string> ConfusableWith =>
    [
        "Reverse Integer (math track) reverses DECIMAL digits with % 10; this reverses binary digits with & 1 and shifts.",
        "Counting Bits (this track) also reads the lowest bit with & 1 and shifts, but it only counts the ones.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static uint ReverseBits(uint n)\n" +
            "    {\n" +
            "        // TODO: result = 0. Repeat exactly 32 times:\n" +
            "        // result = (result << 1) | (n & 1); n >>= 1;\n" +
            "        // Return result.\n" +
            "        return n;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def reverse_bits(n):\n" +
            "    # TODO: result = 0. Repeat exactly 32 times:\n" +
            "    # result = (result << 1) | (n & 1); n >>= 1.\n" +
            "    # Return result.\n" +
            "    return n\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.ReverseBits",
        ["python"] = "reverse_bits",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("43261596", "964176192"),
        new TestCase("4294967293", "3221225471"),
        new TestCase("1", "2147483648"),
        new TestCase("2147483648", "1"),
        new TestCase("6", "1610612736"),
        new TestCase("0", "0"),
        new TestCase("4294967295", "4294967295"),
    ];

    public string CSharpCallTemplate => "Solution.ReverseBits({input})";
    public string PythonCallTemplate => "reverse_bits({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const int width = 8;
        var n = 13;
        var result = 0;
        var steps = new List<VisualizationStep>();
        var cols = Enumerable.Range(0, width).Select(i => (object)$"b{width - 1 - i}").ToArray();

        Dictionary<string, object> State(int round) => new()
        {
            ["grid"] = new[] { BitsSingleNumber.Bits(n, width), BitsSingleNumber.Bits(result, width) },
            ["rowLabels"] = new object[] { "n", "result" },
            ["colLabels"] = cols,
            ["highlight"] = round < 0 ? Array.Empty<int[]>() : new[] { new[] { 0, width - 1 }, new[] { 1, width - 1 } },
            ["tracker"] = $"n = {n}, result = {result}",
            ["trackerLabel"] = round >= 0 ? $"after round {round + 1} of {width}" : result == 0 ? "start" : "done",
        };

        steps.Add(new VisualizationStep(State(-1), [], "8-bit version: n = 13 = 00001101. Each round moves n's lowest bit onto the bottom of result."));
        for (var r = 0; r < width; r++)
        {
            var bit = n & 1;
            result = (result << 1) | bit;
            n >>= 1;
            steps.Add(new VisualizationStep(State(r), [],
                $"Round {r + 1}: n & 1 = {bit}. result = (result << 1) | {bit} = {Convert.ToString(result, 2).PadLeft(width, '0')}. n >>= 1 gives {Convert.ToString(n, 2).PadLeft(width, '0')}."
                + (n == 0 && r < width - 1 ? " n is already 0, but keep going: the remaining rounds push result's bits up to the top." : "")));
        }
        steps.Add(new VisualizationStep(State(-1), [],
            $"After {width} rounds: 00001101 reversed is {Convert.ToString(result, 2).PadLeft(width, '0')} = {result}."));
        return steps;
    }
}
