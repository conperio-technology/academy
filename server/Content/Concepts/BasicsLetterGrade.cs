namespace DsaAcademy.Content.Concepts;

public class BasicsLetterGrade : IConcept
{
    public string Id => "basics-letter-grade";
    public string Section => Basics.Section;
    public string Track => "basics";
    public int Order => 31;
    public string Title => "Letter Grade from a Score";
    public string OneLiner => "Turn a score from 0 to 100 into a letter with an else-if chain, and reject scores outside the range.";
    public string KeyTakeaway =>
        "Check invalid input first, then test thresholds from highest to lowest so each branch only needs one comparison. " +
        "Boundary values (exactly 90, exactly 0, exactly 100) are where else-if chains go wrong, so test them.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Return the letter grade for a whole-number score: 90 to 100 is \"A\", 80 to 89 \"B\", 70 to 79 \"C\", 60 to 69 " +
        "\"D\", and 0 to 59 \"F\". A score below 0 or above 100 isn't valid: return \"Invalid\".\n\n" +
        "Deal with the invalid case first, then go from the top down: if the score is at least 90 it's an A; otherwise, if " +
        "it's at least 80, it's a B; and so on. Because each else-if only runs when every earlier test failed, you never " +
        "need to write both ends of a range (score >= 80 && score < 90). The order is what makes that safe: test 60 " +
        "before 90 and every passing score becomes a D.\n\n" +
        "In C#, a switch expression with relational patterns reads nicely too: score switch { < 0 or > 100 => \"Invalid\", " +
        ">= 90 => \"A\", ... }. In Python, an if/elif chain is the clearest.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static string LetterGrade(int score)\n" +
            "    {\n" +
            "        // TODO: \"Invalid\" outside 0..100, then A / B / C / D / F.\n" +
            "        return \"\";\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def letter_grade(score):\n" +
            "    # TODO: \"Invalid\" outside 0..100, then A / B / C / D / F.\n" +
            "    return \"\"\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.LetterGrade",
        ["python"] = "letter_grade",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("95", Lit.Str("A")),
        new TestCase("90", Lit.Str("A")),
        new TestCase("89", Lit.Str("B")),
        new TestCase("75", Lit.Str("C")),
        new TestCase("60", Lit.Str("D")),
        new TestCase("59", Lit.Str("F")),
        new TestCase("0", Lit.Str("F")),
        new TestCase("100", Lit.Str("A")),
        new TestCase("101", Lit.Str("Invalid")),
        new TestCase("-5", Lit.Str("Invalid")),
    ];

    public string CSharpCallTemplate => "Solution.LetterGrade({input})";
    public string PythonCallTemplate => "letter_grade({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        object[] checks = ["valid?", ">= 90", ">= 80", ">= 70", ">= 60", "else"];
        return
        [
            Basics.Step(checks, [], 72, "score", "Grade a score of 72. The checks run left to right and stop at the first that matches."),
            Basics.Step(checks, [0], 72, "score", "72 is between 0 and 100, so it's valid. Carry on."),
            Basics.Step(checks, [1], 72, "score", "72 >= 90? No."),
            Basics.Step(checks, [2], 72, "score", "72 >= 80? No."),
            Basics.Step(checks, [3], 72, "score", "72 >= 70? Yes: the grade is \"C\". The remaining checks never run."),
        ];
    }
}
