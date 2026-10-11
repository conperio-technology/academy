namespace DsaAcademy.Content.Concepts;

public class AdvCleanupOrder : IConcept
{
    public string Id => "adv-cleanup-order";
    public string Section => Basics.Section;
    public string Track => Adv.Track;
    public int Order => 2301;
    public string Title => "Open and Close in the Right Order";
    public string OneLiner => "Open a list of resources, do the work, and close every resource that was opened, newest first, even when opening one of them or the work itself fails.";
    public string KeyTakeaway =>
        "Clean-up must run on every path: success, a failure while acquiring, and a failure during the work. Release " +
        "only what was actually acquired, in reverse order. With a number of resources known only at run time, keep a " +
        "list and dispose it backwards in a finally block (C#), or let contextlib.ExitStack do exactly that (Python).";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write RunSteps(names, failOn, log). It must open one Resource per name, in order, then add \"work\" to the log, " +
        "then close the resources in reverse order. Opening a resource logs \"open name\" and closing it logs \"close " +
        "name\"; the Resource type is provided and does the logging. The test can make things fail: if failOn is one " +
        "of the names, opening that resource throws, and if failOn is \"work\", your code must throw after logging " +
        "\"work\" (C#: throw new InvalidOperationException(\"work failed\"); Python: raise RuntimeError(\"work failed\")). " +
        "Either way, every resource that was opened must still be closed, newest first, and the exception must reach " +
        "the caller. The checker returns the log, plus \"error: message\" if an exception came out.\n\n" +
        "So names [\"a\", \"b\", \"c\"] with failOn \"c\" gives [\"open a\", \"open b\", \"close b\", \"close a\", \"error: cannot " +
        "open c\"]: c was never opened, so it isn't closed, and \"work\" never happens.\n\n" +
        "In C#, Resource implements IDisposable and its constructor opens it: new Resource(name, failOn, log). A fixed " +
        "number of resources would be a stack of using statements, but here the count varies, so add each one to a " +
        "List<Resource> as it opens and, in a finally block, dispose them from the last to the first. In Python, " +
        "Resource(name, fail_on, log) is a context manager that opens in __enter__; use \"with ExitStack() as stack:\" " +
        "and stack.enter_context(Resource(...)) for each name, and ExitStack closes them in reverse for you.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static void RunSteps(string[] names, string failOn, List<string> log)\n" +
            "    {\n" +
            "        var opened = new List<Resource>();\n" +
            "        foreach (var name in names) opened.Add(new Resource(name, failOn, log));\n" +
            "        log.Add(\"work\");\n" +
            "        if (failOn == \"work\") throw new InvalidOperationException(\"work failed\");\n" +
            "        // TODO: close what was opened, newest first, on every path (try / finally).\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "from contextlib import ExitStack\n" +
            "\n" +
            "\n" +
            "def run_steps(names, fail_on, log):\n" +
            "    for name in names:\n" +
            "        Resource(name, fail_on, log).__enter__()   # TODO: use an ExitStack instead\n" +
            "    log.append(\"work\")\n" +
            "    if fail_on == \"work\":\n" +
            "        raise RuntimeError(\"work failed\")\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.RunSteps",
        ["python"] = "run_steps",
    };

    public string? CSharpHarnessPreamble =>
        "public sealed class Resource : IDisposable\n" +
        "{\n" +
        "    private readonly string _name;\n" +
        "    private readonly List<string> _log;\n" +
        "\n" +
        "    public Resource(string name, string failOn, List<string> log)\n" +
        "    {\n" +
        "        if (name == failOn) throw new InvalidOperationException($\"cannot open {name}\");\n" +
        "        _name = name;\n" +
        "        _log = log;\n" +
        "        log.Add($\"open {name}\");\n" +
        "    }\n" +
        "\n" +
        "    public void Dispose() => _log.Add($\"close {_name}\");\n" +
        "}\n" +
        "\n" +
        "public static class CleanupCheck\n" +
        "{\n" +
        "    public static List<string> Check(string[] names, string failOn)\n" +
        "    {\n" +
        "        var log = new List<string>();\n" +
        "        try\n" +
        "        {\n" +
        "            Solution.RunSteps(names, failOn, log);\n" +
        "        }\n" +
        "        catch (InvalidOperationException e)\n" +
        "        {\n" +
        "            log.Add($\"error: {e.Message}\");\n" +
        "        }\n" +
        "        return log;\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "class Resource:\n" +
        "    def __init__(self, name, fail_on, log):\n" +
        "        self.name, self.fail_on, self.log = name, fail_on, log\n" +
        "\n" +
        "    def __enter__(self):\n" +
        "        if self.name == self.fail_on:\n" +
        "            raise RuntimeError(f\"cannot open {self.name}\")\n" +
        "        self.log.append(f\"open {self.name}\")\n" +
        "        return self\n" +
        "\n" +
        "    def __exit__(self, exc_type, exc, tb):\n" +
        "        self.log.append(f\"close {self.name}\")\n" +
        "        return False\n" +
        "\n" +
        "\n" +
        "def check_cleanup(names, fail_on):\n" +
        "    log = []\n" +
        "    try:\n" +
        "        run_steps(names, fail_on, log)\n" +
        "    except RuntimeError as e:\n" +
        "        log.append(f\"error: {e}\")\n" +
        "    return log\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Basics.StrArray("db", "file"), Lit.Str("")),
            "[\"open db\", \"open file\", \"work\", \"close file\", \"close db\"]"),
        new TestCase(Lit.Args(Basics.StrArray("a", "b", "c"), Lit.Str("work")),
            "[\"open a\", \"open b\", \"open c\", \"work\", \"close c\", \"close b\", \"close a\", \"error: work failed\"]"),
        new TestCase(Lit.Args(Basics.StrArray("a", "b", "c"), Lit.Str("c")),
            "[\"open a\", \"open b\", \"close b\", \"close a\", \"error: cannot open c\"]"),
        new TestCase(Lit.Args(Basics.StrArray("a"), Lit.Str("a")), "[\"error: cannot open a\"]"),
        new TestCase(Lit.Args(Basics.StrArray(), Lit.Str("")), "[\"work\"]"),
        new TestCase(Lit.Args(Basics.StrArray("conn", "tx", "lock", "file"), Lit.Str("lock")),
            "[\"open conn\", \"open tx\", \"close tx\", \"close conn\", \"error: cannot open lock\"]"),
    ];

    public string CSharpCallTemplate => "CleanupCheck.Check({input})";
    public string PythonCallTemplate => "check_cleanup({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        object[] names = ["a", "b", "c"];
        return
        [
            Basics.Step(names, [], "[]", "opened", "Three resources to open, and the test says opening c will fail."),
            Basics.Step(names, [0], "[a]", "opened", "Open a and remember it."),
            Basics.Step(names, [1], "[a, b]", "opened", "Open b and remember it."),
            Basics.Step(names, [2], "[a, b]", "opened", "Opening c throws. The work never runs, and c was never opened, so it must not be closed."),
            Basics.Step(names, [1], "[a]", "opened", "The finally block (or ExitStack) closes what was opened, newest first: b..."),
            Basics.Step(names, [0], "[]", "opened", "...then a. The exception then carries on to the caller, which logs \"error: cannot open c\"."),
        ];
    }
}
