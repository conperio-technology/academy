namespace DsaAcademy.Content.Concepts;

public class BitManipulationCountSetBits : IConcept
{
    public string Id => "bit-manipulation-count-set-bits";
    public string Track => "patterns";
    public string Title => "Bit Manipulation: Count Set Bits";
    public string OneLiner => "AND, OR, XOR, shifts -- the low-level operations bit-manipulation problems are built from, demonstrated by counting a number's 1 bits.";
    public string KeyTakeaway =>
        "Bit tricks aren't magic -- they're five operations (AND &, OR |, XOR ^, NOT ~, shift " +
        "<</>>) applied directly to a number's binary representation, often replacing a loop over an " +
        "array or string with O(1)-per-bit work on a single integer. `n & 1` checks whether the " +
        "lowest bit is set; `n >> 1` discards it and moves to the next one.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Five operations work directly on a number's bits: AND (&) gives 1 only where BOTH inputs " +
        "have a 1; OR (|) gives 1 where EITHER input has a 1; XOR (^) gives 1 only where the inputs " +
        "DISAGREE; NOT (~) flips every bit; and shifting (<< left, >> right) slides every bit over by " +
        "one position, which is the same as multiplying or dividing by 2. To count how many 1 bits are " +
        "in a number: check the lowest bit with `n & 1` (1 if it's set, 0 if not), add that to a " +
        "running count, then `n >>= 1` to discard that bit and bring the next one into the lowest " +
        "position -- repeat until n is 0. Two classic tricks worth knowing even though they're not " +
        "needed for this exercise: `n & (n - 1)` clears the LOWEST set bit in one operation (Brian " +
        "Kernighan's trick -- useful for a faster set-bit count, since it only loops once per 1-bit " +
        "instead of once per bit total), and `(n & (n - 1)) == 0` for n > 0 checks whether n is a power " +
        "of two (a power of two has exactly one set bit, so clearing it always leaves zero). Watch out " +
        "for `n & 1` checking the LOWEST bit, not the highest -- it's easy to get the direction backward " +
        "when reasoning about which end of the number you're inspecting.";

    public List<string> RecognitionSignals =>
    [
        "The problem talks about binary representation, powers of two, or \"set bits\" directly.",
        "You need to check, toggle, or count individual bits of a number rather than treat it as one opaque value.",
        "A brute-force approach would convert the number to a string or array of digits to inspect it -- bit operations usually do the same job in O(1) extra space.",
    ];

    public List<string> Gotchas =>
    [
        "`n & 1` checks the LOWEST (rightmost) bit, not the highest -- easy to get backward when reasoning about which end of the number you're looking at.",
        "Right-shifting a NEGATIVE number can sign-extend (fill with 1s, not 0s) depending on the language/type -- a loop assuming \"shift until n == 0\" can spin forever on negative input if that's not accounted for.",
        "`n & (n - 1)` clears the lowest SET bit, not the lowest bit period -- it's a no-op shortcut specifically because subtracting 1 flips every trailing 0 (and the lowest 1) up to and including that lowest set bit.",
    ];

    public List<string> ConfusableWith =>
    [
        "Bitmask subset enumeration (Bits: All Subsets by Counting Bitmasks) also manipulates bits, but there each bit means \"is this element included in the subset\" -- same five operations, completely different meaning attached to each bit.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int CountSetBits(int n)\n" +
            "    {\n" +
            "        // TODO: while n > 0, check the lowest bit with (n & 1), add it to a count,\n" +
            "        // then shift n right by 1. Return the count once n reaches 0.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def count_set_bits(n):\n" +
            "    # TODO: while n > 0, check the lowest bit with (n & 1), add it to a count,\n" +
            "    # then shift n right by 1. Return the count once n reaches 0.\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CountSetBits",
        ["python"] = "count_set_bits",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Int(23), "4"),
        new TestCase(Lit.Int(0), "0"),
        new TestCase(Lit.Int(1), "1"),
        new TestCase(Lit.Int(8), "1"),
        new TestCase(Lit.Int(255), "8"),
    ];

    public string CSharpCallTemplate => "Solution.CountSetBits({input})";
    public string PythonCallTemplate => "count_set_bits({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const int original = 23;
        const int width = 5;
        var bits = Enumerable.Range(0, width).Select(i => (original >> (width - 1 - i)) & 1).ToArray(); // MSB..LSB
        var steps = new List<VisualizationStep>();

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = bits, ["tracker"] = 0, ["trackerLabel"] = "set bits found" },
            HighlightIndices: [],
            Message: $"{original} in binary is {string.Join("", bits)}. Check the lowest bit (n & 1), record it, shift right (n >>= 1), repeat until n is 0."
        ));

        var count = 0;
        var n = original;
        for (var pos = 0; pos < width; pos++)
        {
            var displayIndex = width - 1 - pos; // rightmost (LSB) first, moving left
            var bitValue = n & 1;
            if (bitValue == 1) count++;
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = bits, ["tracker"] = count, ["trackerLabel"] = "set bits found" },
                HighlightIndices: [displayIndex],
                Message: bitValue == 1
                    ? $"n & 1 = 1 -- this bit is set. count = {count}. Shift right: n = {n >> 1}."
                    : $"n & 1 = 0 -- not set. count stays {count}. Shift right: n = {n >> 1}."
            ));
            n >>= 1;
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = bits, ["tracker"] = count, ["trackerLabel"] = "set bits found" },
            HighlightIndices: [],
            Message: $"n is now 0 -- done. {original} has {count} set bits."
        ));

        return steps;
    }
}
