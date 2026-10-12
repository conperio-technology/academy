namespace DsaAcademy.Content.Concepts;

public class InterPassingNames : IConcept
{
    public string Id => "inter-passing-names";
    public string Section => Basics.Section;
    public string Track => Inter.Track;
    public int Order => 1102;
    public string Title => "Who Passed? Filter, Sort and Pick";
    public string OneLiner => "Pair up names with scores, keep those at or above the pass mark, sort best first with ties alphabetical, and return just the names.";
    public string KeyTakeaway =>
        "Many queries are a pipeline: pair up (Zip / zip), filter (Where / if), sort (OrderByDescending.ThenBy / a " +
        "tuple key with a negated number), then project (Select / the expression of a comprehension). Write it as one " +
        "chain and read it top to bottom.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write PassingNames(names, scores, passMark). names[i] scored scores[i]; return the names of everyone whose " +
        "score is at least passMark, highest score first, and alphabetical among equal scores. For names [\"ann\", \"bob\", " +
        "\"cy\", \"dee\"], scores [70, 45, 90, 70] and a pass mark of 50, the answer is [\"cy\", \"ann\", \"dee\"]: cy has 90, " +
        "then ann and dee tie on 70. Nobody passing gives an empty list. Names are lowercase letters.\n\n" +
        "In C#: names.Zip(scores) pairs them up, giving tuples with First and Second; then Where, OrderByDescending on " +
        "the score, ThenBy on the name (with StringComparer.Ordinal to compare by character code), and Select the " +
        "name.\n\n" +
        "In Python: zip(names, scores) pairs them; a comprehension keeps the passing pairs; sorted with key=lambda p: " +
        "(-p[1], p[0]) puts high scores first (negating a number reverses its order) and breaks ties by name; a last " +
        "comprehension picks the names. This is the filter, sort and project pipeline from the LINQ and Comprehensions " +
        "lesson.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static List<string> PassingNames(string[] names, int[] scores, int passMark)\n" +
            "    {\n" +
            "        // TODO: pair names with scores, keep score >= passMark,\n" +
            "        // sort by score (high first) then name, and return the names.\n" +
            "        return new List<string>();\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def passing_names(names, scores, pass_mark):\n" +
            "    # TODO: pair names with scores, keep score >= pass_mark,\n" +
            "    # sort by score (high first) then name, and return the names.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.PassingNames",
        ["python"] = "passing_names",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Basics.StrArray("ann", "bob", "cy", "dee"), Lit.IntArray([70, 45, 90, 70]), Lit.Int(50)), "[\"cy\", \"ann\", \"dee\"]"),
        new TestCase(Lit.Args(Basics.StrArray("x"), Lit.IntArray([49]), Lit.Int(50)), "[]"),
        new TestCase(Lit.Args(Basics.StrArray(), Lit.IntArray([]), Lit.Int(50)), "[]"),
        new TestCase(Lit.Args(Basics.StrArray("zed", "amy", "bo"), Lit.IntArray([80, 80, 80]), Lit.Int(80)), "[\"amy\", \"bo\", \"zed\"]"),
        new TestCase(Lit.Args(Basics.StrArray("a", "b", "c"), Lit.IntArray([0, 100, 50]), Lit.Int(0)), "[\"b\", \"c\", \"a\"]"),
    ];

    public string CSharpCallTemplate => "Solution.PassingNames({input})";
    public string PythonCallTemplate => "passing_names({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        object[] pairs = ["ann 70", "bob 45", "cy 90", "dee 70"];
        object[] passed = ["ann 70", "cy 90", "dee 70"];
        object[] ranked = ["cy 90", "ann 70", "dee 70"];
        return
        [
            Basics.Step(pairs, [], "50", "pass mark", "Zip pairs each name with its score."),
            Basics.Step(pairs, [0, 2, 3], "50", "pass mark", "Filter: keep scores of at least 50. bob, with 45, is dropped."),
            Basics.Step(passed, [], "score high to low, then name", "sort by", "Three pairs passed, still in their original order."),
            Basics.Step(ranked, [0], "score high to low, then name", "sort by", "Sort: cy's 90 comes first."),
            Basics.Step(ranked, [1, 2], "score high to low, then name", "sort by", "ann and dee tie on 70, so the name decides: ann first."),
            Basics.Step(ranked, [], "[cy, ann, dee]", "names", "Project: keep just the names."),
        ];
    }
}
