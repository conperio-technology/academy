namespace DsaAcademy.Content.Concepts;

public class GreedyPartitionLabels : IConcept
{
    public string Id => "greedy-partition-labels";
    public string Track => "greedy";
    public int Order => 111;
    public string Title => "Greedy: Partition Labels";
    public string OneLiner => "Cut a string into as many pieces as possible so each letter lives in one piece: record each letter's last index, then close a piece when you reach the furthest last index seen.";
    public string KeyTakeaway =>
        "A piece that contains a letter must stretch to that letter's LAST occurrence. So store last[c] for every " +
        "letter, then scan: end = max(end, last[s[i]]). When i == end, nothing inside the piece appears later, so " +
        "cut there. Cutting as early as possible is what makes the piece count as large as possible: O(n) time, " +
        "O(1) space for a fixed 26-letter alphabet.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Split a string of lowercase letters into as many parts as possible so that each letter appears in at " +
        "most one part, and return the length of each part in order. For \"ababcbacadefegdehijhklij\" the answer " +
        "is [9, 7, 8]: \"ababcbaca\", \"defegde\", \"hijhklij\". Joining the parts back together must give the " +
        "original string, so you're choosing where to cut, not rearranging.\n\n" +
        "Think about the first part. It starts at index 0, so it contains s[0], so it must reach at least the last " +
        "occurrence of s[0]. Every letter inside that stretch drags the end further, to its own last occurrence. " +
        "Once the scan reaches the current end and nothing has pushed it further, the part is self-contained, and " +
        "cutting right there is the earliest legal cut. Cutting as early as possible is safe (and so greedy works) " +
        "because an earlier cut never forces a later one to move: the rest of the string has exactly the same " +
        "constraints either way, so it can be split just as finely.\n\n" +
        "Two passes. First, last[c] = the final index of each letter (an int[26] in C#, or a dict in Python). " +
        "Second, scan with start = 0 and end = 0: at each i set end = max(end, last[s[i]]); when i == end, append " +
        "end - start + 1 and set start = i + 1. Both passes are O(n). The extra space is 26 counters no matter how " +
        "long the string is, which counts as O(1).\n\n" +
        "In C#, s[i] - 'a' turns a char into 0 to 25 (a char subtracts as a number). In Python, use ord(ch) - " +
        "ord('a'), or just key a dict by the character.\n\n" +
        "The visualization scans \"abacdcbe\": the highlighted cells are the current part and the tracker is end.";

    public List<string> RecognitionSignals =>
    [
        "\"Each character / value appears in at most one part\" with parts kept in their original order.",
        "The answer depends on the first and last position of each item: precompute last occurrences.",
        "Maximise the number of parts, so cut as early as is legal.",
    ];

    public List<string> Gotchas =>
    [
        "end only grows: use max(end, last[s[i]]), never assign last[s[i]] directly.",
        "The part length is end - start + 1, and the next part starts at i + 1.",
        "Sorting or rearranging the letters changes the problem; the parts must stay contiguous and in order.",
    ];

    public List<string> ConfusableWith =>
    [
        "Merge Intervals: each letter defines an interval [first, last], and the parts are exactly the merged intervals. This lesson gets them in one pass without building or sorting intervals.",
        "Sliding Window: both scan with a moving boundary, but a window shrinks from the left; here a part only grows until it closes for good.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "using System.Collections.Generic;\n\n" +
            "public class Solution\n" +
            "{\n" +
            "    public static List<int> PartitionLabels(string s)\n" +
            "    {\n" +
            "        // TODO: last[c] = the last index of each letter (int[26], use s[i] - 'a').\n" +
            "        // Scan with start = 0, end = 0: end = max(end, last[s[i] - 'a']).\n" +
            "        // When i == end, add end - start + 1 to the result and set start = i + 1.\n" +
            "        return new List<int>();\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def partition_labels(s):\n" +
            "    # TODO: last[ch] = the last index of each letter.\n" +
            "    # Scan with start = 0, end = 0: end = max(end, last[s[i]]).\n" +
            "    # When i == end, append end - start + 1 and set start = i + 1.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.PartitionLabels",
        ["python"] = "partition_labels",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Str("ababcbacadefegdehijhklij"), "[9, 7, 8]"),
        new TestCase(Lit.Str("eccbbbbdec"), "[10]"),
        new TestCase(Lit.Str("a"), "[1]"),
        new TestCase(Lit.Str("abc"), "[1, 1, 1]"),
        new TestCase(Lit.Str("aabbcc"), "[2, 2, 2]"),
        new TestCase(Lit.Str("abac"), "[3, 1]"),
        new TestCase(Lit.Str("caedbdedda"), "[1, 9]"),
        new TestCase(Lit.Str("abacdcbe"), "[7, 1]"),
    ];

    public string CSharpCallTemplate => "Solution.PartitionLabels({input})";
    public string PythonCallTemplate => "partition_labels({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const string s = "abacdcbe";
        var cells = s.Select(ch => (object)ch.ToString()).ToArray();
        var last = new Dictionary<char, int>();
        for (var i = 0; i < s.Length; i++) last[s[i]] = i;
        var steps = new List<VisualizationStep>();
        var parts = new List<int>();
        int start = 0, end = 0;

        Dictionary<string, object> State() => new()
        {
            ["array"] = cells,
            ["tracker"] = end,
            ["trackerLabel"] = "end of current part",
        };

        steps.Add(new VisualizationStep(State(), [],
            "s = \"abacdcbe\". First pass: last index of each letter is a:2, b:6, c:5, d:4, e:7. Second pass: grow the current part to the furthest last index of any letter inside it."));

        for (var i = 0; i < s.Length; i++)
        {
            var before = end;
            end = Math.Max(end, last[s[i]]);
            var part = Enumerable.Range(start, i - start + 1).ToArray();
            var grow = end > before ? $"last['{s[i]}'] = {last[s[i]]} pushes end to {end}." : $"last['{s[i]}'] = {last[s[i]]} is within end = {end}.";
            if (i == end)
            {
                parts.Add(end - start + 1);
                steps.Add(new VisualizationStep(State(), part,
                    $"i = {i}: {grow} i == end, so every letter in this part is finished: cut. Part length {end - start + 1}; parts so far [{string.Join(", ", parts)}]."));
                start = i + 1;
            }
            else
            {
                steps.Add(new VisualizationStep(State(), part, $"i = {i}: {grow}"));
            }
        }

        steps.Add(new VisualizationStep(State(), [],
            $"Done: [{string.Join(", ", parts)}]. The 'b' at index 1 forced the first part all the way to index 6."));
        return steps;
    }
}
