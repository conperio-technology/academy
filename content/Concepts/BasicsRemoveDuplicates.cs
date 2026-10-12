namespace DsaAcademy.Content.Concepts;

public class BasicsRemoveDuplicates : IConcept
{
    public string Id => "basics-remove-duplicates";
    public string Section => Basics.Section;
    public string Track => "basics";
    public int Order => 62;
    public string Title => "Remove Duplicates, Keep Order";
    public string OneLiner => "Keep the first copy of each value in its original order, using a set to remember what you've already seen.";
    public string KeyTakeaway =>
        "A set alone loses the order; a list alone makes every \"seen it?\" check O(n). Use both: the set answers " +
        "membership in O(1) and the output list keeps the order, for O(n) overall.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Return a new list with duplicates removed, keeping the first occurrence of each value and the original order: " +
        "[3, 1, 3, 2, 1] gives [3, 1, 2].\n\n" +
        "Turning the list into a set removes duplicates but loses the order (sets have no positions), so on its own it " +
        "fails the tests. Checking result.Contains(x) or x in result before appending keeps the order but searches the " +
        "output list each time, O(n) per check and O(n²) overall. The standard answer uses both structures: a set of values " +
        "seen so far, and the output list. For each value, if it isn't in the set, add it to the set and append it to the " +
        "output. In C#, HashSet.Add returns false when the value was already there, so if (seen.Add(x)) result.Add(x); " +
        "does both in one line.\n\n" +
        "Shortcuts exist: nums.Distinct().ToList() in C# (which keeps first occurrences in order in practice, though its " +
        "documentation doesn't promise it) and list(dict.fromkeys(nums)) in Python (dictionaries keep insertion order). " +
        "Write the set version first; it's the one that carries over to harder problems.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static List<int> RemoveDuplicates(int[] nums)\n" +
            "    {\n" +
            "        var result = new List<int>();\n" +
            "        // TODO: keep the first copy of each value, in order.\n" +
            "        return result;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def remove_duplicates(nums):\n" +
            "    result = []\n" +
            "    # TODO: keep the first copy of each value, in order.\n" +
            "    return result\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.RemoveDuplicates",
        ["python"] = "remove_duplicates",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([3, 1, 3, 2, 1]), "[3, 1, 2]"),
        new TestCase(Lit.IntArray([]), "[]"),
        new TestCase(Lit.IntArray([7, 7, 7]), "[7]"),
        new TestCase(Lit.IntArray([1, 2, 3]), "[1, 2, 3]"),
        new TestCase(Lit.IntArray([-1, 0, -1, 0]), "[-1, 0]"),
        new TestCase(Lit.IntArray([9, 8, 7, 8, 9]), "[9, 8, 7]"),
    ];

    public string CSharpCallTemplate => "Solution.RemoveDuplicates({input})";
    public string PythonCallTemplate => "remove_duplicates({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] sample = [4, 2, 4, 9, 2];
        var arr = Basics.Boxed(sample);
        var steps = new List<VisualizationStep> { Basics.Step(arr, [], "[]", "output", "Empty \"seen\" set, empty output list.") };
        var seen = new HashSet<int>();
        var output = new List<int>();
        for (var i = 0; i < sample.Length; i++)
        {
            var added = seen.Add(sample[i]);
            if (added) output.Add(sample[i]);
            steps.Add(Basics.Step(arr, [i], "[" + string.Join(", ", output) + "]", "output",
                added ? $"{sample[i]} isn't in the set: add it to the set and append it." : $"{sample[i]} is already in the set (an O(1) check): skip it."));
        }
        return steps;
    }
}
