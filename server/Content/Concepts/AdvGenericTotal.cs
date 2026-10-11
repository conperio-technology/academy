namespace DsaAcademy.Content.Concepts;

public class AdvGenericTotal : IConcept
{
    public string Id => "adv-generic-total";
    public string Section => Basics.Section;
    public string Track => Adv.Track;
    public int Order => 2501;
    public string Title => "Generic Total for Any Number Type";
    public string OneLiner => "Write one Total method that adds up a sequence of ints, longs, decimals or doubles, using generic math in C# and a constrained type variable in Python.";
    public string KeyTakeaway =>
        "where T : INumber<T> lets generic code use + and T.Zero, because static abstract interface members put " +
        "operators and constants on the type parameter. The same loop then sums ints, longs without overflow, decimals " +
        "exactly (0.1 + 0.2 is 0.3) and doubles inexactly (0.30000000000000004). Python needs no constraint to run, only " +
        "to type check.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write Total(items), which returns the sum of a sequence of numbers of any one numeric type, and the type's zero " +
        "for an empty sequence. Each test calls it five times: on a list of ints; on the same numbers times a billion " +
        "as longs (an int would overflow); on amounts in cents divided by 100 as decimals; on the same amounts as " +
        "doubles; and on an empty list of ints. With ints [1, 2, 3] and cents [10, 20] the results are [6, " +
        "6000000000, 0.3, 0.30000000000000004, 0]: decimal stores 0.1 and 0.2 exactly, double can't.\n\n" +
        "In C# the signature is static T Total<T>(IEnumerable<T> items) where T : INumber<T> (System.Numerics is " +
        "already imported for you). Start from T.Zero, a static member that the constraint makes available on the " +
        "type parameter, and add with +=, which INumber<T> also promises. Don't convert to double or decimal along the " +
        "way: each type must be added in its own arithmetic.\n\n" +
        "In Python the code is a simple loop (or sum), and the typing is the interesting part: def total[T: (int, " +
        "float, Decimal)](items: Iterable[T]) -> T declares a constrained type variable, so a type checker knows that " +
        "summing Decimals gives a Decimal. The checker converts your Decimal result to a float to report it.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static T Total<T>(IEnumerable<T> items) where T : INumber<T>\n" +
            "    {\n" +
            "        // TODO: start from T.Zero and add each item.\n" +
            "        return items.First();\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "from collections.abc import Iterable\n" +
            "from decimal import Decimal\n" +
            "\n" +
            "\n" +
            "def total[T: (int, float, Decimal)](items: Iterable[T]) -> T:\n" +
            "    # TODO: add them up; an empty input gives 0.\n" +
            "    return next(iter(items))\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Total",
        ["python"] = "total",
    };

    public string? CSharpHarnessPreamble =>
        "using System.Numerics;\n" +
        "\n" +
        "public static class TotalCheck\n" +
        "{\n" +
        "    public static object[] Check(int[] ints, int[] cents) =>\n" +
        "    [\n" +
        "        Solution.Total(ints),\n" +
        "        Solution.Total(ints.Select(i => (long)i * 1_000_000_000L)),\n" +
        "        Solution.Total(cents.Select(c => c / 100m)),\n" +
        "        Solution.Total(cents.Select(c => c / 100.0)),\n" +
        "        Solution.Total(new List<int>()),\n" +
        "    ];\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "from decimal import Decimal\n" +
        "\n" +
        "\n" +
        "def check_total(ints, cents):\n" +
        "    return [\n" +
        "        total(ints),\n" +
        "        total([i * 1_000_000_000 for i in ints]),\n" +
        "        float(total([Decimal(c) / 100 for c in cents])),\n" +
        "        total([c / 100 for c in cents]),\n" +
        "        total([]),\n" +
        "    ]\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3]), Lit.IntArray([10, 20])), "[6, 6000000000, 0.3, 0.30000000000000004, 0]"),
        new TestCase(Lit.Args(Lit.IntArray([5]), Lit.IntArray([199, 1])), "[5, 5000000000, 2, 2, 0]"),
        new TestCase(Lit.Args(Lit.IntArray([2000000000, 1, -1]), Lit.IntArray([10, 10, 10])), "[2000000000, 2000000000000000000, 0.3, 0.30000000000000004, 0]"),
        new TestCase(Lit.Args(Lit.IntArray([-4, 4]), Lit.IntArray([])), "[0, 0, 0, 0, 0]"),
        new TestCase(Lit.Args(Lit.IntArray([7, 8]), Lit.IntArray([1999, -999])), "[15, 15000000000, 10, 9.999999999999998, 0]"),
    ];

    public string CSharpCallTemplate => "TotalCheck.Check({input})";
    public string PythonCallTemplate => "check_total({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        return
        [
            Basics.Step(["0.1", "0.2"], [], "T.Zero = 0", "decimal", "T = decimal. The constraint where T : INumber<T> is what makes T.Zero and + available."),
            Basics.Step(["0.1", "0.2"], [0], "0.1", "decimal", "Add 0.1: decimal stores base-10 digits, so 0.1 is exact."),
            Basics.Step(["0.1", "0.2"], [1], "0.3", "decimal", "Add 0.2: exactly 0.3."),
            Basics.Step(["0.1", "0.2"], [0, 1], "0.30000000000000004", "double", "The same code with T = double: binary floating point can't store 0.1 or 0.2 exactly, and the error shows."),
        ];
    }
}
