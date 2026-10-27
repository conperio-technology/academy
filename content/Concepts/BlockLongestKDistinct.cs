namespace DsaAcademy.Content.Concepts;

public class BlockLongestKDistinct : BuildingBlock
{
    public override string Id => "block-longest-k-distinct";
    public override string Title => "Block: Sliding Window With a Hashmap";
    public override string OneLiner => "Find the longest substring with at most k distinct characters, growing a window on the right and shrinking it on the left.";
    public override string KeyTakeaway =>
        "Grow right every step; shrink left only while the window is invalid; measure after shrinking. Delete a key when its count drops to 0, or the map's size lies.";

    public override string Explanation =>
        "Return the length of the longest substring of s that contains at most k distinct characters. \"eceba\" with k = 2 gives 3 (\"ece\").\n" +
        "\n" +
        "Keep counts of the characters inside the window s[left..right]. Each step adds s[right]. While the map holds more than k keys, remove s[left]: decrease its count, delete it at 0, and move left on. After the while loop the window is valid, so right - left + 1 is a candidate. Longest Substring Without Repeats, Fruit Into Baskets and Character Replacement are this block with a different validity test.";

    protected override string[] Plan =>
    [
        "Make a map from character to count inside the window, and set left = 0.",
        "Move right across the string, adding s[right] to the map.",
        "While the map has more than k keys, shrink: decrease s[left]'s count, delete it at 0, then move left on.",
        "After shrinking, the window right - left + 1 is valid: keep the best length.",
        "Return the best.",
    ];

    protected override string CSharpSignature => "public static int LongestKDistinct(string s, int k)";
    protected override string CSharpReturnStub => "return 0;";
    protected override string PythonSignature => "def longest_k_distinct(s, k):";
    protected override string PythonReturnStub => "return 0";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.LongestKDistinct",
        ["python"] = "longest_k_distinct",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("\"eceba\", 2", "3"),
        new TestCase("\"aa\", 1", "2"),
        new TestCase("\"\", 2", "0"),
        new TestCase("\"abc\", 0", "0"),
        new TestCase("\"aabacbebebe\", 3", "7"),
        new TestCase("\"abaccc\", 2", "4"),
        new TestCase("\"abcabc\", 3", "6"),
    ];

    public override string CSharpCallTemplate => "Solution.LongestKDistinct({input})";
    public override string PythonCallTemplate => "longest_k_distinct({input})";

    public override List<string> Gotchas =>
    [
        "Off-by-one on the window: its length is right - left + 1.",
        "Not deleting a key when its count reaches 0, so the map counts characters that left the window.",
        "Measuring the window before shrinking it, while it is still invalid.",
    ];
}
