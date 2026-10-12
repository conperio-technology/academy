namespace DsaAcademy.Content.Concepts;

public class InterMinMax : IConcept
{
    public string Id => "inter-min-max";
    public string Section => Basics.Section;
    public string Track => Inter.Track;
    public int Order => 1301;
    public string Title => "Generic Min and Max";
    public string OneLiner => "Write one generic method that returns the smallest and largest item of a list of any comparable type, numbers and words alike.";
    public string KeyTakeaway =>
        "A type parameter with a constraint, where T : IComparable<T>, lets one method work for every type that can be " +
        "compared, with full type checking. Inside, you can only use what the constraint promises: CompareTo. Python's " +
        "version just uses < and > and states the intent with type hints.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write MinMax(items), which returns both the smallest and the largest item of a non-empty list, in one pass. " +
        "The same code must work for a list of ints and a list of strings: each test calls it on both. [3, 9, 1, 7] " +
        "gives (1, 9), and [\"pear\", \"apple\", \"fig\"] gives (\"apple\", \"pear\"), comparing words alphabetically. Words are " +
        "lowercase letters.\n\n" +
        "In C# the signature is static (T Min, T Max) MinMax<T>(List<T> items) where T : IComparable<T>. The constraint " +
        "is what allows a.CompareTo(b), which is negative when a comes before b, zero when they're equal and positive " +
        "when a comes after. Start with the first item as both the minimum and the maximum and update them as you go. " +
        "Try it without LINQ's Min and Max, which would need two passes anyway.\n\n" +
        "In Python, def min_max(items: list[T]) -> tuple[T, T] declares the same intent with type hints (with T from " +
        "Python 3.12's def min_max[T](...) syntax or a TypeVar); the code uses < and > directly and returns a tuple. " +
        "The checker unpacks your pair and reports [min, max, smallest word, largest word].";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static (T Min, T Max) MinMax<T>(List<T> items) where T : IComparable<T>\n" +
            "    {\n" +
            "        T min = items[0];\n" +
            "        T max = items[0];\n" +
            "        // TODO: one pass, using CompareTo.\n" +
            "        return (min, max);\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def min_max(items):\n" +
            "    lo = items[0]\n" +
            "    hi = items[0]\n" +
            "    # TODO: one pass, using < and >.\n" +
            "    return lo, hi\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MinMax",
        ["python"] = "min_max",
    };

    // Each test calls MinMax twice, on ints and on strings, so the method must be generic.
    public string? CSharpHarnessPreamble =>
        "public static class MinMaxCheck\n" +
        "{\n" +
        "    public static object[] Check(int[] numbers, string[] words)\n" +
        "    {\n" +
        "        var (lo, hi) = Solution.MinMax(numbers.ToList());\n" +
        "        var (wordLo, wordHi) = Solution.MinMax(words.ToList());\n" +
        "        return [lo, hi, wordLo, wordHi];\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "def check_min_max(numbers, words):\n" +
        "    lo, hi = min_max(numbers)\n" +
        "    word_lo, word_hi = min_max(words)\n" +
        "    return [lo, hi, word_lo, word_hi]\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([3, 9, 1, 7]), Basics.StrArray("pear", "apple", "fig")), "[1, 9, \"apple\", \"pear\"]"),
        new TestCase(Lit.Args(Lit.IntArray([5]), Basics.StrArray("solo")), "[5, 5, \"solo\", \"solo\"]"),
        new TestCase(Lit.Args(Lit.IntArray([-2, -8, 0]), Basics.StrArray("b", "a", "c")), "[-8, 0, \"a\", \"c\"]"),
        new TestCase(Lit.Args(Lit.IntArray([4, 4, 4]), Basics.StrArray("zz", "z", "zzz")), "[4, 4, \"z\", \"zzz\"]"),
        new TestCase(Lit.Args(Lit.IntArray([100, -100, 50, 0]), Basics.StrArray("motor", "fan", "valve", "pump")), "[-100, 100, \"fan\", \"valve\"]"),
    ];

    public string CSharpCallTemplate => "MinMaxCheck.Check({input})";
    public string PythonCallTemplate => "check_min_max({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] sample = [3, 9, 1, 7];
        var arr = Basics.Boxed(sample);
        var steps = new List<VisualizationStep> { Basics.Step(arr, [0], "min 3, max 3", "so far", "Start with the first item as both min and max.") };
        int lo = sample[0], hi = sample[0];
        for (var i = 1; i < sample.Length; i++)
        {
            var x = sample[i];
            string note;
            if (x.CompareTo(lo) < 0) { lo = x; note = $"{x}.CompareTo(min) is negative: {x} comes first, so it's the new min."; }
            else if (x.CompareTo(hi) > 0) { hi = x; note = $"{x}.CompareTo(max) is positive: {x} is the new max."; }
            else note = $"{x} is between them: no change.";
            steps.Add(Basics.Step(arr, [i], $"min {lo}, max {hi}", "so far", note));
        }
        steps.Add(Basics.Step(["pear", "apple", "fig"], [1, 0], "min apple, max pear", "same code, T = string", "The same method on strings: CompareTo now compares alphabetically."));
        return steps;
    }
}
