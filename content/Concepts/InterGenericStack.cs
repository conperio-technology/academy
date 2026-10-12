namespace DsaAcademy.Content.Concepts;

public class InterGenericStack : IConcept
{
    public string Id => "inter-generic-stack";
    public string Section => Basics.Section;
    public string Track => Inter.Track;
    public int Order => 1302;
    public string Title => "A Generic Stack Class";
    public string OneLiner => "Write a TypedStack<T> class with push, pop, peek, a count and an emptiness check, that throws the right exception when popped empty.";
    public string KeyTakeaway =>
        "A generic class declares its type parameter once (class TypedStack<T>, class TypedStack[T]) and uses T for " +
        "everything it stores and returns. Wrap a List<T> or a Python list, push and pop at the end for O(1), and " +
        "signal misuse with the exception callers expect: InvalidOperationException in C#, IndexError in Python.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write a generic stack class, TypedStack, that stores items of one type T, last in, first out. It needs " +
        "Push(item), Pop() which removes and returns the newest item, Peek() which returns it without removing it, " +
        "Count, and IsEmpty. Popping or peeking an empty stack must throw InvalidOperationException in C#, the same as " +
        ".NET's own Stack<T>. In Python the methods are push, pop, peek and is_empty, the count is len(stack) through a " +
        "__len__ method, and an empty pop or peek raises IndexError, as a Python list does.\n\n" +
        "Each test runs a list of commands on a stack of ints, like [\"push 3\", \"push 4\", \"pop\", \"peek\", \"count\"], and " +
        "reports what pop, peek, count and empty returned, with \"error\" when your class threw the expected exception. " +
        "So that example gives [4, 3, 1, \"ok\"]. The final \"ok\" comes from a second stack, of strings, that every test " +
        "pushes \"ok\" onto and pops: one class must work for both types.\n\n" +
        "Store the items in a List<T> (C#) or a list (Python) and push and pop at the end, where both are O(1). Count " +
        "can be a property, public int Count => _items.Count, and IsEmpty another. In Python, class TypedStack[T]: " +
        "(Python 3.12+) or class TypedStack(Generic[T]): states the type parameter for type checkers; the code is the " +
        "same either way.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class TypedStack<T>\n" +
            "{\n" +
            "    private readonly List<T> _items = new();\n" +
            "\n" +
            "    public void Push(T item)\n" +
            "    {\n" +
            "        // TODO\n" +
            "    }\n" +
            "\n" +
            "    public T Pop()\n" +
            "    {\n" +
            "        // TODO: throw new InvalidOperationException(\"Stack is empty\") when empty.\n" +
            "        return default!;\n" +
            "    }\n" +
            "\n" +
            "    public T Peek()\n" +
            "    {\n" +
            "        // TODO\n" +
            "        return default!;\n" +
            "    }\n" +
            "\n" +
            "    public int Count => 0;          // TODO\n" +
            "    public bool IsEmpty => true;    // TODO\n" +
            "}\n",
        ["python"] =
            "class TypedStack[T]:\n" +
            "    def __init__(self) -> None:\n" +
            "        self._items: list[T] = []\n" +
            "\n" +
            "    def push(self, item: T) -> None:\n" +
            "        pass  # TODO\n" +
            "\n" +
            "    def pop(self) -> T:\n" +
            "        raise IndexError(\"pop from empty stack\")  # TODO\n" +
            "\n" +
            "    def peek(self) -> T:\n" +
            "        raise IndexError(\"peek at empty stack\")  # TODO\n" +
            "\n" +
            "    def __len__(self) -> int:\n" +
            "        return 0  # TODO\n" +
            "\n" +
            "    def is_empty(self) -> bool:\n" +
            "        return True  # TODO\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "TypedStack",
        ["python"] = "TypedStack",
    };

    // Each test runs commands on a TypedStack<int>, then pops "ok" from a TypedStack<string>.
    public string? CSharpHarnessPreamble =>
        "public static class StackCheck\n" +
        "{\n" +
        "    public static List<object> Check(string[] commands)\n" +
        "    {\n" +
        "        var stack = new TypedStack<int>();\n" +
        "        var words = new TypedStack<string>();\n" +
        "        var results = new List<object>();\n" +
        "        foreach (var command in commands)\n" +
        "        {\n" +
        "            var p = command.Split(' ');\n" +
        "            try\n" +
        "            {\n" +
        "                switch (p[0])\n" +
        "                {\n" +
        "                    case \"push\": stack.Push(int.Parse(p[1])); break;\n" +
        "                    case \"pop\": results.Add(stack.Pop()); break;\n" +
        "                    case \"peek\": results.Add(stack.Peek()); break;\n" +
        "                    case \"count\": results.Add(stack.Count); break;\n" +
        "                    case \"empty\": results.Add(stack.IsEmpty); break;\n" +
        "                }\n" +
        "            }\n" +
        "            catch (InvalidOperationException)\n" +
        "            {\n" +
        "                results.Add(\"error\");\n" +
        "            }\n" +
        "        }\n" +
        "        words.Push(\"ok\");\n" +
        "        results.Add(words.Pop());\n" +
        "        return results;\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "def check_stack(commands):\n" +
        "    stack = TypedStack()\n" +
        "    words = TypedStack()\n" +
        "    results = []\n" +
        "    for command in commands:\n" +
        "        p = command.split(\" \")\n" +
        "        try:\n" +
        "            if p[0] == \"push\":\n" +
        "                stack.push(int(p[1]))\n" +
        "            elif p[0] == \"pop\":\n" +
        "                results.append(stack.pop())\n" +
        "            elif p[0] == \"peek\":\n" +
        "                results.append(stack.peek())\n" +
        "            elif p[0] == \"count\":\n" +
        "                results.append(len(stack))\n" +
        "            elif p[0] == \"empty\":\n" +
        "                results.append(stack.is_empty())\n" +
        "        except IndexError:\n" +
        "            results.append(\"error\")\n" +
        "    words.push(\"ok\")\n" +
        "    results.append(words.pop())\n" +
        "    return results\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Basics.StrArray("push 3", "push 4", "pop", "peek", "count"), "[4, 3, 1, \"ok\"]"),
        new TestCase(Basics.StrArray("pop", "empty", "push 1", "empty"), "[\"error\", true, false, \"ok\"]"),
        new TestCase(Basics.StrArray("push 5", "push 6", "push 7", "pop", "pop", "pop", "pop", "count"), "[7, 6, 5, \"error\", 0, \"ok\"]"),
        new TestCase(Basics.StrArray("peek", "count"), "[\"error\", 0, \"ok\"]"),
        new TestCase(Basics.StrArray("push -1", "peek", "peek", "count"), "[-1, -1, 1, \"ok\"]"),
    ];

    public string CSharpCallTemplate => "StackCheck.Check({input})";
    public string PythonCallTemplate => "check_stack({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        return
        [
            Basics.Step([], [], "[]", "results", "A new TypedStack<int>: empty."),
            Basics.Step([3], [0], "[]", "results", "push 3."),
            Basics.Step([3, 4], [1], "[]", "results", "push 4: it goes on top, at the end of the list."),
            Basics.Step([3], [], "[4]", "results", "pop removes and returns the top item, 4. Removing from the end of a list is O(1)."),
            Basics.Step([3], [0], "[4, 3]", "results", "peek returns the top item, 3, and leaves it there."),
            Basics.Step([3], [], "[4, 3, 1]", "results", "count is 1. Popping twice more would throw on the second pop: the stack would be empty."),
        ];
    }
}
