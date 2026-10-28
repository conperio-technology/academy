namespace DsaAcademy.Content.Concepts;

public class MonotonicStackLargestRectangle : IConcept
{
    public string Id => "monotonic-stack-largest-rectangle";
    public string Track => "patterns";
    public string Title => "Monotonic Stack: Largest Rectangle in Histogram";
    public string OneLiner => "The biggest rectangle under a bar chart. Keep a stack of bars with increasing heights; when a shorter bar arrives, every taller bar it pops has found its right edge.";
    public string KeyTakeaway =>
        "For each bar, the widest rectangle of its full height runs from the first shorter bar on its left to " +
        "the first shorter bar on its right. A stack of increasing heights finds both at once: when bar i is " +
        "shorter than the top, the top's right edge is i and its left edge is the new top below it. Pop, " +
        "measure, repeat; a final height-0 bar flushes the stack. O(n).";
    public VisualizerKind VisualizerKind => VisualizerKind.Stack;

    public string Explanation =>
        "heights[i] is the height of bar i in a histogram where every bar is 1 wide. Return the area of the " +
        "largest rectangle that fits inside the bars. For [2, 1, 5, 6, 2, 3] the answer is 10: height 5 " +
        "across the bars 5 and 6.\n\n" +
        "Every candidate rectangle is limited by its shortest bar. So for each bar, ask: what is the widest " +
        "rectangle whose height is exactly this bar's height? It extends left and right until it meets a " +
        "shorter bar. Its width is (first shorter on the right) - (first shorter on the left) - 1. Checking " +
        "every bar by scanning outwards is O(n²).\n\n" +
        "Both \"first shorter\" questions are next-smaller-element questions, which a monotonic stack answers " +
        "in one pass (Next Greater Element and Daily Temperatures, flipped). Keep a stack of indices whose " +
        "heights increase from bottom to top. When bar i is shorter than the bar on top, that top bar can't " +
        "extend past i: pop it, its height is h, its right limit is i, and its left limit is the index now on " +
        "top of the stack (or -1 if the stack is empty, meaning it reaches the left edge). Its area is h · (i " +
        "- left - 1). Keep popping while the top is taller, then push i.\n\n" +
        "Bars still on the stack at the end reach the right edge. The neat way to handle them is to pretend " +
        "there is one extra bar of height 0 at index n: it is shorter than everything, so it pops the whole " +
        "stack through the same code. Each index is pushed and popped once: O(n) time, O(n) stack.\n\n" +
        "This is also the core of Maximal Rectangle in a 0/1 matrix: treat each row as the floor of a " +
        "histogram of consecutive 1s above it, and run this on every row.\n\n" +
        "The visualization runs [2, 1, 5, 6, 2, 3]; the stack shows indices and heights.";

    public List<string> RecognitionSignals => [
        "\"Largest rectangle\", \"maximal area\" or \"widest span\" limited by the minimum in the span.",
        "For each element you need the nearest smaller (or larger) element on both sides.",
    ];

    public List<string> Gotchas => [
        "The width after popping uses the NEW top as the left limit, not the popped index: width = i - stack.Peek() - 1, or i when the stack is empty.",
        "Forgetting to flush the stack at the end misses rectangles that reach the right edge; a sentinel height 0 at index n handles it.",
        "Pushing heights instead of indices loses the positions needed for the width.",
    ];

    public List<string> ConfusableWith => [
        "Trapping Rain Water also looks at bars and their neighbours, but measures water above short bars, bounded by the taller bars around them.",
        "Daily Temperatures pops when a LARGER value arrives (next greater); here you pop when a smaller bar arrives (next smaller), on both sides at once.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int LargestRectangleArea(int[] heights)\n" +
            "    {\n" +
            "        var stack = new Stack<int>(); // indices; their heights increase from bottom to top\n" +
            "        var best = 0;\n" +
            "        for (var i = 0; i <= heights.Length; i++)\n" +
            "        {\n" +
            "            var h = i == heights.Length ? 0 : heights[i]; // a height-0 bar at the end flushes the stack\n" +
            "            // TODO: while the stack is not empty and heights[stack.Peek()] > h:\n" +
            "            // pop top; width = stack empty ? i : i - stack.Peek() - 1;\n" +
            "            // best = max(best, heights[top] * width). Then push i.\n" +
            "        }\n" +
            "        return best;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def largest_rectangle_area(heights):\n" +
            "    stack = []  # indices; their heights increase from bottom to top\n" +
            "    best = 0\n" +
            "    for i in range(len(heights) + 1):\n" +
            "        h = 0 if i == len(heights) else heights[i]  # a height-0 bar at the end flushes the stack\n" +
            "        # TODO: while stack and heights[stack[-1]] > h:\n" +
            "        # pop top; width = i if not stack else i - stack[-1] - 1;\n" +
            "        # best = max(best, heights[top] * width). Then push i.\n" +
            "    return best\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.LargestRectangleArea",
        ["python"] = "largest_rectangle_area",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[2, 1, 5, 6, 2, 3]", "10"),
        new TestCase("[2, 4]", "4"),
        new TestCase("[1]", "1"),
        new TestCase("[]", "0"),
        new TestCase("[2, 2, 2]", "6"),
        new TestCase("[6, 2, 5, 4, 5, 1, 6]", "12"),
        new TestCase("[1, 2, 3, 4, 5]", "9"),
        new TestCase("[5, 4, 3, 2, 1]", "9"),
        new TestCase("[0, 0]", "0"),
    ];

    public string CSharpCallTemplate => "Solution.LargestRectangleArea({input})";
    public string PythonCallTemplate => "largest_rectangle_area({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] heights = [2, 1, 5, 6, 2, 3];
        var stack = new List<int>();
        var best = 0;
        var steps = new List<VisualizationStep>();
        string[] Input() => heights.Select(h => h.ToString()).Append("0 (end)").ToArray();
        Dictionary<string, object> State() => new() { ["input"] = Input(), ["stack"] = stack.Select(i => $"i{i} h{heights[i]}").ToArray() };
        steps.Add(new(State(), [], "Bars [2, 1, 5, 6, 2, 3], plus a height-0 bar at the end. The stack keeps indices of increasing height."));
        for (var i = 0; i <= heights.Length; i++)
        {
            var h = i == heights.Length ? 0 : heights[i];
            while (stack.Count > 0 && heights[stack[^1]] > h)
            {
                var top = stack[^1];
                stack.RemoveAt(stack.Count - 1);
                var left = stack.Count == 0 ? -1 : stack[^1];
                var width = i - left - 1;
                var area = heights[top] * width;
                best = Math.Max(best, area);
                steps.Add(new(State(), [i],
                    $"Bar {i} (height {h}) is shorter than bar {top} (height {heights[top]}): pop it. It spans from after index {left} to before {i}, width {width}, area {heights[top]} x {width} = {area}. Best {best}."));
            }
            if (i < heights.Length)
            {
                stack.Add(i);
                steps.Add(new(State(), [i], $"Push bar {i} (height {h}). Heights on the stack still increase."));
            }
        }
        steps.Add(new(State(), [], $"The end bar flushed the stack. Largest rectangle: {best}."));
        return steps;
    }
}
