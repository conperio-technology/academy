namespace DsaAcademy.Content.Concepts;

public class StackValidParentheses : IConcept
{
    public string Id => "stack-valid-parentheses";
    public string Track => "fundamentals";

    // See ArrayTraversalSum.cs -- keeps this track ahead of Trees/Graphs/Sorting/DP/
    // Patterns so Hashing (Order = 60) can slot in right after it.
    public int Order => 50;

    public string Title => "Stacks: Valid Parentheses";
    public string OneLiner => "Push on every open bracket, pop-and-match on every close -- the stack tells you if anything's out of order.";
    public string KeyTakeaway =>
        "A stack is LIFO -- last in, first out. Reach for one whenever a problem is about matching " +
        "or nesting (brackets, undo history, DFS backtracking): the most recently opened thing has to " +
        "be the first thing closed, which is exactly what push/pop gives you for free.";
    public VisualizerKind VisualizerKind => VisualizerKind.Stack;

    public string Explanation =>
        "A stack only supports two moves -- push (add to the top) and pop (remove from the top) -- " +
        "and that's exactly the shape \"is this bracket string balanced\" needs. Walk the string; on " +
        "every open bracket, push it. On every close bracket, pop the top and check it's the matching " +
        "open -- if the stack is empty (nothing to pop) or the popped bracket doesn't match, the " +
        "string is invalid immediately. At the very end, the stack must be empty too -- an unclosed " +
        "open bracket (like \"(\") passes every per-character check but still isn't valid. Watch out " +
        "for both failure directions: popping an empty stack (too many closes) and a non-empty stack " +
        "at the end (too many opens) are two separate bugs people forget to check.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static bool IsValid(string s)\n" +
            "    {\n" +
            "        // TODO: push open brackets. On a close bracket, pop and check it matches --\n" +
            "        // if the stack is empty, that's an invalid \"too many closes\".\n" +
            "        // At the end, the stack must be empty too (no unclosed opens).\n" +
            "        return false;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def is_valid(s):\n" +
            "    # TODO: push open brackets. On a close bracket, pop and check it matches --\n" +
            "    # if the stack is empty, that's an invalid \"too many closes\".\n" +
            "    # At the end, the stack must be empty too (no unclosed opens).\n" +
            "    return False\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.IsValid",
        ["python"] = "is_valid",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Str("()"), "true"),
        new TestCase(Lit.Str("()[]{}"), "true"),
        new TestCase(Lit.Str("(]"), "false"),
        new TestCase(Lit.Str("([)]"), "false"),
        new TestCase(Lit.Str("{[]}"), "true"),
        new TestCase(Lit.Str("("), "false"),
        new TestCase(Lit.Str(")"), "false"),
    ];

    public string CSharpCallTemplate => "Solution.IsValid({input})";
    public string PythonCallTemplate => "is_valid({input})";

    private static readonly Dictionary<char, char> Pairs = new() { [')'] = '(', [']'] = '[', ['}'] = '{' };

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const string input = "{[()]}";
        var chars = input.ToCharArray();
        var steps = new List<VisualizationStep>();
        var stack = new List<char>();

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["input"] = chars, ["stack"] = stack.ToArray() },
            HighlightIndices: [0],
            Message: $"Walk \"{input}\" left to right. Empty stack to start."
        ));

        for (var i = 0; i < chars.Length; i++)
        {
            var c = chars[i];
            string message;

            if (Pairs.ContainsValue(c))
            {
                stack.Add(c);
                message = $"'{c}' is an open bracket -- push it. Stack: [{string.Join(" ", stack)}]";
            }
            else
            {
                var top = stack.Count > 0 ? stack[^1] : (char?)null;
                if (top == Pairs[c])
                {
                    stack.RemoveAt(stack.Count - 1);
                    message = $"'{c}' matches the top of the stack ('{top}') -- pop it. Stack: [{string.Join(" ", stack)}]";
                }
                else
                {
                    message = top is null
                        ? $"'{c}' is a close bracket but the stack is empty -- invalid (too many closes)."
                        : $"'{c}' doesn't match the top of the stack ('{top}') -- invalid.";
                }
            }

            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["input"] = chars, ["stack"] = stack.ToArray() },
                HighlightIndices: [i],
                Message: message
            ));
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["input"] = chars, ["stack"] = stack.ToArray() },
            HighlightIndices: [],
            Message: stack.Count == 0
                ? "Every open was matched and the stack is empty at the end -- valid."
                : $"Stack still has [{string.Join(" ", stack)}] left over -- unclosed opens, invalid."
        ));

        return steps;
    }
}
