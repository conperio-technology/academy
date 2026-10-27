namespace DsaAcademy.Content.Concepts;

public class BlockCourseOrder : BuildingBlock
{
    public override string Id => "block-course-order";
    public override string Title => "Block: Topological Sort (Kahn's Algorithm)";
    public override string OneLiner => "Order courses so every prerequisite comes first, by repeatedly taking courses with no remaining prerequisites.";
    public override string KeyTakeaway =>
        "Kahn's algorithm: count indegrees, queue every node at 0, pop and decrement its neighbours, queue any that reach 0. If fewer than n come out, there is a cycle.";

    public override string Explanation =>
        "There are n courses, 0 to n - 1. Each [a, b] in prereqs means b must be taken before a. Return an order that takes every course, or an empty list if a cycle makes that impossible.\n" +
        "\n" +
        "So that there is one right answer: start the queue with the courses that have no prerequisites in increasing number, add edges to the adjacency list in the order prereqs lists them, and use a first-in first-out queue. Pop a course, append it to the order, and decrease the indegree of every course that depends on it, enqueuing those that reach 0. Course Schedule, build orders and Parallel Courses are this block.";

    protected override string[] Plan =>
    [
        "Build the adjacency list (prerequisite to course) and count each course's indegree.",
        "Put every course with indegree 0 into a queue, lowest number first.",
        "Pop from the front, append it to the order, and decrease each neighbour's indegree, enqueuing any that reach 0.",
        "If the order has fewer than n courses, there is a cycle: return an empty list.",
        "Otherwise return the order.",
    ];

    protected override string CSharpSignature => "public static List<int> CourseOrder(int n, int[][] prereqs)";
    protected override string CSharpReturnStub => "return new List<int>();";
    protected override string PythonSignature => "def course_order(n, prereqs):";
    protected override string PythonReturnStub => "return []";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CourseOrder",
        ["python"] = "course_order",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("2, [[1, 0]]", "[0,1]"),
        new TestCase("4, [[1, 0], [2, 0], [3, 1], [3, 2]]", "[0,1,2,3]"),
        new TestCase("2, [[1, 0], [0, 1]]", "[]"),
        new TestCase("3, []", "[0,1,2]"),
        new TestCase("3, [[0, 1], [0, 2], [1, 2]]", "[2,1,0]"),
        new TestCase("5, [[1, 0], [2, 1], [3, 2], [1, 3]]", "[]"),
        new TestCase("4, [[2, 3]]", "[0,1,3,2]"),
    ];

    public override string CSharpCallTemplate => "Solution.CourseOrder({input})";
    public override string PythonCallTemplate => "course_order({input})";

    public override List<string> Gotchas =>
    [
        "Building the edge the wrong way round: [a, b] means an edge from b to a.",
        "Returning the partial order when there is a cycle instead of checking its length.",
    ];
}
