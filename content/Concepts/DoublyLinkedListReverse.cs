namespace DsaAcademy.Content.Concepts;

public class DoublyLinkedListReverse : IConcept
{
    public string Id => "doubly-linked-list-reverse";
    public string Track => "fundamentals";

    // See ArrayTraversalSum.cs -- keeps this track ahead of Trees/Graphs/Sorting/DP/
    // Patterns so Hashing (Order = 60) can slot in right after it.
    public int Order => 50;

    public string Title => "Linked Lists: Reverse a Doubly Linked List";
    public string OneLiner => "Singly linked reversal flips one pointer per node; doubly linked reversal has to flip two.";
    public string KeyTakeaway =>
        "A doubly linked list trades a little extra memory (one more pointer per node) for O(1) " +
        "backward traversal and O(1) removal given a node reference, without needing to walk from the " +
        "head to find the predecessor the way a singly linked list does. Reversing it means swapping " +
        "BOTH Next and Prev at every node, not just redirecting one pointer.";
    public VisualizerKind VisualizerKind => VisualizerKind.LinkedList;

    public string Explanation =>
        "Every node in a doubly linked list has two pointers instead of one: `Next` (forward, same as " +
        "a singly linked list) and `Prev` (backward, the thing a singly linked list can't do in O(1) -- " +
        "walking backward there means starting over from the head). To reverse the whole list, walk " +
        "node by node from the head and, at EACH node, swap its Next and Prev pointers -- what used to " +
        "point forward now points backward and vice versa. Keep track of the last node you touch; once " +
        "the walk runs out (following the OLD Next pointer, saved before you overwrite it), that last " +
        "node is the new head. Watch out for the order of operations: you have to save the old Next " +
        "pointer BEFORE overwriting it, or you lose your way forward through the original list entirely.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static DoublyListNode? ReverseList(DoublyListNode? head)\n" +
            "    {\n" +
            "        // TODO: walk from head. At each node, save node.Next before overwriting it,\n" +
            "        // then swap node.Next and node.Prev. The last node you visit is the new head.\n" +
            "        return head;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def reverse_list(head):\n" +
            "    # TODO: walk from head. At each node, save node.next before overwriting it,\n" +
            "    # then swap node.next and node.prev. The last node you visit is the new head.\n" +
            "    return head\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.ReverseList",
        ["python"] = "reverse_list",
    };

    // The user only ever sees/writes Solution -- DoublyListNode and the array<->list
    // helpers are infrastructure, injected ahead of their code the same way
    // LinkedListTraversal's ListNode/ListBuilder are. ToArray on the OUTPUT (not just
    // FromArray on the input) matters here specifically: a reversed doubly linked list
    // has Prev pointers forming a cycle back through the structure, so serializing the
    // node graph directly would hit a circular reference. Traversing it back down to a
    // plain int[] before comparing sidesteps that entirely.
    public string? CSharpHarnessPreamble =>
        "public class DoublyListNode\n" +
        "{\n" +
        "    public int Val;\n" +
        "    public DoublyListNode? Next;\n" +
        "    public DoublyListNode? Prev;\n" +
        "    public DoublyListNode(int val) { Val = val; }\n" +
        "}\n" +
        "public static class DoublyListBuilder\n" +
        "{\n" +
        "    public static DoublyListNode? FromArray(int[] values)\n" +
        "    {\n" +
        "        DoublyListNode? head = null, tail = null;\n" +
        "        foreach (var v in values)\n" +
        "        {\n" +
        "            var node = new DoublyListNode(v);\n" +
        "            if (head == null) { head = node; tail = node; }\n" +
        "            else { node.Prev = tail; tail!.Next = node; tail = node; }\n" +
        "        }\n" +
        "        return head;\n" +
        "    }\n" +
        "    public static int[] ToArray(DoublyListNode? head)\n" +
        "    {\n" +
        "        var result = new List<int>();\n" +
        "        var current = head;\n" +
        "        while (current != null) { result.Add(current.Val); current = current.Next; }\n" +
        "        return result.ToArray();\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "class DoublyListNode:\n" +
        "    def __init__(self, val):\n" +
        "        self.val = val\n" +
        "        self.next = None\n" +
        "        self.prev = None\n" +
        "\n" +
        "def build_doubly_list(values):\n" +
        "    head = None\n" +
        "    tail = None\n" +
        "    for v in values:\n" +
        "        node = DoublyListNode(v)\n" +
        "        if head is None:\n" +
        "            head = node\n" +
        "            tail = node\n" +
        "        else:\n" +
        "            node.prev = tail\n" +
        "            tail.next = node\n" +
        "            tail = node\n" +
        "    return head\n" +
        "\n" +
        "def doubly_list_to_array(head):\n" +
        "    result = []\n" +
        "    current = head\n" +
        "    while current is not None:\n" +
        "        result.append(current.val)\n" +
        "        current = current.next\n" +
        "    return result\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([1, 2, 3]), "[3,2,1]"),
        new TestCase(Lit.IntArray([]), "[]"),
        new TestCase(Lit.IntArray([5]), "[5]"),
        new TestCase(Lit.IntArray([1, 2, 3, 4, 5]), "[5,4,3,2,1]"),
    ];

    public string CSharpCallTemplate => "DoublyListBuilder.ToArray(Solution.ReverseList(DoublyListBuilder.FromArray({input})))";
    public string PythonCallTemplate => "doubly_list_to_array(reverse_list(build_doubly_list({input})))";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] values = [4, 8, 15, 16, 23];
        var steps = new List<VisualizationStep>();

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["nodes"] = values, ["collected"] = Array.Empty<int>() },
            HighlightIndices: [0],
            Message: "current = head. Walk forward, and at each node swap Next and Prev -- the nodes stay where they are, only which way their pointers face changes."
        ));

        for (var i = 0; i < values.Length; i++)
        {
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["nodes"] = values, ["collected"] = Array.Empty<int>() },
                HighlightIndices: [i],
                Message: $"At node (val {values[i]}): save the old Next before overwriting it, then swap Next and Prev on this node."
            ));
        }

        var reversed = values.Reverse().ToArray();
        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["nodes"] = values, ["collected"] = reversed },
            HighlightIndices: [],
            Message: $"Old Next was null (end of the original list) -- stop. The last node touched (originally the tail, val {values[^1]}) is the new head. Traversing forward from it now visits: [{string.Join(", ", reversed)}]."
        ));

        return steps;
    }
}
