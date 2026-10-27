namespace DsaAcademy.Content.Concepts;

public class BlockInterleaveStrings : BuildingBlock
{
    public override string Id => "block-interleave-strings";
    public override string Title => "Block: Build a String";
    public override string OneLiner => "Interleave two strings character by character, then append whatever is left of the longer one.";
    public override string KeyTakeaway =>
        "Build strings from pieces and join once: StringBuilder in C#, a list and \"\".join in Python. Adding to a string in a loop copies it every time.";

    public override string Explanation =>
        "Return a string that takes one character from a, then one from b, and so on; when one runs out, the rest of the other follows. (\"abc\", \"12\") gives \"a1b2c\".\n" +
        "\n" +
        "Loop i from 0 to the longer length, appending a[i] if i is inside a and b[i] if i is inside b. Collect into a StringBuilder (C#) or a list of characters (Python) and turn it into a string once at the end. Strings are immutable in both languages, so s += c in a loop builds a new string each time: O(n²) for long inputs.";

    protected override string[] Plan =>
    [
        "Make an empty string builder (a list of pieces in Python).",
        "Loop i from 0 up to the longer of the two lengths.",
        "If i is inside the first string, append its character; then do the same for the second string.",
        "Join the pieces once at the end and return the result.",
    ];

    protected override string CSharpSignature => "public static string Interleave(string a, string b)";
    protected override string CSharpReturnStub => "return \"\";";
    protected override string PythonSignature => "def interleave(a, b):";
    protected override string PythonReturnStub => "return \"\"";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Interleave",
        ["python"] = "interleave",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("\"abc\", \"12\"", "\"a1b2c\""),
        new TestCase("\"\", \"xyz\"", "\"xyz\""),
        new TestCase("\"ab\", \"\"", "\"ab\""),
        new TestCase("\"ab\", \"cd\"", "\"acbd\""),
        new TestCase("\"\", \"\"", "\"\""),
        new TestCase("\"x\", \"12345\"", "\"x12345\""),
    ];

    public override string CSharpCallTemplate => "Solution.Interleave({input})";
    public override string PythonCallTemplate => "interleave({input})";

    public override List<string> Gotchas =>
    [
        "Adding to a string inside the loop, which copies the whole string on every append.",
    ];
}
