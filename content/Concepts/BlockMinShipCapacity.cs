namespace DsaAcademy.Content.Concepts;

public class BlockMinShipCapacity : BuildingBlock
{
    public override string Id => "block-min-ship-capacity";
    public override string Title => "Block: Binary Search on the Answer";
    public override string OneLiner => "Find the smallest ship capacity that delivers packages in order within a number of days, by binary searching over capacities.";
    public override string KeyTakeaway =>
        "When \"does X work?\" is easy and the answers are monotonic (if X works, so does X + 1), binary search over X with a feasibility check. The block is the check plus the lower-bound loop.";

    public override string Explanation =>
        "weights must be shipped in order, one day at a time; a day's load can't exceed the ship's capacity. Return the smallest capacity that ships everything within days days. [1..10] in 5 days needs 15.\n" +
        "\n" +
        "The answer lies between the heaviest package (anything smaller can't carry it) and the sum of all weights (one day). Write canShip(capacity): fill each day greedily and count days. Then run the first-index binary search over that range: if canShip(mid), hi = mid, otherwise lo = mid + 1. Koko Eating Bananas, Split Array Largest Sum and minimum speed problems are this block.";

    protected override string[] Plan =>
    [
        "The answer lies between the heaviest package (lo) and the total weight (hi).",
        "Write canShip(capacity): fill each day greedily in order and count how many days it takes.",
        "Binary search: if canShip(mid), mid works, so try smaller (hi = mid); otherwise lo = mid + 1.",
        "Return lo, the smallest capacity that works.",
    ];

    protected override string CSharpSignature => "public static int MinCapacity(int[] weights, int days)";
    protected override string CSharpReturnStub => "return 0;";
    protected override string PythonSignature => "def min_capacity(weights, days):";
    protected override string PythonReturnStub => "return 0";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MinCapacity",
        ["python"] = "min_capacity",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5", "15"),
        new TestCase("[3, 2, 2, 4, 1, 4], 3", "6"),
        new TestCase("[1, 2, 3, 1, 1], 4", "3"),
        new TestCase("[10], 1", "10"),
        new TestCase("[1, 1, 1, 1], 4", "1"),
        new TestCase("[5, 5, 5], 1", "15"),
    ];

    public override string CSharpCallTemplate => "Solution.MinCapacity({input})";
    public override string PythonCallTemplate => "min_capacity({input})";

    public override List<string> Gotchas =>
    [
        "Starting lo at 1 instead of the heaviest package, so the check accepts a capacity that can't lift one item.",
        "Getting the direction backwards: when mid works, search left (hi = mid), not right.",
    ];
}
