namespace DsaAcademy.Content.Concepts;

public class DesignMinStack : IConcept
{
    public string Id => "design-min-stack";
    public string Track => "patterns";
    public string Title => "Design: Min Stack";
    public string OneLiner => "A stack that can also tell you its smallest element at any moment, with every operation in O(1).";
    public string KeyTakeaway =>
        "Store the minimum ALONGSIDE each element: when you push x, also record min(x, the min below it). " +
        "The stack below an entry never changes while that entry is on top, so the min saved with it stays " +
        "correct, and popping automatically restores the previous minimum.";
    public VisualizerKind VisualizerKind => VisualizerKind.Stack;

    public string Explanation =>
        "Build a stack with push(x), pop(), top() and getMin(), where getMin returns the smallest value " +
        "currently on the stack, and every operation is O(1). Keeping one \"current minimum\" variable works " +
        "for push (min = min(min, x)) but breaks on pop: if you pop the minimum, what was the minimum before " +
        "it? You'd have to rescan the stack, which is O(n).\n\n" +
        "The insight is that a stack only ever changes at the top. While an entry sits on the stack, " +
        "everything beneath it is frozen. So the minimum of \"this entry and everything below it\" is a fixed " +
        "fact you can compute once, at push time, and store with the entry. Push x as the pair (x, " +
        "min(x, min stored in the current top)). getMin reads the top pair's min. pop removes the top pair, " +
        "and the new top already carries the minimum that was true before that push. Nothing is ever " +
        "recomputed.\n\n" +
        "For example, push 5, 3, 7: the pairs are (5, 5), (3, 3), (7, 3). getMin is 3. Pop twice and the top " +
        "is (5, 5), so getMin is 5, with no search. Duplicates are handled for free: pushing another 3 gives " +
        "(3, 3), and popping it leaves the earlier (3, 3) underneath.\n\n" +
        "A common space-saving variant keeps a second stack that only gets a push when x is less than OR " +
        "EQUAL to its top, and pops it only when the popped value equals its top. Using strictly less there is " +
        "the classic bug: a duplicate minimum would then be lost on the first pop. Interviewers also like the " +
        "follow-up \"max stack\" (same idea with max) and \"min queue\" (build a queue from two min stacks).\n\n" +
        "The harness runs the operations in order with their arguments ([x] for push, [] for the others) and " +
        "returns the values produced by top and getMin calls only; pop is never called on an empty stack.";

    public List<string> RecognitionSignals =>
    [
        "A stack (or undo history) where you also need a running aggregate -- min, max -- after every push and pop, in O(1).",
        "\"Design a class\" with an O(1) requirement on a query that would naturally need a scan.",
    ];

    public List<string> Gotchas =>
    [
        "A single min variable can't be restored after popping the minimum -- the previous minimum has to be stored somewhere.",
        "With the two-stack variant, push onto the min stack when x <= its top (not <), or duplicate minimums get dropped too early.",
        "When the stack is empty, the first push's min is just x -- don't compare against a missing top.",
    ];

    public List<string> ConfusableWith =>
    [
        "Monotonic Stack: Find the Next Greater Element (this track) pops elements to keep the stack ordered, and discards data. A min stack keeps every element and never reorders; it just remembers an extra value per entry.",
        "Stacks: Valid Parentheses (Fundamentals) is the plain stack this builds on.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class MinStack\n" +
            "{\n" +
            "    // TODO: one Stack<(int Value, int Min)>, where Min is the smallest value\n" +
            "    // at or below that entry. (Or two stacks: values, and minimums.)\n" +
            "\n" +
            "    public void Push(int val)\n" +
            "    {\n" +
            "        // TODO: min = empty ? val : Math.Min(val, top's Min); push (val, min).\n" +
            "    }\n" +
            "\n" +
            "    public void Pop()\n" +
            "    {\n" +
            "        // TODO: remove the top pair; the one below already knows its min.\n" +
            "    }\n" +
            "\n" +
            "    public int Top()\n" +
            "    {\n" +
            "        // TODO: the top pair's Value.\n" +
            "        return 0;\n" +
            "    }\n" +
            "\n" +
            "    public int GetMin()\n" +
            "    {\n" +
            "        // TODO: the top pair's Min.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "class MinStack:\n" +
            "    def __init__(self):\n" +
            "        # TODO: a list of (value, min) pairs, where min is the smallest value\n" +
            "        # at or below that entry.\n" +
            "        pass\n" +
            "\n" +
            "    def push(self, val):\n" +
            "        # TODO: m = val if empty else min(val, top's min); append (val, m).\n" +
            "        pass\n" +
            "\n" +
            "    def pop(self):\n" +
            "        # TODO: remove the top pair; the one below already knows its min.\n" +
            "        pass\n" +
            "\n" +
            "    def top(self):\n" +
            "        # TODO: the top pair's value.\n" +
            "        return 0\n" +
            "\n" +
            "    def get_min(self):\n" +
            "        # TODO: the top pair's min.\n" +
            "        return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "MinStack",
        ["python"] = "MinStack",
    };

    public string? CSharpHarnessPreamble =>
        "public static class MinStackHarness\n" +
        "{\n" +
        "    public static List<int> Run(string[] ops, int[][] args)\n" +
        "    {\n" +
        "        var stack = new MinStack();\n" +
        "        var results = new List<int>();\n" +
        "        for (var i = 0; i < ops.Length; i++)\n" +
        "        {\n" +
        "            if (ops[i] == \"push\") stack.Push(args[i][0]);\n" +
        "            else if (ops[i] == \"pop\") stack.Pop();\n" +
        "            else if (ops[i] == \"top\") results.Add(stack.Top());\n" +
        "            else if (ops[i] == \"getMin\") results.Add(stack.GetMin());\n" +
        "        }\n" +
        "        return results;\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "def run_min_stack_ops(ops, args):\n" +
        "    stack = MinStack()\n" +
        "    results = []\n" +
        "    for op, a in zip(ops, args):\n" +
        "        if op == \"push\":\n" +
        "            stack.push(a[0])\n" +
        "        elif op == \"pop\":\n" +
        "            stack.pop()\n" +
        "        elif op == \"top\":\n" +
        "            results.append(stack.top())\n" +
        "        elif op == \"getMin\":\n" +
        "            results.append(stack.get_min())\n" +
        "    return results\n";

    private static string Ops(params string[] ops) => "[" + string.Join(", ", ops.Select(Lit.Str)) + "]";
    private static string Rows(params int[][] rows) => "[" + string.Join(", ", rows.Select(r => Lit.IntArray(r))) + "]";

    public List<TestCase> TestCases =>
    [
        new TestCase(
            Lit.Args(
                Ops("push", "push", "push", "getMin", "pop", "top", "getMin"),
                Rows([-2], [0], [-3], [], [], [], [])),
            "[-3,0,-2]"),
        new TestCase(
            Lit.Args(
                Ops("push", "push", "push", "getMin", "pop", "getMin", "pop", "getMin", "top"),
                Rows([5], [3], [7], [], [], [], [], [], [])),
            "[3,3,5,5]"),
        new TestCase(
            Lit.Args(
                Ops("push", "push", "push", "getMin", "pop", "getMin", "pop", "getMin"),
                Rows([2], [1], [1], [], [], [], [], [])),
            "[1,1,2]"),
        new TestCase(
            Lit.Args(
                Ops("push", "top", "getMin"),
                Rows([42], [], [])),
            "[42,42]"),
        new TestCase(
            Lit.Args(
                Ops("push", "pop", "push", "getMin", "push", "getMin", "top"),
                Rows([1], [], [9], [], [4], [], [])),
            "[9,4,4]"),
        new TestCase(
            Lit.Args(
                Ops("push", "push", "push", "push", "getMin", "pop", "getMin", "pop", "getMin", "pop", "getMin", "top"),
                Rows([10], [8], [9], [1], [], [], [], [], [], [], [], [])),
            "[1,8,8,10,10]"),
    ];

    public string CSharpCallTemplate => "MinStackHarness.Run({input})";
    public string PythonCallTemplate => "run_min_stack_ops({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        // (op label, value for push)
        (string Op, int Arg)[] script =
        [
            ("push", 5), ("push", 3), ("push", 7), ("getMin", 0), ("push", 3),
            ("pop", 0), ("getMin", 0), ("pop", 0), ("pop", 0), ("getMin", 0), ("top", 0),
        ];
        var input = script.Select(s => s.Op == "push" ? $"push {s.Arg}" : s.Op).ToArray();
        var stack = new List<(int Value, int Min)>();
        var steps = new List<VisualizationStep>();

        VisualizationStep Step(int pointer, string message) => new(
            State: new Dictionary<string, object>
            {
                ["input"] = input,
                ["stack"] = stack.Select(e => $"{e.Value} (min {e.Min})").ToArray(),
            },
            HighlightIndices: pointer >= 0 ? [pointer] : [],
            Message: message
        );

        steps.Add(Step(-1, "Each stack entry is a pair: the value, and the smallest value at or below it. Watch the min column -- it's what makes getMin O(1)."));

        for (var i = 0; i < script.Length; i++)
        {
            var (op, arg) = script[i];
            switch (op)
            {
                case "push":
                    var below = stack.Count == 0 ? (int?)null : stack[^1].Min;
                    var min = below is int b ? Math.Min(arg, b) : arg;
                    stack.Add((arg, min));
                    steps.Add(Step(i, below is int m
                        ? $"push {arg}: the min below is {m}, so store ({arg}, min {min})."
                        : $"push {arg}: the stack was empty, so its min is just {arg}."));
                    break;
                case "pop":
                    var popped = stack[^1];
                    stack.RemoveAt(stack.Count - 1);
                    steps.Add(Step(i, stack.Count == 0
                        ? $"pop removes {popped.Value}. The stack is empty."
                        : $"pop removes {popped.Value}. The new top already carries min {stack[^1].Min} -- the minimum is restored without searching."));
                    break;
                case "getMin":
                    steps.Add(Step(i, $"getMin: read the top entry's min: {stack[^1].Min}. No scan."));
                    break;
                case "top":
                    steps.Add(Step(i, $"top: the top entry's value is {stack[^1].Value}."));
                    break;
            }
        }

        steps.Add(Step(-1, "Done. Pushing the duplicate 3 stored its own (3, min 3), so popping it left the earlier 3 still counted as the minimum."));
        return steps;
    }
}
