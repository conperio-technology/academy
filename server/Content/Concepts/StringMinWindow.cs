namespace DsaAcademy.Content.Concepts;

public class StringMinWindow : IConcept
{
    public string Id => "string-min-window";
    public string Track => "patterns";
    public string Title => "Sliding Window: Minimum Window Substring";
    public string OneLiner => "Grow the window to the right until it covers every character of t, then shrink it from the left for as long as it still does.";
    public string KeyTakeaway =>
        "For \"shortest window that satisfies X\", expand right until the window is valid, then shrink left " +
        "while it stays valid, recording the best each time. A single counter of how many required " +
        "characters are still missing makes the validity check O(1), so the whole scan is O(n + m) even " +
        "though there are O(n²) possible substrings.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Given strings s and t (t is non-empty), return the shortest substring of s that contains every " +
        "character of t, counting repeats: if t is \"aab\", the window needs two a's and a b. Return \"\" if no " +
        "such substring exists. If several shortest windows exist, return the leftmost. For s = " +
        "\"ADOBECODEBANC\" and t = \"ABC\" the answer is \"BANC\".\n\n" +
        "Checking all O(n²) substrings, each with an O(m) comparison, is far too slow. The sliding window " +
        "works because of one fact: if a window [left, right] covers t, every window that contains it does " +
        "too, and if it doesn't cover t, none of its sub-windows do. So for each right end you only care " +
        "about the largest left that still covers t, and that left never has to move backwards as right " +
        "moves forward.\n\n" +
        "Keep need, a count per character of how many more copies the window still requires (start it at " +
        "t's counts), and missing, the total still required (start it at t's length). When right takes in a " +
        "character c: if need[c] > 0, this copy was required, so missing decreases. Either way, decrement " +
        "need[c]; a negative value just means the window has a surplus of c. Once missing hits 0, the window " +
        "is valid: record it if it's the shortest so far, then remove s[left] by incrementing its need. If " +
        "that need becomes positive, the window just lost a required copy, so missing goes back up and you " +
        "return to expanding. Otherwise keep shrinking.\n\n" +
        "right visits each index once and left only moves forward, so each character is added once and " +
        "removed at most once: O(n + m) time, where building the counts from t is the m. The map holds at " +
        "most the distinct characters of t (plus any from s you choose to store), bounded by the alphabet. " +
        "This is the hardest of the variable-size window problems because the validity condition is about " +
        "counts, not just \"no repeats\"; the same need/missing bookkeeping solves \"find all anagrams of p " +
        "in s\" and \"permutation in string\" (where the window size is fixed at m).\n\n" +
        "The visualization shows the moments the window covers \"ABC\" and how far it can shrink each time.";

    public List<string> RecognitionSignals =>
    [
        "The SHORTEST (or longest) contiguous substring or subarray that satisfies a condition about what it contains.",
        "The condition is about character counts (\"contains all of\", \"at most k distinct\", \"every char of t with multiplicity\").",
        "Once a window is valid, growing it keeps it valid, so the left edge never needs to move back.",
    ];

    public List<string> Gotchas =>
    [
        "Multiplicity counts: t = \"aa\" needs two a's. A set of required characters instead of a count map passes \"ADOBECODEBANC\" and fails on repeats.",
        "Only decrement missing when need[c] was positive BEFORE this character, and only increment it when need becomes positive AFTER removing one. Surplus copies must not change missing.",
        "Record the best window inside the shrinking loop, before removing s[left], not after the loop; after the loop the window is already invalid.",
        "Track the best start and length and slice once at the end. Building a substring every time you find a better window adds O(window length) work on every improvement, which can make the scan quadratic.",
    ];

    public List<string> ConfusableWith =>
    [
        "Sliding Window (Variable Size): Longest Substring Without Repeats (this track) also expands right and shrinks left, but it wants the LONGEST valid window and shrinks only when the window becomes invalid. Here you want the SHORTEST and shrink while it is still valid.",
        "Two Pointers on a sorted array move toward each other based on a comparison. Here both pointers move in the same direction over unsorted text, and the decision depends on the window's contents.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static string MinWindow(string s, string t)\n" +
            "    {\n" +
            "        // TODO: need[c] = count of c in t; missing = t.Length. For each right:\n" +
            "        // if need[s[right]] > 0, missing--; then need[s[right]]--.\n" +
            "        // While missing == 0: record (left, length) if shorter than the best,\n" +
            "        // then need[s[left]]++; if it became > 0, missing++; left++.\n" +
            "        // Return the best substring, or \"\" if none was found.\n" +
            "        return \"?\";\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def min_window(s, t):\n" +
            "    # TODO: need[c] = count of c in t; missing = len(t). For each right:\n" +
            "    # if need[s[right]] > 0, missing -= 1; then need[s[right]] -= 1.\n" +
            "    # While missing == 0: record (left, length) if shorter than the best,\n" +
            "    # then need[s[left]] += 1; if it became > 0, missing += 1; left += 1.\n" +
            "    # Return the best substring, or \"\" if none was found.\n" +
            "    return \"?\"\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MinWindow",
        ["python"] = "min_window",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.Str("ADOBECODEBANC"), Lit.Str("ABC")), "\"BANC\""),
        new TestCase(Lit.Args(Lit.Str("a"), Lit.Str("a")), "\"a\""),
        new TestCase(Lit.Args(Lit.Str("a"), Lit.Str("aa")), "\"\""),
        new TestCase(Lit.Args(Lit.Str("aa"), Lit.Str("aa")), "\"aa\""),
        new TestCase(Lit.Args(Lit.Str("ab"), Lit.Str("b")), "\"b\""),
        new TestCase(Lit.Args(Lit.Str("bba"), Lit.Str("ab")), "\"ba\""),
        new TestCase(Lit.Args(Lit.Str("cabwefgewcwaefgcf"), Lit.Str("cae")), "\"cwae\""),
        new TestCase(Lit.Args(Lit.Str("xyz"), Lit.Str("q")), "\"\""),
    ];

    public string CSharpCallTemplate => "Solution.MinWindow({input})";
    public string PythonCallTemplate => "min_window({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const string s = "ADOBECODEBANC";
        const string t = "ABC";
        var arr = s.Select(c => (object)c.ToString()).ToArray();
        var steps = new List<VisualizationStep>();
        var need = new Dictionary<char, int>();
        foreach (var c in t) need[c] = need.GetValueOrDefault(c) + 1;
        var missing = t.Length;
        int bestStart = 0, bestLen = int.MaxValue;
        var left = 0;

        int[] Window(int from, int to) => Enumerable.Range(from, to - from + 1).ToArray();
        string Best() => bestLen == int.MaxValue ? "none yet" : $"\"{s.Substring(bestStart, bestLen)}\"";

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = arr, ["tracker"] = missing, ["trackerLabel"] = "missing" },
            HighlightIndices: [],
            Message: $"Find the shortest window of s containing A, B and C. need = {{A: 1, B: 1, C: 1}}, missing = {missing}. Expand right until missing hits 0."
        ));

        for (var right = 0; right < s.Length; right++)
        {
            var c = s[right];
            if (need.GetValueOrDefault(c) > 0) missing--;
            need[c] = need.GetValueOrDefault(c) - 1;
            if (missing > 0) continue;

            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = arr, ["tracker"] = missing, ["trackerLabel"] = "missing" },
                HighlightIndices: Window(left, right),
                Message: $"right = {right} ('{c}'): the window \"{s.Substring(left, right - left + 1)}\" now covers A, B and C. Start shrinking from the left."
            ));

            while (missing == 0)
            {
                if (right - left + 1 < bestLen)
                {
                    bestStart = left;
                    bestLen = right - left + 1;
                }
                var outChar = s[left];
                need[outChar]++;
                if (need[outChar] > 0) missing++;
                left++;

                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = arr, ["tracker"] = missing, ["trackerLabel"] = "missing" },
                    HighlightIndices: left <= right ? Window(left, right) : [],
                    Message: missing > 0
                        ? $"Drop '{outChar}': it was the window's only copy of a required character, so missing = {missing}. Best so far {Best()}. Expand right again."
                        : $"Drop '{outChar}': not needed (or a surplus copy), the window is still valid. Best so far {Best()}."
                ));
            }
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = arr, ["tracker"] = bestLen, ["trackerLabel"] = "best length" },
            HighlightIndices: Window(bestStart, bestStart + bestLen - 1),
            Message: $"right reached the end. Shortest window: {Best()}. Each character entered and left the window at most once."
        ));
        return steps;
    }
}
