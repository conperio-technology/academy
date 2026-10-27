namespace DsaAcademy.Content.Concepts;

public class BlockPalindromePointers : BuildingBlock
{
    public override string Id => "block-palindrome-pointers";
    public override string Title => "Block: Two Pointers From Both Ends";
    public override string OneLiner => "Check whether a string reads the same both ways, looking only at letters and digits and ignoring case.";
    public override string KeyTakeaway =>
        "Two pointers from both ends: skip what doesn't count, compare, step both inward, stop when they meet. Every skip loop needs its own left < right check.";

    public override string Explanation =>
        "Return true if s is a palindrome when you keep only letters and digits and ignore case. \"A man, a plan, a canal: Panama\" is; \"race a car\" isn't. An empty string, or one with no letters or digits, is a palindrome.\n" +
        "\n" +
        "Put left at 0 and right at the last index. Move each past characters that aren't letters or digits (char.IsLetterOrDigit in C#, str.isalnum in Python), compare the two lowercased characters, then step both inward. Doing it in place avoids building a filtered copy.";

    protected override string[] Plan =>
    [
        "Put one pointer at the start and one at the end.",
        "While they have not met, move each pointer past anything that is not a letter or digit.",
        "Compare the two characters ignoring case; if they differ, return false.",
        "Move both pointers one step inward.",
        "Return true once they meet.",
    ];

    protected override string CSharpSignature => "public static bool IsAlnumPalindrome(string s)";
    protected override string CSharpReturnStub => "return false;";
    protected override string PythonSignature => "def is_alnum_palindrome(s):";
    protected override string PythonReturnStub => "return False";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.IsAlnumPalindrome",
        ["python"] = "is_alnum_palindrome",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("\"A man, a plan, a canal: Panama\"", "true"),
        new TestCase("\"race a car\"", "false"),
        new TestCase("\"\"", "true"),
        new TestCase("\" \"", "true"),
        new TestCase("\"ab_a\"", "true"),
        new TestCase("\"0P\"", "false"),
        new TestCase("\"No 'x' in Nixon\"", "true"),
    ];

    public override string CSharpCallTemplate => "Solution.IsAlnumPalindrome({input})";
    public override string PythonCallTemplate => "is_alnum_palindrome({input})";

    public override List<string> Gotchas =>
    [
        "A skip loop without its own left < right check runs off the end on input like \"!!\".",
    ];
}
