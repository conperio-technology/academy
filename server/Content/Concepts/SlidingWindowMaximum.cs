namespace DsaAcademy.Content.Concepts;

public class SlidingWindowMaximum : IConcept
{
    public string Id => "sliding-window-maximum";
    public string Track => "patterns";
    public string Title => "Monotonic Deque: Sliding Window Maximum";
    public string OneLiner => "The maximum of every window of size k, in one pass -- keep a deque of indices whose values only decrease from front to back.";
    public string KeyTakeaway =>
        "A new element makes every smaller element before it useless: they leave the window sooner and can " +
        "never be the max while it's there. So pop them off the BACK before pushing the new index, drop the " +
        "FRONT index once it slides out of the window, and the front is always the current maximum. Each " +
        "index is pushed and popped at most once: O(n).";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Given nums and a window size k, return the maximum of each of the n - k + 1 windows, left to right. " +
        "For [1, 3, -1, -3, 5, 3, 6, 7] with k = 3 the answer is [3, 3, 5, 5, 6, 7]. Rescanning every window " +
        "is O(n·k). The running-sum trick from the fixed-size window lesson doesn't work either: when the " +
        "maximum slides out, you can't \"subtract\" it to find the new one. A heap works in O(n log n) but has " +
        "to lazily throw away stale entries.\n\n" +
        "The key observation: if nums[j] >= nums[i] and j comes after i, then i will never again be the " +
        "maximum of any window. j is at least as big and stays in the window longer. So i can be forgotten " +
        "the moment j arrives. What remains after forgetting all such elements is a sequence of indices whose " +
        "values strictly decrease, and its first element is the window's maximum.\n\n" +
        "Store those indices in a deque (a double-ended queue). For each new index i: first, if the front " +
        "index is i - k or older, it has slid out of the window, so pop it from the front. Second, while the " +
        "value at the back is <= nums[i], pop it from the back; those are the elements i makes useless. Then " +
        "push i at the back. Once i >= k - 1 (the first full window), nums[front] is that window's maximum. " +
        "Store indices, not values, because you need the index to tell when the front has left the window.\n\n" +
        "Every index enters the deque once and leaves at most once, so the total work is O(n) even with the " +
        "inner while loop, and the deque never holds more than k indices. In C# use LinkedList<int> (AddLast, " +
        "RemoveFirst, RemoveLast, First.Value, Last.Value); in Python use collections.deque. Follow-ups: the " +
        "window minimum (flip the comparison), and DP problems like \"jump game with a max reach of k\" or " +
        "\"constrained subsequence sum\", where a monotonic deque gives the best of the last k DP values in O(1).\n\n" +
        "The visualization highlights each window, with the deque's contents in the message.";

    public List<string> RecognitionSignals =>
    [
        "The max (or min) of EVERY contiguous window of a fixed size k, or the best of the last k values in a DP.",
        "A fixed-size window where the thing you track can't be undone by subtraction when an element leaves (max, min).",
        "You'd reach for a heap of window elements, then realize stale entries are the annoying part.",
    ];

    public List<string> Gotchas =>
    [
        "Push INDICES, not values; with values you can't tell whether the front has slid out of the window.",
        "Evict from the front when the front index is <= i - k, before reading the max -- and only start recording answers once i >= k - 1.",
        "Pop from the back with <= (or <) consistently; either gives correct maxima, but forgetting the back pops entirely leaves the deque unsorted and the front stops being the max.",
    ];

    public List<string> ConfusableWith =>
    [
        "Monotonic Stack: Find the Next Greater Element (this track) uses the same \"pop the smaller ones before pushing\" rule, but only at one end. Here you also remove from the FRONT as the window slides, so you need a deque.",
        "Sliding Window: Max Sum Subarray of Size K (this track) has the same fixed window, but a sum can be updated by subtracting the leaving element. A maximum can't, which is why this needs the deque.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] MaxSlidingWindow(int[] nums, int k)\n" +
            "    {\n" +
            "        // TODO: a LinkedList<int> deque of INDICES, values decreasing front\n" +
            "        // to back. For each i: if the front index <= i - k, RemoveFirst.\n" +
            "        // While nums[back] <= nums[i], RemoveLast. AddLast(i). Once\n" +
            "        // i >= k - 1, record nums[front]. Return the n - k + 1 maxima in order.\n" +
            "        return new int[0];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "from collections import deque\n\n\n" +
            "def max_sliding_window(nums, k):\n" +
            "    # TODO: a deque of INDICES, values decreasing front to back. For each\n" +
            "    # i: if dq[0] <= i - k, popleft(). While nums[dq[-1]] <= nums[i],\n" +
            "    # pop(). append(i). Once i >= k - 1, record nums[dq[0]]. Return the\n" +
            "    # n - k + 1 maxima in order.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MaxSlidingWindow",
        ["python"] = "max_sliding_window",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([1, 3, -1, -3, 5, 3, 6, 7]), Lit.Int(3)), "[3,3,5,5,6,7]"),
        new TestCase(Lit.Args(Lit.IntArray([1]), Lit.Int(1)), "[1]"),
        new TestCase(Lit.Args(Lit.IntArray([9, 8, 7, 6, 5]), Lit.Int(2)), "[9,8,7,6]"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3, 4]), Lit.Int(4)), "[4]"),
        new TestCase(Lit.Args(Lit.IntArray([4, 4, 4, 4]), Lit.Int(2)), "[4,4,4]"),
        new TestCase(Lit.Args(Lit.IntArray([7, 2, 4]), Lit.Int(1)), "[7,2,4]"),
        new TestCase(Lit.Args(Lit.IntArray([1, 3, 1, 2, 0, 5]), Lit.Int(3)), "[3,3,2,5]"),
    ];

    public string CSharpCallTemplate => "Solution.MaxSlidingWindow({input})";
    public string PythonCallTemplate => "max_sliding_window({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [1, 3, -1, -3, 5, 3, 6, 7];
        const int k = 3;
        var arr = nums.Select(v => (object)v).ToArray();
        var dq = new LinkedList<int>();
        var maxima = new List<int>();
        var steps = new List<VisualizationStep>();

        string Deque() => "[" + string.Join(", ", dq.Select(i => $"{i}:{nums[i]}")) + "]";

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = arr },
            HighlightIndices: [],
            Message: "k = 3. The deque holds indices (shown as index:value) whose values decrease from front to back; the front is always the window max."
        ));

        for (var i = 0; i < nums.Length; i++)
        {
            var notes = new List<string>();
            if (dq.Count > 0 && dq.First!.Value <= i - k)
            {
                notes.Add($"index {dq.First.Value} slid out, pop it from the front");
                dq.RemoveFirst();
            }
            var popped = new List<int>();
            while (dq.Count > 0 && nums[dq.Last!.Value] <= nums[i])
            {
                popped.Add(nums[dq.Last.Value]);
                dq.RemoveLast();
            }
            if (popped.Count > 0)
                notes.Add($"{nums[i]} makes [{string.Join(", ", popped)}] useless, pop from the back");
            dq.AddLast(i);

            var left = Math.Max(0, i - k + 1);
            var window = Enumerable.Range(left, i - left + 1).ToArray();
            var what = notes.Count > 0 ? string.Join("; ", notes) + ". " : "";
            string message;
            if (i >= k - 1)
            {
                maxima.Add(nums[dq.First!.Value]);
                message = $"i = {i}: {what}Push {i}. Deque {Deque()}. Window max = {maxima[^1]}. Maxima so far: [{string.Join(", ", maxima)}].";
            }
            else
            {
                message = $"i = {i}: {what}Push {i}. Deque {Deque()}. The first window isn't full yet.";
            }

            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object>
                {
                    ["array"] = arr,
                    ["tracker"] = nums[dq.First!.Value],
                    ["trackerLabel"] = "front of deque (current max)",
                },
                HighlightIndices: window,
                Message: message
            ));
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = arr },
            HighlightIndices: [],
            Message: $"Done: [{string.Join(", ", maxima)}]. Each index entered the deque once and left at most once."
        ));
        return steps;
    }
}
