namespace DsaAcademy.Content.Concepts;

// Transfer exercise after Next Greater Element: the same stack of unresolved indices, but the
// answer is how far away the warmer day is, which is why the stack must hold indices.
public class MonotonicStackDailyTemperatures : IConcept
{
    public string Id => "monotonic-stack-daily-temperatures";
    public string Track => "patterns";
    public string Title => "Transfer: Daily Temperatures";
    public string OneLiner => "For each day, how many days until a warmer one? The next greater element again, but the answer is a distance, so the stack has to remember positions.";
    public string KeyTakeaway =>
        "Keep a stack of indices of days still waiting for a warmer day; their temperatures never increase " +
        "from bottom to top. When day i is warmer than the day on top, that day's wait is over: pop it at " +
        "index j and record i - j. Each day is pushed and popped at most once, so O(n).";
    public VisualizerKind VisualizerKind => VisualizerKind.Stack;
    public string? TransferOf => "monotonic-stack-next-greater";

    public string Explanation =>
        "This follows Find the Next Greater Element with the answer changed. temperatures[i] is the " +
        "temperature on day i. For each day, return how many days you would have to wait for a strictly " +
        "warmer one, or 0 if no later day is warmer. For [73, 74, 75, 71, 69, 72, 76, 73] the answer is " +
        "[1, 1, 4, 2, 1, 1, 0, 0]: after the 75 on day 2 the next warmer day is the 76 on day 6, four days " +
        "later.\n\n" +
        "\"First later day that is warmer\" is exactly \"next greater element\", so the same one pass works. " +
        "Walk the days left to right with a stack of days that have not found a warmer day yet. Before " +
        "pushing day i, pop every day on top whose temperature is lower than temperatures[i]: day i is the " +
        "first warmer day for each of them. Then push day i. Days still on the stack at the end never warm " +
        "up and keep the answer 0.\n\n" +
        "The one real change is what you record. The parent stored the greater value; here you need the " +
        "distance, answer[j] = i - j, so the stack must hold indices, not temperatures (you can always read " +
        "the temperature back as temperatures[j]). Equal temperatures are not warmer, so pop only on a " +
        "strict <, and a run of equal days waits together.\n\n" +
        "Every index is pushed once and popped at most once: O(n) time, O(n) space for the stack and the " +
        "answer. Checking every later day for every day is O(n²), which is what the stack avoids.\n\n" +
        "The visualization runs [73, 74, 75, 71, 69, 72, 76, 73]; the stack shows day indices with their " +
        "temperatures.\n\n" +
        "Explain why the same idea works: before you move on, write two or three sentences comparing this " +
        "with Find the Next Greater Element. Why is the day that pops j always the first warmer day after j, " +
        "why does the stack have to store indices now, and why is the whole pass still O(n)?";

    public List<string> RecognitionSignals =>
    [
        "\"How many days (steps, positions) until something larger or smaller\", asked for every position.",
        "Next greater or next smaller element, but the answer is a distance or an index rather than the value.",
    ];

    public List<string> Gotchas =>
    [
        "Push indices, not temperatures: the answer i - j needs the position of the waiting day.",
        "Pop only on strictly warmer; an equal temperature does not end the wait.",
        "Days left on the stack at the end keep 0, so fill the answer with 0 up front.",
    ];

    public List<string> ConfusableWith =>
    [
        "Monotonic Stack: Find the Next Greater Element records the warmer value itself; this records how far away it is, which is why the stack must hold indices.",
        "Monotonic Deque: Sliding Window Maximum also keeps a decreasing run of indices, but it drops them from the front as the window moves on. Here an index leaves only when its answer is found.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] DailyTemperatures(int[] temperatures)\n" +
            "    {\n" +
            "        // TODO: answer = new int[n] (all 0), a Stack<int> of day INDICES.\n" +
            "        // For each day i: while the stack is not empty and\n" +
            "        // temperatures[stack.Peek()] < temperatures[i], pop j and set\n" +
            "        // answer[j] = i - j. Then push i. Return answer.\n" +
            "        return new int[temperatures.Length];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def daily_temperatures(temperatures):\n" +
            "    # TODO: answer = [0] * n, a stack (list) of day INDICES. For each day i:\n" +
            "    # while the stack is not empty and temperatures[stack[-1]] < temperatures[i],\n" +
            "    # pop j and set answer[j] = i - j. Then push i. Return answer.\n" +
            "    return [0] * len(temperatures)\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.DailyTemperatures",
        ["python"] = "daily_temperatures",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([73, 74, 75, 71, 69, 72, 76, 73]), "[1,1,4,2,1,1,0,0]"),
        new TestCase(Lit.IntArray([30, 40, 50, 60]), "[1,1,1,0]"),
        new TestCase(Lit.IntArray([30, 60, 90]), "[1,1,0]"),
        new TestCase(Lit.IntArray([50]), "[0]"),
        new TestCase(Lit.IntArray([70, 70, 70]), "[0,0,0]"),
        new TestCase(Lit.IntArray([]), "[]"),
        new TestCase(Lit.IntArray([90, 80, 70, 60]), "[0,0,0,0]"),
        new TestCase(Lit.IntArray([55, 38, 53, 81, 61, 93, 97, 32, 43, 78]), "[3,1,1,2,1,1,0,1,1,0]"),
    ];

    public string CSharpCallTemplate => "Solution.DailyTemperatures({input})";
    public string PythonCallTemplate => "daily_temperatures({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] temps = [73, 74, 75, 71, 69, 72, 76, 73];
        var steps = new List<VisualizationStep>();
        var stack = new List<int>();
        var answer = new int[temps.Length];

        string[] InputLabels() => temps.Select(t => t.ToString()).ToArray();
        string[] StackLabels() => stack.Select(i => $"day{i}={temps[i]}").ToArray();
        Dictionary<string, object> State() => new() { ["input"] = InputLabels(), ["stack"] = StackLabels() };

        for (var i = 0; i < temps.Length; i++)
        {
            while (stack.Count > 0 && temps[stack[^1]] < temps[i])
            {
                var j = stack[^1];
                stack.RemoveAt(stack.Count - 1);
                answer[j] = i - j;
                steps.Add(new VisualizationStep(State(), [i],
                    $"Day {i} ({temps[i]}) is warmer than day {j} ({temps[j]}) on top. Pop day {j}: it waited {i} - {j} = {i - j} day{(i - j == 1 ? "" : "s")}."));
            }
            stack.Add(i);
            steps.Add(new VisualizationStep(State(), [i],
                $"Push day {i} ({temps[i]}). It waits for a warmer day; the stack's temperatures never rise from bottom to top."));
        }

        steps.Add(new VisualizationStep(State(), [],
            $"Done: [{string.Join(", ", answer)}]. The days still on the stack never got a warmer day, so they keep 0."));
        return steps;
    }
}
