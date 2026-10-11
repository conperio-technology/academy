namespace DsaAcademy.Content.Concepts;

// Transfer exercise after Longest Substring Without Repeats: same grow-then-shrink window, but
// the rule changes from "no repeats" to "at most k characters differ from the most common one".
public class SlidingWindowCharReplacement : IConcept
{
    public string Id => "sliding-window-char-replacement";
    public string Track => "patterns";
    public string Title => "Transfer: Longest Repeating Character Replacement";
    public string OneLiner => "Change at most k letters to get the longest run of one letter. Same variable window as the no-repeats lesson; only the rule it keeps changes.";
    public string KeyTakeaway =>
        "A window can become all one letter with at most k changes exactly when its length minus the count " +
        "of its most common letter is at most k. Keep letter counts for the window, grow right every step, " +
        "and shrink from the left while length - maxCount > k. Each index enters and leaves once: O(n).";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;
    public string? TransferOf => "sliding-window-longest-unique";

    public string Explanation =>
        "This follows Longest Substring Without Repeats with the rule changed. You get a string s of " +
        "uppercase letters and a number k. You may change any character to any other uppercase letter, at " +
        "most k times in total. Return the length of the longest run of one repeated letter you can end up " +
        "with. For \"AABABBA\" and k = 1 the answer is 4: change the middle A of \"BABB\" to get \"BBBB\".\n\n" +
        "Look at one window and ask what it costs to make it all one letter. The cheapest plan keeps the " +
        "letter that already appears most often and changes everything else, so the cost is the window " +
        "length minus the count of its most common letter. The window is usable when that cost is at most " +
        "k. That is the rule the window has to keep, in place of \"no character twice\".\n\n" +
        "The loop is the one you already know. Keep a count per letter (an array of 26) for the window. " +
        "Move right forward, add s[right] to the counts and update maxCount, the largest count seen. While " +
        "(right - left + 1) - maxCount > k, the window costs too much: subtract s[left] from the counts and " +
        "move left forward. Then record right - left + 1 if it is the best so far.\n\n" +
        "A detail that surprises people: when you shrink, you do not need to lower maxCount. A stale, too " +
        "high maxCount can only let a window that is not truly valid survive at the same length as the best " +
        "one already found, never longer, so the answer is unchanged. The answer only grows when a real " +
        "letter count beats the old maxCount. Recomputing the true maximum over 26 counts is also fine; it " +
        "is O(26) per step, still O(n) overall.\n\n" +
        "The visualization runs \"AABABBA\" with k = 1; the highlighted cells are the window.\n\n" +
        "Explain why the same idea works: before you move on, write two or three sentences comparing this " +
        "with Longest Substring Without Repeats. What is the rule each window keeps, why is it still safe " +
        "to shrink only from the left when the rule breaks, and why does the scan stay O(n)?";

    public List<string> RecognitionSignals =>
    [
        "Longest contiguous run you can make uniform (or valid) with a budget of at most k changes, flips or deletions.",
        "Whether a window is fixable depends only on counts inside it, so adding on the right and removing on the left are cheap.",
    ];

    public List<string> Gotchas =>
    [
        "The cost of a window is its length minus the count of its MOST common letter, not the number of distinct letters.",
        "Shrink while the cost is above k (a while loop, as in the parent lesson), and only then measure the window.",
        "k can be larger than the string: the answer is then the whole length, not more.",
    ];

    public List<string> ConfusableWith =>
    [
        "Sliding Window (Variable Size): Longest Substring Without Repeats keeps \"no character twice\"; this keeps \"at most k characters differ from the most common one\". Same loop, different rule.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int CharacterReplacement(string s, int k)\n" +
            "    {\n" +
            "        // TODO: counts = new int[26], left = 0, maxCount = 0. For each right:\n" +
            "        // counts[s[right] - 'A']++ and update maxCount. While\n" +
            "        // (right - left + 1) - maxCount > k: counts[s[left] - 'A']-- and left++.\n" +
            "        // Then track the best right - left + 1.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def character_replacement(s, k):\n" +
            "    # TODO: counts = a dict (or a list of 26), left = 0, max_count = 0.\n" +
            "    # For each right: add s[right] to counts and update max_count. While\n" +
            "    # (right - left + 1) - max_count > k: remove s[left] from counts and\n" +
            "    # left += 1. Then track the best right - left + 1.\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CharacterReplacement",
        ["python"] = "character_replacement",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.Str("ABAB"), Lit.Int(2)), "4"),
        new TestCase(Lit.Args(Lit.Str("AABABBA"), Lit.Int(1)), "4"),
        new TestCase(Lit.Args(Lit.Str(""), Lit.Int(0)), "0"),
        new TestCase(Lit.Args(Lit.Str("A"), Lit.Int(0)), "1"),
        new TestCase(Lit.Args(Lit.Str("ABCDE"), Lit.Int(1)), "2"),
        new TestCase(Lit.Args(Lit.Str("AAAA"), Lit.Int(0)), "4"),
        new TestCase(Lit.Args(Lit.Str("ABAA"), Lit.Int(0)), "2"),
        new TestCase(Lit.Args(Lit.Str("ABCD"), Lit.Int(10)), "4"),
        new TestCase(Lit.Args(Lit.Str("BAAAB"), Lit.Int(2)), "5"),
        new TestCase(Lit.Args(Lit.Str("ABBACCCABAAACBBBAACAABBBBCAAB"), Lit.Int(2)), "6"),
    ];

    public string CSharpCallTemplate => "Solution.CharacterReplacement({input})";
    public string PythonCallTemplate => "character_replacement({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const string s = "AABABBA";
        const int k = 1;
        var chars = s.Select(c => (object)c.ToString()).ToArray();
        var counts = new int[26];
        var steps = new List<VisualizationStep>();
        int left = 0, maxCount = 0, best = 0;

        Dictionary<string, object> State() => new()
        {
            ["array"] = chars,
            ["tracker"] = best,
            ["trackerLabel"] = "longest so far",
        };

        steps.Add(new VisualizationStep(State(), [],
            $"k = {k}. A window is fine when its length minus the count of its most common letter is at most {k}."));

        for (var right = 0; right < s.Length; right++)
        {
            counts[s[right] - 'A']++;
            // The true maximum, recomputed (O(26)), so every message shows the real count.
            maxCount = counts.Max();
            var dropped = new List<char>();
            while (right - left + 1 - maxCount > k)
            {
                counts[s[left] - 'A']--;
                dropped.Add(s[left]);
                left++;
                maxCount = counts.Max();
            }
            var size = right - left + 1;
            best = Math.Max(best, size);
            var window = s[left..(right + 1)];
            steps.Add(new VisualizationStep(State(), Enumerable.Range(left, size).ToArray(),
                dropped.Count == 0
                    ? $"Add '{s[right]}': window \"{window}\" has length {size}, most common letter count {maxCount}, so {size - maxCount} change{(size - maxCount == 1 ? "" : "s")} needed. That fits k = {k}."
                    : $"Add '{s[right]}': that window needed more than {k} change{(k == 1 ? "" : "s")}, so drop \"{string.Concat(dropped)}\" from the left. Window is now \"{window}\", length {size}."));
        }

        steps.Add(new VisualizationStep(State(), [],
            $"Done: the longest window that {k} change{(k == 1 ? "" : "s")} can make uniform has {best} characters. Same grow and shrink loop as the no-repeats lesson, with a different rule."));
        return steps;
    }
}
