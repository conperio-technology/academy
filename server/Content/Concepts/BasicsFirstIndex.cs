namespace DsaAcademy.Content.Concepts;

public class BasicsFirstIndex : IConcept
{
    public string Id => "basics-first-index";
    public string Section => Basics.Section;
    public string Track => "basics";
    public int Order => 44;
    public string Title => "Find the First Position of a Value";
    public string OneLiner => "Linear search: walk the list with an index and return the first position holding the target, or -1 if it isn't there.";
    public string KeyTakeaway =>
        "Return from inside the loop the moment you find a match; the code after the loop only runs when nothing matched, " +
        "so that's where the \"not found\" answer goes. This is linear search, O(n), what IndexOf and list.index do inside.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Return the index of the first element equal to the target, or -1 if the target isn't in the list. Write the loop " +
        "yourself rather than calling Array.IndexOf or list.index (which, in Python, raises ValueError when the value " +
        "is missing instead of returning -1).\n\n" +
        "You need the position, not just the value, so loop by index: for (int i = 0; i < nums.Length; i++) in C#, " +
        "for i in range(len(nums)) or for i, n in enumerate(nums) in Python. When nums[i] equals the target, return " +
        "i straight away: that's what makes it the first match. If the loop finishes without returning, the value " +
        "wasn't there, so return -1 after the loop.\n\n" +
        "This is linear search: in the worst case it looks at every element, O(n). If the list were sorted you could do " +
        "much better with binary search, O(log n); see the Binary Search lesson in the Patterns track.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int FirstIndex(int[] nums, int target)\n" +
            "    {\n" +
            "        // TODO: return the first i where nums[i] == target, else -1.\n" +
            "        return -1;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def first_index(nums, target):\n" +
            "    # TODO: return the first i where nums[i] == target, else -1.\n" +
            "    return -1\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.FirstIndex",
        ["python"] = "first_index",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([4, 2, 7, 2]), Lit.Int(2)), "1"),
        new TestCase(Lit.Args(Lit.IntArray([4, 2, 7]), Lit.Int(9)), "-1"),
        new TestCase(Lit.Args(Lit.IntArray([]), Lit.Int(1)), "-1"),
        new TestCase(Lit.Args(Lit.IntArray([5]), Lit.Int(5)), "0"),
        new TestCase(Lit.Args(Lit.IntArray([1, 1, 1]), Lit.Int(1)), "0"),
        new TestCase(Lit.Args(Lit.IntArray([3, 8, -6]), Lit.Int(-6)), "2"),
    ];

    public string CSharpCallTemplate => "Solution.FirstIndex({input})";
    public string PythonCallTemplate => "first_index({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] sample = [12, 30, 7, 30, 9];
        var arr = Basics.Boxed(sample);
        return
        [
            Basics.Step(arr, [], 30, "target", "Find the first position holding 30."),
            Basics.Step(arr, [0], 30, "target", "Index 0 holds 12: not it, keep going."),
            Basics.Step(arr, [1], 30, "target", "Index 1 holds 30: return 1 right now. The second 30 at index 3 is never even looked at."),
            Basics.Step(arr, [], 99, "target", "If the target were 99, the loop would check all five and finish without returning, so the line after the loop returns -1."),
        ];
    }
}
