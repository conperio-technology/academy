namespace DsaAcademy.Content.Concepts;

public class IntervalsInsert : IConcept
{
    public string Id => "intervals-insert";
    public string Track => "patterns";
    public string Title => "Merge Intervals: Insert an Interval";
    public string OneLiner => "The list is already sorted and non-overlapping, so one O(n) pass splits it into three runs: before the new interval, overlapping it, and after it.";
    public string KeyTakeaway =>
        "Because the intervals are sorted and don't overlap each other, the ones that overlap the new " +
        "interval form ONE contiguous run. Copy everything that ends before the new interval starts, " +
        "absorb the run that overlaps it (min of starts, max of ends), then copy the rest. No sort is " +
        "needed, so it's O(n).";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "You get a list of intervals that is sorted by start and has no overlaps, plus one new interval. " +
        "Insert the new interval and merge wherever it now overlaps, so the result is again sorted and " +
        "non-overlapping. Touching endpoints count as overlapping: [1, 2] plus [2, 3] becomes [1, 3]. For " +
        "[[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]] with new interval [4, 8] the answer is " +
        "[[1, 2], [3, 10], [12, 16]].\n\n" +
        "You could append the new interval and run the general merge from Merge Intervals: Combine " +
        "Everything That Overlaps, but that sorts again, O(n log n), and ignores the fact that the list " +
        "is already in order. Because the existing intervals are sorted and disjoint, the ones that " +
        "overlap the new interval sit next to each other. That splits the list into three runs, and one " +
        "left-to-right pass handles them in order.\n\n" +
        "First run: while the current interval ENDS before the new one STARTS (end < newStart), it can't " +
        "touch the new interval, so copy it to the output unchanged. Second run: while the current " +
        "interval STARTS at or before the new one ENDS (start <= newEnd), it overlaps, so widen the new " +
        "interval to cover it: newStart = min(newStart, start), newEnd = max(newEnd, end). When that loop " +
        "stops, append the widened interval. Third run: everything left starts after the widened " +
        "interval ends, so copy it unchanged. Every interval is looked at once: O(n) time, and O(n) for " +
        "the output.\n\n" +
        "The two comparisons decide what \"overlap\" means. Using end < newStart in the first loop and " +
        "start <= newEnd in the second treats touching intervals as overlapping, which is what this " +
        "problem wants. Notice the new interval can swallow many intervals, none, or land before the " +
        "first or after the last, and the same three loops cover all of those without special cases.\n\n" +
        "The visualization inserts [4, 8]; the cells show the output as it's built.";

    public List<string> RecognitionSignals =>
    [
        "The intervals are ALREADY sorted and non-overlapping, and one new interval has to be added while keeping that property.",
        "An O(n) bound, or a hint that re-sorting is wasteful, on what would otherwise be a merge-intervals problem.",
    ];

    public List<string> Gotchas =>
    [
        "Mixing up which ends to compare: \"entirely before\" is end < newStart, \"overlaps\" is start <= newEnd. Swapping them, or using the new interval's ORIGINAL end after it has been widened, drops or double-counts intervals.",
        "Forgetting to append the merged new interval when there was nothing to merge with (empty list, or it fits in a gap or at either end).",
        "Absorbing only ONE overlapping interval with an if instead of a while: the new interval can swallow several, and each one it absorbs can push its end further right.",
    ];

    public List<string> ConfusableWith =>
    [
        "Merge Intervals (this track) starts from UNSORTED intervals and needs a sort first, O(n log n). Here the input is already sorted and disjoint, so a single O(n) pass is enough; re-sorting works but misses the point.",
        "Binary search can find where the new interval starts in O(log n), but the merged output still has to be built, so the total stays O(n).",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[][] InsertInterval(int[][] intervals, int[] newInterval)\n" +
            "    {\n" +
            "        // TODO: one pass with index i and (start, end) = newInterval.\n" +
            "        // 1) while intervals[i] ends before start: copy it to the output.\n" +
            "        // 2) while intervals[i] starts at or before end: widen start/end to\n" +
            "        //    cover it. Then append [start, end].\n" +
            "        // 3) copy everything that's left.\n" +
            "        return new int[0][];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def insert_interval(intervals, new_interval):\n" +
            "    # TODO: one pass with index i and start, end = new_interval.\n" +
            "    # 1) while intervals[i] ends before start: copy it to the output.\n" +
            "    # 2) while intervals[i] starts at or before end: widen start/end to\n" +
            "    #    cover it. Then append [start, end].\n" +
            "    # 3) copy everything that's left.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.InsertInterval",
        ["python"] = "insert_interval",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[[1, 3], [6, 9]], [2, 5]", "[[1,5],[6,9]]"),
        new TestCase("[[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]", "[[1,2],[3,10],[12,16]]"),
        new TestCase("[], [5, 7]", "[[5,7]]"),
        new TestCase("[[1, 5]], [2, 3]", "[[1,5]]"),
        new TestCase("[[3, 5]], [1, 2]", "[[1,2],[3,5]]"),
        new TestCase("[[1, 2], [5, 6]], [3, 4]", "[[1,2],[3,4],[5,6]]"),
        new TestCase("[[1, 2], [3, 4]], [2, 3]", "[[1,4]]"),
        new TestCase("[[2, 3], [5, 7]], [0, 10]", "[[0,10]]"),
    ];

    public string CSharpCallTemplate => "Solution.InsertInterval({input})";
    public string PythonCallTemplate => "insert_interval({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[][] intervals = [[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]];
        int start = 4, end = 8;
        var output = new List<string>();
        var steps = new List<VisualizationStep>();

        string Iv(int[] iv) => $"[{iv[0]},{iv[1]}]";
        Dictionary<string, object> State(params object[] pending) => new()
        {
            ["array"] = output.Cast<object>().Concat(pending).ToArray(),
        };

        steps.Add(new VisualizationStep(
            State(),
            [],
            "Insert [4,8] into [[1,2], [3,5], [6,7], [8,10], [12,16]]. The list is sorted and disjoint, so the intervals that overlap [4,8] form one run."
        ));

        var i = 0;
        while (i < intervals.Length && intervals[i][1] < start)
        {
            output.Add(Iv(intervals[i]));
            steps.Add(new VisualizationStep(
                State(),
                [output.Count - 1],
                $"{Iv(intervals[i])} ends at {intervals[i][1]}, before the new interval starts at {start}: copy it unchanged."
            ));
            i++;
        }

        while (i < intervals.Length && intervals[i][0] <= end)
        {
            var oldStart = start;
            var oldEnd = end;
            start = Math.Min(start, intervals[i][0]);
            end = Math.Max(end, intervals[i][1]);
            steps.Add(new VisualizationStep(
                State($"new [{start},{end}]"),
                [output.Count],
                $"{Iv(intervals[i])} starts at {intervals[i][0]}, at or before the new interval's end ({oldEnd}): overlap. " +
                    (start == oldStart && end == oldEnd
                        ? $"[{start},{end}] already covers it, so nothing changes."
                        : $"Widen [{oldStart},{oldEnd}] to [{start},{end}].")
            ));
            i++;
        }

        output.Add($"[{start},{end}]");
        steps.Add(new VisualizationStep(
            State(),
            [output.Count - 1],
            i < intervals.Length
                ? $"{Iv(intervals[i])} starts at {intervals[i][0]}, after {end}: the overlapping run is over. Append the merged interval [{start},{end}]."
                : $"No intervals left: append the merged interval [{start},{end}]."
        ));

        while (i < intervals.Length)
        {
            output.Add(Iv(intervals[i]));
            steps.Add(new VisualizationStep(
                State(),
                [output.Count - 1],
                $"{Iv(intervals[i])} starts after the merged interval ends: copy it unchanged."
            ));
            i++;
        }

        steps.Add(new VisualizationStep(
            State(),
            [],
            $"Done: [{string.Join(", ", output)}]. Every interval was looked at once, with no sort."
        ));
        return steps;
    }
}
