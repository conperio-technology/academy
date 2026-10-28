namespace DsaAcademy.Content.Concepts;

public class InterExtractErrorCodes : IConcept
{
    public string Id => "inter-extract-error-codes";
    public string Section => Basics.Section;
    public string Track => Inter.Track;
    public int Order => 1751;
    public string Title => "Regex: Extract Error Codes From a Log";
    public string OneLiner => "Find every error code of the form ERR- plus exactly four digits in a log, as a whole token, using a regular expression in C# or Python.";
    public string KeyTakeaway =>
        "Describe the shape, not the search: \\bERR-[0-9]{4}\\b finds the codes in one call (Regex.Matches / " +
        "re.findall). The word boundaries \\b stop matches glued to other letters or digits, and {4} with the " +
        "closing \\b rejects five-digit codes. Write [0-9] rather than \\d when you mean ASCII digits.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write ExtractErrorCodes(log), which returns every error code in a block of log text, in the order " +
        "they appear, duplicates included. An error code is the capital letters ERR, a hyphen, and exactly " +
        "four digits, standing as a whole token: the character before it (if any) and the character after it " +
        "(if any) must not be a letter, digit or underscore. So \"(ERR-1042)\" and \"ERR-1042.\" count, but " +
        "\"XERR-1042\", \"ERR-10420\" and \"ERR-1042a\" don't, and neither does lower-case \"err-1042\".\n\n" +
        "This is the job regular expressions are for: describe what the text looks like and let the engine " +
        "find it. The pattern is \\bERR-[0-9]{4}\\b. \\b is a word boundary, the point between a word character " +
        "(letter, digit, underscore) and anything else, or the start or end of the text. ERR- is literal. " +
        "[0-9]{4} is exactly four digits. In C#, Regex.Matches(log, pattern) returns every match and m.Value " +
        "is the matched text; in Python, re.findall(pattern, log) returns the matched strings directly when " +
        "the pattern has no groups.\n\n" +
        "Write the pattern as a verbatim string in C# (@\"...\") and a raw string in Python (r\"...\"), so the " +
        "backslashes reach the regex engine instead of being read as string escapes: in a normal string \"\\b\" " +
        "is a backspace character. Prefer [0-9] to \\d here: in both .NET and Python 3, \\d also matches digits " +
        "from other scripts, such as Arabic-Indic numerals.\n\n" +
        "The visualization runs the pattern over a short log and shows each match as it is found, and the " +
        "near misses the boundaries reject.";

    public List<string> RecognitionSignals => [
        "Pull every token of a fixed shape (IDs, codes, dates, IP addresses) out of free text.",
        "Validate that a whole string has a format, using ^...$ or Regex.IsMatch / re.fullmatch.",
    ];

    public List<string> Gotchas => [
        "Without \\b, ERR-[0-9]{4} also finds ERR-1234 inside ERR-12345 and XERR-1234.",
        "A regex in a normal (non-raw) string loses its backslashes, or turns \\b into a backspace.",
        "Python's re.findall returns the groups, not the whole match, when the pattern contains (...); use (?:...) or no groups.",
    ];

    public List<string> ConfusableWith => [
        "Regular Expression Matching (dp-regex-matching) asks you to build a tiny regex engine for . and * with dynamic programming; here you use the language's engine.",
        "Splitting on spaces and checking each token misses codes next to punctuation, such as (ERR-1042) or ERR-1042.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "using System.Text.RegularExpressions;\n" +
            "\n" +
            "public class Solution\n" +
            "{\n" +
            "    public static List<string> ExtractErrorCodes(string log)\n" +
            "    {\n" +
            "        var codes = new List<string>();\n" +
            "        // TODO: foreach (Match m in Regex.Matches(log, @\"...\")) codes.Add(m.Value);\n" +
            "        // The pattern: a word boundary, ERR-, exactly four digits, a word boundary.\n" +
            "        return codes;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "import re\n" +
            "\n" +
            "\n" +
            "def extract_error_codes(log):\n" +
            "    # TODO: return re.findall(r\"...\", log)\n" +
            "    # The pattern: a word boundary, ERR-, exactly four digits, a word boundary.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.ExtractErrorCodes",
        ["python"] = "extract_error_codes",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("\"09:14 ERR-1042 disk full\\n09:15 retry ok\\n09:20 ERR-2001 timeout\"", "[\"ERR-1042\",\"ERR-2001\"]"),
        new TestCase("\"no errors today\"", "[]"),
        new TestCase("\"\"", "[]"),
        new TestCase("\"ERR-0007 at start, (ERR-9999) in brackets, end ERR-1234\"", "[\"ERR-0007\",\"ERR-9999\",\"ERR-1234\"]"),
        new TestCase("\"ERR-12345 too long, ERR-123 too short, XERR-5555 glued, ERR-55556\"", "[]"),
        new TestCase("\"err-1234 lower case and ERR-1234a with a letter, but ERR-4321.\"", "[\"ERR-4321\"]"),
        new TestCase("\"ERR-1111 ERR-1111 ERR-2222\"", "[\"ERR-1111\",\"ERR-1111\",\"ERR-2222\"]"),
        new TestCase("\"line1: ERR-3001\\r\\nline2: code=ERR-3002;next\"", "[\"ERR-3001\",\"ERR-3002\"]"),
    ];

    public string CSharpCallTemplate => "Solution.ExtractErrorCodes({input})";
    public string PythonCallTemplate => "extract_error_codes({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        var log = "ERR-1042 disk full; XERR-2000; ERR-30001; (ERR-4004) retry";
        var tokens = new[] { "ERR-1042", "disk", "full;", "XERR-2000;", "ERR-30001;", "(ERR-4004)", "retry" };
        var found = new List<string>();
        var steps = new List<VisualizationStep>
        {
            Basics.Step(tokens, [], "[]", "matches", "The log, split into words only for display. The pattern \\bERR-[0-9]{4}\\b scans the raw text, not the words."),
        };
        foreach (System.Text.RegularExpressions.Match m in System.Text.RegularExpressions.Regex.Matches(log, @"\bERR-[0-9]{4}\b"))
        {
            found.Add(m.Value);
            var at = Array.FindIndex(tokens, t => t.Contains(m.Value) && !t.StartsWith("X"));
            steps.Add(Basics.Step(tokens, [at], $"[{string.Join(", ", found)}]", "matches",
                $"Match at index {m.Index}: {m.Value}. A boundary before ERR (start of text or a non-word character) and after the four digits."));
            if (m.Value == "ERR-1042")
            {
                steps.Add(Basics.Step(tokens, [3], $"[{string.Join(", ", found)}]", "matches", "XERR-2000 is skipped: X and E are both word characters, so there is no \\b before ERR."));
                steps.Add(Basics.Step(tokens, [4], $"[{string.Join(", ", found)}]", "matches", "ERR-30001 is skipped: after four digits comes a fifth, so the closing \\b fails."));
            }
        }
        steps.Add(Basics.Step(tokens, [], $"[{string.Join(", ", found)}]", "matches", "Done: two codes. The bracket in (ERR-4004) is not a word character, so the boundaries hold."));
        return steps;
    }
}
