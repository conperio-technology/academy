namespace DsaAcademy.Content.Concepts;

public class LinkedListTraversal : IConcept
{
    public string Id => "linked-list-traversal";
    public string Track => "fundamentals";

    // See ArrayTraversalSum.cs -- keeps this track ahead of Trees/Graphs/Sorting/DP/
    // Patterns so Hashing (Order = 60) can slot in right after it.
    public int Order => 50;

    public string Title => "Linked Lists: Traversal";
    public string OneLiner => "No indexes here -- walk node to node by following .Next until it's null.";
    public string KeyTakeaway =>
        "Linked lists trade the array's O(1) random access for O(1) insert/delete at a known " +
        "position -- the only way to reach position i is to walk i steps from the head.";
    public VisualizerKind VisualizerKind => VisualizerKind.LinkedList;

    public string Explanation =>
        "A linked list stores each value in its own node, a small object holding the value and a reference " +
        "(`Next`) to the next node; the first node is the head, and the last node's `Next` is null, meaning \"no node\". It has no index -- there's no nums[3]. The only way to get anywhere is to start at the head and follow each node's `Next` pointer until you hit null. This is the " +
        "single most important habit to build before touching anything else with linked lists " +
        "(reversal, cycle detection, merging): a `while (current != null) { ...; current = " +
        "current.Next; }` loop. Watch out for the classic bug -- advancing the pointer before you've " +
        "read/used the current node's value, which silently skips the head.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] TraverseToArray(ListNode? head)\n" +
            "    {\n" +
            "        // TODO: walk from head to the end (Next == null), collecting each Val.\n" +
            "        return new int[0];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def traverse_to_array(head):\n" +
            "    # TODO: walk from head to the end (next is None), collecting each val.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.TraverseToArray",
        ["python"] = "traverse_to_array",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([1, 2, 3]), "[1,2,3]"),
        new TestCase(Lit.IntArray([]), "[]"),
        new TestCase(Lit.IntArray([42]), "[42]"),
        new TestCase(Lit.IntArray([5, 5, 5, 5]), "[5,5,5,5]"),
        new TestCase(Lit.IntArray([9, 1, 8, 2, 7]), "[9,1,8,2,7]"),
    ];

    // The user only ever sees/writes Solution -- ListNode and the array-to-list builder
    // are infrastructure, injected ahead of their code (server-side for C#, client-side
    // via Pyodide for Python) so test cases can hand them a real list.
    public string? CSharpHarnessPreamble =>
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
        "}\n";

    public string? PythonHarnessPreamble =>
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
        "    return head\n";

    public string CSharpCallTemplate => "Solution.TraverseToArray(ListBuilder.FromArray({input}))";
    public string PythonCallTemplate => "traverse_to_array(build_list({input}))";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] values = [4, 8, 15, 16, 23];
        var steps = new List<VisualizationStep>();
        var collected = new List<int>();

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["nodes"] = values, ["collected"] = collected.ToArray() },
            HighlightIndices: [0],
            Message: "current = head. There's no index to jump around with -- the only way forward is current.Next."
        ));

        for (var i = 0; i < values.Length; i++)
        {
            collected.Add(values[i]);
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["nodes"] = values, ["collected"] = collected.ToArray() },
                HighlightIndices: [i],
                Message: $"Visit node {i} (val {values[i]}), record it, then move current = current.Next."
            ));
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["nodes"] = values, ["collected"] = collected.ToArray() },
            HighlightIndices: [],
            Message: "current.Next is null -- end of the list. Every node was visited exactly once, O(n)."
        ));

        return steps;
    }
}
