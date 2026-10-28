namespace DsaAcademy.Content.Concepts;

public class DpDecodeWays : IConcept
{
    public string Id => "dp-decode-ways";
    public string Track => "patterns";
    public string Title => "DP: Decode Ways";
    public string OneLiner => "Count how many ways a digit string decodes to letters (A = 1 ... Z = 26). Like climbing stairs: the last step is one digit or two, but zeros close some steps.";
    public string KeyTakeaway =>
        "ways(i), the number of decodings of the first i digits, is ways(i - 1) if digit i is not 0 (decode " +
        "it alone) plus ways(i - 2) if the last two digits form 10 to 26. Only the previous two values are " +
        "needed, so two variables give O(n) time and O(1) space. Zeros are the whole difficulty: \"0\" alone is " +
        "invalid, and \"06\" is not 6.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "A message of letters was encoded as numbers, A = 1, B = 2, ..., Z = 26, and the numbers were run " +
        "together. Given the digit string s, return how many different messages it could have been. \"12\" is " +
        "AB or L, so 2. \"226\" is BBF, BZ or VF, so 3. \"06\" is 0: there is no letter for 0 and \"06\" is not a " +
        "valid code for F.\n\n" +
        "Look at the end of the string. The last letter came from either the last single digit or the last " +
        "two digits. So the count for the first i digits is the count for the first i - 1 (if the last digit " +
        "alone is a letter) plus the count for the first i - 2 (if the last two digits together are a " +
        "letter). That is Climbing Stairs, where you could take one or two steps, except that some steps are " +
        "not allowed.\n\n" +
        "The rules: a single digit is a letter unless it is 0. A pair is a letter if it is between 10 and 26; " +
        "that rules out 05 (leading zero) and 27 or more. Define ways(0) = 1 (the empty prefix has exactly " +
        "one decoding, nothing) and ways(1) = 1 if s[0] is not '0', else 0. Then for i from 2 to n: ways(i) = " +
        "(s[i - 1] != '0' ? ways(i - 1) : 0) + (10 <= s[i - 2..i] <= 26 ? ways(i - 2) : 0).\n\n" +
        "Each step looks back only two places, so keep two variables instead of the table: O(n) time, O(1) " +
        "space. A 0 can only survive as the second digit of 10 or 20, which is why \"100\" has 0 decodings and " +
        "\"2101\" has 1 (2 10 1). Try \"11106\" by hand before you code it; it should give 2 (1 1 10 6, 11 10 6).\n\n" +
        "The visualization fills ways for \"11106\": the array shows ways(0) to ways(5).";

    public List<string> RecognitionSignals => [
        "Count the ways to split a sequence into pieces of length one or two that each satisfy a rule.",
        "Fibonacci-like growth with exceptions: the count depends on the previous one or two counts.",
    ];

    public List<string> Gotchas => [
        "Treating \"0\" as a letter, or \"05\" as a valid pair.",
        "A string starting with 0 has 0 decodings.",
        "Counting the decodings of the empty prefix as 0 instead of 1 zeroes out every later count.",
    ];

    public List<string> ConfusableWith => [
        "Climbing Stairs is the same recurrence with every one-step and two-step move allowed.",
        "Word Break checks prefixes against a dictionary and asks yes or no; this counts, and the pieces are fixed at one or two digits.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int NumDecodings(string s)\n" +
            "    {\n" +
            "        if (s.Length == 0) return 0;\n" +
            "        // ways of the first i - 2 and first i - 1 digits.\n" +
            "        int prev2 = 1, prev1 = s[0] != '0' ? 1 : 0;\n" +
            "        // TODO: for i from 1 to s.Length - 1: cur = 0; if s[i] != '0', cur += prev1;\n" +
            "        // if the two digits s[i - 1], s[i] form 10 to 26, cur += prev2.\n" +
            "        // Then shift: prev2 = prev1, prev1 = cur. Return prev1.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def num_decodings(s):\n" +
            "    if not s:\n" +
            "        return 0\n" +
            "    # ways of the first i - 2 and first i - 1 digits.\n" +
            "    prev2, prev1 = 1, (1 if s[0] != \"0\" else 0)\n" +
            "    # TODO: for i from 1 to len(s) - 1: cur = 0; if s[i] != \"0\", cur += prev1;\n" +
            "    # if 10 <= int(s[i - 1:i + 1]) <= 26, cur += prev2.\n" +
            "    # Then shift: prev2, prev1 = prev1, cur. Return prev1.\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.NumDecodings",
        ["python"] = "num_decodings",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("\"12\"", "2"),
        new TestCase("\"226\"", "3"),
        new TestCase("\"06\"", "0"),
        new TestCase("\"0\"", "0"),
        new TestCase("\"10\"", "1"),
        new TestCase("\"27\"", "1"),
        new TestCase("\"11106\"", "2"),
        new TestCase("\"2101\"", "1"),
        new TestCase("\"111111\"", "13"),
        new TestCase("\"1201234\"", "3"),
        new TestCase("\"100\"", "0"),
    ];

    public string CSharpCallTemplate => "Solution.NumDecodings({input})";
    public string PythonCallTemplate => "num_decodings({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const string s = "11106";
        var ways = new int[s.Length + 1];
        ways[0] = 1;
        ways[1] = s[0] != '0' ? 1 : 0;
        var steps = new List<VisualizationStep>
        {
            new(new() { ["array"] = ways.ToArray(), ["tracker"] = 1, ["trackerLabel"] = "i" }, [0, 1], "s = \"11106\". ways(0) = 1 (the empty prefix), ways(1) = 1 (\"1\" is A)."),
        };
        for (var i = 2; i <= s.Length; i++)
        {
            var single = s[i - 1] != '0';
            var pair = int.Parse(s[(i - 2)..i]);
            var pairOk = pair >= 10 && pair <= 26;
            ways[i] = (single ? ways[i - 1] : 0) + (pairOk ? ways[i - 2] : 0);
            var a = single ? $"digit {s[i - 1]} alone is a letter, + ways({i - 1}) = {ways[i - 1]}" : $"digit 0 alone is not a letter";
            var b = pairOk ? $"{pair} is a letter, + ways({i - 2}) = {ways[i - 2]}" : $"{s[(i - 2)..i]} is not a letter";
            steps.Add(new(new() { ["array"] = ways.ToArray(), ["tracker"] = i, ["trackerLabel"] = "i" }, [i],
                $"ways({i}) for \"{s[..i]}\": {a}; {b}. ways({i}) = {ways[i]}."));
        }
        steps.Add(new(new() { ["array"] = ways.ToArray() }, [s.Length], $"\"11106\" decodes {ways[s.Length]} ways: 1 1 10 6 and 11 10 6."));
        return steps;
    }
}
