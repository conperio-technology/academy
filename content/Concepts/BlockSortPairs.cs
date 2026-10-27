namespace DsaAcademy.Content.Concepts;

public class BlockSortPairs : BuildingBlock
{
    public override string Id => "block-sort-pairs";
    public override string Title => "Block: Sort With a Custom Key";
    public override string OneLiner => "Sort pairs by their second value ascending, breaking ties by their first value descending.";
    public override string KeyTakeaway =>
        "Say the sort order out loud as keys, most important first, then write it: OrderBy then ThenByDescending in C#, a key tuple with a negated part in Python.";

    public override string Explanation =>
        "Each pair is [a, b]. Return the pairs sorted by b ascending, and where b ties, by a descending. [[1, 2], [3, 1], [2, 2], [5, 1]] gives [[5, 1], [3, 1], [2, 2], [1, 2]].\n" +
        "\n" +
        "In C#, pairs.OrderBy(p => p[1]).ThenByDescending(p => p[0]) is stable and reads like the spec. In Python, sorted(pairs, key=lambda p: (p[1], -p[0])) sorts by a tuple, and negating a number flips its direction. Sorting intervals by start, events by time, or people by (height, -k) are all this block.";

    protected override string[] Plan =>
    [
        "Decide the sort key: the second value first, then the first value.",
        "Make the tiebreak descending (negate it in Python, ThenByDescending in C#).",
        "Sort the pairs with that key, keeping each pair intact.",
        "Return the sorted pairs.",
    ];

    protected override string CSharpSignature => "public static int[][] SortPairs(int[][] pairs)";
    protected override string CSharpReturnStub => "return pairs;";
    protected override string PythonSignature => "def sort_pairs(pairs):";
    protected override string PythonReturnStub => "return pairs";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.SortPairs",
        ["python"] = "sort_pairs",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("[[1, 2], [3, 1], [2, 2], [5, 1]]", "[[5,1],[3,1],[2,2],[1,2]]"),
        new TestCase("[]", "[]"),
        new TestCase("[[0, 0]]", "[[0,0]]"),
        new TestCase("[[-1, 5], [2, -3], [0, 5]]", "[[2,-3],[0,5],[-1,5]]"),
        new TestCase("[[4, 4], [4, 4], [1, 4]]", "[[4,4],[4,4],[1,4]]"),
    ];

    public override string CSharpCallTemplate => "Solution.SortPairs({input})";
    public override string PythonCallTemplate => "sort_pairs({input})";

    public override List<string> Gotchas =>
    [
        "Putting the keys in the wrong order: the first key decides, later keys only break ties.",
        "Sorting twice with the main key second, or forgetting which way the tiebreak runs.",
    ];
}
