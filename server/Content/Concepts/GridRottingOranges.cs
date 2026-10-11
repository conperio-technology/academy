namespace DsaAcademy.Content.Concepts;

public class GridRottingOranges : IConcept
{
    public string Id => "grid-rotting-oranges";
    public string Track => "patterns";
    public string Title => "Multi-Source BFS: Rotting Oranges";
    public string OneLiner => "Start a BFS from EVERY rotten orange at once; each BFS layer is one minute, and the answer is how many layers it takes to reach every fresh orange.";
    public string KeyTakeaway =>
        "When something spreads from several starting points at the same speed, put ALL the starting points " +
        "in the queue before the first step. BFS then processes the grid in rings of equal distance, so the " +
        "number of layers is the time it takes, and any fresh cell never reached means the answer is -1.";
    public VisualizerKind VisualizerKind => VisualizerKind.Grid;

    public string Explanation =>
        "Each cell of the grid is 0 (empty), 1 (a fresh orange) or 2 (a rotten orange). Every minute, each " +
        "rotten orange rots the fresh oranges directly above, below, left and right of it. Return the number " +
        "of minutes until no fresh orange is left, or -1 if some fresh orange can never be reached.\n\n" +
        "The rot spreads outward from every rotten orange at the same time and the same speed. That is " +
        "exactly what breadth-first search does: it visits everything at distance 1, then everything at " +
        "distance 2, and so on. The insight is to start the BFS from all the rotten oranges at once, by " +
        "putting every one of them in the queue before the loop starts (a \"multi-source\" BFS). Running a " +
        "separate BFS from each rotten orange and taking minimums would also work, but it costs O((rows × " +
        "cols)²) instead of O(rows × cols).\n\n" +
        "Process the queue one layer at a time: read the queue's current size, pop exactly that many cells, " +
        "and for each one rot its fresh neighbours (set them to 2 right away, so nobody rots them twice) and " +
        "push them. If that layer rotted at least one orange, a minute has passed. Keep a count of fresh " +
        "oranges from the initial scan and decrement it each time one rots; when the queue empties, return " +
        "the minutes if the count reached 0, otherwise -1.\n\n" +
        "Two edge cases trip people up. If there are no fresh oranges at the start, the answer is 0 even if " +
        "there are no rotten ones either. And if there are fresh oranges but no rotten ones, the answer is -1. " +
        "The fresh-counter handles both without special cases.\n\n" +
        "The same shape solves \"distance from every cell to the nearest gate\" (Walls and Gates), \"distance " +
        "to the nearest 0\" (01 Matrix) and \"how long until the fire reaches you\". Interviewers often ask why " +
        "DFS fails here: DFS would reach a cell along a long path first and record the wrong time.";

    public List<string> RecognitionSignals =>
    [
        "Something spreads or ripples out from SEVERAL starting cells at the same rate (rot, fire, infection, signal), and you need the time until it covers everything.",
        "\"Distance from each cell to the nearest X\" where there are many X cells -- seed the queue with all of them.",
        "The answer is a number of steps or minutes on an unweighted grid, which means BFS layers, not DFS.",
    ];

    public List<string> Gotchas =>
    [
        "Mark an orange rotten (or visited) when you PUSH it, not when you pop it. Otherwise two rotten neighbours both push it and it is counted twice.",
        "Only count a minute when the layer actually rotted something. Incrementing once per loop iteration overcounts by 1 at the end.",
        "A grid with no fresh oranges returns 0, not -1, even if there are no rotten oranges either.",
    ];

    public List<string> ConfusableWith =>
    [
        "Grid Flood Fill: Number of Islands (this track) also spreads across a grid, but it only cares which cells are reachable, so DFS is fine. Here the number of layers matters, which needs BFS.",
        "Graphs: BFS Traversal (Fundamentals) is the single-source version. Multi-source BFS is the same loop with more than one cell in the queue before it starts.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int OrangesRotting(int[][] grid)\n" +
            "    {\n" +
            "        // TODO: scan once: enqueue every rotten orange (2) into a\n" +
            "        // Queue<(int, int)> and count the fresh ones (1). Then BFS layer by\n" +
            "        // layer: for each of the current queue.Count cells, rot each fresh\n" +
            "        // neighbour (set it to 2, decrement fresh, enqueue it). Count a\n" +
            "        // minute only for layers that rotted something. Return the minutes if\n" +
            "        // fresh reached 0, otherwise -1.\n" +
            "        return -1;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def oranges_rotting(grid):\n" +
            "    # TODO: scan once: put every rotten orange (2) into a deque and count\n" +
            "    # the fresh ones (1). Then BFS layer by layer: for each of the current\n" +
            "    # len(queue) cells, rot each fresh neighbour (set it to 2, decrement\n" +
            "    # fresh, append it). Count a minute only for layers that rotted\n" +
            "    # something. Return the minutes if fresh reached 0, otherwise -1.\n" +
            "    return -1\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.OrangesRotting",
        ["python"] = "oranges_rotting",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[[2, 1, 1], [1, 1, 0], [0, 1, 1]]", "4"),
        new TestCase("[[2, 1, 1], [0, 1, 1], [1, 0, 1]]", "-1"),
        new TestCase("[[0, 2]]", "0"),
        new TestCase("[[0]]", "0"),
        new TestCase("[[1]]", "-1"),
        new TestCase("[[2, 1, 1, 1, 2]]", "2"),
        new TestCase("[[2, 2], [1, 1], [0, 0], [2, 0]]", "1"),
    ];

    public string CSharpCallTemplate => "Solution.OrangesRotting({input})";
    public string PythonCallTemplate => "oranges_rotting({input})";

    private static int[][] Cells(IEnumerable<(int R, int C)> cells) => cells.Select(p => new[] { p.R, p.C }).ToArray();

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[][] grid =
        [
            [2, 1, 1, 0, 1],
            [1, 1, 0, 1, 1],
            [0, 1, 1, 1, 0],
            [0, 0, 1, 1, 2],
        ];
        int rows = grid.Length, cols = grid[0].Length;
        var empty = new List<(int R, int C)>();
        var queue = new List<(int R, int C)>();
        var fresh = 0;
        for (var r = 0; r < rows; r++)
        {
            for (var c = 0; c < cols; c++)
            {
                if (grid[r][c] == 0) empty.Add((r, c));
                else if (grid[r][c] == 2) queue.Add((r, c));
                else fresh++;
            }
        }

        var rotten = new List<(int R, int C)>(queue);
        var minutes = 0;
        var steps = new List<VisualizationStep>();

        Dictionary<string, object> State(IEnumerable<(int R, int C)> justRotted, IEnumerable<(int R, int C)> frontier) => new()
        {
            ["grid"] = grid.Select(row => row.ToArray()).ToArray(),
            ["muted"] = Cells(empty),
            ["visited"] = Cells(rotten),
            ["highlight"] = Cells(justRotted),
            ["frontier"] = Cells(frontier),
            ["tracker"] = minutes,
            ["trackerLabel"] = "minutes",
        };

        steps.Add(new VisualizationStep(
            State(Array.Empty<(int, int)>(), queue),
            [],
            $"0 = empty (dimmed), 1 = fresh, 2 = rotten. Scan once: both rotten oranges go into the queue together (dashed), and there are {fresh} fresh oranges to rot."
        ));

        while (queue.Count > 0)
        {
            var next = new List<(int R, int C)>();
            foreach (var (r, c) in queue)
            {
                foreach (var (dr, dc) in new[] { (1, 0), (-1, 0), (0, 1), (0, -1) })
                {
                    int nr = r + dr, nc = c + dc;
                    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] != 1) continue;
                    grid[nr][nc] = 2;
                    fresh--;
                    next.Add((nr, nc));
                }
            }
            if (next.Count == 0) break;
            minutes++;
            rotten.AddRange(next);
            steps.Add(new VisualizationStep(
                State(next, next),
                [],
                $"Minute {minutes}: every orange in the queue rots its fresh neighbours at the same time. {next.Count} orange{(next.Count == 1 ? "" : "s")} rotted (bright) and become the next layer of the queue. {fresh} fresh left."
            ));
            queue = next;
        }

        steps.Add(new VisualizationStep(
            State(Array.Empty<(int, int)>(), Array.Empty<(int, int)>()),
            [],
            fresh == 0
                ? $"The last layer rotted nothing new, so the queue empties. No fresh oranges remain, so the answer is {minutes} minutes. Starting from both rotten oranges at once is what makes each layer exactly one minute."
                : $"The queue is empty but {fresh} fresh orange{(fresh == 1 ? " is" : "s are")} unreachable, so the answer is -1."
        ));
        return steps;
    }
}
