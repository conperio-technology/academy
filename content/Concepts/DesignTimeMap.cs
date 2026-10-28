namespace DsaAcademy.Content.Concepts;

public class DesignTimeMap : IConcept
{
    public string Id => "design-time-map";
    public string Track => "patterns";
    public string Title => "Design: Time-Based Key-Value Store";
    public string OneLiner => "A key-value store that remembers every version: get(key, t) returns the value set at the latest time at or before t. Each key keeps its versions in time order, so a binary search finds the answer.";
    public string KeyTakeaway =>
        "Map each key to a list of (timestamp, value) pairs. Timestamps for a key arrive in increasing order, " +
        "so appending keeps the list sorted for free. get(key, t) is then \"the last timestamp <= t\", an " +
        "upper-bound binary search: O(log m) for m versions of that key, and O(1) for set.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Design a class TimeMap with Set(key, value, timestamp), which stores value for key at that time, and " +
        "Get(key, timestamp), which returns the value whose set time is the largest one at or before " +
        "timestamp, or \"\" if there is none. For one key, set calls arrive with strictly increasing " +
        "timestamps. Set foo = bar at 1, then Get(foo, 3) is bar; after Set foo = bar2 at 4, Get(foo, 4) and " +
        "Get(foo, 5) are bar2, while Get(foo, 3) would still be bar.\n\n" +
        "The grader runs a list of operations and collects what every get returns. Arguments arrive as " +
        "strings, so the harness converts the timestamps to integers for you.\n\n" +
        "Store a dictionary from key to a list of (timestamp, value). Set appends to that key's list. Because " +
        "timestamps only increase, each list is already sorted by time, with no sorting needed.\n\n" +
        "Get searches the key's list for the last entry with timestamp <= t. Scanning backwards works but is " +
        "O(m) per call. Binary search makes it O(log m): find the first entry with timestamp > t (lo = 0, hi " +
        "= count; while lo < hi: mid; if times[mid] <= t then lo = mid + 1 else hi = mid), and the answer is " +
        "the entry just before it, lo - 1. If lo is 0, every version is newer than t: return \"\". A missing " +
        "key also returns \"\".\n\n" +
        "Set is O(1) amortized and Get is O(log m). This is the shape of multi-version storage: databases " +
        "keep row versions with timestamps so each transaction reads the version that was current when it " +
        "started (MVCC, in the Databases section), and configuration and feature-flag systems answer \"what " +
        "was the value at time t\" the same way.\n\n" +
        "The visualization stores four versions of one key and answers Get at time 25.";

    public List<string> RecognitionSignals => [
        "\"Value as of time t\", versioned data, snapshots: a sorted list per key plus binary search.",
        "Data arrives already sorted by the field you will search on: append and binary search instead of a tree.",
    ];

    public List<string> Gotchas => [
        "Returning the first timestamp >= t instead of the last one <= t.",
        "A query earlier than every version must return \"\", not the earliest value.",
        "Off by one in the search: with an upper-bound search, the answer is at lo - 1.",
    ];

    public List<string> ConfusableWith => [
        "Binary Search Range (first and last position) uses the same lower and upper bound searches on one array; here there is one sorted array per key.",
        "LRU Cache also wraps a dictionary in extra structure, but evicts old entries; this keeps every version.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class TimeMap\n" +
            "{\n" +
            "    private readonly Dictionary<string, List<(int Time, string Value)>> versions = new();\n" +
            "\n" +
            "    public void Set(string key, string value, int timestamp)\n" +
            "    {\n" +
            "        // TODO: append (timestamp, value) to key's list (create it if missing).\n" +
            "    }\n" +
            "\n" +
            "    public string Get(string key, int timestamp)\n" +
            "    {\n" +
            "        // TODO: \"\" if the key is missing. Binary search key's list for the first\n" +
            "        // entry with Time > timestamp (lo, hi = 0, count); the answer is at lo - 1,\n" +
            "        // or \"\" when lo is 0.\n" +
            "        return \"\";\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "class TimeMap:\n" +
            "    def __init__(self):\n" +
            "        self.versions = {}  # key -> list of (timestamp, value), in time order\n" +
            "\n" +
            "    def set(self, key, value, timestamp):\n" +
            "        # TODO: append (timestamp, value) to key's list (create it if missing).\n" +
            "        pass\n" +
            "\n" +
            "    def get(self, key, timestamp):\n" +
            "        # TODO: \"\" if the key is missing. Binary search key's list for the first\n" +
            "        # entry with time > timestamp (lo, hi = 0, len); the answer is at lo - 1,\n" +
            "        # or \"\" when lo is 0.\n" +
            "        return \"\"\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "TimeMap",
        ["python"] = "TimeMap",
    };

    public string? CSharpHarnessPreamble => "public static class TimeMapHarness\n" +
        "{\n" +
        "    public static List<string> Run(string[] ops, string[][] args)\n" +
        "    {\n" +
        "        var map = new TimeMap();\n" +
        "        var results = new List<string>();\n" +
        "        for (var i = 0; i < ops.Length; i++)\n" +
        "        {\n" +
        "            if (ops[i] == \"set\") map.Set(args[i][0], args[i][1], int.Parse(args[i][2]));\n" +
        "            else results.Add(map.Get(args[i][0], int.Parse(args[i][1])));\n" +
        "        }\n" +
        "        return results;\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble => "def run_time_map(ops, args):\n" +
        "    m = TimeMap()\n" +
        "    results = []\n" +
        "    for op, a in zip(ops, args):\n" +
        "        if op == \"set\":\n" +
        "            m.set(a[0], a[1], int(a[2]))\n" +
        "        else:\n" +
        "            results.append(m.get(a[0], int(a[1])))\n" +
        "    return results\n";

    public List<TestCase> TestCases =>
    [
        new TestCase("[\"set\", \"get\", \"get\", \"set\", \"get\", \"get\"], [[\"foo\", \"bar\", \"1\"], [\"foo\", \"1\"], [\"foo\", \"3\"], [\"foo\", \"bar2\", \"4\"], [\"foo\", \"4\"], [\"foo\", \"5\"]]", "[\"bar\",\"bar\",\"bar2\",\"bar2\"]"),
        new TestCase("[\"get\", \"set\", \"get\", \"get\"], [[\"a\", \"5\"], [\"a\", \"x\", \"10\"], [\"a\", \"9\"], [\"a\", \"10\"]]", "[\"\",\"\",\"x\"]"),
        new TestCase("[\"set\", \"set\", \"set\", \"get\", \"get\", \"get\", \"get\"], [[\"k\", \"v1\", \"5\"], [\"k\", \"v2\", \"10\"], [\"other\", \"o\", \"7\"], [\"k\", \"4\"], [\"k\", \"7\"], [\"k\", \"20\"], [\"other\", \"6\"]]", "[\"\",\"v1\",\"v2\",\"\"]"),
        new TestCase("[\"set\", \"set\", \"set\", \"set\", \"get\", \"get\", \"get\"], [[\"love\", \"high\", \"10\"], [\"love\", \"low\", \"20\"], [\"love\", \"mid\", \"30\"], [\"hate\", \"x\", \"15\"], [\"love\", \"5\"], [\"love\", \"25\"], [\"hate\", \"100\"]]", "[\"\",\"low\",\"x\"]"),
    ];

    public string CSharpCallTemplate => "TimeMapHarness.Run({input})";
    public string PythonCallTemplate => "run_time_map({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        (int Time, string Value)[] versions = [(10, "high"), (20, "low"), (30, "mid"), (40, "off")];
        string[] Cells() => versions.Select(v => $"t{v.Time}={v.Value}").ToArray();
        var steps = new List<VisualizationStep>
        {
            new(new() { ["array"] = Cells() }, [], "Four Set calls for one key, at times 10, 20, 30 and 40. Appending kept them in time order. Now Get(key, 25)."),
        };
        const int t = 25;
        int lo = 0, hi = versions.Length;
        while (lo < hi)
        {
            var mid = (lo + hi) / 2;
            var ok = versions[mid].Time <= t;
            steps.Add(new(new() { ["array"] = Cells(), ["tracker"] = mid, ["trackerLabel"] = "mid" }, Enumerable.Range(lo, hi - lo).ToArray(),
                $"Search slots {lo} to {hi - 1}: time {versions[mid].Time} is {(ok ? "<= 25, so the answer is here or later: lo = " + (mid + 1) : "> 25, so look earlier: hi = " + mid)}."));
            if (ok) lo = mid + 1;
            else hi = mid;
        }
        steps.Add(new(new() { ["array"] = Cells() }, [lo - 1], $"lo = {lo}: the first version after 25. The one before it, slot {lo - 1}, was current at 25: \"{versions[lo - 1].Value}\"."));
        return steps;
    }
}
