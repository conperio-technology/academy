namespace DsaAcademy.Content.Concepts;

public class BlockMemoGridPaths : BuildingBlock
{
    public override string Id => "block-memo-grid-paths";
    public override string Title => "Block: Memoized Recursion (Top-Down DP)";
    public override string OneLiner => "Count the paths through a grid moving only right or down, caching each subproblem so it is solved once.";
    public override string KeyTakeaway =>
        "Top-down DP is the plain recursion plus three lines: check the memo, compute, store. Key the memo on exactly the arguments that change.";

    public override string Explanation =>
        "A robot starts at the top-left cell of a rows by cols grid and moves only right or down. Return how many different paths reach the bottom-right cell. A 3 by 7 grid has 28.\n" +
        "\n" +
        "The number of ways into cell (r, c) is the ways into the cell above plus the ways into the cell to the left, and any cell in the top row or left column has exactly one. Written as plain recursion that is exponential, because the same cells are recomputed over and over. Add a memo keyed on (r, c): return the stored answer if there is one, otherwise compute and store. Each cell is then solved once. Climbing Stairs, Decode Ways and Word Break start as this block.";

    protected override string[] Plan =>
    [
        "Make an empty memo map from (row, col) to its answer.",
        "Write ways(r, c): a cell in the top row or left column has exactly 1 way.",
        "If (r, c) is in the memo, return the stored answer.",
        "Otherwise ways(r - 1, c) + ways(r, c - 1); store it in the memo and return it.",
        "Return ways(rows - 1, cols - 1).",
    ];

    protected override string CSharpSignature => "public static int CountPaths(int rows, int cols)";
    protected override string CSharpReturnStub => "return 0;";
    protected override string PythonSignature => "def count_paths(rows, cols):";
    protected override string PythonReturnStub => "return 0";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CountPaths",
        ["python"] = "count_paths",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("3, 7", "28"),
        new TestCase("3, 2", "3"),
        new TestCase("1, 1", "1"),
        new TestCase("1, 5", "1"),
        new TestCase("10, 10", "48620"),
        new TestCase("17, 17", "601080390"),
    ];

    public override string CSharpCallTemplate => "Solution.CountPaths({input})";
    public override string PythonCallTemplate => "count_paths({input})";

    public override List<string> Gotchas =>
    [
        "Checking the memo after recursing instead of before, which keeps the exponential running time.",
        "A memo key that leaves out one of the changing arguments, so different subproblems share an answer.",
    ];
}
