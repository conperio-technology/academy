namespace DsaAcademy.Content.Concepts;

public class BlockCoastCells : BuildingBlock
{
    public override string Id => "block-coast-cells";
    public override string Title => "Block: Grid Neighbours With a Directions Array";
    public override string OneLiner => "Count the land cells in a grid that touch water up, down, left or right.";
    public override string KeyTakeaway =>
        "Keep the four directions in one array and loop over it; bounds-check the neighbour before you read it. Every grid BFS and DFS starts with these five lines.";

    public override string Explanation =>
        "grid holds 1 for land and 0 for water. Count the land cells with at least one water cell directly above, below, left or right. Cells outside the grid don't count as water.\n" +
        "\n" +
        "Write the directions once: (-1, 0), (1, 0), (0, -1), (0, 1). For each land cell, loop over them, compute the neighbour's row and column, skip it if it falls outside 0..rows-1 or 0..cols-1, and check it. Count the cell once and stop as soon as one neighbour is water.";

    protected override string[] Plan =>
    [
        "Make the four directions as (row, column) steps: up, down, left, right.",
        "Walk every cell by row and column, skipping water.",
        "For each direction, work out the neighbour's position and skip it if it is outside the grid.",
        "If any neighbour is water, count this cell once and stop checking it.",
        "Return the count.",
    ];

    protected override string CSharpSignature => "public static int CountCoastCells(int[][] grid)";
    protected override string CSharpReturnStub => "return 0;";
    protected override string PythonSignature => "def count_coast_cells(grid):";
    protected override string PythonReturnStub => "return 0";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CountCoastCells",
        ["python"] = "count_coast_cells",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("[[1, 1, 1], [1, 1, 1], [1, 1, 1]]", "0"),
        new TestCase("[[0, 1, 0], [1, 1, 1], [0, 1, 0]]", "4"),
        new TestCase("[]", "0"),
        new TestCase("[[1]]", "0"),
        new TestCase("[[1, 0]]", "1"),
        new TestCase("[[0, 0], [0, 0]]", "0"),
        new TestCase("[[1, 1, 0], [1, 1, 1], [1, 1, 1]]", "2"),
    ];

    public override string CSharpCallTemplate => "Solution.CountCoastCells({input})";
    public override string PythonCallTemplate => "count_coast_cells({input})";

    public override List<string> Gotchas =>
    [
        "Reading grid[r][c] before the bounds check, or checking rows against the column count.",
        "Counting a cell once per water neighbour instead of once.",
    ];
}
