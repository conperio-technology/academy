namespace DsaAcademy.Content.Concepts;

// The Building Blocks track: the small templates most interview solutions are glued together from
// (a hashmap count, a stack, BFS with a visited set, binary search on the answer, union-find),
// each a graded exercise with the thinnest possible wrapper so one rep takes a few minutes. Tier 1
// is simple constructs, tier 2 the algorithm blocks. The "Today's reps" tool (BlockRepsTool) drills
// them from the bare starter and tracks fluency; client/src/buildingBlocksData.ts holds the tier,
// target time and glue problems per block.
//
// The guided starter is the block's plain-English plan, one numbered comment per step, and the bare
// starter (client/src/bareStarter.ts) strips those comments, so both come from Plan below. Blocks
// have no step-through visualizer: the point is writing them, and the lesson page skips that section.
public abstract class BuildingBlock : IConcept
{
    public const string TrackName = "building blocks";

    public abstract string Id { get; }
    public string Section => "Data Structures & Algorithms";
    public string Track => TrackName;
    // After the fundamentals and hashing tracks and before trees, graphs and patterns (100);
    // the Today's reps tool sits first at 98.
    public int Order => 99;
    public abstract string Title { get; }
    public abstract string OneLiner { get; }
    public abstract string KeyTakeaway { get; }
    public abstract string Explanation { get; }
    public VisualizerKind VisualizerKind => VisualizerKind.Array;
    public List<VisualizationStep> BuildVisualizationSteps() => [];

    // Four or five plain-English steps, written into the guided starter as numbered comments.
    protected abstract string[] Plan { get; }
    // Lines describing provided types (a ListNode, a TreeNode); kept in the bare starter too.
    protected virtual string[] CSharpProvided => [];
    protected virtual string[] PythonProvided => [];
    protected abstract string CSharpSignature { get; }
    protected abstract string CSharpReturnStub { get; }
    protected abstract string PythonSignature { get; }
    protected abstract string PythonReturnStub { get; }

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            string.Concat(CSharpProvided.Select(line => $"// {line} (provided)\n")) +
            "public class Solution\n" +
            "{\n" +
            $"    {CSharpSignature}\n" +
            "    {\n" +
            string.Concat(Plan.Select((step, i) => $"        // {i + 1}. {step}\n")) +
            $"        {CSharpReturnStub}\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            string.Concat(PythonProvided.Select(line => $"# {line} (provided)\n")) +
            $"{PythonSignature}\n" +
            string.Concat(Plan.Select((step, i) => $"    # {i + 1}. {step}\n")) +
            $"    {PythonReturnStub}\n",
    };

    public abstract Dictionary<string, string> FunctionNames { get; }
    public abstract List<TestCase> TestCases { get; }
    public abstract string CSharpCallTemplate { get; }
    public abstract string PythonCallTemplate { get; }
    public virtual string? CSharpHarnessPreamble => null;
    public virtual string? PythonHarnessPreamble => null;

    // The bug this block is most often written with; shown under "Watch out for".
    public virtual List<string> Gotchas => [];
    public List<string> RecognitionSignals => [];
    public List<string> ConfusableWith => [];
}

// Harness code shared by the blocks that take a linked list or a tree.
internal static class BlockHarness
{
    public const string ListNodeCSharp =
        "public class ListNode\n" +
        "{\n" +
        "    public int Val;\n" +
        "    public ListNode? Next;\n" +
        "    public ListNode(int val, ListNode? next = null) { Val = val; Next = next; }\n" +
        "}\n" +
        "public static class ListBuilder\n" +
        "{\n" +
        "    public static ListNode? FromArray(int[] values)\n" +
        "    {\n" +
        "        ListNode? head = null, tail = null;\n" +
        "        foreach (var v in values)\n" +
        "        {\n" +
        "            var node = new ListNode(v);\n" +
        "            if (head == null) { head = node; tail = node; }\n" +
        "            else { tail!.Next = node; tail = node; }\n" +
        "        }\n" +
        "        return head;\n" +
        "    }\n" +
        "    public static int[] ToArray(ListNode? head)\n" +
        "    {\n" +
        "        var result = new List<int>();\n" +
        "        for (var current = head; current != null; current = current.Next)\n" +
        "        {\n" +
        "            if (result.Count == 10000) throw new InvalidOperationException(\"The returned list never reaches null (it loops back on itself).\");\n" +
        "            result.Add(current.Val);\n" +
        "        }\n" +
        "        return result.ToArray();\n" +
        "    }\n" +
        "}\n";

    public const string ListNodePython =
        "class ListNode:\n" +
        "    def __init__(self, val, next=None):\n" +
        "        self.val = val\n" +
        "        self.next = next\n" +
        "\n" +
        "def build_list(values):\n" +
        "    head = None\n" +
        "    tail = None\n" +
        "    for v in values:\n" +
        "        node = ListNode(v)\n" +
        "        if head is None:\n" +
        "            head = node\n" +
        "            tail = node\n" +
        "        else:\n" +
        "            tail.next = node\n" +
        "            tail = node\n" +
        "    return head\n" +
        "\n" +
        "def list_to_array(head):\n" +
        "    result = []\n" +
        "    current = head\n" +
        "    while current is not None:\n" +
        "        if len(result) == 10000:\n" +
        "            raise ValueError(\"The returned list never reaches None (it loops back on itself).\")\n" +
        "        result.append(current.val)\n" +
        "        current = current.next\n" +
        "    return result\n";

    // Level-order arrays with null gaps: the C# builder takes int?[] and the Python preamble
    // defines `null = None`, so one literal is valid in both languages (as in TreeDiameter).
    public const string TreeNodeCSharp =
        "public class TreeNode\n" +
        "{\n" +
        "    public int Val;\n" +
        "    public TreeNode? Left;\n" +
        "    public TreeNode? Right;\n" +
        "    public TreeNode(int val) { Val = val; }\n" +
        "}\n" +
        "public static class LevelOrderTree\n" +
        "{\n" +
        "    public static TreeNode? Build(int?[] values)\n" +
        "    {\n" +
        "        if (values.Length == 0 || values[0] is not int rootValue) return null;\n" +
        "        var root = new TreeNode(rootValue);\n" +
        "        var queue = new Queue<TreeNode>();\n" +
        "        queue.Enqueue(root);\n" +
        "        var i = 1;\n" +
        "        while (queue.Count > 0 && i < values.Length)\n" +
        "        {\n" +
        "            var node = queue.Dequeue();\n" +
        "            if (values[i] is int leftValue)\n" +
        "            {\n" +
        "                node.Left = new TreeNode(leftValue);\n" +
        "                queue.Enqueue(node.Left);\n" +
        "            }\n" +
        "            i++;\n" +
        "            if (i < values.Length && values[i] is int rightValue)\n" +
        "            {\n" +
        "                node.Right = new TreeNode(rightValue);\n" +
        "                queue.Enqueue(node.Right);\n" +
        "            }\n" +
        "            i++;\n" +
        "        }\n" +
        "        return root;\n" +
        "    }\n" +
        "}\n";

    public const string TreeNodePython =
        "null = None\n" +
        "\n" +
        "class TreeNode:\n" +
        "    def __init__(self, val):\n" +
        "        self.val = val\n" +
        "        self.left = None\n" +
        "        self.right = None\n" +
        "\n" +
        "def build_level_order_tree(values):\n" +
        "    if not values or values[0] is None:\n" +
        "        return None\n" +
        "    root = TreeNode(values[0])\n" +
        "    queue = [root]\n" +
        "    head = 0\n" +
        "    i = 1\n" +
        "    while head < len(queue) and i < len(values):\n" +
        "        node = queue[head]\n" +
        "        head += 1\n" +
        "        if values[i] is not None:\n" +
        "            node.left = TreeNode(values[i])\n" +
        "            queue.append(node.left)\n" +
        "        i += 1\n" +
        "        if i < len(values) and values[i] is not None:\n" +
        "            node.right = TreeNode(values[i])\n" +
        "            queue.append(node.right)\n" +
        "        i += 1\n" +
        "    return root\n";
}
