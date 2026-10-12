namespace DsaAcademy.Content.Concepts;

public class BasicsCommonElements : IConcept
{
    public string Id => "basics-common-elements";
    public string Section => Basics.Section;
    public string Track => "basics";
    public int Order => 63;
    public string Title => "Values in Both Lists";
    public string OneLiner => "Return the values that appear in both lists, once each, in the order they first appear in the first list.";
    public string KeyTakeaway =>
        "Turn the list you search into a set first: then each \"is it in there?\" check is O(1) and the whole job is " +
        "O(n + m) instead of O(n · m). A second set stops the same value being output twice.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Given two lists of whole numbers, return the values that appear in both. Each value appears in the output once, " +
        "in the order of its first appearance in the first list: ([2, 1, 2, 3], [3, 2, 2]) gives [2, 3].\n\n" +
        "The direct approach loops over the first list and searches the second for each value: with n and m items that's " +
        "n × m comparisons. Instead, put the second list into a set once (new HashSet<int>(b) in C#, set(b) in Python), " +
        "then walk the first list and keep a value if it's in that set and you haven't output it yet (a second set, as in " +
        "Remove Duplicates). Building the set costs O(m) and the walk O(n), so the whole thing is O(n + m).\n\n" +
        "Set intersection (IntersectWith, &) finds the common values too, but loses the order the tests ask for, so " +
        "you still need the walk over the first list.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static List<int> InBoth(int[] a, int[] b)\n" +
            "    {\n" +
            "        var result = new List<int>();\n" +
            "        // TODO: values in both lists, once each, in a's order.\n" +
            "        return result;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def in_both(a, b):\n" +
            "    result = []\n" +
            "    # TODO: values in both lists, once each, in a's order.\n" +
            "    return result\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.InBoth",
        ["python"] = "in_both",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3, 4]), Lit.IntArray([4, 3, 9])), "[3, 4]"),
        new TestCase(Lit.Args(Lit.IntArray([5, 5, 6]), Lit.IntArray([5])), "[5]"),
        new TestCase(Lit.Args(Lit.IntArray([]), Lit.IntArray([1])), "[]"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2]), Lit.IntArray([3])), "[]"),
        new TestCase(Lit.Args(Lit.IntArray([2, 1, 2, 3]), Lit.IntArray([3, 2, 2])), "[2, 3]"),
    ];

    public string CSharpCallTemplate => "Solution.InBoth({input})";
    public string PythonCallTemplate => "in_both({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] a = [2, 1, 2, 3];
        var arr = Basics.Boxed(a);
        return
        [
            Basics.Step(arr, [], "{3, 2}", "set of b", "b = [3, 2, 2] becomes the set {3, 2}: built once, O(m)."),
            Basics.Step(arr, [0], "[2]", "output", "2 is in b's set and not output yet: keep it."),
            Basics.Step(arr, [1], "[2]", "output", "1 isn't in b's set: skip."),
            Basics.Step(arr, [2], "[2]", "output", "2 again: already output, skip."),
            Basics.Step(arr, [3], "[2, 3]", "output", "3 is in b's set: keep it. Done in one pass over a."),
        ];
    }
}
