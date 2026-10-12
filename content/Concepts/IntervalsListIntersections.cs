namespace DsaAcademy.Content.Concepts;

// Transfer exercise after Merge Intervals: two sorted interval lists, and the question is where
// they overlap. Same overlap test, walked with one pointer per list.
public class IntervalsListIntersections : IConcept
{
    public string Id => "intervals-list-intersections";
    public string Track => "patterns";
    public string Title => "Transfer: Intersect Two Interval Lists";
    public string OneLiner => "Two people's busy times, each sorted and non-overlapping. Return the times both are busy, in one pass with a pointer into each list.";
    public string KeyTakeaway =>
        "Two intervals overlap exactly when the later start is not after the earlier end: max(starts) <= " +
        "min(ends), and that range is the overlap. With both lists sorted, the interval that ends first can't " +
        "overlap anything further along the other list, so advance its pointer.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;
    public string? TransferOf => "merge-intervals";

    public string Explanation =>
        "This follows Merge Intervals with an unfamiliar twist: instead of one list to combine, you get two " +
        "lists a and b. Each is sorted by start and has no overlaps inside itself. Return every interval " +
        "where they overlap, in order. Endpoints are inclusive, so [1, 5] and [5, 10] meet in [5, 5].\n\n" +
        "Comparing every interval of a with every interval of b works, at O(n x m). The sorted order gives a " +
        "one pass method. Keep a pointer i into a and j into b. Look at a[i] and b[j]: their overlap, if " +
        "any, runs from lo = max(a[i] start, b[j] start) to hi = min(a[i] end, b[j] end), and it exists when " +
        "lo <= hi. That is the same overlap test Merge Intervals made after sorting, written for two " +
        "intervals at once.\n\n" +
        "Then move on from whichever interval ends first. Say a[i] ends first. Every later interval of b " +
        "starts after b[j] ends (b has no overlaps inside itself), and b[j] ends at or after a[i] does, so " +
        "no later interval of b can reach back to a[i]: it has nothing more to meet, and i++. If they end " +
        "at the same time, either can move. Each step advances one pointer, so the whole walk is O(n + m), " +
        "and the output can hold up to n + m intervals.\n\n" +
        "The visualization intersects a = [[0, 2], [5, 10], [13, 23], [24, 25]] with b = [[1, 5], [8, 12], " +
        "[15, 24], [25, 26]]. The cells are the intersections found so far.\n\n" +
        "Explain why the same idea works: before you move on, write two or three sentences on what this has " +
        "in common with Merge Intervals. Where does the overlap test come from, what does sorted order let " +
        "you throw away at each step, and why is it safe to advance the pointer of the interval that ends " +
        "first?";

    public List<string> RecognitionSignals =>
    [
        "Two (or more) sorted lists of ranges, and you need where they overlap, or where both or neither are busy.",
        "\"Common free time\", \"when are both available\", or intersecting schedules.",
    ];

    public List<string> Gotchas =>
    [
        "Use <= in the overlap test: touching endpoints overlap in a single point here.",
        "Advance the interval that ends first, not the one that starts first, or a long interval in one list misses later partners.",
        "Either list can be empty; the answer is then empty.",
    ];

    public List<string> ConfusableWith =>
    [
        "Merge Intervals combines overlapping intervals from ONE list into their union; this finds the intersection of TWO lists that are already sorted.",
        "Linked List Pointers: Merge Two Sorted Lists uses the same two pointer walk over two sorted inputs, advancing whichever is smaller.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[][] IntervalIntersection(int[][] a, int[][] b)\n" +
            "    {\n" +
            "        // TODO: i = 0 into a, j = 0 into b. While both are in range:\n" +
            "        // lo = max of the two starts, hi = min of the two ends; if lo <= hi,\n" +
            "        // add [lo, hi]. Then advance the pointer whose interval ends first\n" +
            "        // (if a[i] ends first, i++; otherwise j++).\n" +
            "        return new int[0][];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def interval_intersection(a, b):\n" +
            "    # TODO: i = 0 into a, j = 0 into b. While both are in range:\n" +
            "    # lo = max of the two starts, hi = min of the two ends; if lo <= hi,\n" +
            "    # add [lo, hi]. Then advance the pointer whose interval ends first\n" +
            "    # (if a[i] ends first, i += 1; otherwise j += 1).\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.IntervalIntersection",
        ["python"] = "interval_intersection",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[[0, 2], [5, 10], [13, 23], [24, 25]], [[1, 5], [8, 12], [15, 24], [25, 26]]",
            "[[1,2],[5,5],[8,10],[15,23],[24,24],[25,25]]"),
        new TestCase("[[1, 3], [5, 9]], []", "[]"),
        new TestCase("[], [[4, 8]]", "[]"),
        new TestCase("[[1, 7]], [[3, 10]]", "[[3,7]]"),
        new TestCase("[[1, 2]], [[3, 4]]", "[]"),
        new TestCase("[[3, 10]], [[5, 10]]", "[[5,10]]"),
        new TestCase("[[1, 5]], [[2, 3], [4, 6]]", "[[2,3],[4,5]]"),
        new TestCase("[[0, 100]], [[1, 2], [10, 20], [50, 60], [99, 120]]", "[[1,2],[10,20],[50,60],[99,100]]"),
    ];

    public string CSharpCallTemplate => "Solution.IntervalIntersection({input})";
    public string PythonCallTemplate => "interval_intersection({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[][] a = [[0, 2], [5, 10], [13, 23], [24, 25]];
        int[][] b = [[1, 5], [8, 12], [15, 24], [25, 26]];
        var found = new List<string>();
        var steps = new List<VisualizationStep>();

        Dictionary<string, object> State() => new()
        {
            ["array"] = found.Count == 0 ? new object[] { "(none yet)" } : found.Select(f => (object)f).ToArray(),
            ["tracker"] = found.Count,
            ["trackerLabel"] = "intersections",
        };

        steps.Add(new VisualizationStep(State(), [],
            "i points at a[0] = [0, 2], j at b[0] = [1, 5]. Each step: test the overlap, then advance whichever interval ends first."));

        int i = 0, j = 0;
        while (i < a.Length && j < b.Length)
        {
            var lo = Math.Max(a[i][0], b[j][0]);
            var hi = Math.Min(a[i][1], b[j][1]);
            var pair = $"a[{i}] = [{a[i][0]}, {a[i][1]}] and b[{j}] = [{b[j][0]}, {b[j][1]}]";
            string overlap;
            if (lo <= hi)
            {
                found.Add($"[{lo},{hi}]");
                overlap = $"max start {lo} <= min end {hi}, so they overlap in [{lo}, {hi}]";
            }
            else
            {
                overlap = $"max start {lo} > min end {hi}, so no overlap";
            }
            var move = a[i][1] < b[j][1] ? $"a[{i}] ends first: i++" : $"b[{j}] ends first (or they tie): j++";
            steps.Add(new VisualizationStep(State(), lo <= hi ? [found.Count - 1] : [],
                $"{pair}: {overlap}. {move}."));
            if (a[i][1] < b[j][1]) i++;
            else j++;
        }

        steps.Add(new VisualizationStep(State(), [],
            $"One list ran out, so nothing else can overlap. {found.Count} intersections in O(n + m) steps."));
        return steps;
    }
}
