namespace DsaAcademy.Content.Concepts;

public class InterFormatRow : IConcept
{
    public string Id => "inter-format-row";
    public string Section => Basics.Section;
    public string Track => Inter.Track;
    public int Order => 1701;
    public string Title => "Format a Report Line";
    public string OneLiner => "Build one fixed-width line of a report: a left-aligned name, a right-aligned quantity, and two money columns with two decimals.";
    public string KeyTakeaway =>
        "Format strings line columns up for you: {value,width:format} in C#, {value:>width.decimals} in Python. A " +
        "negative C# width (or < in Python) left-aligns; F2 (or .2f) gives two decimals; N2 (or ,.2f) adds thousands " +
        "separators too.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write FormatRow(name, qty, price) returning one line of a parts report, four columns separated by |: the name " +
        "left-aligned in 10 characters, the quantity right-aligned in 5, the unit price right-aligned in 10 with " +
        "exactly 2 decimal places, and the line total (qty × price) right-aligned in 12 with 2 decimals and a comma " +
        "between thousands. FormatRow(\"Pump\", 3, 1249.5) gives \"Pump␣␣␣␣␣␣|␣␣␣␣3|␣␣␣1249.50|␣␣␣␣3,748.50\". Names are at " +
        "most 10 characters.\n\n" +
        "In C#, one interpolated string does it: $\"{name,-10}|{qty,5}|{price,10:F2}|{qty * price,12:N2}\". F2 is " +
        "fixed-point with 2 decimals, N2 adds thousands separators. In Python: " +
        "f\"{name:<10}|{qty:>5}|{price:>10.2f}|{qty * price:>12,.2f}\". The comma in ,.2f asks for thousands " +
        "separators.\n\n" +
        "C# formats numbers using the computer's culture, and the checker runs with the invariant culture, which writes " +
        "a point for decimals and commas for thousands, matching Python. On a computer set to, say, German, the same C# " +
        "code would print 1.249,50; for text other programs read, pass CultureInfo.InvariantCulture to ToString.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static string FormatRow(string name, int qty, double price)\n" +
            "    {\n" +
            "        // TODO: name (left, 10) | qty (right, 5) | price (right, 10, 2 decimals) | total (right, 12, N2)\n" +
            "        return $\"{name}|{qty}|{price}|{qty * price}\";\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def format_row(name, qty, price):\n" +
            "    # TODO: name (left, 10) | qty (right, 5) | price (right, 10, 2 decimals) | total (right, 12, with commas)\n" +
            "    return f\"{name}|{qty}|{price}|{qty * price}\"\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.FormatRow",
        ["python"] = "format_row",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.Str("Pump"), Lit.Int(3), "1249.5"), "\"Pump      |    3|   1249.50|    3,748.50\""),
        new TestCase(Lit.Args(Lit.Str("Valve"), Lit.Int(12), "89.99"), "\"Valve     |   12|     89.99|    1,079.88\""),
        new TestCase(Lit.Args(Lit.Str("Fan"), Lit.Int(0), "0.0"), "\"Fan       |    0|      0.00|        0.00\""),
        new TestCase(Lit.Args(Lit.Str("Compressor"), Lit.Int(2), "15000.0"), "\"Compressor|    2|  15000.00|   30,000.00\""),
        new TestCase(Lit.Args(Lit.Str("Bolt"), Lit.Int(1000), "0.25"), "\"Bolt      | 1000|      0.25|      250.00\""),
    ];

    public string CSharpCallTemplate => "Solution.FormatRow({input})";
    public string PythonCallTemplate => "format_row({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        object[] cols = ["name", "qty", "price", "total"];
        return
        [
            Basics.Step(cols, [0], "[Pump␣␣␣␣␣␣]", "{name,-10}", "The name, left-aligned in 10 characters: padded with spaces on the right."),
            Basics.Step(cols, [1], "[␣␣␣␣3]", "{qty,5}", "The quantity, right-aligned in 5: padded on the left."),
            Basics.Step(cols, [2], "[␣␣␣1249.50]", "{price,10:F2}", "The price with exactly 2 decimals (F2), right-aligned in 10."),
            Basics.Step(cols, [3], "[␣␣␣␣3,748.50]", "{qty * price,12:N2}", "The total, 3 × 1249.5 = 3748.5, with a thousands separator and 2 decimals (N2), right-aligned in 12."),
            Basics.Step(cols, [], "Pump␣␣␣␣␣␣|␣␣␣␣3|␣␣␣1249.50|␣␣␣␣3,748.50", "the line", "Joined with | between the columns. ␣ marks each padding space; the brackets only show where each column starts and ends."),
        ];
    }
}
