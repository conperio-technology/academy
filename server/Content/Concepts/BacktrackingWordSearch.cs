namespace DsaAcademy.Content.Concepts;

public class BacktrackingWordSearch : IConcept
{
    public string Id => "backtracking-word-search";
    public string Track => "patterns";
    public string Title => "Backtracking on a Grid: Word Search";
    public string OneLiner => "Try to spell the word from every cell: step into a matching neighbour, mark it used, recurse, and unmark it on the way back so other paths can use it.";
    public string KeyTakeaway =>
        "Grid backtracking is DFS where \"visited\" belongs to the current PATH, not to the whole search: mark " +
        "a cell when you step onto it and unmark it when you step back off. Forget the unmark and a dead-end " +
        "path silently blocks cells that a later, correct path needs.";
    public VisualizerKind VisualizerKind => VisualizerKind.Grid;

    public string Explanation =>
        "You get a board of letters (each row given as a string, like [\"ABCE\", \"SFCS\", \"ADEE\"]) and a word. " +
        "Return true if the word can be spelled by a path of adjacent cells (up, down, left, right), using " +
        "each cell at most once. \"ABCCED\" is on that board; \"ABCB\" is not, because spelling it would need " +
        "the B cell twice.\n\n" +
        "Write a recursive helper dfs(r, c, i) that answers \"can I spell word[i:] starting at cell (r, c)?\". " +
        "It fails straight away if (r, c) is off the board, already on the current path, or doesn't hold " +
        "word[i]. It succeeds if i is the last index. Otherwise it marks (r, c) as used, tries all four " +
        "neighbours with i + 1, and then UNMARKS (r, c) before returning. Call it from every cell with i = 0 " +
        "and return true as soon as one call does.\n\n" +
        "The unmark step is the heart of the problem and what makes this backtracking rather than a plain " +
        "flood fill. In Number of Islands a cell visited once stays visited forever, because reachability " +
        "doesn't depend on how you got there. Here it does: a cell that was a dead end on one path might be " +
        "exactly the cell another path needs. So \"visited\" means \"on the path I'm currently building\", and " +
        "it has to be undone. A neat trick is to overwrite the cell with a marker like '#' while it's on the " +
        "path and restore the letter afterwards, which avoids a separate visited array.\n\n" +
        "In the worst case the search starts at each of the rows × cols cells and branches up to 3 ways (it " +
        "never goes straight back) for each of the word's L letters: O(rows × cols × 3^L). Two cheap prunings " +
        "help a lot in practice: return false immediately if the word is longer than the board has cells or " +
        "uses a letter more often than the board contains it, and if the word's last letter is rarer on the " +
        "board than its first, search for the reversed word instead. The classic follow-up, Word Search II, " +
        "finds many words at once by walking a Trie alongside the grid.";

    public List<string> RecognitionSignals =>
    [
        "You need to find a PATH through a grid that satisfies a constraint (spells a word, sums to a target), and cells can't be reused within one path.",
        "A plain visited set gives wrong answers because the same cell may be needed by a different path -- a sign the \"visited\" state must be undone.",
        "The answer is yes/no or \"all such paths\", and you can stop exploring a branch as soon as its prefix is already wrong.",
    ];

    public List<string> Gotchas =>
    [
        "Unmark the cell after trying its neighbours, on every return path including failure. Returning early before restoring it corrupts the board for later searches.",
        "Check bounds before reading the cell, and check \"already on the path\" so a word like \"ABA\" can't bounce back onto the cell it came from.",
        "Stop as soon as one starting cell succeeds. Exploring every path after finding one turns a fast true into a slow one.",
    ];

    public List<string> ConfusableWith =>
    [
        "Grid Flood Fill: Number of Islands (this track) also walks neighbours, but there a visited cell stays visited forever. Here visited is per path and must be undone.",
        "Backtracking: Generate All Subsets (this track) has the same choose, recurse, un-choose shape, applied to picking elements instead of stepping between cells.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static bool Exist(string[] board, string word)\n" +
            "    {\n" +
            "        // TODO: strings are immutable, so copy the board into a char[][]\n" +
            "        // (board.Select(row => row.ToCharArray()).ToArray()). Write a helper\n" +
            "        // Dfs(r, c, i): false if (r, c) is off the board or grid[r][c] !=\n" +
            "        // word[i]; true if i == word.Length - 1. Otherwise mark the cell\n" +
            "        // (grid[r][c] = '#'), try the 4 neighbours with i + 1, restore the\n" +
            "        // letter, and return whether any neighbour succeeded. Try Dfs from\n" +
            "        // every cell.\n" +
            "        return false;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def exist(board, word):\n" +
            "    # TODO: strings are immutable, so copy the board into lists:\n" +
            "    # grid = [list(row) for row in board]. Write a helper dfs(r, c, i):\n" +
            "    # False if (r, c) is off the board or grid[r][c] != word[i]; True if\n" +
            "    # i == len(word) - 1. Otherwise mark the cell (grid[r][c] = '#'), try\n" +
            "    # the 4 neighbours with i + 1, restore the letter, and return whether\n" +
            "    # any neighbour succeeded. Try dfs from every cell.\n" +
            "    return False\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Exist",
        ["python"] = "exist",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args("[\"ABCE\", \"SFCS\", \"ADEE\"]", Lit.Str("ABCCED")), "true"),
        new TestCase(Lit.Args("[\"ABCE\", \"SFCS\", \"ADEE\"]", Lit.Str("SEE")), "true"),
        new TestCase(Lit.Args("[\"ABCE\", \"SFCS\", \"ADEE\"]", Lit.Str("ABCB")), "false"),
        new TestCase(Lit.Args("[\"ABCE\", \"SFCS\", \"ADEE\"]", Lit.Str("SEED")), "true"),
        new TestCase(Lit.Args("[\"A\"]", Lit.Str("A")), "true"),
        new TestCase(Lit.Args("[\"A\"]", Lit.Str("B")), "false"),
        new TestCase(Lit.Args("[\"AB\", \"CD\"]", Lit.Str("ABDC")), "true"),
        new TestCase(Lit.Args("[\"AAA\", \"AAA\"]", Lit.Str("AAAAAAA")), "false"),
    ];

    public string CSharpCallTemplate => "Solution.Exist({input})";
    public string PythonCallTemplate => "exist({input})";

    private static int[][] Cells(IEnumerable<(int R, int C)> cells) => cells.Select(p => new[] { p.R, p.C }).ToArray();

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        string[] board = ["ABCE", "SFCS", "ADEE"];
        const string word = "SEED";
        var grid = board.Select(row => row.Select(ch => ch.ToString()).ToArray()).ToArray();
        int rows = board.Length, cols = board[0].Length;
        var path = new List<(int R, int C)>();
        var steps = new List<VisualizationStep>();
        // Neighbour order: up, down, left, right.
        var dirs = new[] { (-1, 0), (1, 0), (0, -1), (0, 1) };

        Dictionary<string, object> State(IEnumerable<(int R, int C)> rejected) => new()
        {
            ["grid"] = grid,
            ["visited"] = Cells(path.Take(Math.Max(0, path.Count - 1))),
            ["highlight"] = Cells(path.Skip(Math.Max(0, path.Count - 1))),
            ["rejected"] = Cells(rejected),
            ["tracker"] = path.Count == 0 ? "(nothing yet)" : word[..path.Count],
            ["trackerLabel"] = "spelled so far",
        };

        steps.Add(new VisualizationStep(
            State(Array.Empty<(int, int)>()),
            [],
            $"Look for \"{word}\". Try every cell as a start; only cells holding '{word[0]}' can begin the word. Neighbours are tried in the order up, down, left, right."
        ));

        bool Dfs(int r, int c, int i)
        {
            path.Add((r, c));
            if (i == word.Length - 1)
            {
                steps.Add(new VisualizationStep(
                    State(Array.Empty<(int, int)>()),
                    [],
                    $"({r}, {c}) is '{word[i]}', the last letter. The path spells \"{word}\", so return true all the way up -- no need to try anything else."
                ));
                return true;
            }

            var next = new List<(int R, int C)>();
            foreach (var (dr, dc) in dirs)
            {
                int nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !path.Contains((nr, nc)) && board[nr][nc] == word[i + 1])
                    next.Add((nr, nc));
            }

            steps.Add(new VisualizationStep(
                State(Array.Empty<(int, int)>()),
                [],
                next.Count > 0
                    ? $"Step onto ({r}, {c}) = '{word[i]}' and mark it as on the path. Look for '{word[i + 1]}' among its unused neighbours."
                    : $"Step onto ({r}, {c}) = '{word[i]}' and mark it. None of its unused neighbours is '{word[i + 1]}'."
            ));

            foreach (var (nr, nc) in next)
                if (Dfs(nr, nc, i + 1)) return true;

            path.RemoveAt(path.Count - 1);
            steps.Add(new VisualizationStep(
                State([(r, c)]),
                [],
                $"Dead end at ({r}, {c}). Backtrack: UNMARK it (red) so a different path may use it later, and return false to the cell before."
            ));
            return false;
        }

        for (var r = 0; r < rows; r++)
            for (var c = 0; c < cols; c++)
                if (board[r][c] == word[0] && Dfs(r, c, 0))
                    return steps;
        return steps;
    }
}
