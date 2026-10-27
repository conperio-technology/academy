namespace DsaAcademy.Content.Concepts;

public class BlockShiftLetters : BuildingBlock
{
    public override string Id => "block-shift-letters";
    public override string Title => "Block: Character Arithmetic";
    public override string OneLiner => "Shift every lowercase letter k places through the alphabet, wrapping around, with k possibly negative or large.";
    public override string KeyTakeaway =>
        "Turn a letter into 0..25 by subtracting 'a', do the arithmetic, wrap with % 26, add 'a' back. In C# a negative number % 26 stays negative, so normalise first.";

    public override string Explanation =>
        "Return s with each lowercase letter a to z moved k places forward in the alphabet, wrapping from z back to a. Every other character stays as it is. k can be negative (move backward) or bigger than 26.\n" +
        "\n" +
        "Letters are numbers underneath: c - 'a' in C#, ord(c) - ord('a') in Python, gives 0 for a and 25 for z. Add the shift, wrap with % 26, and convert back with (char)('a' + x) or chr(ord('a') + x). Python's % always returns a value from 0 to 25 here; C#'s keeps the sign of the left side, so -1 % 26 is -1. Normalise once with ((k % 26) + 26) % 26.";

    protected override string[] Plan =>
    [
        "Reduce the shift to the range 0 to 25 (in C# add 26 and take % 26 again, since % can be negative).",
        "Walk the characters, keeping anything that is not a lowercase letter unchanged.",
        "For a letter, turn it into a number from 0 to 25 by subtracting 'a'.",
        "Add the shift, wrap with % 26, and turn it back into a character by adding 'a'.",
        "Join the characters and return the result.",
    ];

    protected override string CSharpSignature => "public static string ShiftLetters(string s, int k)";
    protected override string CSharpReturnStub => "return s;";
    protected override string PythonSignature => "def shift_letters(s, k):";
    protected override string PythonReturnStub => "return s";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.ShiftLetters",
        ["python"] = "shift_letters",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("\"abc\", 1", "\"bcd\""),
        new TestCase("\"xyz\", 3", "\"abc\""),
        new TestCase("\"hello, world!\", 13", "\"uryyb, jbeyq!\""),
        new TestCase("\"abc\", -1", "\"zab\""),
        new TestCase("\"abc\", -27", "\"zab\""),
        new TestCase("\"\", 5", "\"\""),
        new TestCase("\"Az\", 26", "\"Az\""),
    ];

    public override string CSharpCallTemplate => "Solution.ShiftLetters({input})";
    public override string PythonCallTemplate => "shift_letters({input})";

    public override List<string> Gotchas =>
    [
        "C#'s % keeps the sign, so a negative shift goes below 'a' unless you normalise it.",
        "Shifting characters that aren't lowercase letters.",
    ];
}
