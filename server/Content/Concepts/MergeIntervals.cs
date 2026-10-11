namespace DsaAcademy.Content.Concepts;

public class MergeIntervals : IConcept
{
    public string Id => "merge-intervals";
    public string Track => "patterns";
    public string Title => "Merge Intervals: Combine Everything That Overlaps";
    public string OneLiner => "Sort by start time first, then a single left-to-right pass is enough to merge every overlapping interval -- no interval needs to be revisited once merged.";
    public string KeyTakeaway =>
        "Once intervals are SORTED by start, an interval can only possibly overlap the current merged " +
        "interval (everything earlier ends before it) -- so a single pass comparing each interval to the last one KEPT (not " +
        "the last one seen) is enough; the sort is what makes one pass sufficient.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Given a list of intervals, merge every pair that overlaps into one combined interval. The key " +
        "insight: this is hard to do correctly on UNSORTED intervals (any interval could overlap any " +
        "other), but trivial once they're SORTED by start time -- after sorting, if an interval " +
        "doesn't overlap the interval immediately after it, it can't overlap anything further away " +
        "either (since everything further away starts even later). That collapses the problem to one " +
        "left-to-right pass.\n\n" +
        "Walk the sorted intervals one at a time, keeping a \"current merged interval\" (start with the " +
        "first one). For each next interval: if its start is <= the current merged interval's end, " +
        "they overlap -- extend the current merged interval's end to cover the larger of the two ends. " +
        "If it doesn't overlap, the current merged interval is finished -- record it, and start a new " +
        "current merged interval from this one.\n\n" +
        "Watch the sorted intervals collapse into fewer, wider ones below -- each interval only ever " +
        "gets compared against the CURRENT merged result, never against every other interval, which is " +
        "what keeps this an O(n log n) algorithm (dominated by the sort) instead of O(n^2).";

    public List<string> RecognitionSignals =>
    [
        "The problem gives a list of ranges/intervals and asks you to combine, count, or find overlaps among them.",
        "Any brute-force approach would compare every interval against every other interval (O(n^2)) -- sorting first should immediately come to mind.",
    ];

    public List<string> Gotchas =>
    [
        "Whether touching endpoints count as overlapping ([1,4] and [4,5]) is a real ambiguity some problems specify explicitly -- using <= instead of < in the overlap check treats them as overlapping; double check which the problem wants.",
        "Forgetting to sort first (or sorting by the wrong field, like end instead of start) breaks the single-pass guarantee entirely.",
    ];

    public List<string> ConfusableWith =>
    [
        "Sliding Window (this track) also processes a sequence in one pass, but slides a WINDOW of fixed or growing/shrinking size over an array; merging intervals compares each new interval only against the last MERGED result, not a moving window boundary.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[][] MergeIntervals(int[][] intervals)\n" +
            "    {\n" +
            "        // TODO: sort intervals by start. Walk them left to right, keeping a\n" +
            "        // \"current merged interval.\" If the next interval's start <= current's\n" +
            "        // end, extend current's end to the larger of the two ends. Otherwise,\n" +
            "        // record current and start a new one from this interval.\n" +
            "        return new int[0][];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def merge_intervals(intervals):\n" +
            "    # TODO: sort intervals by start. Walk them left to right, keeping a\n" +
            "    # \"current merged interval.\" If the next interval's start <= current's\n" +
            "    # end, extend current's end to the larger of the two ends. Otherwise,\n" +
            "    # record current and start a new one from this interval.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MergeIntervals",
        ["python"] = "merge_intervals",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[[1, 3], [2, 6], [8, 10], [15, 18]]", "[[1,6],[8,10],[15,18]]"),
        new TestCase("[[8, 10], [1, 3], [15, 18], [2, 6]]", "[[1,6],[8,10],[15,18]]"),
        new TestCase("[[1, 4], [4, 5]]", "[[1,5]]"),
        new TestCase("[[1, 4], [2, 3]]", "[[1,4]]"),
        new TestCase("[[1, 2], [3, 4], [5, 6]]", "[[1,2],[3,4],[5,6]]"),
    ];

    public string CSharpCallTemplate => "Solution.MergeIntervals({input})";
    public string PythonCallTemplate => "merge_intervals({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[][] sorted = [[1, 3], [2, 6], [8, 10], [15, 18]];
        var steps = new List<VisualizationStep>();
        var merged = new List<(int Start, int End)>();

        object[] Snapshot() => merged.Select(m => (object)$"[{m.Start},{m.End}]").ToArray();

        merged.Add((sorted[0][0], sorted[0][1]));
        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = Snapshot() },
            HighlightIndices: [merged.Count - 1],
            Message: $"Start with the first sorted interval: [{sorted[0][0]},{sorted[0][1]}]."
        ));

        for (var i = 1; i < sorted.Length; i++)
        {
            var overlaps = sorted[i][0] <= merged[^1].End;
            if (overlaps)
            {
                var old = merged[^1];
                var newEnd = Math.Max(old.End, sorted[i][1]);
                merged[^1] = (old.Start, newEnd);
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = Snapshot() },
                    HighlightIndices: [merged.Count - 1],
                    Message: $"[{sorted[i][0]},{sorted[i][1]}] overlaps [{old.Start},{old.End}] (starts before it ends) -- merge into [{old.Start},{newEnd}]."
                ));
            }
            else
            {
                merged.Add((sorted[i][0], sorted[i][1]));
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = Snapshot() },
                    HighlightIndices: [merged.Count - 1],
                    Message: $"[{sorted[i][0]},{sorted[i][1]}] doesn't overlap the last merged interval -- keep it separate."
                ));
            }
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = Snapshot() },
            HighlightIndices: [],
            Message: $"Done -- {merged.Count} merged interval(s): [{string.Join(", ", merged.Select(m => $"[{m.Start},{m.End}]"))}]."
        ));

        return steps;
    }
}
