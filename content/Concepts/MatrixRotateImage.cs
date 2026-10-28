namespace DsaAcademy.Content.Concepts;

public class MatrixRotateImage : IConcept
{
    public string Id => "matrix-rotate-image";
    public string Track => "patterns";
    public string Title => "Matrix: Rotate Image";
    public string OneLiner => "Rotate a square matrix 90 degrees clockwise in place: transpose it, then reverse each row.";
    public string KeyTakeaway =>
        "A 90 degree clockwise rotation sends cell (r, c) to (c, n - 1 - r). Doing that directly needs " +
        "four-way swaps around each ring; the easier route is two simple in-place steps: transpose (swap (r, " +
        "c) with (c, r) above the diagonal), then reverse every row. Both are O(n²) with O(1) extra space.";
    public VisualizerKind VisualizerKind => VisualizerKind.Grid;

    public string Explanation =>
        "matrix is n by n. Rotate it 90 degrees clockwise in place (no second matrix) and return it. [[1, 2, " +
        "3], [4, 5, 6], [7, 8, 9]] becomes [[7, 4, 1], [8, 5, 2], [9, 6, 3]]: the first column, read bottom " +
        "to top, becomes the first row.\n\n" +
        "Look at where a cell goes: the value at row r, column c ends up at row c, column n - 1 - r. " +
        "Allocating a new matrix and copying every value there is easy but uses O(n²) space. To stay in " +
        "place, split the move into two steps you can each do with swaps.\n\n" +
        "Step 1, transpose: swap matrix[r][c] with matrix[c][r] for every c > r, which reflects the matrix " +
        "across its main diagonal, so (r, c) goes to (c, r). Only loop over the cells above the diagonal; " +
        "swapping every pair twice puts everything back. Step 2, reverse each row: (c, r) goes to (c, n - 1 - " +
        "r). Together that is exactly the rotation.\n\n" +
        "Other rotations are the same trick with a different second step: counter-clockwise is transpose then " +
        "reverse each column (or reverse each row, then transpose). The direct method, rotating four cells at " +
        "a time ring by ring, saves the second pass but is easy to get wrong; know the transpose version cold " +
        "and mention the other.\n\n" +
        "Every cell is touched a constant number of times: O(n²), which is linear in the size of the matrix, " +
        "and O(1) extra space. The visualization rotates a 3 by 3 matrix.";

    public List<string> RecognitionSignals => [
        "Rotate or flip a square grid in place: images, game boards, matrices.",
        "A move that maps (r, c) to some mix of r, c and n - 1 - r: break it into a transpose and a reversal.",
    ];

    public List<string> Gotchas => [
        "Transposing over the whole matrix instead of only c > r swaps each pair twice and leaves it unchanged.",
        "Reversing columns instead of rows rotates counter-clockwise.",
        "The in-place transpose only works on a square matrix; a rectangular one changes shape and needs a new array.",
    ];

    public List<string> ConfusableWith => [
        "Spiral Order also works ring by ring, but only reads values; nothing moves.",
        "Reverse an Array In Place is step 2 here, applied to each row.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[][] Rotate(int[][] matrix)\n" +
            "    {\n" +
            "        var n = matrix.Length;\n" +
            "        // TODO: transpose: for r in 0..n-1, for c in r+1..n-1, swap matrix[r][c] and matrix[c][r].\n" +
            "        // Then reverse each row (Array.Reverse works, or two pointers).\n" +
            "        return matrix;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def rotate(matrix):\n" +
            "    n = len(matrix)\n" +
            "    # TODO: transpose: for r in range(n), for c in range(r + 1, n), swap matrix[r][c] and matrix[c][r].\n" +
            "    # Then reverse each row (row.reverse() works, or two pointers).\n" +
            "    return matrix\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Rotate",
        ["python"] = "rotate",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[[1, 2, 3], [4, 5, 6], [7, 8, 9]]", "[[7,4,1],[8,5,2],[9,6,3]]"),
        new TestCase("[[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]", "[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]"),
        new TestCase("[[1]]", "[[1]]"),
        new TestCase("[[1, 2], [3, 4]]", "[[3,1],[4,2]]"),
        new TestCase("[[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18, 19, 20], [21, 22, 23, 24, 25]]", "[[21,16,11,6,1],[22,17,12,7,2],[23,18,13,8,3],[24,19,14,9,4],[25,20,15,10,5]]"),
    ];

    public string CSharpCallTemplate => "Solution.Rotate({input})";
    public string PythonCallTemplate => "rotate({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[][] m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
        int[][] Copy() => m.Select(row => row.ToArray()).ToArray();
        var steps = new List<VisualizationStep>
        {
            new(new() { ["grid"] = Copy() }, [], "Rotate [[1, 2, 3], [4, 5, 6], [7, 8, 9]] clockwise in place. Step 1 is a transpose."),
        };
        for (var r = 0; r < 3; r++)
        {
            for (var c = r + 1; c < 3; c++)
            {
                (m[r][c], m[c][r]) = (m[c][r], m[r][c]);
                steps.Add(new(new() { ["grid"] = Copy(), ["highlight"] = new[] { new[] { r, c }, new[] { c, r } } }, [],
                    $"Swap ({r}, {c}) with ({c}, {r}) across the diagonal: now {m[r][c]} and {m[c][r]}."));
            }
        }
        steps.Add(new(new() { ["grid"] = Copy() }, [], "Transposed: rows became columns. Step 2 reverses each row."));
        for (var r = 0; r < 3; r++)
        {
            Array.Reverse(m[r]);
            steps.Add(new(new() { ["grid"] = Copy(), ["highlight"] = Enumerable.Range(0, 3).Select(c => new[] { r, c }).ToArray() }, [],
                $"Reverse row {r}: [{string.Join(", ", m[r])}]."));
        }
        steps.Add(new(new() { ["grid"] = Copy() }, [], "Rotated 90 degrees clockwise: the old first column, read upwards, is the new first row."));
        return steps;
    }
}
