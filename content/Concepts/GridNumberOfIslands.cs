namespace DsaAcademy.Content.Concepts;

public class GridNumberOfIslands : IConcept
{
    public string Id => "grid-number-of-islands";
    public string Track => "patterns";
    public string Title => "Grid Flood Fill: Number of Islands";
    public string OneLiner => "Scan a 0/1 map; every time you hit unvisited land, count one island and flood-fill all of it so you never count it again.";
    public string KeyTakeaway =>
        "A grid is a graph in disguise: each cell is a node and its up/down/left/right neighbours are its " +
        "edges. Counting islands is counting connected components -- scan every cell, and each time you " +
        "find land nobody has visited yet, add 1 and DFS/BFS from it to mark the whole island visited.";
    public VisualizerKind VisualizerKind => VisualizerKind.Grid;

    public string Explanation =>
        "You get a map as a 2-D grid where 1 is land and 0 is water. An island is a group of land cells " +
        "joined horizontally or vertically (diagonals do not count). Return how many islands there are.\n\n" +
        "The trick is to stop thinking of it as a grid problem and see the graph: every cell is a node, and it " +
        "has an edge to each of its four neighbours that is also land. Then \"how many islands\" is just \"how " +
        "many connected components\", and you already know how to find those: walk every node, and whenever " +
        "you reach one that hasn't been visited, that's a new component, so you traverse it completely before " +
        "moving on.\n\n" +
        "Concretely: loop over every (row, col). If grid[row][col] is 1 and unvisited, increment the count and " +
        "start a flood fill there. The flood fill marks the cell visited, then recurses (or pushes onto a " +
        "stack/queue) into each in-bounds neighbour that is land and unvisited. When it returns, the whole " +
        "island is marked, so the outer scan will skip the rest of its cells. A common shortcut is to \"sink\" " +
        "land by overwriting it with 0 instead of keeping a separate visited array -- it saves memory but " +
        "destroys the input, so say so in an interview.\n\n" +
        "Every cell is visited at most once by the scan and once by a flood fill, so the total work is " +
        "O(rows × cols). Watch the recursion depth: a 1000 × 1000 grid of all land makes a recursive DFS a " +
        "million calls deep, which overflows the stack in most languages. An explicit stack or a BFS queue " +
        "avoids that.\n\n" +
        "Common follow-ups: the area of the largest island (return the size of each flood fill instead of " +
        "just counting), the number of distinct island shapes (record each island's cells relative to its " +
        "first cell), counting islands as land is added one cell at a time (Union-Find, since re-flooding " +
        "after every addition is too slow), and 8-directional connectivity (just add the four diagonals to " +
        "the neighbour list).";

    public List<string> RecognitionSignals =>
    [
        "A 2-D grid or map where cells of one kind \"connect\" to their neighbours, and you need to count, size, or mark the connected groups.",
        "Words like islands, regions, blobs, rooms, provinces, or \"fill everything connected to this cell\" (paint bucket).",
        "The answer depends on which cells are reachable from which, not on distances -- so plain DFS is enough and BFS is optional.",
    ];

    public List<string> Gotchas =>
    [
        "Mark a cell visited BEFORE (or as soon as) you push/recurse into it, not after you pop it -- otherwise the same cell gets pushed several times and BFS can blow up.",
        "Check bounds first, then the cell value: grid[r][c] with r = -1 crashes in C# and silently reads the LAST row in Python.",
        "Diagonal cells are not neighbours unless the problem says so. [[1, 0], [0, 1]] is two islands.",
    ];

    public List<string> ConfusableWith =>
    [
        "Union-Find: Count Connected Components (this track) answers the same question for an explicit edge list. On a static grid a flood fill is simpler; Union-Find wins when land appears one cell at a time.",
        "Grid BFS: Rotting Oranges (this track) also walks a grid, but it cares about HOW FAR the spread goes (minutes), which needs BFS layer by layer. Here only reachability matters.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int NumIslands(int[][] grid)\n" +
            "    {\n" +
            "        // TODO: loop over every (r, c). When grid[r][c] == 1, count one island\n" +
            "        // and flood-fill from it: set the cell to 0 (or mark it visited), then\n" +
            "        // visit each in-bounds neighbour (up, down, left, right) that is still 1.\n" +
            "        // An explicit Stack<(int, int)> avoids deep recursion on big grids.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def num_islands(grid):\n" +
            "    # TODO: loop over every (r, c). When grid[r][c] == 1, count one island\n" +
            "    # and flood-fill from it: set the cell to 0 (or mark it visited), then\n" +
            "    # visit each in-bounds neighbour (up, down, left, right) that is still 1.\n" +
            "    # An explicit stack (a list) avoids deep recursion on big grids.\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.NumIslands",
        ["python"] = "num_islands",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[[1, 1, 0, 0, 0], [1, 1, 0, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 1, 1]]", "3"),
        new TestCase("[[1, 1, 1, 1, 0], [1, 1, 0, 1, 0], [1, 1, 0, 0, 0], [0, 0, 0, 0, 0]]", "1"),
        new TestCase("[[0, 0], [0, 0]]", "0"),
        new TestCase("[[1]]", "1"),
        new TestCase("[[1, 0, 1], [0, 1, 0], [1, 0, 1]]", "5"),
        new TestCase("[[1, 1, 1], [1, 0, 1], [1, 1, 1]]", "1"),
        new TestCase("[[1, 0, 1, 1], [1, 0, 1, 0], [1, 1, 1, 0]]", "1"),
    ];

    public string CSharpCallTemplate => "Solution.NumIslands({input})";
    public string PythonCallTemplate => "num_islands({input})";

    private static int[][] Cells(IEnumerable<(int R, int C)> cells) => cells.Select(p => new[] { p.R, p.C }).ToArray();

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[][] grid =
        [
            [1, 1, 0, 0, 1],
            [1, 0, 0, 1, 1],
            [0, 0, 1, 0, 0],
            [1, 0, 1, 1, 0],
        ];
        int rows = grid.Length, cols = grid[0].Length;
        var water = new List<(int R, int C)>();
        for (var r = 0; r < rows; r++)
            for (var c = 0; c < cols; c++)
                if (grid[r][c] == 0) water.Add((r, c));

        var visited = new HashSet<(int R, int C)>();
        var islands = 0;
        var steps = new List<VisualizationStep>();

        Dictionary<string, object> State(IEnumerable<(int R, int C)> highlight, IEnumerable<(int R, int C)> frontier) => new()
        {
            ["grid"] = grid,
            ["muted"] = Cells(water),
            ["visited"] = Cells(visited),
            ["highlight"] = Cells(highlight),
            ["frontier"] = Cells(frontier),
            ["tracker"] = islands,
            ["trackerLabel"] = "islands",
        };

        steps.Add(new VisualizationStep(
            State(Array.Empty<(int, int)>(), Array.Empty<(int, int)>()),
            [],
            "1 is land, 0 is water (dimmed). Scan the grid row by row, left to right, looking for land nobody has visited yet."
        ));

        for (var r = 0; r < rows; r++)
        {
            for (var c = 0; c < cols; c++)
            {
                if (grid[r][c] != 1 || visited.Contains((r, c))) continue;

                islands++;
                visited.Add((r, c));
                var neighbours = new List<(int R, int C)>();
                foreach (var (dr, dc) in new[] { (1, 0), (-1, 0), (0, 1), (0, -1) })
                {
                    int nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1 && !visited.Contains((nr, nc)))
                        neighbours.Add((nr, nc));
                }
                steps.Add(new VisualizationStep(
                    State([(r, c)], neighbours),
                    [],
                    neighbours.Count > 0
                        ? $"Unvisited land at ({r}, {c}): that's island #{islands}. Mark it and push its land neighbours (dashed) onto the stack."
                        : $"Unvisited land at ({r}, {c}): that's island #{islands}. It has no land neighbours, so this island is a single cell."
                ));

                var stack = new Stack<(int R, int C)>(neighbours);
                foreach (var n in neighbours) visited.Add(n);
                var filled = new List<(int R, int C)> { (r, c) };
                while (stack.Count > 0)
                {
                    var (cr, cc) = stack.Pop();
                    filled.Add((cr, cc));
                    foreach (var (dr, dc) in new[] { (1, 0), (-1, 0), (0, 1), (0, -1) })
                    {
                        int nr = cr + dr, nc = cc + dc;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1 && !visited.Contains((nr, nc)))
                        {
                            visited.Add((nr, nc));
                            stack.Push((nr, nc));
                        }
                    }
                }
                if (filled.Count > 1)
                {
                    steps.Add(new VisualizationStep(
                        State(Array.Empty<(int, int)>(), Array.Empty<(int, int)>()),
                        [],
                        $"The flood fill keeps popping cells and pushing their unvisited land neighbours until the stack is empty. Island #{islands} has {filled.Count} cells, all marked visited now, so the scan will skip them."
                    ));
                }
            }
        }

        steps.Add(new VisualizationStep(
            State(Array.Empty<(int, int)>(), Array.Empty<(int, int)>()),
            [],
            $"The scan reached the last cell. Every land cell is visited and each flood fill started exactly one island: {islands} islands. Note (2, 2) and (1, 3) only touch diagonally, so they are separate."
        ));
        return steps;
    }
}
