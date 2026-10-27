namespace DsaAcademy.Content.Concepts;

public class BlockMostCommonChar : BuildingBlock
{
    public override string Id => "block-most-common-char";
    public override string Title => "Block: Count With a Hashmap";
    public override string OneLiner => "Count every character with a hashmap, then return the most common one, ties going to the one that appears first.";
    public override string KeyTakeaway =>
        "Counting is the hashmap construct you write most: read the old count with a default of 0, add one, store it back. Get the missing-key case right once and it stops being a bug.";

    public override string Explanation =>
        "Return the character that appears most often in s. When several share the highest count, return the one whose first appearance is earliest. An empty string returns an empty string.\n" +
        "\n" +
        "Two passes. The first builds the counts: counts.GetValueOrDefault(c) + 1 in C#, counts.get(c, 0) + 1 in Python. The second walks s again in order and keeps the first character whose count beats the best so far. Replacing only on a strictly higher count is what sends ties to the earliest character.\n" +
        "\n" +
        "This is a rep, not a puzzle: write it from the blank editor until the counting line comes out without thinking.";

    protected override string[] Plan =>
    [
        "Make an empty map from character to count.",
        "Walk the string and add one to each character's count (missing keys start at 0).",
        "Walk the string again, keeping the character with the highest count so far.",
        "Replace the best only on a strictly higher count, so ties go to the earliest character.",
        "Return the best character, or an empty string for empty input.",
    ];

    protected override string CSharpSignature => "public static string MostCommonChar(string s)";
    protected override string CSharpReturnStub => "return \"\";";
    protected override string PythonSignature => "def most_common_char(s):";
    protected override string PythonReturnStub => "return \"\"";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MostCommonChar",
        ["python"] = "most_common_char",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("\"hello\"", "\"l\""),
        new TestCase("\"abcabc\"", "\"a\""),
        new TestCase("\"zzyy\"", "\"z\""),
        new TestCase("\"\"", "\"\""),
        new TestCase("\"a\"", "\"a\""),
        new TestCase("\"mississippi\"", "\"i\""),
        new TestCase("\"bbbaa\"", "\"b\""),
    ];

    public override string CSharpCallTemplate => "Solution.MostCommonChar({input})";
    public override string PythonCallTemplate => "most_common_char({input})";

    public override List<string> Gotchas =>
    [
        "Reading counts[c] before the key exists: use GetValueOrDefault, get(c, 0) or a defaultdict.",
        "Replacing the best on an equal count, which sends ties to the last character instead of the first.",
    ];
}
