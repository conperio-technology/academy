namespace DsaAcademy.Content.Concepts;

public class MonotonicStackNextGreater : IConcept
{
    public string Id => "monotonic-stack-next-greater";
    public string Track => "patterns";
    public string Title => "Monotonic Stack: Find the Next Greater Element";
    public string OneLiner => "For every element, find the next one to its right that's bigger -- a stack that only ever holds a decreasing sequence answers this for the WHOLE array in one pass.";
    public string KeyTakeaway =>
        "A monotonic stack keeps its elements in one-way order (each no larger, or each no smaller, than the one below it) at all times " +
        "by popping anything that violates that order BEFORE pushing the new element -- each element " +
        "gets pushed once and popped at most once, so the whole array is processed in O(n) total " +
        "despite looking like a nested loop problem.";
    public VisualizerKind VisualizerKind => VisualizerKind.Stack;

    public string Explanation =>
        "\"Find the next greater element\" for every position in an array -- naively, that's a nested " +
        "loop: for each index, scan RIGHT until something bigger shows up, O(n^2) worst case. A " +
        "MONOTONIC STACK solves it in one O(n) pass: walk the array left to right, and before pushing " +
        "the current element's index onto the stack, pop off every index whose value is SMALLER than " +
        "the current element -- each one just found its \"next greater element\": the current one.\n\n" +
        "The stack stays monotonically NON-INCREASING (bottom to top; equal values stay) at all times, by construction -- " +
        "anything that would break that order gets popped and resolved immediately, before the new " +
        "element goes on. Whatever's left on the stack at the very end never found a next-greater " +
        "element (nothing to their right was ever bigger), so those get whatever \"no answer\" value " +
        "the problem wants (often -1).\n\n" +
        "The O(n) part is the subtle bit: it LOOKS like a nested loop (an inner while-pop loop inside " +
        "the outer for-loop), but every single element gets pushed exactly once and popped AT MOST " +
        "once across the entire run -- so the total number of pop operations across the whole " +
        "algorithm is bounded by n, not n per outer iteration. Watch the stack below: notice it only " +
        "ever holds a decreasing run of not-yet-resolved elements.";

    public List<string> RecognitionSignals =>
    [
        "The problem asks for the \"next greater/smaller element\" for every position in an array.",
        "You're about to write a nested loop scanning right (or left) from every index -- an O(n^2) shape a monotonic stack collapses to O(n).",
    ];

    public List<string> Gotchas =>
    [
        "Push INDICES onto the stack, not values -- you need the index later to write into the result array at the right position.",
        "Using <= instead of < (or vice versa) in the pop condition silently changes whether equal elements count as \"greater\" -- match whatever the problem actually asks for.",
    ];

    public List<string> ConfusableWith =>
    [
        "Two Pointers / Sliding Window (this track) also make one pass over an array, but with pointers moving independently or a window boundary sliding -- a monotonic stack's defining feature is the stack itself staying ordered at all times.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] NextGreaterElements(int[] nums)\n" +
            "    {\n" +
            "        // TODO: result = array of -1s, same length as nums. Walk a stack of\n" +
            "        // INDICES left to right. Before pushing index i, pop every index j on\n" +
            "        // the stack whose nums[j] < nums[i] -- each one's answer is nums[i].\n" +
            "        // Whatever's left on the stack at the end keeps -1.\n" +
            "        return new int[0];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def next_greater_elements(nums):\n" +
            "    # TODO: result = list of -1s, same length as nums. Walk a stack of\n" +
            "    # INDICES left to right. Before pushing index i, pop every index j on\n" +
            "    # the stack whose nums[j] < nums[i] -- each one's answer is nums[i].\n" +
            "    # Whatever's left on the stack at the end keeps -1.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.NextGreaterElements",
        ["python"] = "next_greater_elements",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([2, 1, 2, 4, 3]), "[4,2,4,-1,-1]"),
        new TestCase(Lit.IntArray([1, 2, 3, 4, 5]), "[2,3,4,5,-1]"),
        new TestCase(Lit.IntArray([5, 4, 3, 2, 1]), "[-1,-1,-1,-1,-1]"),
        new TestCase(Lit.IntArray([1]), "[-1]"),
        new TestCase(Lit.IntArray([3, 3, 3]), "[-1,-1,-1]"),
    ];

    public string CSharpCallTemplate => "Solution.NextGreaterElements({input})";
    public string PythonCallTemplate => "next_greater_elements({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [2, 1, 2, 4, 3];
        var steps = new List<VisualizationStep>();
        var stack = new List<int>();
        var result = new int[nums.Length];
        Array.Fill(result, -1);

        string[] InputLabels() => nums.Select(n => n.ToString()).ToArray();
        string[] StackLabels() => stack.Select(i => $"idx{i}={nums[i]}").ToArray();

        for (var i = 0; i < nums.Length; i++)
        {
            while (stack.Count > 0 && nums[stack[^1]] < nums[i])
            {
                var j = stack[^1];
                stack.RemoveAt(stack.Count - 1);
                result[j] = nums[i];
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["input"] = InputLabels(), ["stack"] = StackLabels() },
                    HighlightIndices: [i],
                    Message: $"nums[{i}]={nums[i]} > nums[{j}]={nums[j]} -- pop index {j}, its next greater is {nums[i]}."
                ));
            }
            stack.Add(i);
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["input"] = InputLabels(), ["stack"] = StackLabels() },
                HighlightIndices: [i],
                Message: $"Push index {i} (val {nums[i]}) -- stack stays non-increasing bottom to top."
            ));
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["input"] = InputLabels(), ["stack"] = StackLabels() },
            HighlightIndices: [],
            Message: $"Done -- result: [{string.Join(", ", result)}]. Anything left on the stack never found a next greater element."
        ));

        return steps;
    }
}
