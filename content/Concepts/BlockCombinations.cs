namespace DsaAcademy.Content.Concepts;

public class BlockCombinations : BuildingBlock
{
    public override string Id => "block-combinations";
    public override string Title => "Block: The Backtracking Template";
    public override string OneLiner => "List every way to choose k numbers from 1 to n, in order, with choose, explore, undo.";
    public override string KeyTakeaway =>
        "Backtracking is choose, explore, undo: append, recurse, pop. Save a copy of the path when it is complete, never the path itself.";

    public override string Explanation =>
        "Return all combinations of k distinct numbers from 1 to n, each in increasing order, listed in lexicographic order. n = 4, k = 2 gives [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]. k = 0 gives one empty combination.\n" +
        "\n" +
        "Keep a path and write backtrack(start). If the path has k numbers, add a copy to the result and return. Otherwise, for each number from start to n: append it, call backtrack(number + 1), then remove it again. Starting the next level at number + 1 is what keeps each combination in increasing order with no repeats. Subsets, permutations, combination sums and N-Queens are this template with different choices and stopping rules.";

    protected override string[] Plan =>
    [
        "Make an empty result list and an empty current path.",
        "Write backtrack(start): if the path has k numbers, add a copy to the result and return.",
        "For each number from start to n: choose it (append), explore with backtrack(number + 1), then undo (remove it).",
        "Call backtrack(1) and return the result.",
    ];

    protected override string CSharpSignature => "public static List<List<int>> Combinations(int n, int k)";
    protected override string CSharpReturnStub => "return new List<List<int>>();";
    protected override string PythonSignature => "def combinations(n, k):";
    protected override string PythonReturnStub => "return []";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Combinations",
        ["python"] = "combinations",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("4, 2", "[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]"),
        new TestCase("1, 1", "[[1]]"),
        new TestCase("3, 3", "[[1,2,3]]"),
        new TestCase("3, 0", "[[]]"),
        new TestCase("5, 4", "[[1,2,3,4],[1,2,3,5],[1,2,4,5],[1,3,4,5],[2,3,4,5]]"),
    ];

    public override string CSharpCallTemplate => "Solution.Combinations({input})";
    public override string PythonCallTemplate => "combinations({input})";

    public override List<string> Gotchas =>
    [
        "Adding the path itself instead of a copy, so every saved combination is emptied by later pops.",
        "Forgetting the undo step, so the path keeps growing.",
    ];
}
