namespace DsaAcademy.Content.Concepts;

public class IntervalsNonOverlapping : IConcept
{
    public string Id => "intervals-non-overlapping";
    public string Track => "patterns";
    public string Title => "Greedy: Non-overlapping Intervals";
    public string OneLiner => "To remove as few intervals as possible, keep as many as possible: sort by END time and always keep the interval that finishes earliest.";
    public string KeyTakeaway =>
        "Minimizing removals is the same as maximizing the intervals you keep. Sort by end time; walk them " +
        "in order, keeping an interval whenever it starts at or after the end of the last one you kept, " +
        "and counting it as removed otherwise. Finishing earliest always leaves the most room for " +
        "everything after, so this greedy choice is never worse than any other: O(n log n).";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Given a list of intervals, return the minimum number you have to remove so that the rest don't " +
        "overlap. Intervals that only touch, like [1, 2] and [2, 3], don't overlap. For " +
        "[[1, 2], [2, 3], [3, 4], [1, 3]] the answer is 1: remove [1, 3] and the other three line up end " +
        "to end.\n\n" +
        "Flip the question around: removing the fewest is the same as keeping the most, so find the " +
        "largest set of intervals with no overlaps and subtract its size from n. Trying every subset is " +
        "exponential. A greedy rule works instead: of all the intervals you could keep next, keep the one " +
        "that ENDS earliest. Why is that safe? Suppose some best answer keeps a different interval first. " +
        "Swap it for the earliest-ending one: that one ends no later, so everything after it in the best " +
        "answer still fits, and the count is unchanged. Repeat the argument at every step and the greedy " +
        "choice is never worse.\n\n" +
        "In code: sort the intervals by end. Track lastEnd, the end of the last interval you kept (start " +
        "with nothing kept). For each interval in order: if its start >= lastEnd, it fits after what you " +
        "kept, so keep it and set lastEnd to its end. Otherwise it overlaps the last kept interval, and " +
        "since that one ends no later (the list is sorted by end), dropping the current one is the right " +
        "call: count one removal. Sorting dominates, O(n log n) time; the pass itself is O(n) and needs " +
        "only two variables.\n\n" +
        "Sorting by START is the tempting mistake. With [[1, 10], [2, 3], [4, 5], [6, 7]], sorting by start " +
        "and keeping whatever comes first would keep [1, 10] and remove the other three, but the best " +
        "answer removes only [1, 10]. A long interval that starts early blocks everything; ending early is " +
        "what matters. The same rule (sort by end, keep the earliest finisher) answers activity selection, " +
        "\"maximum number of meetings in one room\" and \"minimum arrows to burst balloons\".\n\n" +
        "The visualization shows the intervals sorted by end; the message says which ones are kept.";

    public List<string> RecognitionSignals =>
    [
        "\"Remove the fewest intervals so the rest don't overlap\", or the mirror image, \"keep / schedule / attend the MOST non-overlapping intervals\".",
        "Picking a subset of intervals where one locally best choice (the earliest finish) can be argued never to hurt later choices.",
        "Brute force would try subsets, but intervals give an ordering that a single sorted pass can exploit.",
    ];

    public List<string> Gotchas =>
    [
        "Sort by END, not by start. Sorting by start and keeping the first interval of each overlapping pair keeps long intervals that block many short ones.",
        "Touching endpoints don't overlap here, so the keep test is start >= lastEnd; using > removes intervals that could stay.",
        "When an interval overlaps, don't update lastEnd: the interval you already kept ends no later, so it stays the one to compare against.",
    ];

    public List<string> ConfusableWith =>
    [
        "Merge Intervals (this track) also sorts intervals and walks them once, but it COMBINES overlapping intervals into one (sorted by start). Here overlapping intervals are thrown away, and the right sort key is the end.",
        "Minimum Meeting Rooms (this track) keeps every interval and asks how many rooms they need; this one keeps a single \"room\" and asks how many intervals must go.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int EraseOverlapIntervals(int[][] intervals)\n" +
            "    {\n" +
            "        // TODO: sort intervals by END. Track lastEnd, the end of the last\n" +
            "        // interval kept. For each interval: if it starts at or after lastEnd,\n" +
            "        // keep it (lastEnd = its end); otherwise count it as removed.\n" +
            "        // Return the number removed.\n" +
            "        return -1;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def erase_overlap_intervals(intervals):\n" +
            "    # TODO: sort intervals by END. Track last_end, the end of the last\n" +
            "    # interval kept. For each interval: if it starts at or after last_end,\n" +
            "    # keep it (last_end = its end); otherwise count it as removed.\n" +
            "    # Return the number removed.\n" +
            "    return -1\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.EraseOverlapIntervals",
        ["python"] = "erase_overlap_intervals",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[[1, 2], [2, 3], [3, 4], [1, 3]]", "1"),
        new TestCase("[[1, 2], [1, 2], [1, 2]]", "2"),
        new TestCase("[[1, 2], [2, 3]]", "0"),
        new TestCase("[[1, 10], [2, 3], [4, 5], [6, 7]]", "1"),
        new TestCase("[[1, 100], [11, 22], [1, 11], [2, 12]]", "2"),
        new TestCase("[[0, 2], [1, 3], [2, 4], [3, 5], [4, 6]]", "2"),
        new TestCase("[[-5, -1], [-3, 0], [0, 4]]", "1"),
        new TestCase("[]", "0"),
    ];

    public string CSharpCallTemplate => "Solution.EraseOverlapIntervals({input})";
    public string PythonCallTemplate => "erase_overlap_intervals({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[][] intervals = [[1, 10], [2, 3], [1, 4], [4, 5], [3, 7], [6, 8]];
        var sorted = intervals.OrderBy(iv => iv[1]).ToArray();
        var cells = sorted.Select(iv => (object)$"[{iv[0]},{iv[1]}]").ToArray();
        var kept = new List<int>();
        var removed = 0;
        int? lastEnd = null;
        var steps = new List<VisualizationStep>();

        string Kept() => "[" + string.Join(", ", kept.Select(k => cells[k])) + "]";

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = cells },
            HighlightIndices: [],
            Message: "[[1,10], [2,3], [1,4], [4,5], [3,7], [6,8]] sorted by END time. Keep each interval that starts at or after the end of the last one kept; remove the rest."
        ));

        for (var i = 0; i < sorted.Length; i++)
        {
            var (start, end) = (sorted[i][0], sorted[i][1]);
            string message;
            if (lastEnd is null || start >= lastEnd)
            {
                message = lastEnd is null
                    ? $"{cells[i]} ends earliest of all: keep it. lastEnd = {end}."
                    : $"{cells[i]} starts at {start}, at or after lastEnd = {lastEnd}: it fits, keep it. lastEnd = {end}.";
                kept.Add(i);
                lastEnd = end;
            }
            else
            {
                removed++;
                message = $"{cells[i]} starts at {start}, before lastEnd = {lastEnd}: it overlaps the kept interval, which ends sooner. Remove it.";
            }
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object>
                {
                    ["array"] = cells,
                    ["tracker"] = removed,
                    ["trackerLabel"] = "removed",
                },
                HighlightIndices: [i],
                Message: message + $" Kept so far: {Kept()}."
            ));
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object>
            {
                ["array"] = cells,
                ["tracker"] = removed,
                ["trackerLabel"] = "removed",
            },
            HighlightIndices: kept.ToArray(),
            Message: $"Done: kept {Kept()}, removed {removed}. Sorting by start instead would have kept [1,10] first and blocked almost everything."
        ));
        return steps;
    }
}
