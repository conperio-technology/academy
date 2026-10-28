namespace DsaAcademy.Content.Concepts;

public class MatrixSetZeroes : IConcept
{
    public string Id => "matrix-set-zeroes";
    public string Track => "patterns";
    public string Title => "Matrix: Set Matrix Zeroes";
    public string OneLiner => "Wherever a cell is 0, zero its whole row and column, using the first row and column as the markers so no extra memory is needed.";
    public string KeyTakeaway =>
        "Don't zero cells while you scan, or new zeros spread further. First record which rows and columns " +
        "contain a 0, then zero them. Sets of rows and columns cost O(n + m); storing the marks in row 0 and " +
        "column 0 themselves, plus one flag for whether column 0 itself must be cleared, makes it O(1).";
    public VisualizerKind VisualizerKind => VisualizerKind.Grid;

    public string Explanation =>
        "Given an m by n matrix, if a cell is 0, set its entire row and its entire column to 0. Do it in " +
        "place and return the matrix. [[1, 1, 1], [1, 0, 1], [1, 1, 1]] becomes [[1, 0, 1], [0, 0, 0], [1, 0, " +
        "1]].\n\n" +
        "The tempting one-pass approach is wrong: if you zero row 1 and column 1 the moment you see the 0, " +
        "the next cells you read in that row are now zeros you created, and they wipe out more rows and " +
        "columns. Separate finding from writing. Pass 1 records every row and every column that contains an " +
        "original 0. Pass 2 sets matrix[r][c] = 0 whenever row r or column c was recorded. With two sets that " +
        "is O(m · n) time and O(m + n) space, and it is a perfectly good first answer.\n\n" +
        "The follow-up asks for O(1) space. Use the matrix's own first row and first column as the record: " +
        "when matrix[r][c] is 0, set matrix[r][0] = 0 and matrix[0][c] = 0. The corner cell matrix[0][0] can " +
        "only mean one thing, so let it mark row 0, and keep a separate flag, firstColZero, for column 0. " +
        "Then zero the inner cells (r >= 1, c >= 1) whose row or column marker is 0, and only after that " +
        "clear row 0 (if matrix[0][0] is 0) and column 0 (if firstColZero). Clearing the markers last is what " +
        "keeps them readable.\n\n" +
        "Both versions read each cell a constant number of times: O(m · n) time. The visualization runs the " +
        "marker version on a 4 by 4 matrix.";

    public List<string> RecognitionSignals => [
        "An update that depends on the original values but is written into the same grid: record first, write second.",
        "\"In place, constant extra space\" for a grid: reuse a row or column of the grid as scratch memory.",
    ];

    public List<string> Gotchas => [
        "Zeroing during the scan lets your own zeros trigger more zeroing.",
        "matrix[0][0] cannot mark both row 0 and column 0; one of them needs its own flag.",
        "Clearing the first row or column before using them as markers destroys the record; do them last.",
    ];

    public List<string> ConfusableWith => [
        "Game of Life has the same \"don't overwrite what you still need to read\" problem; it solves it by encoding old and new state in each cell.",
        "Number of Islands spreads from a cell to its neighbours; here a zero affects whole rows and columns, not neighbours.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[][] SetZeroes(int[][] matrix)\n" +
            "    {\n" +
            "        // TODO: pass 1: record which rows and columns contain a 0\n" +
            "        // (two HashSet<int>s, or the first row and column as markers).\n" +
            "        // Pass 2: set matrix[r][c] = 0 if row r or column c was recorded.\n" +
            "        return matrix;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def set_zeroes(matrix):\n" +
            "    # TODO: pass 1: record which rows and columns contain a 0\n" +
            "    # (two sets, or the first row and column as markers).\n" +
            "    # Pass 2: set matrix[r][c] = 0 if row r or column c was recorded.\n" +
            "    return matrix\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.SetZeroes",
        ["python"] = "set_zeroes",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[[1, 1, 1], [1, 0, 1], [1, 1, 1]]", "[[1,0,1],[0,0,0],[1,0,1]]"),
        new TestCase("[[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]", "[[0,0,0,0],[0,4,5,0],[0,3,1,0]]"),
        new TestCase("[[1]]", "[[1]]"),
        new TestCase("[[0]]", "[[0]]"),
        new TestCase("[[1, 0]]", "[[0,0]]"),
        new TestCase("[[1], [0], [1]]", "[[0],[0],[0]]"),
        new TestCase("[[1, 2, 3, 4], [5, 0, 7, 8], [0, 10, 11, 12], [13, 14, 15, 0]]", "[[0,0,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]"),
        new TestCase("[[1, 2], [3, 4]]", "[[1,2],[3,4]]"),
    ];

    public string CSharpCallTemplate => "Solution.SetZeroes({input})";
    public string PythonCallTemplate => "set_zeroes({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[][] m = [[1, 2, 3, 4], [5, 0, 7, 8], [9, 10, 11, 12], [13, 14, 15, 0]];
        int rows = 4, cols = 4;
        int[][] Copy() => m.Select(row => row.ToArray()).ToArray();
        int[][] Markers() => Enumerable.Range(0, cols).Select(c => new[] { 0, c }).Concat(Enumerable.Range(1, rows - 1).Select(r => new[] { r, 0 })).ToArray();
        var steps = new List<VisualizationStep>
        {
            new(new() { ["grid"] = Copy(), ["frontier"] = Markers() }, [], "Zero the rows and columns of every 0. Row 0 and column 0 will hold the markers; firstColZero records column 0 separately."),
        };
        var firstColZero = false;
        for (var r = 0; r < rows; r++)
        {
            if (m[r][0] == 0) firstColZero = true;
            for (var c = 1; c < cols; c++)
            {
                if (m[r][c] != 0) continue;
                m[r][0] = 0;
                m[0][c] = 0;
                steps.Add(new(new() { ["grid"] = Copy(), ["highlight"] = new[] { new[] { r, c } }, ["frontier"] = Markers() }, [],
                    $"Found 0 at ({r}, {c}): mark row {r} by setting matrix[{r}][0] = 0 and column {c} by setting matrix[0][{c}] = 0."));
            }
        }
        for (var r = 1; r < rows; r++)
            for (var c = 1; c < cols; c++)
                if (m[r][0] == 0 || m[0][c] == 0) m[r][c] = 0;
        steps.Add(new(new() { ["grid"] = Copy(), ["frontier"] = Markers() }, [], "Zero every inner cell whose row marker or column marker is 0. The markers themselves are still intact."));
        if (m[0][0] == 0) for (var c = 0; c < cols; c++) m[0][c] = 0;
        if (firstColZero) for (var r = 0; r < rows; r++) m[r][0] = 0;
        steps.Add(new(new() { ["grid"] = Copy() }, [], $"Last, row 0 and column 0 themselves: matrix[0][0] is {(m[0][0] == 0 ? "0, so row 0 is cleared" : "not 0, so row 0 keeps its other values")}, and firstColZero is {firstColZero.ToString().ToLower()}, so column 0 {(firstColZero ? "is cleared" : "does too")}. The markers written there were already correct zeros."));
        return steps;
    }
}
