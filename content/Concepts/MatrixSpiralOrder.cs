namespace DsaAcademy.Content.Concepts;

public class MatrixSpiralOrder : IConcept
{
    public string Id => "matrix-spiral-order";
    public string Track => "patterns";
    public string Title => "Matrix: Spiral Order";
    public string OneLiner => "Walk a matrix clockwise from the outside in, keeping four boundaries and shrinking one after each edge.";
    public string KeyTakeaway =>
        "Keep four boundaries, top, bottom, left and right. Read the top row left to right (then top++), the " +
        "right column downwards (right--), the bottom row right to left (bottom--), the left column upwards " +
        "(left++), and repeat while top <= bottom and left <= right. Re-check the bounds before the bottom " +
        "row and left column, or a single leftover row or column is read twice.";
    public VisualizerKind VisualizerKind => VisualizerKind.Grid;

    public string Explanation =>
        "Return every element of an m by n matrix in spiral order: along the top row, down the right side, " +
        "back along the bottom, up the left side, then the same again one ring further in. For [[1, 2, 3], " +
        "[4, 5, 6], [7, 8, 9]] the answer is [1, 2, 3, 6, 9, 8, 7, 4, 5].\n\n" +
        "Tracking a direction and turning when you hit a visited cell works, but needs a visited grid. The " +
        "cleaner approach keeps four boundaries for the part not yet read: top = 0, bottom = m - 1, left = 0, " +
        "right = n - 1. Each loop reads one ring in four legs, and after each leg moves that boundary inward: " +
        "read row top from left to right, then top++. Read column right from top to bottom, then right--. " +
        "Read row bottom from right to left, then bottom--. Read column left from bottom to top, then left++.\n\n" +
        "The trap is the last ring of a non-square matrix. For a single remaining row, the first leg reads it " +
        "and top passes bottom; without a check, the third leg would read the same row backwards. So guard " +
        "the third leg with if (top <= bottom) and the fourth with if (left <= right). Test [[1, 2, 3]] and " +
        "[[1], [2], [3]] by hand; they catch this every time.\n\n" +
        "Every element is read exactly once: O(m · n) time and no extra space beyond the output. The same " +
        "boundary bookkeeping builds a spiral (Spiral Matrix II) and shows up in grid problems that peel " +
        "layers, like Rotate Image.\n\n" +
        "The visualization reads a 3 by 4 matrix; highlighted cells are the current leg, shaded ones are " +
        "already read.";

    public List<string> RecognitionSignals => [
        "\"Spiral\", \"clockwise\", \"layer by layer\" or \"ring by ring\" through a 2D grid.",
        "A traversal order that changes direction at the edges of what is left.",
    ];

    public List<string> Gotchas => [
        "Without the top <= bottom and left <= right checks before the last two legs, a leftover single row or column is read twice.",
        "An empty matrix ([]) has no first row; return [] before reading matrix[0].",
        "Off by one on the corners: each leg starts where the previous one ended, after its boundary moved, so no corner is read twice.",
    ];

    public List<string> ConfusableWith => [
        "Rotate Image also works ring by ring, but moves values between the four sides instead of reading them out.",
        "Grid BFS (Number of Islands) visits by distance from a start cell; spiral order is a fixed geometric walk with no queue.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static List<int> SpiralOrder(int[][] matrix)\n" +
            "    {\n" +
            "        var result = new List<int>();\n" +
            "        if (matrix.Length == 0) return result;\n" +
            "        int top = 0, bottom = matrix.Length - 1, left = 0, right = matrix[0].Length - 1;\n" +
            "        // TODO: while top <= bottom and left <= right:\n" +
            "        //   read row top (left to right), top++\n" +
            "        //   read column right (top to bottom), right--\n" +
            "        //   if top <= bottom: read row bottom (right to left), bottom--\n" +
            "        //   if left <= right: read column left (bottom to top), left++\n" +
            "        return result;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def spiral_order(matrix):\n" +
            "    result = []\n" +
            "    if not matrix:\n" +
            "        return result\n" +
            "    top, bottom, left, right = 0, len(matrix) - 1, 0, len(matrix[0]) - 1\n" +
            "    # TODO: while top <= bottom and left <= right:\n" +
            "    #   read row top (left to right), top += 1\n" +
            "    #   read column right (top to bottom), right -= 1\n" +
            "    #   if top <= bottom: read row bottom (right to left), bottom -= 1\n" +
            "    #   if left <= right: read column left (bottom to top), left += 1\n" +
            "    return result\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.SpiralOrder",
        ["python"] = "spiral_order",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[[1, 2, 3], [4, 5, 6], [7, 8, 9]]", "[1,2,3,6,9,8,7,4,5]"),
        new TestCase("[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]", "[1,2,3,4,8,12,11,10,9,5,6,7]"),
        new TestCase("[[1]]", "[1]"),
        new TestCase("[[1, 2, 3]]", "[1,2,3]"),
        new TestCase("[[1], [2], [3]]", "[1,2,3]"),
        new TestCase("[]", "[]"),
        new TestCase("[[1, 2], [3, 4], [5, 6]]", "[1,2,4,6,5,3]"),
        new TestCase("[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]", "[1,2,3,4,8,12,16,15,14,13,9,5,6,7,11,10]"),
    ];

    public string CSharpCallTemplate => "Solution.SpiralOrder({input})";
    public string PythonCallTemplate => "spiral_order({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[][] m = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]];
        var steps = new List<VisualizationStep>();
        var read = new List<int[]>();
        var output = new List<int>();
        int top = 0, bottom = 2, left = 0, right = 3;

        void Leg(List<int[]> cells, string what)
        {
            foreach (var cell in cells) output.Add(m[cell[0]][cell[1]]);
            steps.Add(new(new() { ["grid"] = m, ["highlight"] = cells.ToArray(), ["visited"] = read.ToArray() }, [],
                $"{what}: {string.Join(", ", cells.Select(c => m[c[0]][c[1]]))}. Output so far [{string.Join(", ", output)}]. Now top={top}, bottom={bottom}, left={left}, right={right}."));
            read.AddRange(cells);
        }

        steps.Add(new(new() { ["grid"] = m }, [], "Read a 3 by 4 matrix clockwise. Boundaries: top = 0, bottom = 2, left = 0, right = 3."));
        while (top <= bottom && left <= right)
        {
            var row = top;
            var cells = Enumerable.Range(left, right - left + 1).Select(c => new[] { row, c }).ToList();
            top++;
            Leg(cells, $"Top row {row}, left to right, then top++");
            var col = right;
            cells = Enumerable.Range(top, Math.Max(0, bottom - top + 1)).Select(r => new[] { r, col }).ToList();
            right--;
            if (cells.Count > 0) Leg(cells, $"Right column {col}, downwards, then right--");
            if (top <= bottom)
            {
                row = bottom;
                cells = Enumerable.Range(left, Math.Max(0, right - left + 1)).Reverse().Select(c => new[] { row, c }).ToList();
                bottom--;
                if (cells.Count > 0) Leg(cells, $"Bottom row {row}, right to left, then bottom--");
            }
            if (left <= right)
            {
                col = left;
                cells = Enumerable.Range(top, Math.Max(0, bottom - top + 1)).Reverse().Select(r => new[] { r, col }).ToList();
                left++;
                if (cells.Count > 0) Leg(cells, $"Left column {col}, upwards, then left++");
            }
        }
        steps.Add(new(new() { ["grid"] = m, ["visited"] = read.ToArray() }, [], $"The boundaries crossed, so every cell was read once: [{string.Join(", ", output)}]."));
        return steps;
    }
}
