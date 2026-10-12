namespace DsaAcademy.Content.Concepts;

public class AdvInclusiveRange : IConcept
{
    public string Id => "adv-inclusive-range";
    public string Section => Basics.Section;
    public string Track => Adv.Track;
    public int Order => 2402;
    public string Title => "A Range You Can Index, Count and Loop Over";
    public string OneLiner => "Write StepRange, a lazy range of numbers from start to stop by step, that supports a count, indexing, membership tests in O(1) and looping, without ever storing its numbers.";
    public string KeyTakeaway =>
        "A collection doesn't have to store its items: compute them. Count, indexing and membership are arithmetic, so " +
        "they're O(1) even for a billion numbers. In C# that means a Count property, an indexer and an IEnumerable<int> " +
        "iterator; in Python, __len__, __getitem__, __contains__ and __iter__. Without your own Contains or __contains__, " +
        "the language falls back to looping through every item.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write a class StepRange(start, stop, step) for the numbers start, start + step, start + 2 * step, ... up to " +
        "and including stop if it's reached. StepRange(1, 10, 3) is 1, 4, 7, 10 and StepRange(1, 9, 3) is 1, 4, 7. step " +
        "is always 1 or more, and if stop is less than start the range is empty. It must support: the number of items " +
        "(Count in C#, len() in Python); indexing, range[i] for 0 <= i < count, which must throw " +
        "ArgumentOutOfRangeException (C#) or IndexError (Python) for any other i; a membership test (Contains(x) in " +
        "C#, x in range in Python); and looping with foreach / for.\n\n" +
        "Don't store the numbers: one test uses StepRange(0, 2000000000, 2), which has a billion items. The count is " +
        "(stop - start) / step + 1 when stop >= start (use long arithmetic in C# to be safe, as the difference can exceed " +
        "int.MaxValue), item i is start + i * step, and x is in the range when start <= x <= stop and (x - start) is " +
        "divisible by step. Each test reports [count, the items as a list (only when there are 20 or fewer), the " +
        "membership results for the probe values, range[0] or \"error\", and range[count] or \"error\"].\n\n" +
        "In C#, implement IEnumerable<int> with a yield-based GetEnumerator plus the non-generic one, a Count property, " +
        "an indexer public int this[int i] and a Contains method. Without your own Contains, range.Contains(x) quietly " +
        "uses LINQ's version, which loops over all billion numbers. In Python, write __len__, __getitem__, __contains__ " +
        "and __iter__; without __contains__, in falls back to iterating.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class StepRange : IEnumerable<int>\n" +
            "{\n" +
            "    private readonly int _start, _stop, _step;\n" +
            "\n" +
            "    public StepRange(int start, int stop, int step) => (_start, _stop, _step) = (start, stop, step);\n" +
            "\n" +
            "    public int Count => 0;                          // TODO\n" +
            "\n" +
            "    public int this[int i] => _start + i * _step;   // TODO: check i\n" +
            "\n" +
            "    // TODO: public bool Contains(int x) => ...\n" +
            "\n" +
            "    public IEnumerator<int> GetEnumerator()\n" +
            "    {\n" +
            "        for (int i = 0; i < Count; i++) yield return this[i];\n" +
            "    }\n" +
            "\n" +
            "    System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator() => GetEnumerator();\n" +
            "}\n",
        ["python"] =
            "class StepRange:\n" +
            "    def __init__(self, start, stop, step):\n" +
            "        self.start, self.stop, self.step = start, stop, step\n" +
            "\n" +
            "    def __len__(self):\n" +
            "        return 0  # TODO\n" +
            "\n" +
            "    def __getitem__(self, i):\n" +
            "        return self.start + i * self.step  # TODO: raise IndexError when out of range\n" +
            "\n" +
            "    # TODO: __contains__ and __iter__\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "StepRange",
        ["python"] = "StepRange",
    };

    public string? CSharpHarnessPreamble =>
        "public static class RangeCheck\n" +
        "{\n" +
        "    public static List<object> Check(int start, int stop, int step, int[] probes)\n" +
        "    {\n" +
        "        var range = new StepRange(start, stop, step);\n" +
        "        var results = new List<object> { range.Count };\n" +
        "        results.Add(range.Count <= 20 ? range.ToList() : (object)\"too many to list\");\n" +
        "        results.Add(probes.Select(p => range.Contains(p)).ToList());\n" +
        "        foreach (int i in new[] { 0, range.Count })\n" +
        "        {\n" +
        "            try { results.Add(range[i]); }\n" +
        "            catch (ArgumentOutOfRangeException) { results.Add(\"error\"); }\n" +
        "        }\n" +
        "        return results;\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "def check_range(start, stop, step, probes):\n" +
        "    r = StepRange(start, stop, step)\n" +
        "    results = [len(r)]\n" +
        "    results.append(list(r) if len(r) <= 20 else \"too many to list\")\n" +
        "    results.append([p in r for p in probes])\n" +
        "    for i in (0, len(r)):\n" +
        "        try:\n" +
        "            results.append(r[i])\n" +
        "        except IndexError:\n" +
        "            results.append(\"error\")\n" +
        "    return results\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.Int(1), Lit.Int(10), Lit.Int(3), Lit.IntArray([4, 5, 10, 13])),
            "[4, [1, 4, 7, 10], [true, false, true, false], 1, \"error\"]"),
        new TestCase(Lit.Args(Lit.Int(1), Lit.Int(9), Lit.Int(3), Lit.IntArray([7, 9, 1, -2])),
            "[3, [1, 4, 7], [true, false, true, false], 1, \"error\"]"),
        new TestCase(Lit.Args(Lit.Int(5), Lit.Int(4), Lit.Int(1), Lit.IntArray([4, 5])),
            "[0, [], [false, false], \"error\", \"error\"]"),
        new TestCase(Lit.Args(Lit.Int(-6), Lit.Int(6), Lit.Int(4), Lit.IntArray([-6, -2, 0, 2, 6])),
            "[4, [-6, -2, 2, 6], [true, true, false, true, true], -6, \"error\"]"),
        new TestCase(Lit.Args(Lit.Int(7), Lit.Int(7), Lit.Int(5), Lit.IntArray([7, 12])),
            "[1, [7], [true, false], 7, \"error\"]"),
        new TestCase(Lit.Args(Lit.Int(0), Lit.Int(2000000000), Lit.Int(2), Lit.IntArray([1999999998, 7, 2000000000, -2])),
            "[1000000001, \"too many to list\", [true, false, true, false], 0, \"error\"]"),
    ];

    public string CSharpCallTemplate => "RangeCheck.Check({input})";
    public string PythonCallTemplate => "check_range({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        object[] items = [1, 4, 7, 10];
        return
        [
            Basics.Step(items, [], "count 4", "StepRange(1, 10, 3)", "Nothing is stored: these four numbers are computed when asked for. Count = (10 - 1) / 3 + 1 = 4."),
            Basics.Step(items, [2], "this[2] = 7", "StepRange(1, 10, 3)", "Indexing is arithmetic: item 2 is 1 + 2 * 3 = 7. Index 4 would be past the end, so it throws."),
            Basics.Step(items, [], "5 in range? no", "StepRange(1, 10, 3)", "Membership is arithmetic too: 5 is between 1 and 10, but (5 - 1) % 3 isn't 0, so it's not in the range. O(1), no loop."),
            Basics.Step(items, [0, 1, 2, 3], "foreach", "StepRange(1, 10, 3)", "Looping yields start, start + step, ... one at a time, so even a billion-item range costs no memory."),
        ];
    }
}
