namespace DsaAcademy.Content.Concepts;

public class BacktrackingGenerateParentheses : IConcept
{
    public string Id => "backtracking-generate-parentheses";
    public string Track => "patterns";
    public string Title => "Backtracking: Generate Parentheses";
    public string OneLiner => "Every balanced string of n pairs of parentheses. Build left to right, adding ( while you have some left and ) only while it would close an open one.";
    public string KeyTakeaway =>
        "Never build an invalid prefix and you never need to check validity at the end. Track open and close " +
        "counts: you may add ( if open < n, and ) if close < open. When the string reaches length 2n it is " +
        "balanced by construction. The count of results is the n-th Catalan number.";
    public VisualizerKind VisualizerKind => VisualizerKind.CallStack;

    public string Explanation =>
        "Return all strings of n pairs of parentheses that are balanced (every ) closes an earlier (). For n " +
        "= 3 there are five: ((())), (()()), (())(), ()(()), ()()(). The grader sorts your list, so any order " +
        "is fine.\n\n" +
        "Brute force would generate all 2^(2n) strings of ( and ) and keep the valid ones, checking each with " +
        "a counter like Valid Parentheses. Backtracking does better by refusing to grow a prefix that can't " +
        "become valid. A prefix can still be completed exactly when it never closes more than it has opened " +
        "and never opens more than n.\n\n" +
        "So recurse on (current string, open, close). If the length is 2n, record it. Otherwise two choices, " +
        "each with its own guard: if open < n, try adding \"(\"; if close < open, try adding \")\". The second " +
        "guard is the key one, since it means there is an unmatched ( to close. Strings are immutable, so " +
        "passing current + \"(\" down the recursion needs no explicit undo; with a StringBuilder or list you " +
        "would append, recurse and remove.\n\n" +
        "Every leaf of this search tree is a valid answer, so the work is proportional to the output. The " +
        "number of balanced strings is the n-th Catalan number, about 4^n / (n^1.5 · √π), and each has length " +
        "2n. The recursion is only 2n deep.\n\n" +
        "The visualization runs n = 2.";

    public List<string> RecognitionSignals => [
        "Generate all valid strings or structures where validity is a running count (balance, depth, budget).",
        "A constraint you can check on each prefix: prune as you build instead of filtering at the end.",
    ];

    public List<string> Gotchas => [
        "Guarding ) with close < n instead of close < open produces strings like ())(.",
        "Stopping at length n instead of 2n.",
        "With a shared StringBuilder, forgetting to remove the last character after the recursive call.",
    ];

    public List<string> ConfusableWith => [
        "Valid Parentheses checks one given string with a stack; here you generate all of them, and a counter replaces the stack because there is only one bracket type.",
        "Subsets and Combination Sum choose from a list of items; here the two choices are always ( and ), and the guards do the pruning.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static List<string> GenerateParenthesis(int n)\n" +
            "    {\n" +
            "        var result = new List<string>();\n" +
            "\n" +
            "        void Build(string current, int open, int close)\n" +
            "        {\n" +
            "            // TODO: if current.Length == 2 * n, add it and return.\n" +
            "            // If open < n, Build(current + \"(\", open + 1, close).\n" +
            "            // If close < open, Build(current + \")\", open, close + 1).\n" +
            "        }\n" +
            "\n" +
            "        Build(\"\", 0, 0);\n" +
            "        return result;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def generate_parenthesis(n):\n" +
            "    result = []\n" +
            "\n" +
            "    def build(current, open_count, close_count):\n" +
            "        # TODO: if len(current) == 2 * n, append it and return.\n" +
            "        # If open_count < n, build(current + \"(\", open_count + 1, close_count).\n" +
            "        # If close_count < open_count, build(current + \")\", open_count, close_count + 1).\n" +
            "        pass\n" +
            "\n" +
            "    build(\"\", 0, 0)\n" +
            "    return result\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.GenerateParenthesis",
        ["python"] = "generate_parenthesis",
    };

    public string? CSharpHarnessPreamble => "public static class StringListNormalizer\n" +
        "{\n" +
        "    public static List<string> Sorted(List<string> items)\n" +
        "    {\n" +
        "        var copy = new List<string>(items);\n" +
        "        copy.Sort(string.CompareOrdinal);\n" +
        "        return copy;\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble => "def sorted_strings(items):\n" +
        "    return sorted(items)\n";

    public List<TestCase> TestCases =>
    [
        new TestCase("1", "[\"()\"]"),
        new TestCase("2", "[\"(())\",\"()()\"]"),
        new TestCase("3", "[\"((()))\",\"(()())\",\"(())()\",\"()(())\",\"()()()\"]"),
        new TestCase("4", "[\"(((())))\",\"((()()))\",\"((())())\",\"((()))()\",\"(()(()))\",\"(()()())\",\"(()())()\",\"(())(())\",\"(())()()\",\"()((()))\",\"()(()())\",\"()(())()\",\"()()(())\",\"()()()()\"]"),
    ];

    public string CSharpCallTemplate => "StringListNormalizer.Sorted(Solution.GenerateParenthesis({input}))";
    public string PythonCallTemplate => "sorted_strings(generate_parenthesis({input}))";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const int n = 2;
        var steps = new List<VisualizationStep>();
        var frames = new List<string>();
        var found = new List<string>();
        steps.Add(new(new() { ["frames"] = Array.Empty<string>() }, [], "n = 2. Add ( while open < 2; add ) only while close < open."));

        void Build(string current, int open, int close)
        {
            frames.Add($"\"{current}\" open {open} close {close}");
            if (current.Length == 2 * n)
            {
                found.Add(current);
                steps.Add(new(new() { ["frames"] = frames.ToArray() }, [], $"Length 4: record \"{current}\". It is balanced by construction."));
            }
            else
            {
                var options = new List<string>();
                if (open < n) options.Add("( (open < 2)");
                if (close < open) options.Add(") (close < open)");
                steps.Add(new(new() { ["frames"] = frames.ToArray() }, [], $"At \"{current}\": allowed next {string.Join(" and ", options)}."));
                if (open < n) Build(current + "(", open + 1, close);
                if (close < open) Build(current + ")", open, close + 1);
            }
            frames.RemoveAt(frames.Count - 1);
        }

        Build("", 0, 0);
        steps.Add(new(new() { ["frames"] = Array.Empty<string>() }, [], $"Done: {string.Join(", ", found)}. No invalid prefix was ever built."));
        return steps;
    }
}
