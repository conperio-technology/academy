namespace DsaAcademy.Content.Concepts;

public class BlockKnapsackOneRow : BuildingBlock
{
    public override string Id => "block-knapsack-one-row";
    public override string Title => "Block: 0/1 Knapsack in One Row";
    public override string OneLiner => "Pick items to carry the most value within a weight limit, each item at most once, with a single array filled from the top down.";
    public override string KeyTakeaway =>
        "With one array, loop capacity downward for 0/1 knapsack (each item once) and upward for unbounded (items reusable). The loop direction is the entire difference.";

    public override string Explanation =>
        "Item i weighs weights[i] and is worth values[i]. Return the most value you can carry with total weight at most capacity, using each item at most once.\n" +
        "\n" +
        "dp[c] is the best value with capacity c using the items seen so far. For each item, go through c from capacity down to the item's weight and set dp[c] = max(dp[c], dp[c - weight] + value): leave the item, or take it on top of the best for the remaining room. Going downward means dp[c - weight] still holds the value from before this item, so it can't be taken twice. Partition Equal Subset Sum and Target Sum are this block; Coin Change is the upward version.";

    protected override string[] Plan =>
    [
        "Make dp of length capacity + 1 filled with 0: dp[c] is the best value with capacity c.",
        "For each item, loop the capacity c downward from capacity to the item's weight.",
        "Set dp[c] to the larger of dp[c] (skip the item) and dp[c - weight] + value (take it once).",
        "Return dp[capacity].",
    ];

    protected override string CSharpSignature => "public static int MaxValue(int[] weights, int[] values, int capacity)";
    protected override string CSharpReturnStub => "return 0;";
    protected override string PythonSignature => "def max_value(weights, values, capacity):";
    protected override string PythonReturnStub => "return 0";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MaxValue",
        ["python"] = "max_value",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("[1, 3, 4, 5], [1, 4, 5, 7], 7", "9"),
        new TestCase("[1, 2, 3], [10, 15, 40], 6", "65"),
        new TestCase("[5], [10], 4", "0"),
        new TestCase("[], [], 10", "0"),
        new TestCase("[2, 2, 2], [3, 3, 3], 4", "6"),
        new TestCase("[1, 1], [5, 5], 1", "5"),
    ];

    public override string CSharpCallTemplate => "Solution.MaxValue({input})";
    public override string PythonCallTemplate => "max_value({input})";

    public override List<string> Gotchas =>
    [
        "Looping capacity upward, which lets one item be taken many times.",
        "Stopping the loop at weight + 1 or starting it at capacity - 1, which skips a capacity.",
    ];
}
