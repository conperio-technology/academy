namespace DsaAcademy.Content.Concepts;

public class StackEvaluateRpn : IConcept
{
    public string Id => "stack-evaluate-rpn";
    public string Track => "patterns";
    public string Title => "Stack: Evaluate Reverse Polish Notation";
    public string OneLiner => "Evaluate an expression written operator-last, like 2 1 + 3 *. Push numbers; an operator pops two, applies itself, and pushes the result.";
    public string KeyTakeaway =>
        "In Reverse Polish Notation every operator comes after its two operands, so no parentheses or " +
        "precedence rules are needed. Scan left to right with a stack: push each number; for an operator pop " +
        "b (the right operand) then a (the left), push a op b. The one number left is the answer. Order " +
        "matters for - and /, and division truncates toward zero.";
    public VisualizerKind VisualizerKind => VisualizerKind.Stack;

    public string Explanation =>
        "tokens is an arithmetic expression in Reverse Polish Notation (postfix): each operator follows its " +
        "two operands. [\"2\", \"1\", \"+\", \"3\", \"*\"] means (2 + 1) * 3 = 9. The operators are +, -, * and /, " +
        "every token is an integer or an operator, and the expression is valid. Division between integers " +
        "truncates toward zero: 6 / -4 is -1, not -2.\n\n" +
        "Postfix is easy for a machine precisely because it needs no precedence rules or parentheses. The " +
        "moment you see an operator, its operands are the two most recent values not yet used, which is " +
        "exactly what a stack holds. Push numbers. On an operator, pop b, then pop a, compute a op b and push " +
        "the result. At the end, the single value on the stack is the result.\n\n" +
        "Mind the pop order. The first value popped is the RIGHT operand. For [\"3\", \"-4\", \"-\"], b = -4 and a " +
        "= 3, so 3 - (-4) = 7; swapping them gives -7. Also tell a negative number token like \"-11\" apart " +
        "from the operator \"-\": an operator token is exactly one character long.\n\n" +
        "Language note on division: C#'s integer / already truncates toward zero. Python's // floors instead " +
        "(-7 // 2 is -4), so use int(a / b) for truncation (fine for the sizes here; for huge values compute " +
        "it from abs and the signs).\n\n" +
        "Each token is handled once with O(1) work: O(n) time, and up to O(n) stack. This is also how " +
        "stack-based virtual machines (the JVM, .NET's IL, WebAssembly) evaluate code, and the second half of " +
        "the shunting-yard method for ordinary infix expressions: first convert to postfix, then run this.\n\n" +
        "The visualization evaluates [\"4\", \"13\", \"5\", \"/\", \"+\"].";

    public List<string> RecognitionSignals => [
        "Postfix (RPN) expressions, or a stack machine executing instructions.",
        "Each operation consumes the most recent unconsumed results: a stack.",
    ];

    public List<string> Gotchas => [
        "Popping in the wrong order flips subtraction and division.",
        "\"-3\" is a number, not the minus operator; check the token length, not just its first character.",
        "Python's // rounds toward negative infinity; the problem wants truncation toward zero.",
    ];

    public List<string> ConfusableWith => [
        "Valid Parentheses also scans with a stack, but only matches brackets; nothing is computed.",
        "Basic Calculator evaluates ordinary infix with precedence, which needs a second stack for operators (or conversion to postfix first).",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int EvalRPN(string[] tokens)\n" +
            "    {\n" +
            "        var stack = new Stack<int>();\n" +
            "        // TODO: for each token: if it is one of + - * / (and one character long),\n" +
            "        // pop b, then pop a, and push a op b. Otherwise push int.Parse(token).\n" +
            "        // Return the one value left on the stack.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def eval_rpn(tokens):\n" +
            "    stack = []\n" +
            "    # TODO: for each token: if it is one of + - * /, pop b, then pop a, and push\n" +
            "    # a op b (use int(a / b) for division, which truncates toward zero).\n" +
            "    # Otherwise push int(token). Return the one value left on the stack.\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.EvalRPN",
        ["python"] = "eval_rpn",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[\"2\", \"1\", \"+\", \"3\", \"*\"]", "9"),
        new TestCase("[\"4\", \"13\", \"5\", \"/\", \"+\"]", "6"),
        new TestCase("[\"10\", \"6\", \"9\", \"3\", \"+\", \"-11\", \"*\", \"/\", \"*\", \"17\", \"+\", \"5\", \"+\"]", "22"),
        new TestCase("[\"7\"]", "7"),
        new TestCase("[\"3\", \"-4\", \"-\"]", "7"),
        new TestCase("[\"-7\", \"2\", \"/\"]", "-3"),
        new TestCase("[\"5\", \"1\", \"2\", \"+\", \"4\", \"*\", \"+\", \"3\", \"-\"]", "14"),
    ];

    public string CSharpCallTemplate => "Solution.EvalRPN({input})";
    public string PythonCallTemplate => "eval_rpn({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        string[] tokens = ["4", "13", "5", "/", "+"];
        var stack = new List<int>();
        var steps = new List<VisualizationStep>();
        Dictionary<string, object> State() => new() { ["input"] = tokens, ["stack"] = stack.Select(v => v.ToString()).ToArray() };
        steps.Add(new(State(), [], "Evaluate 4 13 5 / +, which is 4 + (13 / 5) in ordinary notation."));
        for (var i = 0; i < tokens.Length; i++)
        {
            var t = tokens[i];
            if (t.Length == 1 && "+-*/".Contains(t))
            {
                var b = stack[^1];
                stack.RemoveAt(stack.Count - 1);
                var a = stack[^1];
                stack.RemoveAt(stack.Count - 1);
                var r = t switch { "+" => a + b, "-" => a - b, "*" => a * b, _ => a / b };
                stack.Add(r);
                steps.Add(new(State(), [i], $"Operator {t}: pop b = {b}, then a = {a}. Push {a} {t} {b} = {r}{(t == "/" ? " (truncated toward zero)" : "")}."));
            }
            else
            {
                stack.Add(int.Parse(t));
                steps.Add(new(State(), [i], $"Number {t}: push it."));
            }
        }
        steps.Add(new(State(), [], $"One value left: {stack[0]}."));
        return steps;
    }
}
