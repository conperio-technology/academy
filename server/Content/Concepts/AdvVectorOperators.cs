namespace DsaAcademy.Content.Concepts;

public class AdvVectorOperators : IConcept
{
    public string Id => "adv-vector-operators";
    public string Section => Basics.Section;
    public string Track => Adv.Track;
    public int Order => 2401;
    public string Title => "A Vector Type with Operators";
    public string OneLiner => "Write a small 2D vector type that works with +, -, unary minus, multiplication by a number on either side, == and sets, and prints as (x, y).";
    public string KeyTakeaway =>
        "C# operators are public static methods (operator +), and 3 * v and v * 3 need separate overloads; a record " +
        "struct gives value equality and hashing for free. Python calls __add__, __sub__, __neg__, __mul__ and, for " +
        "3 * v, __rmul__; define __eq__ and __hash__ together, and return NotImplemented (or False from __eq__) for types " +
        "you don't handle instead of crashing.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write a type Vec for 2D vectors with whole-number coordinates, created as new Vec(x, y) in C# and Vec(x, y) in " +
        "Python. It needs: a + b and a - b (coordinate by coordinate), -a, a * k and k * a for an int k, equality " +
        "(a == b exactly when both coordinates match, and a == 5 is simply false), hashing consistent with equality so " +
        "equal vectors count once in a set, and text: (3, -4) prints as \"(3, -4)\".\n\n" +
        "Each test builds a from the first pair of numbers, b from the second and takes k, then reports [a + b, a - b, " +
        "-a, a * k, k * a] as text, followed by a == b, a == new Vec(a's coordinates), the number of distinct vectors in " +
        "a set of a, a copy of a, and b, and a == 5. For a = (1, 2), b = (3, 4) and k = 3 that's [\"(4, 6)\", \"(-2, -2)\", " +
        "\"(-1, -2)\", \"(3, 6)\", \"(3, 6)\", false, true, 2, false].\n\n" +
        "In C#, a readonly record struct Vec(int X, int Y) already has value equality, GetHashCode and == ; add the " +
        "operators as public static Vec operator +(Vec p, Vec q) and so on (two for *), and override ToString. In " +
        "Python, write __add__, __sub__, __neg__, __mul__ with __rmul__ = __mul__, __eq__ (return False, or " +
        "NotImplemented, when the other value isn't a Vec), __hash__ returning hash((self.x, self.y)), and __repr__.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public readonly record struct Vec(int X, int Y)\n" +
            "{\n" +
            "    public static Vec operator +(Vec p, Vec q) => new(p.X + q.X, p.Y + q.Y);\n" +
            "    // TODO: binary -, unary -, Vec * int and int * Vec.\n" +
            "    public override string ToString() => $\"Vec {X} {Y}\";   // TODO: (x, y)\n" +
            "}\n",
        ["python"] =
            "class Vec:\n" +
            "    def __init__(self, x, y):\n" +
            "        self.x = x\n" +
            "        self.y = y\n" +
            "\n" +
            "    def __add__(self, other):\n" +
            "        return Vec(self.x + other.x, self.y + other.y)\n" +
            "\n" +
            "    # TODO: __sub__, __neg__, __mul__, __rmul__, __eq__, __hash__, __repr__\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Vec",
        ["python"] = "Vec",
    };

    public string? CSharpHarnessPreamble =>
        "public static class VecCheck\n" +
        "{\n" +
        "    public static List<object> Check(int[] first, int[] second, int k)\n" +
        "    {\n" +
        "        var a = new Vec(first[0], first[1]);\n" +
        "        var b = new Vec(second[0], second[1]);\n" +
        "        return\n" +
        "        [\n" +
        "            (a + b).ToString(), (a - b).ToString(), (-a).ToString(), (a * k).ToString(), (k * a).ToString(),\n" +
        "            a == b, a == new Vec(first[0], first[1]),\n" +
        "            new HashSet<Vec> { a, new Vec(first[0], first[1]), b }.Count,\n" +
        "            a.Equals(5),\n" +
        "        ];\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "def check_vec(first, second, k):\n" +
        "    a = Vec(first[0], first[1])\n" +
        "    b = Vec(second[0], second[1])\n" +
        "    return [\n" +
        "        str(a + b), str(a - b), str(-a), str(a * k), str(k * a),\n" +
        "        a == b, a == Vec(first[0], first[1]),\n" +
        "        len({a, Vec(first[0], first[1]), b}),\n" +
        "        a == 5,\n" +
        "    ]\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([1, 2]), Lit.IntArray([3, 4]), Lit.Int(3)),
            "[\"(4, 6)\", \"(-2, -2)\", \"(-1, -2)\", \"(3, 6)\", \"(3, 6)\", false, true, 2, false]"),
        new TestCase(Lit.Args(Lit.IntArray([5, -1]), Lit.IntArray([5, -1]), Lit.Int(0)),
            "[\"(10, -2)\", \"(0, 0)\", \"(-5, 1)\", \"(0, 0)\", \"(0, 0)\", true, true, 1, false]"),
        new TestCase(Lit.Args(Lit.IntArray([0, 0]), Lit.IntArray([-2, 7]), Lit.Int(-2)),
            "[\"(-2, 7)\", \"(2, -7)\", \"(0, 0)\", \"(0, 0)\", \"(0, 0)\", false, true, 2, false]"),
        new TestCase(Lit.Args(Lit.IntArray([-3, 4]), Lit.IntArray([4, -3]), Lit.Int(10)),
            "[\"(1, 1)\", \"(-7, 7)\", \"(3, -4)\", \"(-30, 40)\", \"(-30, 40)\", false, true, 2, false]"),
    ];

    public string CSharpCallTemplate => "VecCheck.Check({input})";
    public string PythonCallTemplate => "check_vec({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        return
        [
            Basics.Step([1, 2], [], "a = (1, 2)", "values", "a = (1, 2), b = (3, 4), k = 3."),
            Basics.Step([4, 6], [0, 1], "a + b", "values", "a + b calls operator + (C#) or a.__add__(b) (Python): (4, 6)."),
            Basics.Step([-1, -2], [0, 1], "-a", "values", "-a is the unary minus: operator -(Vec) or __neg__: (-1, -2)."),
            Basics.Step([3, 6], [0, 1], "3 * a", "values", "3 * a: C# needs operator *(int, Vec); Python tries int's * first, gets NotImplemented, then calls a.__rmul__(3)."),
            Basics.Step([1, 2], [], "set size 2", "values", "{a, Vec(1, 2), b} holds 2 vectors: equal values must have equal hashes, so the copy of a isn't counted twice."),
        ];
    }
}
