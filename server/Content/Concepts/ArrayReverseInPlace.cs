namespace DsaAcademy.Content.Concepts;

public class ArrayReverseInPlace : IConcept
{
    public string Id => "array-reverse-in-place";
    public string Track => "fundamentals";

    // See ArrayTraversalSum.cs -- keeps this track ahead of Trees/Graphs/Sorting/DP/
    // Patterns so Hashing (Order = 60) can slot in right after it.
    public int Order => 50;

    public string Title => "Array Reversal: Two Pointers, One Pass";
    public string OneLiner => "Walk from both ends at once, swapping as the pointers close in.";
    public string KeyTakeaway =>
        "Two pointers starting at opposite ends and walking inward is the standard way to do array " +
        "work in O(1) extra space, instead of allocating a second array.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "First taste of a technique with its own name: two pointers moving toward each other. " +
        "Instead of one index walking left to right, use two -- one starting at the front, one at " +
        "the back -- and swap-and-step-inward until they meet or cross. This is the earliest, " +
        "simplest version of the \"two pointers\" pattern you'll see formalized later in the " +
        "Patterns track. Watch out for the stopping condition: `left < right`, not `left <= right` " +
        "-- with `<=` on an odd-length array you'd swap the middle element with itself and (harmlessly " +
        "here, but it's the same bug class as an infinite loop elsewhere) waste a step.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] ReverseArray(int[] nums)\n" +
            "    {\n" +
            "        // TODO: use two pointers (left starting at 0, right starting at the end)\n" +
            "        // and swap inward until they meet. Return nums.\n" +
            "        return nums;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def reverse_array(nums):\n" +
            "    # TODO: use two pointers (left starting at 0, right starting at the end)\n" +
            "    # and swap inward until they meet. Return nums.\n" +
            "    return nums\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.ReverseArray",
        ["python"] = "reverse_array",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([1, 2, 3, 4, 5]), "[5,4,3,2,1]"),
        new TestCase(Lit.IntArray([1, 2, 3, 4]), "[4,3,2,1]"),
        new TestCase(Lit.IntArray([7]), "[7]"),
        new TestCase(Lit.IntArray([]), "[]"),
        new TestCase(Lit.IntArray([9, 1, 9, 2]), "[2,9,1,9]"),
    ];

    public string CSharpCallTemplate => "Solution.ReverseArray({input})";
    public string PythonCallTemplate => "reverse_array({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] array = [4, 8, 15, 16, 23, 42];
        var steps = new List<VisualizationStep>();

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = array.ToArray() },
            HighlightIndices: [0, array.Length - 1],
            Message: "left starts at index 0, right starts at the last index. Swap them, then step both pointers inward."
        ));

        var left = 0;
        var right = array.Length - 1;
        while (left < right)
        {
            (array[left], array[right]) = (array[right], array[left]);
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = array.ToArray() },
                HighlightIndices: [left, right],
                Message: $"Swapped indices {left} and {right}."
            ));
            left++;
            right--;
            if (left < right)
            {
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = array.ToArray() },
                    HighlightIndices: [left, right],
                    Message: $"Step inward: left -> {left}, right -> {right}. Still left < right, so keep swapping."
                ));
            }
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = array.ToArray() },
            HighlightIndices: [],
            Message: left == right
                ? $"Pointers met at index {left} (the middle of an odd-length array) -- nothing left to swap. Done."
                : "Pointers crossed. Done -- the whole array is reversed in place, no extra array needed."
        ));

        return steps;
    }
}
