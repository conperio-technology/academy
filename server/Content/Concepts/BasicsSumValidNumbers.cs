namespace DsaAcademy.Content.Concepts;

public class BasicsSumValidNumbers : IConcept
{
    public string Id => "basics-sum-valid-numbers";
    public string Section => Basics.Section;
    public string Track => "basics";
    public int Order => 71;
    public string Title => "Add Up the Valid Numbers";
    public string OneLiner => "Parse a list of text values, skip the ones that aren't whole numbers, and total the rest: try/catch versus TryParse.";
    public string KeyTakeaway =>
        "Bad input is expected, so handle it per item and keep going. In C#, int.TryParse returns false instead of " +
        "throwing; in Python, wrap int(...) in try/except ValueError. Keep the try block around just the risky call.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "You get a list of strings, as you might read from a CSV file or a form. Return the sum of the ones that are " +
        "valid whole numbers, ignoring the rest. Surrounding spaces and a leading + or - are fine (\" 7 \", \"+5\", \"-3\"); " +
        "decimals such as \"3.5\", empty strings and words are not.\n\n" +
        "In Python, int(text) handles all the valid forms and raises ValueError for everything else, so: loop, and " +
        "inside the loop try: total += int(text) with except ValueError: pass (skipping is the whole point here, so " +
        "an empty except body is right for once; it catches only ValueError).\n\n" +
        "In C#, int.Parse behaves the same way, throwing FormatException, and a try/catch works. The more idiomatic " +
        "C# is if (int.TryParse(text, out int n)) total += n;: no exception, just a bool saying whether it worked. " +
        "Exceptions in .NET are relatively slow, which matters when lots of the input is bad.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int SumValid(string[] items)\n" +
            "    {\n" +
            "        int total = 0;\n" +
            "        // TODO: add each item that is a valid whole number; skip the rest.\n" +
            "        return total;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def sum_valid(items):\n" +
            "    total = 0\n" +
            "    # TODO: add each item that is a valid whole number; skip the rest.\n" +
            "    return total\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.SumValid",
        ["python"] = "sum_valid",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Basics.StrArray("4", "x", "10"), "14"),
        new TestCase("[]", "0"),
        new TestCase(Basics.StrArray("-3", " 7 ", "3.5", "", "abc"), "4"),
        new TestCase(Basics.StrArray("+5", "5"), "10"),
        new TestCase(Basics.StrArray("one", "two"), "0"),
    ];

    public string CSharpCallTemplate => "Solution.SumValid({input})";
    public string PythonCallTemplate => "sum_valid({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        object[] items = ["12", "n/a", " 8", "4.5", "-2"];
        return
        [
            Basics.Step(items, [], 0, "total", "Readings exported as text. Some are junk."),
            Basics.Step(items, [0], 12, "total", "\"12\" parses: total 12."),
            Basics.Step(items, [1], 12, "total", "\"n/a\" fails to parse (ValueError / TryParse returns false): skip it and carry on."),
            Basics.Step(items, [2], 20, "total", "\" 8\" parses; leading spaces are allowed: total 20."),
            Basics.Step(items, [3], 20, "total", "\"4.5\" isn't a whole number: skip."),
            Basics.Step(items, [4], 18, "total", "\"-2\" parses: total 18."),
        ];
    }
}
