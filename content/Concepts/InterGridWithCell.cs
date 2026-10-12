namespace DsaAcademy.Content.Concepts;

public class InterGridWithCell : IConcept
{
    public string Id => "inter-grid-with-cell";
    public string Section => Basics.Section;
    public string Track => Inter.Track;
    public int Order => 1601;
    public string Title => "Change a Copy, Not the Original";
    public string OneLiner => "Return a new grid with one cell changed, leaving the caller's grid exactly as it was, which means copying the rows too.";
    public string KeyTakeaway =>
        "Copying the outer array or list isn't enough for a grid: a shallow copy still shares every row, so changing a " +
        "cell changes the original too. Copy the rows (every row, or at least the one you change) before writing to " +
        "them.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write WithCell(grid, row, col, value), which returns a new grid equal to grid except that grid[row][col] is " +
        "value. The caller's grid must not change. For [[1, 2], [3, 4]], row 0, column 1 and value 9 the answer is [[1, " +
        "9], [3, 4]], and the original is still [[1, 2], [3, 4]] afterwards. row and col are always inside the grid.\n\n" +
        "Each test reports two grids: your result, and the original after your function returned, so changing the input " +
        "fails the test. The trap is the shallow copy: grid.Clone() or grid.ToArray() in C#, and grid.copy(), " +
        "list(grid) or grid[:] in Python, all make a new outer array that still holds the same row objects. Writing to " +
        "a row of the copy writes to the original's row.\n\n" +
        "Copy each row as well: grid.Select(r => r.ToArray()).ToArray() in C#, or [row.copy() for row in grid] (or " +
        "copy.deepcopy(grid)) in Python, then change the cell in the copy. Copying only the row you change and sharing " +
        "the others also works and is what immutable data structures do, but get the simple version right first.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[][] WithCell(int[][] grid, int row, int col, int value)\n" +
            "    {\n" +
            "        // TODO: copy the grid (rows too), then change one cell of the copy.\n" +
            "        return grid;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def with_cell(grid, row, col, value):\n" +
            "    # TODO: copy the grid (rows too), then change one cell of the copy.\n" +
            "    return grid\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.WithCell",
        ["python"] = "with_cell",
    };

    // Each test reports [your result, the original grid after the call].
    public string? CSharpHarnessPreamble =>
        "public static class GridCheck\n" +
        "{\n" +
        "    public static object[] Check(int[][] grid, int row, int col, int value)\n" +
        "    {\n" +
        "        var result = Solution.WithCell(grid, row, col, value);\n" +
        "        return [result, grid];\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "def check_with_cell(grid, row, col, value):\n" +
        "    result = with_cell(grid, row, col, value)\n" +
        "    return [result, grid]\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Inter.Grid([1, 2], [3, 4]), Lit.Int(0), Lit.Int(1), Lit.Int(9)), "[[[1, 9], [3, 4]], [[1, 2], [3, 4]]]"),
        new TestCase(Lit.Args(Inter.Grid([0]), Lit.Int(0), Lit.Int(0), Lit.Int(5)), "[[[5]], [[0]]]"),
        new TestCase(Lit.Args(Inter.Grid([1, 2, 3]), Lit.Int(0), Lit.Int(2), Lit.Int(0)), "[[[1, 2, 0]], [[1, 2, 3]]]"),
        new TestCase(Lit.Args(Inter.Grid([1, 1, 1], [1, 1, 1], [1, 1, 1]), Lit.Int(1), Lit.Int(1), Lit.Int(7)), "[[[1, 1, 1], [1, 7, 1], [1, 1, 1]], [[1, 1, 1], [1, 1, 1], [1, 1, 1]]]"),
        new TestCase(Lit.Args(Inter.Grid([4, 4], [4, 4]), Lit.Int(1), Lit.Int(0), Lit.Int(4)), "[[[4, 4], [4, 4]], [[4, 4], [4, 4]]]"),
    ];

    public string CSharpCallTemplate => "GridCheck.Check({input})";
    public string PythonCallTemplate => "check_with_cell({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        return
        [
            Basics.Step(["row 0: [1, 2]", "row 1: [3, 4]"], [], "[[1, 2], [3, 4]]", "original", "The caller's grid. Change row 0, column 1 to 9 in a copy."),
            Basics.Step(["row 0: [1, 9]", "row 1: [3, 4]"], [0], "[[1, 9], [3, 4]]", "original", "Shallow copy: a new outer array, but row 0 is the same object in both. Writing 9 into the copy's row 0 changed the original too."),
            Basics.Step(["row 0: [1, 2]", "row 1: [3, 4]"], [], "[[1, 2], [3, 4]]", "original", "Start again with a deep copy: copy each row into a new array first."),
            Basics.Step(["row 0: [1, 9]", "row 1: [3, 4]"], [0], "[[1, 2], [3, 4]]", "original", "Now the change lands in the copy's own row 0, and the original is untouched."),
        ];
    }
}
