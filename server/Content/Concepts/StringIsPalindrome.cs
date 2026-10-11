namespace DsaAcademy.Content.Concepts;

public class StringIsPalindrome : IConcept
{
    public string Id => "string-is-palindrome";
    public string Track => "fundamentals";

    // See ArrayTraversalSum.cs -- keeps this track ahead of Trees/Graphs/Sorting/DP/
    // Patterns so Hashing (Order = 60) can slot in right after it.
    public int Order => 50;

    public string Title => "Strings: Is Palindrome";
    public string OneLiner => "Two pointers again, but comparing instead of swapping -- read from both ends toward the middle.";
    public string KeyTakeaway =>
        "Strings are effectively character arrays, so array techniques (two pointers, sliding " +
        "window) apply directly. The one catch: in C# and Python, strings are immutable (can't be changed after they're created) -- anything " +
        "beyond read-only comparison needs a new string, not in-place mutation like an int[] gets.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "First string problem, and it reuses a tool you already have: two pointers starting at " +
        "opposite ends. Instead of swapping (like reversing an array), just compare -- if the " +
        "characters at left and right ever disagree, it's not a palindrome; if the pointers meet or " +
        "cross without a disagreement, it is. Watch out for two edge cases interview problems love to " +
        "sneak in: an empty string (trivially a palindrome -- the loop should just never run) and " +
        "case/spacing (this version assumes a clean lowercase string with no spaces; \"real\" " +
        "palindrome-checking problems usually ask you to normalize first).";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static bool IsPalindrome(string s)\n" +
            "    {\n" +
            "        // TODO: two pointers, left at 0 and right at the end, moving inward.\n" +
            "        // Return false the moment they disagree.\n" +
            "        return false;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def is_palindrome(s):\n" +
            "    # TODO: two pointers, left at 0 and right at the end, moving inward.\n" +
            "    # Return False the moment they disagree.\n" +
            "    return False\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.IsPalindrome",
        ["python"] = "is_palindrome",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Str("racecar"), "true"),
        new TestCase(Lit.Str("hello"), "false"),
        new TestCase(Lit.Str(""), "true"),
        new TestCase(Lit.Str("a"), "true"),
        new TestCase(Lit.Str("abca"), "false"),
        new TestCase(Lit.Str("noon"), "true"),
    ];

    public string CSharpCallTemplate => "Solution.IsPalindrome({input})";
    public string PythonCallTemplate => "is_palindrome({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const string word = "level";
        char[] chars = word.ToCharArray();
        var steps = new List<VisualizationStep>();

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = chars },
            HighlightIndices: [0, chars.Length - 1],
            Message: $"left starts at index 0 ('{chars[0]}'), right starts at the last index ('{chars[^1]}')."
        ));

        var left = 0;
        var right = chars.Length - 1;
        while (left < right)
        {
            var match = chars[left] == chars[right];
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = chars },
                HighlightIndices: [left, right],
                Message: match
                    ? $"'{chars[left]}' == '{chars[right]}' -- agree, keep going."
                    : $"'{chars[left]}' != '{chars[right]}' -- mismatch, return false immediately."
            ));
            if (!match) break;
            left++;
            right--;
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = chars },
            HighlightIndices: [],
            Message: $"Pointers met without a mismatch -- \"{word}\" is a palindrome."
        ));

        return steps;
    }
}
