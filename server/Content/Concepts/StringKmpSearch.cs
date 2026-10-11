namespace DsaAcademy.Content.Concepts;

public class StringKmpSearch : IConcept
{
    public string Id => "string-kmp-search";
    public string Track => "patterns";
    public string Title => "String Matching: KMP Search";
    public string OneLiner => "Find every occurrence of a pattern in O(n + m) by precomputing, for each prefix of the pattern, how much of it can be reused after a mismatch.";
    public string KeyTakeaway =>
        "When a match fails after j characters, those j characters of text are already known: they equal " +
        "pattern[0..j-1]. KMP precomputes lps[j-1], the longest proper prefix of that piece which is also a " +
        "suffix of it, and jumps j straight there without moving back in the text. The text pointer only " +
        "moves forward, so the search is O(n) after an O(m) precomputation.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Given a text and a non-empty pattern, return every index where the pattern starts in the text, in " +
        "increasing order. Matches may overlap: \"aa\" occurs in \"aaaaa\" at 0, 1, 2 and 3. The goal is " +
        "O(n + m) for a text of length n and a pattern of length m.\n\n" +
        "The naive search tries every start position and compares up to m characters there, so it's O(n·m) " +
        "in the worst case. Search for \"aaaa...ab\" (1,000 a's then a b) in a text of 2,000 a's and a b: at " +
        "almost every start, the naive loop matches 1,000 a's, fails on the b, then moves the start forward " +
        "by one and compares nearly the same 1,000 a's again. All that rework is information it already had.\n\n" +
        "KMP keeps that information. Define the prefix function, also called the failure function or lps " +
        "(longest proper prefix that is also a suffix): lps[i] is the length of the longest string that is " +
        "both a proper prefix and a suffix of pattern[0..i]. For \"abab\" it's [0, 0, 1, 2]: \"abab\" ends " +
        "with \"ab\", which is also how it starts. Now scan the text with j = the number of pattern " +
        "characters currently matched. If text[i] == pattern[j], j++. If they differ and j > 0, set j = " +
        "lps[j - 1] and compare text[i] again: the last lps[j - 1] matched characters are already a prefix " +
        "of the pattern, so you continue from there instead of starting over. If j == 0 and they differ, " +
        "just move i on. When j reaches m, record a match at i - m + 1, then set j = lps[m - 1] so " +
        "overlapping matches are found.\n\n" +
        "Building lps is the same algorithm run on the pattern against itself: keep length = lps[i - 1]; " +
        "while pattern[i] != pattern[length] and length > 0, fall back with length = lps[length - 1]; if " +
        "they match, length++; then lps[i] = length. Each fallback undoes at least one earlier increment, " +
        "so both loops are linear overall: O(m) to build, O(n) to search, O(m) extra space.\n\n" +
        "In practice, library calls like IndexOf and str.find are fine for a single lookup. KMP matters when " +
        "you need a worst-case guarantee, all occurrences, or the prefix function itself: it also answers " +
        "\"shortest period of a string\" (m - lps[m - 1]), \"longest prefix that is also a suffix\", and " +
        "\"shortest palindrome by adding characters in front\". Rabin-Karp (rolling hash) is the other " +
        "standard linear-time approach; it's simpler to extend to many patterns but needs a collision check.\n\n" +
        "The visualization first builds lps for \"abab\", then searches \"abacababab\", where one mismatch falls back twice and two matches overlap.";

    public List<string> RecognitionSignals =>
    [
        "Find a pattern (or all of its occurrences) in a long text with a guaranteed linear bound, especially with repetitive inputs like \"aaaa...ab\".",
        "Questions about a string's borders: its period, its longest prefix that is also a suffix, or whether it is a repetition of a smaller block.",
        "You notice a naive matcher re-reading text it has already compared after every mismatch.",
    ];

    public List<string> Gotchas =>
    [
        "On a mismatch, don't advance the text pointer: fall back with j = lps[j - 1] and compare the SAME text character again, possibly several times.",
        "After a full match, set j = lps[m - 1], not 0. Resetting to 0 misses overlapping matches like \"abab\" at index 2 in \"abababab\".",
        "lps[i] is about pattern[0..i] inclusive and must be a PROPER prefix (shorter than the whole piece), so lps[0] is always 0 and the build loop starts at i = 1.",
    ];

    public List<string> ConfusableWith =>
    [
        "Naive search (try every start, compare up to m characters) gives the same answers and is what IndexOf-style loops do. It's O(n·m) in the worst case, which repetitive inputs expose.",
        "Rabin-Karp compares rolling hashes of each length-m window instead, also O(n + m) on average. It extends easily to many patterns at once but must verify on a hash match, and a bad hash degrades it to O(n·m).",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static List<int> FindOccurrences(string text, string pattern)\n" +
            "    {\n" +
            "        // TODO: build lps: lps[i] = length of the longest proper prefix of\n" +
            "        // pattern[0..i] that is also a suffix of it. Then scan the text with\n" +
            "        // j = characters matched: while j > 0 and text[i] != pattern[j],\n" +
            "        // j = lps[j - 1]. If they match, j++. When j == pattern.Length, record\n" +
            "        // i - j + 1 and set j = lps[j - 1] so overlapping matches are found.\n" +
            "        return new List<int>();\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def find_occurrences(text, pattern):\n" +
            "    # TODO: build lps: lps[i] = length of the longest proper prefix of\n" +
            "    # pattern[:i + 1] that is also a suffix of it. Then scan the text with\n" +
            "    # j = characters matched: while j > 0 and text[i] != pattern[j],\n" +
            "    # j = lps[j - 1]. If they match, j += 1. When j == len(pattern), record\n" +
            "    # i - j + 1 and set j = lps[j - 1] so overlapping matches are found.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.FindOccurrences",
        ["python"] = "find_occurrences",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.Str("abababab"), Lit.Str("abab")), "[0,2,4]"),
        new TestCase(Lit.Args(Lit.Str("hello world"), Lit.Str("o")), "[4,7]"),
        new TestCase(Lit.Args(Lit.Str("aaaaa"), Lit.Str("aa")), "[0,1,2,3]"),
        new TestCase(Lit.Args(Lit.Str("abc"), Lit.Str("abcd")), "[]"),
        new TestCase(Lit.Args(Lit.Str("abcxabcdabxabcdabcdabcy"), Lit.Str("abcdabcy")), "[15]"),
        new TestCase(Lit.Args(Lit.Str("aabaaabaaac"), Lit.Str("aabaaac")), "[4]"),
        // The naive matcher's worst case: ~1,000 comparisons at almost every start position.
        new TestCase(Lit.Args(Lit.Str(new string('a', 400) + "b"), Lit.Str(new string('a', 200) + "b")), "[200]"),
        new TestCase(Lit.Args(Lit.Str(new string('a', 600)), Lit.Str(new string('a', 300) + "b")), "[]"),
    ];

    public string CSharpCallTemplate => "Solution.FindOccurrences({input})";
    public string PythonCallTemplate => "find_occurrences({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const string pattern = "abab";
        const string text = "abacababab";
        var steps = new List<VisualizationStep>();
        var patternCells = pattern.Select(c => (object)c.ToString()).ToArray();
        var textCells = text.Select(c => (object)c.ToString()).ToArray();
        var lps = new int[pattern.Length];

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = patternCells, ["tracker"] = 0, ["trackerLabel"] = "lps[0]" },
            HighlightIndices: [0],
            Message: "Step 1: build lps for the pattern \"abab\". lps[0] is always 0: a single character has no proper prefix that is also a suffix."
        ));

        var length = 0;
        for (var i = 1; i < pattern.Length; i++)
        {
            while (length > 0 && pattern[i] != pattern[length]) length = lps[length - 1];
            if (pattern[i] == pattern[length]) length++;
            lps[i] = length;
            var piece = pattern[..(i + 1)];
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = patternCells, ["tracker"] = lps[i], ["trackerLabel"] = $"lps[{i}]" },
                HighlightIndices: Enumerable.Range(0, i + 1).ToArray(),
                Message: lps[i] == 0
                    ? $"\"{piece}\": no proper prefix is also a suffix, so lps[{i}] = 0."
                    : $"\"{piece}\" starts and ends with \"{piece[..lps[i]]}\", so lps[{i}] = {lps[i]}."
            ));
        }

        var lpsText = $"[{string.Join(", ", lps)}]";
        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = textCells, ["tracker"] = 0, ["trackerLabel"] = "j (pattern chars matched)" },
            HighlightIndices: [],
            Message: $"Step 2: scan the text \"{text}\" with lps = {lpsText}. j counts how many pattern characters currently match. The text pointer never moves back."
        ));

        var matches = new List<int>();
        var j = 0;
        for (var i = 0; i < text.Length; i++)
        {
            var notes = new List<string>();
            while (j > 0 && text[i] != pattern[j])
            {
                notes.Add($"'{text[i]}' != pattern[{j}] = '{pattern[j]}', fall back j = lps[{j - 1}] = {lps[j - 1]}");
                j = lps[j - 1];
            }
            if (text[i] == pattern[j])
            {
                j++;
                notes.Add($"matches pattern[{j - 1}], j = {j}");
            }
            else
            {
                notes.Add($"'{text[i]}' != pattern[0] either, j stays 0 and i moves on");
            }

            var matched = j == pattern.Length;
            if (matched)
            {
                matches.Add(i - j + 1);
                notes.Add($"full match at {i - j + 1}, so record it and set j = lps[{j - 1}] = {lps[j - 1]} to keep overlaps");
            }

            var highlight = Enumerable.Range(i - j + 1, j).ToArray();
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = textCells, ["tracker"] = matched ? lps[j - 1] : j, ["trackerLabel"] = "j (pattern chars matched)" },
                HighlightIndices: highlight,
                Message: $"i = {i} ('{text[i]}'): {string.Join("; ", notes)}."
            ));
            if (matched) j = lps[j - 1];
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = textCells },
            HighlightIndices: [],
            Message: $"Done: [{string.Join(", ", matches)}]. The text pointer only moved forward: the mismatch at the c fell back through lps instead of restarting, and the overlapping match came from j = lps[3] after the first one."
        ));
        return steps;
    }
}
