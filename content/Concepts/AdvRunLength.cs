namespace DsaAcademy.Content.Concepts;

public class AdvRunLength : IConcept
{
    public string Id => "adv-run-length";
    public string Section => Basics.Section;
    public string Track => Adv.Track;
    public int Order => 2701;
    public string Title => "Run-Length Encode a Status Log";
    public string OneLiner => "Compress a log of statuses into runs such as \"ok x2\", \"fault x1\", reading the input exactly once as a lazy sequence and changing nothing.";
    public string KeyTakeaway =>
        "Run-length encoding groups adjacent equal items, which is exactly what itertools.groupby does (and why groupby " +
        "on unsorted data gives several groups per key). In C#, one pass with the current value and a count does it. " +
        "Accept any IEnumerable or iterable and read it once, so the function also works on streams and generators.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write RunLength(statuses), which turns a sequence of status strings into runs of equal adjacent statuses, each " +
        "written as \"status xN\". [\"ok\", \"ok\", \"fault\", \"ok\"] gives [\"ok x2\", \"fault x1\", \"ok x1\"]: the last \"ok\" is a " +
        "new run because something different came between. An empty input gives an empty list. Comparisons are exact: " +
        "\"OK\" and \"ok\" are different statuses.\n\n" +
        "The input isn't a list: C# receives an IEnumerable<string> that's computed lazily, and Python an iterator, " +
        "which can be read only once. So no indexing, no len(), and no going back. That's how real log processing " +
        "works, on input that may not fit in memory. The function should be pure: build and return a new list.\n\n" +
        "In Python, itertools.groupby(statuses) yields (status, group) for each run of adjacent equal items; " +
        "sum(1 for _ in group) or len(list(group)) counts it. In C#, keep the current status and its count in a " +
        "foreach: when the next item differs, add the finished run to the result and start a new one, and don't forget " +
        "the final run after the loop.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static List<string> RunLength(IEnumerable<string> statuses)\n" +
            "    {\n" +
            "        var runs = new List<string>();\n" +
            "        // TODO: one pass, tracking the current status and how many times it repeated.\n" +
            "        return runs;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "from itertools import groupby\n" +
            "\n" +
            "\n" +
            "def run_length(statuses):\n" +
            "    # TODO: groupby yields (status, group) for each run of equal adjacent items.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.RunLength",
        ["python"] = "run_length",
    };

    public string? CSharpHarnessPreamble =>
        "public static class RunLengthCheck\n" +
        "{\n" +
        "    public static List<string> Check(string[] statuses) => Solution.RunLength(statuses.Where(_ => true));\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "def check_run_length(statuses):\n" +
        "    return run_length(iter(statuses))\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Basics.StrArray("ok", "ok", "fault", "ok"), "[\"ok x2\", \"fault x1\", \"ok x1\"]"),
        new TestCase(Basics.StrArray(), "[]"),
        new TestCase(Basics.StrArray("ok"), "[\"ok x1\"]"),
        new TestCase(Basics.StrArray("idle", "idle", "idle"), "[\"idle x3\"]"),
        new TestCase(Basics.StrArray("a", "b", "a", "b"), "[\"a x1\", \"b x1\", \"a x1\", \"b x1\"]"),
        new TestCase(Basics.StrArray("ok", "OK", "OK", "ok", "ok", "ok", "fault"), "[\"ok x1\", \"OK x2\", \"ok x3\", \"fault x1\"]"),
    ];

    public string CSharpCallTemplate => "RunLengthCheck.Check({input})";
    public string PythonCallTemplate => "check_run_length({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        object[] log = ["ok", "ok", "fault", "ok"];
        return
        [
            Basics.Step(log, [0], "ok x1 so far", "current run", "Start a run with the first status."),
            Basics.Step(log, [1], "ok x2 so far", "current run", "Same status: the run grows."),
            Basics.Step(log, [2], "fault x1 so far", "current run", "Different status: finish \"ok x2\" and start a new run."),
            Basics.Step(log, [3], "ok x1 so far", "current run", "Different again: finish \"fault x1\". This \"ok\" starts its own run, because runs are about neighbours."),
            Basics.Step(log, [], "[ok x2, fault x1, ok x1]", "result", "The input has ended: add the final run. Forgetting this step is the classic bug."),
        ];
    }
}
