namespace DsaAcademy.Content.Concepts;

public class InterParseSettings : IConcept
{
    public string Id => "inter-parse-settings";
    public string Section => Basics.Section;
    public string Track => Inter.Track;
    public int Order => 1702;
    public string Title => "Parse key=value Settings";
    public string OneLiner => "Read settings text line by line into a dictionary, skipping comments, blank lines and malformed lines, and splitting only at the first equals sign.";
    public string KeyTakeaway =>
        "Parse text defensively, one line at a time: trim, skip what you don't understand, split at the first separator " +
        "only (Split('=', 2) / partition), trim both halves, and let later lines override earlier ones. Windows line " +
        "endings leave a \\r behind unless you trim.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write ParseSettings(text), which reads lines of key=value settings into a dictionary of strings. The rules: " +
        "lines are separated by \\n; trim spaces from each line, and skip it if it's empty or starts with #; split it at " +
        "the first = only, so values can contain =; trim the key and the value; skip lines with no = or with an empty " +
        "key; and if a key appears twice, the later value wins. An empty value is allowed. \"host = plc-1\\nport=502\" " +
        "gives {\"host\": \"plc-1\", \"port\": \"502\"}.\n\n" +
        "In C#, line.Split('=', 2) splits into at most 2 parts, and line.IndexOf('=') finds the first one if you'd " +
        "rather use Substring. In Python, key, sep, value = line.partition(\"=\") splits at the first = and leaves sep " +
        "empty when there isn't one. Trim with Trim() / strip().\n\n" +
        "One test uses Windows line endings, \\r\\n. Splitting on \\n leaves a \\r at the end of each line, which trimming " +
        "removes; that's a common real-world surprise when files move between Windows and Linux. Settings files usually " +
        "come from disk (File.ReadAllText, Path.read_text), but the exercise passes the text in directly: the parsing " +
        "code is the same.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static Dictionary<string, string> ParseSettings(string text)\n" +
            "    {\n" +
            "        var settings = new Dictionary<string, string>();\n" +
            "        foreach (var rawLine in text.Split('\\n'))\n" +
            "        {\n" +
            "            // TODO: trim; skip blanks and # comments; split at the first '='; trim key and value.\n" +
            "        }\n" +
            "        return settings;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def parse_settings(text):\n" +
            "    settings = {}\n" +
            "    for raw_line in text.split(\"\\n\"):\n" +
            "        pass  # TODO: strip; skip blanks and # comments; split at the first \"=\"; strip key and value.\n" +
            "    return settings\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.ParseSettings",
        ["python"] = "parse_settings",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Str("host = plc-1\nport=502"), "{\"host\": \"plc-1\", \"port\": \"502\"}"),
        new TestCase(Lit.Str("# comment\n\nmode = auto\nbad line\nmode=manual"), "{\"mode\": \"manual\"}"),
        new TestCase(Lit.Str(""), "{}"),
        new TestCase(Lit.Str("url = http://x/?a=b"), "{\"url\": \"http://x/?a=b\"}"),
        new TestCase(Lit.Str("  Key  =  Value with spaces  \n=orphan\nempty="), "{\"Key\": \"Value with spaces\", \"empty\": \"\"}"),
        new TestCase(Lit.Str("a=1\r\nb=2\r\n"), "{\"a\": \"1\", \"b\": \"2\"}"),
    ];

    public string CSharpCallTemplate => "Solution.ParseSettings({input})";
    public string PythonCallTemplate => "parse_settings({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        // Cells are line numbers (long lines don't fit a phone-width cell); each message quotes the line.
        object[] lines = [1, 2, 3, 4, 5, 6];
        return
        [
            Basics.Step(lines, [], "{}", "settings", "Six lines: \"# comment\", an empty line, \"mode = auto\", \"bad line\", \"url = http://x/?a=b\" and \"mode=manual\"."),
            Basics.Step(lines, [0, 1], "{}", "settings", "Line 1 is a comment and line 2 is blank: skip both."),
            Basics.Step(lines, [2], "{mode: auto}", "settings", "Line 3: split at the first =, trim both sides: key \"mode\", value \"auto\"."),
            Basics.Step(lines, [3], "{mode: auto}", "settings", "Line 4 has no = at all: skip it rather than crash."),
            Basics.Step(lines, [4], "{mode: auto, url: http://x/?a=b}", "settings", "Line 5: only the first = splits, so the value keeps its own =."),
            Basics.Step(lines, [5], "{mode: manual, url: http://x/?a=b}", "settings", "Line 6 sets mode again: the later value replaces the earlier one."),
        ];
    }
}
