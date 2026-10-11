namespace DsaAcademy.Content.Concepts;

public class InterDistinctPoints : IConcept
{
    public string Id => "inter-distinct-points";
    public string Section => Basics.Section;
    public string Track => Inter.Track;
    public int Order => 1501;
    public string Title => "Distinct Points with a Record";
    public string OneLiner => "Turn a plain Point class into a record (or frozen dataclass) so equal points really are equal, then remove duplicates with a set.";
    public string KeyTakeaway =>
        "A hash set can only spot duplicates if equal objects compare equal and hash equally. A record or a frozen " +
        "dataclass gives you both from the field list; a plain class compares by identity, so two Point(1, 2) objects " +
        "are different and nothing is ever a duplicate.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "The starter code has an ordinary Point class with X and Y, and a Distinct(points) method to finish: return the " +
        "points with duplicates removed, keeping the first occurrence of each, in order. [(1, 2), (1, 2), (3, 4)] gives " +
        "[(1, 2), (3, 4)].\n\n" +
        "Write the loop with a HashSet<Point> (C#) or a set (Python): for each point, if it isn't in the set, add it to " +
        "the set and to the result. Then run the tests: they still fail, because the plain class compares by identity, " +
        "so every Point is different from every other, even with the same X and Y. The fix is the point of the " +
        "exercise: make Point a record, public record Point(int X, int Y);, or in Python a @dataclass(frozen=True) with " +
        "fields x and y. Both generate equality and a matching hash code. (Plain @dataclass isn't enough in Python: " +
        "without frozen=True it has no hash, so it can't go in a set.)\n\n" +
        "Each test also checks Point itself: the last value in the result is true only if Point(0, 0) equals Point(0, " +
        "0) and a set of two such points has just one item. The points are shown as [x, y] pairs.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "// An ordinary class: two Points with the same X and Y are still NOT equal.\n" +
            "// TODO: make it a record so they are.\n" +
            "public class Point\n" +
            "{\n" +
            "    public int X { get; }\n" +
            "    public int Y { get; }\n" +
            "    public Point(int x, int y) { X = x; Y = y; }\n" +
            "}\n" +
            "\n" +
            "public class Solution\n" +
            "{\n" +
            "    public static List<Point> Distinct(List<Point> points)\n" +
            "    {\n" +
            "        var seen = new HashSet<Point>();\n" +
            "        var result = new List<Point>();\n" +
            "        // TODO: add each point to result the first time it's seen.\n" +
            "        return result;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "# An ordinary class: two Points with the same x and y are still NOT equal.\n" +
            "# TODO: make it a frozen dataclass so they are.\n" +
            "class Point:\n" +
            "    def __init__(self, x, y):\n" +
            "        self.x = x\n" +
            "        self.y = y\n" +
            "\n" +
            "\n" +
            "def distinct(points):\n" +
            "    seen = set()\n" +
            "    result = []\n" +
            "    # TODO: add each point to result the first time it's seen.\n" +
            "    return result\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Distinct",
        ["python"] = "distinct",
    };

    // Points go in as [x, y] pairs; the result is the distinct pairs plus whether Point has value equality and hashing.
    public string? CSharpHarnessPreamble =>
        "public static class PointCheck\n" +
        "{\n" +
        "    public static object[] Check(int[][] coords)\n" +
        "    {\n" +
        "        var points = coords.Select(c => new Point(c[0], c[1])).ToList();\n" +
        "        var pairs = Solution.Distinct(points).Select(p => new[] { p.X, p.Y }).ToList();\n" +
        "        var valueEquality = new Point(0, 0).Equals(new Point(0, 0))\n" +
        "            && new HashSet<Point> { new Point(0, 0), new Point(0, 0) }.Count == 1;\n" +
        "        return [pairs, valueEquality];\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "def check_points(coords):\n" +
        "    points = [Point(x, y) for x, y in coords]\n" +
        "    pairs = [[p.x, p.y] for p in distinct(points)]\n" +
        "    try:\n" +
        "        value_equality = Point(0, 0) == Point(0, 0) and len({Point(0, 0), Point(0, 0)}) == 1\n" +
        "    except TypeError:\n" +
        "        value_equality = False\n" +
        "    return [pairs, value_equality]\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Inter.Grid([1, 2], [1, 2], [3, 4]), "[[[1, 2], [3, 4]], true]"),
        new TestCase(Inter.Grid(), "[[], true]"),
        new TestCase(Inter.Grid([0, 0]), "[[[0, 0]], true]"),
        new TestCase(Inter.Grid([5, 1], [1, 5], [5, 1], [1, 5], [2, 2]), "[[[5, 1], [1, 5], [2, 2]], true]"),
        new TestCase(Inter.Grid([-1, -1], [-1, -1], [-1, -1]), "[[[-1, -1]], true]"),
    ];

    public string CSharpCallTemplate => "PointCheck.Check({input})";
    public string PythonCallTemplate => "check_points({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        object[] pts = ["(1, 2)", "(1, 2)", "(3, 4)"];
        return
        [
            Basics.Step(pts, [], "{}", "seen", "Three points; the first two have the same X and Y."),
            Basics.Step(pts, [0], "{(1, 2)}", "seen", "(1, 2) isn't in the set: add it to the set and the result."),
            Basics.Step(pts, [1], "{(1, 2)}", "seen", "With a record, the second (1, 2) has the same hash code and Equals is true: it's a duplicate, skip it. With the plain class it would look new and be added again."),
            Basics.Step(pts, [2], "{(1, 2), (3, 4)}", "seen", "(3, 4) is new: add it."),
            Basics.Step(pts, [0, 2], "[(1, 2), (3, 4)]", "result", "First occurrences, in their original order."),
        ];
    }
}
