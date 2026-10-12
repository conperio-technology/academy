namespace DsaAcademy.Content.Concepts;

public class AdvSumFieldsSpan : IConcept
{
    public string Id => "adv-sum-fields-span";
    public string Section => Basics.Section;
    public string Track => Adv.Track;
    public int Order => 2001;
    public string Title => "Sum the Fields of a Line Without Splitting";
    public string OneLiner => "Add up the semicolon-separated numbers in a line by walking it with indexes and slicing a ReadOnlySpan<char>, instead of splitting it into new strings.";
    public string KeyTakeaway =>
        "Split allocates an array plus a new string per field. Walking the text with IndexOf and parsing each slice of a " +
        "ReadOnlySpan<char> straight away (int.Parse accepts spans) does the same job with no allocations at all, which " +
        "matters when a parser runs millions of times. Python has no span for str, but the same index-walking logic applies.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write SumFields(line), which returns the sum of the integers in a line of fields separated by semicolons. " +
        "\"10;20;30\" gives 60. Fields may have spaces around the number (\" 7 \") and may be negative; empty fields, " +
        "including a completely empty line, count as nothing, so \"-5; 7 ;;8\" gives 10 and \"\" gives 0. Every non-empty " +
        "field is a valid int, and the totals fit in an int.\n\n" +
        "In C# the parameter is a ReadOnlySpan<char>, a view of the line's characters, so you can't call Split on it: " +
        "find the next ';' with IndexOf, take the field as a slice (line[..end]), skip it if it's empty or only spaces " +
        "(IsWhiteSpace() on the span), otherwise add int.Parse(field), which accepts a span and ignores surrounding " +
        "spaces. Then continue with the rest of the line (line[(end + 1)..]). Nothing in your loop creates a string.\n\n" +
        "In Python, strings have no no-copy view, so the point is the logic rather than the memory: walk the line with " +
        "line.find(\";\", start), take line[start:end] for each field, skip blank ones with strip(), and add int(field), " +
        "which also ignores surrounding spaces. (In everyday Python, sum over line.split(\";\") is fine.)";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int SumFields(ReadOnlySpan<char> line)\n" +
            "    {\n" +
            "        int total = 0;\n" +
            "        while (!line.IsEmpty)\n" +
            "        {\n" +
            "            int end = line.IndexOf(';');\n" +
            "            // TODO: take the field before end (or the whole rest when end is -1),\n" +
            "            // add it if it isn't blank, then move line past the semicolon.\n" +
            "            break;\n" +
            "        }\n" +
            "        return total;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def sum_fields(line):\n" +
            "    total = 0\n" +
            "    start = 0\n" +
            "    # TODO: find each \";\" with line.find(\";\", start), add the non-blank fields.\n" +
            "    return total\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.SumFields",
        ["python"] = "sum_fields",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Str("10;20;30"), "60"),
        new TestCase(Lit.Str(""), "0"),
        new TestCase(Lit.Str("-5; 7 ;;8"), "10"),
        new TestCase(Lit.Str("42"), "42"),
        new TestCase(Lit.Str(";;;"), "0"),
        new TestCase(Lit.Str("1000000;2000000;-3;"), "2999997"),
        new TestCase(Lit.Str("  ; 15;   "), "15"),
    ];

    public string CSharpCallTemplate => "Solution.SumFields({input})";
    public string PythonCallTemplate => "sum_fields({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        var arr = Basics.Chars("-5; 7 ;;8");
        return
        [
            Basics.Step(arr, [], 0, "total", "The line \"-5; 7 ;;8\". A span is a view of these characters: slicing it moves the view, nothing is copied."),
            Basics.Step(arr, [0, 1], -5, "total", "IndexOf(';') is 2, so the first field is line[..2], \"-5\". int.Parse reads it straight from the span: total -5."),
            Basics.Step(arr, [3, 4, 5], 2, "total", "Move past the ';' (line[3..]). The next field is \" 7 \"; int.Parse ignores the spaces: total 2."),
            Basics.Step(arr, [], 2, "total", "The next field is empty (two semicolons in a row): skip it."),
            Basics.Step(arr, [8], 10, "total", "No more ';', so the rest of the line, \"8\", is the last field: total 10. No strings were created."),
        ];
    }
}
