namespace DsaAcademy.Content.Concepts;

public class IntervalsMeetingRooms : IConcept
{
    public string Id => "intervals-meeting-rooms";
    public string Track => "patterns";
    public string Title => "Sweep Line: Minimum Meeting Rooms";
    public string OneLiner => "The number of rooms you need is the largest number of meetings running at the same moment: sweep through the start and end times in order and track how many are open.";
    public string KeyTakeaway =>
        "Which meeting ends doesn't matter, only WHEN one ends. Sort the start times and the end times " +
        "separately and walk the starts in order: if the earliest unused end time is <= this start, a room " +
        "has freed up, so reuse it; otherwise open a new room. The count of rooms ever opened is the " +
        "answer, in O(n log n).";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Given meetings as [start, end) pairs, return the minimum number of rooms so that no two meetings " +
        "in the same room overlap. A meeting that ends at time t frees its room for one that starts at t. " +
        "For [[0, 30], [5, 10], [15, 20]] the answer is 2: [0, 30] needs its own room the whole time, and " +
        "the other two can share a second one.\n\n" +
        "The minimum number of rooms equals the largest number of meetings in progress at any single " +
        "moment. Fewer rooms can't work at that moment, and that many is always enough, because a room " +
        "can be handed to the next meeting as soon as it frees up. So the question becomes: what's the " +
        "peak overlap? Imagine a vertical line sweeping left to right along the time axis. Every start " +
        "time it crosses adds one meeting in progress, every end time removes one, and you record the " +
        "highest count. That's the sweep line technique.\n\n" +
        "You don't need to keep start and end paired up for this, because the sweep only cares about how " +
        "many meetings are open, not which ones. Sort all the starts and, separately, all the ends. Walk " +
        "the starts in order with a second pointer e into the ends. For each start s: if ends[e] <= s, " +
        "some meeting has already finished, so this meeting can take its room (advance e, room count " +
        "unchanged); otherwise every room is busy, so open a new one. The number of rooms opened is the " +
        "peak overlap. Sorting dominates: O(n log n) time, O(n) for the two sorted arrays.\n\n" +
        "The <= is the half-open rule: a meeting ending at 10 and one starting at 10 can share a room. " +
        "Use < instead and those two would need separate rooms. An equally good alternative uses a min-heap " +
        "of end times for the rooms in use: sort meetings by start, and for each one, pop the heap's top " +
        "if it's <= this start (that room is free), then push this meeting's end. The heap's final size " +
        "is the answer. The same sweep counts peak concurrent users, overlapping flights at an airport, or " +
        "the busiest moment in a log of sessions.\n\n" +
        "The visualization sweeps [[0, 30], [5, 10], [10, 20], [25, 35]] as one sorted timeline of events, " +
        "with ends processed before starts at the same time, which is the same rule as the <= above.";

    public List<string> RecognitionSignals =>
    [
        "\"Minimum number of rooms / machines / platforms / servers\" so that overlapping intervals never share one.",
        "The answer is a COUNT of the maximum overlap at any moment, not a list of merged ranges.",
        "Events with a start and an end where only how many are active at a time matters, not which ones.",
    ];

    public List<string> Gotchas =>
    [
        "Ties decide the answer: with half-open meetings a room freed at t can be reused by a meeting starting at t, so compare with ends[e] <= start (or process ends before starts at the same time).",
        "Sorting the [start, end] pairs by start and only comparing neighbors misses meetings that overlap something further back; you need either the separately sorted ends or a heap of end times.",
        "Merging overlapping intervals and counting the merged blocks gives the number of busy STRETCHES, not the number of rooms; [0, 30], [5, 10], [15, 20] merge into one block but need two rooms.",
    ];

    public List<string> ConfusableWith =>
    [
        "Merge Intervals (this track) combines overlapping intervals into blocks; here overlapping intervals are exactly the ones that must stay APART, and the answer is the peak overlap count.",
        "Top-K with a Heap (this track): a min-heap of end times for the rooms in use is a valid alternative solution (pop when the earliest end is <= the next start); the sweep over two sorted arrays gets the same count without a heap.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int MinMeetingRooms(int[][] intervals)\n" +
            "    {\n" +
            "        // TODO: sort all start times and, separately, all end times. Walk the\n" +
            "        // starts with a pointer e into the ends: if ends[e] <= start, a room\n" +
            "        // has freed up (e++); otherwise open a new room. Return the rooms opened.\n" +
            "        return -1;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def min_meeting_rooms(intervals):\n" +
            "    # TODO: sort all start times and, separately, all end times. Walk the\n" +
            "    # starts with a pointer e into the ends: if ends[e] <= start, a room\n" +
            "    # has freed up (e += 1); otherwise open a new room. Return the rooms opened.\n" +
            "    return -1\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MinMeetingRooms",
        ["python"] = "min_meeting_rooms",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[[0, 30], [5, 10], [15, 20]]", "2"),
        new TestCase("[[7, 10], [2, 4]]", "1"),
        new TestCase("[[1, 5], [5, 10]]", "1"),
        new TestCase("[[1, 10], [2, 9], [3, 8], [4, 7]]", "4"),
        new TestCase("[[1, 3], [2, 4], [3, 5], [4, 6]]", "2"),
        new TestCase("[[9, 10], [4, 9], [4, 17]]", "2"),
        new TestCase("[[1, 5]]", "1"),
        new TestCase("[]", "0"),
    ];

    public string CSharpCallTemplate => "Solution.MinMeetingRooms({input})";
    public string PythonCallTemplate => "min_meeting_rooms({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[][] meetings = [[0, 30], [5, 10], [10, 20], [25, 35]];
        // One timeline of events; at equal times, ends sort before starts.
        var events = meetings
            .SelectMany(m => new[] { (Time: m[0], IsStart: true), (Time: m[1], IsStart: false) })
            .OrderBy(e => e.Time).ThenBy(e => e.IsStart ? 1 : 0)
            .ToArray();
        var cells = events.Select(e => (object)(e.IsStart ? $"start {e.Time}" : $"end {e.Time}")).ToArray();
        var steps = new List<VisualizationStep>();
        int open = 0, peak = 0;

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = cells },
            HighlightIndices: [],
            Message: "Meetings [0,30], [5,10], [10,20], [25,35] as one sorted timeline of start and end events. At the same time, ends go first: a room freed at 10 can host a meeting starting at 10."
        ));

        for (var i = 0; i < events.Length; i++)
        {
            var (time, isStart) = events[i];
            string message;
            if (isStart)
            {
                open++;
                var newPeak = open > peak;
                peak = Math.Max(peak, open);
                message = $"t = {time}: a meeting starts, {open} in progress." +
                    (newPeak ? $" New peak: {peak} room(s) needed." : $" Peak is still {peak}.");
            }
            else
            {
                open--;
                message = $"t = {time}: a meeting ends and its room frees up, {open} in progress. Peak is still {peak}.";
            }
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object>
                {
                    ["array"] = cells,
                    ["tracker"] = open,
                    ["trackerLabel"] = "meetings in progress",
                },
                HighlightIndices: [i],
                Message: message
            ));
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object>
            {
                ["array"] = cells,
                ["tracker"] = peak,
                ["trackerLabel"] = "rooms needed",
            },
            HighlightIndices: [],
            Message: $"Done: the peak overlap was {peak}, so {peak} rooms are enough. The two-pointer version (sorted starts against sorted ends) counts the same thing."
        ));
        return steps;
    }
}
