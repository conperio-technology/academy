namespace DsaAcademy.Content.Concepts;

public class BlockGridDistanceToZero : BuildingBlock
{
    public override string Id => "block-grid-distance-to-zero";
    public override string Title => "Block: Multi-Source BFS on a Grid";
    public override string OneLiner => "For every cell in a 0/1 grid, return the distance to the nearest 0, by starting BFS from all the zeros at once.";
    public override string KeyTakeaway =>
        "Multi-source BFS puts every source in the queue before the loop starts. One BFS from all of them is the same as many BFS runs taking the minimum, in a fraction of the time.";

    public override string Explanation =>
        "grid holds 0s and 1s and has at least one 0. Return a grid of the same shape where each cell is the number of up, down, left or right steps to the nearest 0.\n" +
        "\n" +
        "Fill a distance grid with -1, then enqueue every 0 cell with distance 0. Pop cells in order; for each of the four neighbours inside the grid that is still -1, set it to the popped cell's distance plus one and enqueue it. Rotting Oranges and Walls and Gates are this block.";

    protected override string[] Plan =>
    [
        "Make a distance grid the same shape, filled with -1.",
        "Put every 0 cell in the queue with distance 0: all the sources start together.",
        "Take cells from the front of the queue in order.",
        "For each neighbour inside the grid still at -1, set it to the cell's distance plus 1 and enqueue it.",
        "Return the distance grid.",
    ];

    protected override string CSharpSignature => "public static int[][] DistanceToZero(int[][] grid)";
    protected override string CSharpReturnStub => "return grid;";
    protected override string PythonSignature => "def distance_to_zero(grid):";
    protected override string PythonReturnStub => "return grid";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.DistanceToZero",
        ["python"] = "distance_to_zero",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("[[0, 0, 0], [0, 1, 0], [0, 0, 0]]", "[[0,0,0],[0,1,0],[0,0,0]]"),
        new TestCase("[[0, 0, 0], [0, 1, 0], [1, 1, 1]]", "[[0,0,0],[0,1,0],[1,2,1]]"),
        new TestCase("[[0]]", "[[0]]"),
        new TestCase("[[1, 0, 1, 1]]", "[[1,0,1,2]]"),
        new TestCase("[[1, 1], [1, 0]]", "[[2,1],[1,0]]"),
        new TestCase("[[1, 1, 1], [1, 1, 1], [1, 1, 0]]", "[[4,3,2],[3,2,1],[2,1,0]]"),
    ];

    public override string CSharpCallTemplate => "Solution.DistanceToZero({input})";
    public override string PythonCallTemplate => "distance_to_zero({input})";

    public override List<string> Gotchas =>
    [
        "Running a separate BFS from each 1 (or each 0), which is O((n · m)²).",
        "Enqueuing a neighbour without marking it, so it is reached again at a larger distance.",
    ];
}
