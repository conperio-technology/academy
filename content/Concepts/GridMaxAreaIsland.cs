namespace DsaAcademy.Content.Concepts;

// Transfer exercise after Number of Islands: same scan and flood fill, but each fill has to
// report how big its island was.
public class GridMaxAreaIsland : IConcept
{
    public string Id => "grid-max-area-island";
    public string Track => "patterns";
    public string Title => "Transfer: Largest Island Area";
    public string OneLiner => "Same 0/1 map as Number of Islands, changed question: how many cells does the biggest island have? Make the flood fill count what it sinks.";
    public string KeyTakeaway =>
        "Changing \"how many components\" to \"how big is the biggest\" changes only what the flood fill " +
        "returns: it counts the cells it marks, and the outer scan keeps the maximum. The visited marking, " +
        "the bounds checks and the O(rows x cols) cost are unchanged.";
    public VisualizerKind VisualizerKind => VisualizerKind.Grid;
    public string? TransferOf => "grid-number-of-islands";

    public string Explanation =>
        "This follows Number of Islands with the requirement changed. The grid is the same (1 is land, 0 is " +
        "water, and land cells joined up, down, left or right form one island), but now return the area of " +
        "the largest island, the number of cells in it, or 0 if there is no land at all.\n\n" +
        "The outer scan stays: visit every cell, and when you find land nobody has marked yet, you have found a " +
        "new island. What changes is the flood fill. Instead of only marking cells, it counts them: start a " +
        "counter at 0, and each time you pop (or recurse into) a land cell, mark it and add 1. When the fill " +
        "finishes, the counter is that island's area. Compare it with the best so far.\n\n" +
        "Mark a cell as visited when you push it, not when you pop it. If you only mark at pop time, a cell " +
        "reachable from two neighbours is pushed twice, and unless you also skip already marked cells when " +
        "you pop them it is counted twice, so the area comes out too big. That bug is invisible in Number of " +
        "Islands, where the number of islands is the same either way, which is why this changed requirement " +
        "is worth doing.\n\n" +
        "The cost is still O(rows x cols): each cell is scanned once and filled at most once. An explicit " +
        "stack avoids deep recursion on a big all-land grid.\n\n" +
        "The visualization fills each island of a small map and shows its area as it finishes.\n\n" +
        "Explain why the same idea works: before you move on, write two or three sentences on what you " +
        "changed from Number of Islands and what you did not. Why is the scan plus flood fill still enough to " +
        "find every island exactly once, and why does marking at push time matter now when it did not for " +
        "counting islands?";

    public List<string> RecognitionSignals =>
    [
        "A grid of cells where same kind neighbours form regions, and you need a size, perimeter or other total per region.",
        "\"Largest\", \"biggest\" or \"area of\" a connected blob of cells.",
    ];

    public List<string> Gotchas =>
    [
        "Mark cells when they are pushed; marking only when popped lets a cell reachable two ways be counted twice.",
        "A grid with no land returns 0, not the area of an empty island or -1.",
        "Diagonal cells are not neighbours: [[1, 0], [0, 1]] has two islands of area 1.",
    ];

    public List<string> ConfusableWith =>
    [
        "Grid Flood Fill: Number of Islands counts how many fills start; this one keeps the largest fill size. Same traversal, different thing returned.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int MaxAreaOfIsland(int[][] grid)\n" +
            "    {\n" +
            "        // TODO: scan every (r, c). When grid[r][c] == 1, flood-fill from it with\n" +
            "        // a Stack<(int, int)>: set the cell to 0 as you push it, and each time you\n" +
            "        // pop a cell add 1 to this island's area and push its in-bounds land\n" +
            "        // neighbours (setting each to 0 as it is pushed). Keep the largest area.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def max_area_of_island(grid):\n" +
            "    # TODO: scan every (r, c). When grid[r][c] == 1, flood-fill from it with\n" +
            "    # a stack (a list): set the cell to 0 as you push it, and each time you\n" +
            "    # pop a cell add 1 to this island's area and push its in-bounds land\n" +
            "    # neighbours (setting each to 0 as it is pushed). Keep the largest area.\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MaxAreaOfIsland",
        ["python"] = "max_area_of_island",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(
            "[[0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0], " +
            "[0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0], " +
            "[0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0], " +
            "[0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0]]",
            "6"),
        new TestCase("[[0, 0, 0, 0]]", "0"),
        new TestCase("[[1]]", "1"),
        new TestCase("[[1, 1, 0], [1, 0, 0], [0, 0, 1]]", "3"),
        new TestCase("[[1, 0, 1], [0, 1, 0], [1, 0, 1]]", "1"),
        new TestCase("[[1, 1, 1], [1, 0, 1], [1, 1, 1]]", "8"),
        new TestCase("[[1, 1], [1, 1]]", "4"),
        new TestCase("[[0, 1, 1], [1, 1, 0], [0, 1, 0]]", "5"),
    ];

    public string CSharpCallTemplate => "Solution.MaxAreaOfIsland({input})";
    public string PythonCallTemplate => "max_area_of_island({input})";

    private static int[][] Cells(IEnumerable<(int R, int C)> cells) => cells.Select(p => new[] { p.R, p.C }).ToArray();

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[][] grid =
        [
            [1, 1, 0, 0, 1],
            [1, 0, 0, 1, 1],
            [0, 0, 1, 1, 0],
            [1, 0, 0, 0, 0],
        ];
        int rows = grid.Length, cols = grid[0].Length;
        var water = new List<(int R, int C)>();
        for (var r = 0; r < rows; r++)
            for (var c = 0; c < cols; c++)
                if (grid[r][c] == 0) water.Add((r, c));

        var visited = new HashSet<(int R, int C)>();
        var best = 0;
        var steps = new List<VisualizationStep>();

        Dictionary<string, object> State(IEnumerable<(int R, int C)> highlight) => new()
        {
            ["grid"] = grid,
            ["muted"] = Cells(water),
            ["visited"] = Cells(visited),
            ["highlight"] = Cells(highlight),
            ["tracker"] = best,
            ["trackerLabel"] = "largest area so far",
        };

        steps.Add(new VisualizationStep(State([]), [],
            "Same scan as Number of Islands. This time each flood fill counts the cells it marks, and the tracker keeps the largest count."));

        for (var r = 0; r < rows; r++)
        {
            for (var c = 0; c < cols; c++)
            {
                if (grid[r][c] != 1 || visited.Contains((r, c))) continue;

                var island = new List<(int R, int C)>();
                var stack = new Stack<(int R, int C)>();
                stack.Push((r, c));
                visited.Add((r, c));
                while (stack.Count > 0)
                {
                    var (cr, cc) = stack.Pop();
                    island.Add((cr, cc));
                    foreach (var (dr, dc) in new[] { (1, 0), (-1, 0), (0, 1), (0, -1) })
                    {
                        int nr = cr + dr, nc = cc + dc;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1 && visited.Add((nr, nc)))
                            stack.Push((nr, nc));
                    }
                }

                var previous = best;
                best = Math.Max(best, island.Count);
                steps.Add(new VisualizationStep(State(island), [],
                    $"New land at ({r}, {c}). The flood fill marks {island.Count} cell{(island.Count == 1 ? "" : "s")}, so this island's area is {island.Count}. " +
                    (island.Count > previous ? $"That beats {previous}: largest is now {best}." : $"Not more than {previous}, so the largest stays {best}.")));
            }
        }

        steps.Add(new VisualizationStep(State([]), [],
            $"Every cell scanned, every island filled once. Largest area: {best}. Only the return value of the flood fill changed from Number of Islands."));
        return steps;
    }
}
