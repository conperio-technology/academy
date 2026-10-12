namespace DsaAcademy.Content.Concepts;

public class MathExcelColumnTitle : IConcept
{
    public string Id => "math-excel-column-title";
    public string Track => "math";
    public int Order => 121;
    public string Title => "Math: Excel Column Title (Base 26 With No Zero)";
    public string OneLiner => "Turn 1, 2, ..., 26, 27 into A, B, ..., Z, AA: base-26 conversion where the digits run 1 to 26, so subtract 1 before each step.";
    public string KeyTakeaway =>
        "Converting to any base is \"take n % base for the last digit, then n /= base\". Spreadsheet columns have " +
        "no zero digit (A is 1, Z is 26), so do n -= 1 first in each round: the letter is 'A' + n % 26, then n /= " +
        "26. Letters come out last first, so build the string backwards. O(log n) rounds.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Spreadsheet columns are named A, B, ..., Z, then AA, AB, ..., AZ, BA, ..., ZZ, then AAA. Given a column " +
        "number (1 is A, 26 is Z, 27 is AA, 28 is AB, 701 is ZY), return its title.\n\n" +
        "This is almost base 26. In ordinary base 10 you get the last digit with n % 10 and remove it with n / 10. " +
        "The catch is that column letters run from 1 (A) to 26 (Z) with no zero, which is called bijective base " +
        "26. Plain n % 26 gives 0 for 26, and there's no letter for 0. Fix it by subtracting 1 at the start of " +
        "every round, which shifts the digits to 0 (A) through 25 (Z): letter = 'A' + (n - 1) % 26, then n = (n - " +
        "1) / 26.\n\n" +
        "Check it on 26: n - 1 = 25, 25 % 26 = 25 is Z, and 25 / 26 = 0, so the answer is \"Z\". On 27: 26 % 26 = " +
        "0 is A, 26 / 26 = 1; then 0 % 26 = 0 is A again and the loop ends: \"AA\". On 701: 700 % 26 = 24 is Y, 700 " +
        "/ 26 = 26; then 25 is Z, 25 / 26 = 0: \"ZY\".\n\n" +
        "Each round removes one letter, so the work is O(log26 n), and the title of 2,147,483,647 has only 7 " +
        "letters. Letters come out right to left, so prepend them, or append and reverse at the end. In C#, " +
        "(char)('A' + d) turns a digit into a letter; in Python, chr(ord('A') + d). Use a StringBuilder or a " +
        "list and join rather than repeated string concatenation in a loop, which copies the string every time " +
        "(it doesn't matter for 7 letters, but it's the habit interviewers look for).\n\n" +
        "The reverse direction (title to number) is the familiar left-to-right base conversion: n = n * 26 + " +
        "(letter - 'A' + 1).\n\n" +
        "The visualization converts 701.";

    public List<string> RecognitionSignals =>
    [
        "Converting a number to letters or digits in some base, or back.",
        "A numbering that starts at 1 instead of 0 (columns, license plates, labels): shift by one before % and /.",
        "Output built digit by digit from the least significant end.",
    ];

    public List<string> Gotchas =>
    [
        "Subtract 1 BEFORE taking % 26 in every round, not once at the start: 52 should be AZ, but subtracting only once gives BZ.",
        "The letters come out last first; reverse or prepend.",
        "In Python, n / 26 is a float; use n // 26.",
    ];

    public List<string> ConfusableWith =>
    [
        "Plain base conversion (decimal to binary or hex) uses n % b directly, because those systems have a zero digit.",
        "Reverse Integer (this track) peels digits the same way but rebuilds a number, not a string.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static string ConvertToTitle(int columnNumber)\n" +
            "    {\n" +
            "        // TODO: while columnNumber > 0: columnNumber -= 1;\n" +
            "        // the next letter (from the right) is (char)('A' + columnNumber % 26);\n" +
            "        // then columnNumber /= 26. Build the letters, then reverse them.\n" +
            "        return \"\";\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def convert_to_title(column_number):\n" +
            "    # TODO: while column_number > 0: column_number -= 1;\n" +
            "    # the next letter (from the right) is chr(ord('A') + column_number % 26);\n" +
            "    # then column_number //= 26. Build the letters, then reverse them.\n" +
            "    return \"\"\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.ConvertToTitle",
        ["python"] = "convert_to_title",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Int(1), "\"A\""),
        new TestCase(Lit.Int(26), "\"Z\""),
        new TestCase(Lit.Int(27), "\"AA\""),
        new TestCase(Lit.Int(28), "\"AB\""),
        new TestCase(Lit.Int(52), "\"AZ\""),
        new TestCase(Lit.Int(701), "\"ZY\""),
        new TestCase(Lit.Int(702), "\"ZZ\""),
        new TestCase(Lit.Int(703), "\"AAA\""),
        new TestCase(Lit.Int(16384), "\"XFD\""),
        new TestCase(Lit.Int(2147483647), "\"FXSHRXW\""),
    ];

    public string CSharpCallTemplate => "Solution.ConvertToTitle({input})";
    public string PythonCallTemplate => "convert_to_title({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        var n = 701;
        var letters = new List<string>();
        var steps = new List<VisualizationStep>();

        Dictionary<string, object> State() => new()
        {
            ["array"] = letters.AsEnumerable().Reverse().ToArray(),
            ["tracker"] = n,
            ["trackerLabel"] = "n",
        };

        steps.Add(new VisualizationStep(State(), [], "Convert 701. Each round: n -= 1, letter = 'A' + n % 26, n /= 26."));
        while (n > 0)
        {
            var shifted = n - 1;
            var d = shifted % 26;
            var letter = ((char)('A' + d)).ToString();
            letters.Add(letter);
            n = shifted / 26;
            steps.Add(new VisualizationStep(State(), [0],
                $"n - 1 = {shifted}. {shifted} % 26 = {d}, which is '{letter}' (A is 0 after the shift). n = {shifted} / 26 = {n}. New letter goes on the LEFT."));
        }
        steps.Add(new VisualizationStep(State(), [], $"n is 0: done. 701 is \"{string.Concat(letters.AsEnumerable().Reverse())}\". Check: Z is 26, Y is 25, and 26 * 26 + 25 = 701."));
        return steps;
    }
}
