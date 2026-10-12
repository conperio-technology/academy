namespace DsaAcademy.Content.Concepts;

public class SlidingWindowLongestUnique : IConcept
{
    public string Id => "sliding-window-longest-unique";
    public string Track => "patterns";
    public string Title => "Sliding Window (Variable Size): Longest Substring Without Repeats";
    public string OneLiner => "Grow the window on the right; when it breaks the rule, shrink it from the left until it's valid again.";
    public string KeyTakeaway =>
        "A variable-size window keeps one invariant -- here, \"no character appears twice\". Extend right " +
        "by one each step; while the invariant is broken, move left forward. Each index enters and leaves " +
        "the window at most once, so the whole scan is O(n) even though there's a loop inside a loop.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "The fixed-size sliding window lesson moved a window of exactly k elements. Many real problems " +
        "don't give you k: they give you a rule the window must satisfy and ask for the longest (or " +
        "shortest) window that does. Longest substring with no repeated character is the classic one: in " +
        "\"abcabcbb\" the answer is 3 (\"abc\").\n\n" +
        "Keep two indices, left and right, and a set (or count map) of the characters currently in the " +
        "window. Each step, move right forward and look at the new character. If it's already in the " +
        "window, the rule is broken, so remove characters from the left end (and move left forward) until " +
        "the duplicate is gone. Then add the new character and record the window size, right - left + 1, " +
        "if it's the best so far.\n\n" +
        "It looks quadratic -- there's a while loop inside the for loop -- but left only ever moves " +
        "forward, so across the whole run it moves at most n times. Every character is added once and " +
        "removed at most once: O(n). (A refinement stores each character's last index in a map and jumps " +
        "left straight past it instead of stepping.)\n\n" +
        "The same grow-then-shrink loop solves \"smallest subarray with sum ≥ target\", \"longest substring " +
        "with at most k distinct characters\" and many more -- only the rule and what you track change.";

    public List<string> RecognitionSignals =>
    [
        "Longest or shortest CONTIGUOUS substring/subarray that satisfies a condition (no repeats, at most k distinct, sum at least X).",
        "No fixed window size is given -- the condition decides how big the window can be.",
        "Once a window breaks the rule, any larger window containing it also breaks it, so shrinking from the left is safe.",
    ];

    public List<string> Gotchas =>
    [
        "Shrink with a WHILE loop, not an if -- the duplicate may be several characters back from left.",
        "Remove the left character from the set before moving left forward, or the set and the window drift apart.",
        "Measure the window AFTER restoring the rule, not before; size is right - left + 1.",
    ];

    public List<string> ConfusableWith =>
    [
        "Sliding Window: Max Sum Subarray of Size K (this track) is the fixed-size version: both ends move together every step. Here the right end always advances but the left end only moves when the rule breaks.",
        "Two Pointers (this track): both use two indices, but two pointers usually start at opposite ends and close in; window pointers both move left to right.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "using System.Collections.Generic;\n\n" +
            "public class Solution\n" +
            "{\n" +
            "    public static int LengthOfLongestSubstring(string s)\n" +
            "    {\n" +
            "        // TODO: left = 0, a HashSet<char> of characters in the window.\n" +
            "        // For each right: while s[right] is in the set, remove s[left]\n" +
            "        // and left++. Then add s[right] and track the best\n" +
            "        // right - left + 1.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def length_of_longest_substring(s):\n" +
            "    # TODO: left = 0, a set of characters in the window. For each right:\n" +
            "    # while s[right] is in the set, remove s[left] and left += 1. Then\n" +
            "    # add s[right] and track the best right - left + 1.\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.LengthOfLongestSubstring",
        ["python"] = "length_of_longest_substring",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Str("abcabcbb"), "3"),
        new TestCase(Lit.Str("bbbbb"), "1"),
        new TestCase(Lit.Str("pwwkew"), "3"),
        new TestCase(Lit.Str(""), "0"),
        new TestCase(Lit.Str("dvdf"), "3"),
        new TestCase(Lit.Str("abba"), "2"),
        new TestCase(Lit.Str("conperio academy"), "9"),
    ];

    public string CSharpCallTemplate => "Solution.LengthOfLongestSubstring({input})";
    public string PythonCallTemplate => "length_of_longest_substring({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const string s = "abcabcbb";
        var chars = s.Select(c => (object)c.ToString()).ToArray();
        var window = new HashSet<char>();
        var steps = new List<VisualizationStep>();
        int left = 0, best = 0;

        for (var right = 0; right < s.Length; right++)
        {
            var dropped = new List<char>();
            while (window.Contains(s[right]))
            {
                window.Remove(s[left]);
                dropped.Add(s[left]);
                left++;
            }
            window.Add(s[right]);
            best = Math.Max(best, right - left + 1);
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = chars, ["tracker"] = best, ["trackerLabel"] = "longest so far" },
                HighlightIndices: Enumerable.Range(left, right - left + 1).ToArray(),
                Message: dropped.Count == 0
                    ? $"Add '{s[right]}': no repeat, window \"{s[left..(right + 1)]}\" has size {right - left + 1}."
                    : $"Add '{s[right]}': already in the window, so drop \"{string.Concat(dropped)}\" from the left. Window is now \"{s[left..(right + 1)]}\"."
            ));
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = chars, ["tracker"] = best, ["trackerLabel"] = "longest so far" },
            HighlightIndices: [],
            Message: $"Done: the longest window without a repeat had {best} characters. left moved forward {left} times in total."
        ));
        return steps;
    }
}
