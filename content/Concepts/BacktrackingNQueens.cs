namespace DsaAcademy.Content.Concepts;

public class BacktrackingNQueens : IConcept
{
    public string Id => "backtracking-n-queens";
    public string Track => "patterns";
    public string Title => "Backtracking with Pruning: N-Queens";
    public string OneLiner => "Place one queen per row; in each row try every column that no earlier queen attacks, recurse, then remove the queen and try the next column.";
    public string KeyTakeaway =>
        "Choose the decision order so most constraints hold automatically (one queen per row means rows can " +
        "never clash), then track what's left in O(1) sets: used columns, used r - c diagonals and used " +
        "r + c anti-diagonals. A square is safe exactly when its column and both diagonals are free.";
    public VisualizerKind VisualizerKind => VisualizerKind.Grid;

    public string Explanation =>
        "Place n queens on an n × n chessboard so that no two attack each other: no two share a row, a column " +
        "or a diagonal. Return how many different arrangements exist. For n = 4 there are 2, for n = 8 there " +
        "are 92, and for n = 2 or 3 there are none.\n\n" +
        "Trying every way to put n queens on n² squares is hopeless. The first insight is that each row must " +
        "hold exactly one queen, so make the decision \"which column does the queen in row r go in?\" and " +
        "go row by row. Rows can then never conflict, and the search space drops to at most n choices per " +
        "row.\n\n" +
        "The second insight is how to check a square in O(1). Every square on the same \"\\\" diagonal has " +
        "the same r - c, and every square on the same \"/\" anti-diagonal has the same r + c. So keep three " +
        "sets: columns in use, r - c values in use and r + c values in use. Square (r, c) is safe if c, r - c " +
        "and r + c are all unused.\n\n" +
        "The backtracking function place(r) does this: if r == n, every row has a queen, so count one " +
        "solution. Otherwise, for each column c that is safe, add c, r - c and r + c to the sets, call " +
        "place(r + 1), then remove them again (the backtrack) and try the next column. A row with no safe " +
        "column simply returns, which prunes that whole branch: the visualization shows the search on a 4 × 4 " +
        "board hitting two dead ends before finding its first solution.\n\n" +
        "The running time is roughly O(n!), since row r has at most n - r safe columns, and space is O(n) for " +
        "the sets and recursion. Common follow-ups: return the boards themselves (keep a queens[r] = c array " +
        "and build the strings when r == n), and speeding it up with bitmasks instead of sets, where the free " +
        "squares of a row are ~(cols | diag | antiDiag) and each step peels off the lowest set bit.";

    public List<string> RecognitionSignals =>
    [
        "Place items on a board or into slots so that no two conflict (queens, Sudoku digits, colouring a map), and count or list the valid arrangements.",
        "The constraints let you reject a partial placement immediately, so you can prune whole branches instead of generating full candidates and checking them.",
        "n is small (usually 15 or less), which signals an exponential search with pruning is expected.",
    ];

    public List<string> Gotchas =>
    [
        "Diagonals: r - c identifies a \"\\\" diagonal and r + c a \"/\" one. r - c can be negative, so if you use arrays instead of sets, offset it by n - 1.",
        "Undo all three marks (column, diagonal, anti-diagonal) after the recursive call. Removing only the column leaves phantom diagonal blocks.",
        "n = 1 has exactly one solution (a single queen). n = 2 and n = 3 have zero, not errors.",
    ];

    public List<string> ConfusableWith =>
    [
        "Backtracking: Generate All Subsets (this track) explores every branch because every subset is an answer. N-Queens prunes most branches early because most partial boards are already invalid.",
        "Backtracking on a Grid: Word Search (this track) also undoes marks on a grid, but it walks a path between neighbouring cells; here each row is an independent decision.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int TotalNQueens(int n)\n" +
            "    {\n" +
            "        // TODO: place one queen per row. Keep HashSet<int>s for used columns,\n" +
            "        // used r - c diagonals and used r + c anti-diagonals. Write a helper\n" +
            "        // Place(r): if r == n, that's one solution. Otherwise for each column\n" +
            "        // c that is free in all three sets: add the marks, call Place(r + 1),\n" +
            "        // then remove the marks again. Return the number of solutions.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def total_n_queens(n):\n" +
            "    # TODO: place one queen per row. Keep sets for used columns, used\n" +
            "    # r - c diagonals and used r + c anti-diagonals. Write a helper\n" +
            "    # place(r): if r == n, that's one solution. Otherwise for each column\n" +
            "    # c that is free in all three sets: add the marks, call place(r + 1),\n" +
            "    # then remove the marks again. Return the number of solutions.\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.TotalNQueens",
        ["python"] = "total_n_queens",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Int(4), "2"),
        new TestCase(Lit.Int(1), "1"),
        new TestCase(Lit.Int(2), "0"),
        new TestCase(Lit.Int(3), "0"),
        new TestCase(Lit.Int(5), "10"),
        new TestCase(Lit.Int(6), "4"),
        new TestCase(Lit.Int(8), "92"),
    ];

    public string CSharpCallTemplate => "Solution.TotalNQueens({input})";
    public string PythonCallTemplate => "total_n_queens({input})";

    private static int[][] Cells(IEnumerable<(int R, int C)> cells) => cells.Select(p => new[] { p.R, p.C }).ToArray();

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const int n = 4;
        var queens = new List<(int R, int C)>();
        var steps = new List<VisualizationStep>();
        var found = false;

        bool Safe(int r, int c) => queens.All(q => q.C != c && q.R - q.C != r - c && q.R + q.C != r + c);

        Dictionary<string, object> State(IEnumerable<(int R, int C)> rejected) => new()
        {
            ["grid"] = Enumerable.Range(0, n)
                .Select(r => Enumerable.Range(0, n).Select(c => queens.Contains((r, c)) ? "Q" : "").ToArray())
                .ToArray(),
            ["visited"] = Cells(queens.Take(Math.Max(0, queens.Count - 1))),
            ["highlight"] = Cells(queens.Skip(Math.Max(0, queens.Count - 1))),
            ["rejected"] = Cells(rejected),
            ["rowLabels"] = Enumerable.Range(0, n).Select(r => $"r{r}").ToArray(),
            ["colLabels"] = Enumerable.Range(0, n).Select(c => $"c{c}").ToArray(),
            ["tracker"] = queens.Count,
            ["trackerLabel"] = "queens placed",
        };

        steps.Add(new VisualizationStep(
            State(Array.Empty<(int, int)>()),
            [],
            "4 × 4 board. Put one queen in each row, top to bottom. In each row, try columns left to right and skip any square an earlier queen attacks (same column, r - c or r + c)."
        ));

        void Place(int r)
        {
            if (r == n)
            {
                found = true;
                return;
            }
            for (var c = 0; c < n && !found; c++)
            {
                if (!Safe(r, c)) continue;
                queens.Add((r, c));
                var attackedNext = r + 1 < n
                    ? Enumerable.Range(0, n).Where(nc => !Safe(r + 1, nc)).Select(nc => (r + 1, nc)).ToList()
                    : new List<(int, int)>();
                var nextHasSafe = r + 1 < n && attackedNext.Count < n;
                steps.Add(new VisualizationStep(
                    State(nextHasSafe ? new List<(int, int)>() : attackedNext),
                    [],
                    r + 1 == n
                        ? $"Row {r}, column {c} is safe. That's the 4th queen: a full solution. Count it, backtrack and keep searching for more."
                        : nextHasSafe
                            ? $"Row {r}, column {c} is safe: place a queen and mark column {c}, diagonal {r - c} and anti-diagonal {r + c}. Move on to row {r + 1}."
                            : $"Row {r}, column {c} is safe, so place it -- but now every square in row {r + 1} is attacked (red). Row {r + 1} has nowhere to go."
                ));
                Place(r + 1);
                if (found) return;
                queens.RemoveAt(queens.Count - 1);
                steps.Add(new VisualizationStep(
                    State([(r, c)]),
                    [],
                    $"Backtrack: nothing below works with a queen at ({r}, {c}), so remove it (red), unmark its column and diagonals, and try the next column in row {r}."
                ));
            }
        }

        Place(0);

        steps.Add(new VisualizationStep(
            State(Array.Empty<(int, int)>()),
            [],
            "The search doesn't stop at the first solution: it backtracks and keeps going. Its mirror image (columns 2, 0, 3, 1) is the only other one, so n = 4 has 2 solutions."
        ));
        return steps;
    }
}
