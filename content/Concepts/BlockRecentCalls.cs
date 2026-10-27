namespace DsaAcademy.Content.Concepts;

public class BlockRecentCalls : BuildingBlock
{
    public override string Id => "block-recent-calls";
    public override string Title => "Block: A Queue (Deque)";
    public override string OneLiner => "For each call time, count the calls in the last 3000 ms by dropping old times off the front of a queue.";
    public override string KeyTakeaway =>
        "A queue adds at the back and removes from the front in O(1). In Python that means collections.deque and popleft, never list.pop(0), which shifts every element.";

    public override string Explanation =>
        "times is increasing. For each time t, return how many times so far fall in [t - 3000, t], including t itself. [1, 100, 3001, 3002] gives [1, 2, 3, 3]: at 3002 the call at 1 has dropped out.\n" +
        "\n" +
        "Push each time onto the back of a queue, then pop from the front while the front is older than t - 3000. What is left is exactly the recent window, so its length is the answer for t. C# uses Queue<int> (Enqueue, Peek, Dequeue); Python uses collections.deque (append, [0], popleft).";

    protected override string[] Plan =>
    [
        "Make an empty queue and an empty result list.",
        "For each time, add it to the back of the queue.",
        "Remove times from the front while they are older than the current time minus 3000.",
        "Append the queue's length to the result.",
        "Return the result.",
    ];

    protected override string CSharpSignature => "public static List<int> RecentCounts(int[] times)";
    protected override string CSharpReturnStub => "return new List<int>();";
    protected override string PythonSignature => "def recent_counts(times):";
    protected override string PythonReturnStub => "return []";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.RecentCounts",
        ["python"] = "recent_counts",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("[1, 100, 3001, 3002]", "[1,2,3,3]"),
        new TestCase("[]", "[]"),
        new TestCase("[5]", "[1]"),
        new TestCase("[1, 3001, 6001]", "[1,2,2]"),
        new TestCase("[0, 1000, 2000, 3000, 4000, 10000]", "[1,2,3,4,4,1]"),
    ];

    public override string CSharpCallTemplate => "Solution.RecentCounts({input})";
    public override string PythonCallTemplate => "recent_counts({input})";

    public override List<string> Gotchas =>
    [
        "Using list.pop(0) in Python, which is O(n) per pop.",
        "An off-by-one on the boundary: a call exactly 3000 ms ago still counts.",
    ];
}
