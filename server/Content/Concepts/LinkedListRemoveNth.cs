namespace DsaAcademy.Content.Concepts;

public class LinkedListRemoveNth : IConcept
{
    public string Id => "linked-list-remove-nth";
    public string Track => "patterns";
    public string Title => "Two Pointers: Remove the Nth Node From the End";
    public string OneLiner => "Start two pointers at a dummy node, move the lead n + 1 steps ahead, then move both until the lead falls off the end: the trailing pointer is right before the node to delete.";
    public string KeyTakeaway =>
        "\"n from the end\" becomes \"n behind a pointer that reaches the end\". Keep a fixed gap between two " +
        "pointers and walk them together, and you never need the list's length. A dummy node in front of " +
        "head means removing the head itself is not a special case.";
    public VisualizerKind VisualizerKind => VisualizerKind.LinkedList;

    public string Explanation =>
        "Given the head of a singly linked list and n, remove the n-th node counting from the end (n = 1 is " +
        "the last node) and return the head of the result. n is always between 1 and the list's length. The " +
        "two-pass answer counts the length L, then walks to node L - n. The two-pointer answer does it in one " +
        "pass.\n\n" +
        "To delete a node from a singly linked list you need the node BEFORE it, so you can set " +
        "before.Next = before.Next.Next. The trick is to get a pointer to that node without knowing L. Put " +
        "both pointers, lead and trail, on a dummy node whose Next is head. Move lead n + 1 steps forward. " +
        "Now there are exactly n nodes between trail and lead. Move both one step at a time until lead is " +
        "null (it has walked off the end). The gap hasn't changed, so trail is now n + 1 steps before the " +
        "end, which is the node right before the one to remove. Unlink it and return dummy.Next.\n\n" +
        "The dummy node matters when n equals the length: the node to remove is head itself, and without a " +
        "node in front of it there's no \"before\" to rewire. With the dummy, trail simply stays on the dummy " +
        "and dummy.Next becomes the second node. Return dummy.Next, not head, because head may be the node you " +
        "just removed.\n\n" +
        "The same fixed-gap idea answers \"return the k-th node from the end\" and is a cousin of the fast " +
        "and slow pointers: both pointers move at the same speed here, and what does the work is the head start.\n\n" +
        "In the visualization the first node is the dummy. The pointer labeled fast is the lead and slow is " +
        "the trail.";

    public List<string> RecognitionSignals =>
    [
        "A position counted from the END of a singly linked list (\"n-th from last\", \"k-th to last\") and you'd rather not count the length first.",
        "\"Do it in one pass\" on a linked list where the answer depends on how far a node is from the tail.",
        "You need to delete or insert a node that might be the head, which is when a dummy node saves a special case.",
    ];

    public List<string> Gotchas =>
    [
        "Off by one: to stop on the node BEFORE the target, the lead starts n + 1 steps ahead of the trail (both starting at the dummy). With a gap of n the trail lands on the target itself, and you can't unlink a node from itself.",
        "Return dummy.Next, not head; when n equals the length, head is the node that got removed.",
        "Without a dummy, removing the head needs its own branch, and forgetting it is the most common bug here.",
    ];

    public List<string> ConfusableWith =>
    [
        "Fast & Slow Pointers: Find the Middle of a Linked List (this track) also walks two pointers down one list, but at DIFFERENT speeds. Here they move at the same speed with a fixed gap; the gap, not the speed, is what locates the node.",
        "Two Pointers: Two Sum on a Sorted Array (this track) moves its pointers toward each other from both ends of an array. A singly linked list has no back end to start from, so both pointers start at the front.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static ListNode? RemoveNthFromEnd(ListNode? head, int n)\n" +
            "    {\n" +
            "        // TODO: dummy = new ListNode(0, head); lead = trail = dummy. Move lead\n" +
            "        // n + 1 steps. Then move both one step at a time until lead is null.\n" +
            "        // trail is now just before the node to remove: set\n" +
            "        // trail.Next = trail.Next.Next. Return dummy.Next.\n" +
            "        return head;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def remove_nth_from_end(head, n):\n" +
            "    # TODO: dummy = ListNode(0, head); lead = trail = dummy. Move lead\n" +
            "    # n + 1 steps. Then move both one step at a time until lead is None.\n" +
            "    # trail is now just before the node to remove: set\n" +
            "    # trail.next = trail.next.next. Return dummy.next.\n" +
            "    return head\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.RemoveNthFromEnd",
        ["python"] = "remove_nth_from_end",
    };

    // ListNode plus array <-> list helpers, as in LinkedListReverse; the input is
    // "values, n", so a small harness builds the list and forwards n.
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
        "}\n" +
        "public static class RemoveNthHarness\n" +
        "{\n" +
        "    public static int[] Run(int[] values, int n)\n" +
        "    {\n" +
        "        return ListBuilder.ToArray(Solution.RemoveNthFromEnd(ListBuilder.FromArray(values), n));\n" +
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
        "    return result\n" +
        "\n" +
        "def run_remove_nth(values, n):\n" +
        "    return list_to_array(remove_nth_from_end(build_list(values), n))\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3, 4, 5]), Lit.Int(2)), "[1,2,3,5]"),
        new TestCase(Lit.Args(Lit.IntArray([1]), Lit.Int(1)), "[]"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2]), Lit.Int(1)), "[1]"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2]), Lit.Int(2)), "[2]"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3, 4, 5]), Lit.Int(5)), "[2,3,4,5]"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3, 4, 5]), Lit.Int(1)), "[1,2,3,4]"),
        new TestCase(Lit.Args(Lit.IntArray([10, 20, 30, 40, 50, 60]), Lit.Int(3)), "[10,20,30,50,60]"),
    ];

    public string CSharpCallTemplate => "RemoveNthHarness.Run({input})";
    public string PythonCallTemplate => "run_remove_nth({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        // Index 0 is the dummy; index nodes.Length means "null, past the end".
        object[] nodes = ["dummy", 1, 2, 3, 4, 5];
        const int n = 2;
        var steps = new List<VisualizationStep>();
        var trail = 0;
        var lead = 0;

        string Name(int i) => i >= nodes.Length ? "null" : i == 0 ? "the dummy" : $"node {nodes[i]}";

        VisualizationStep Step(string message)
        {
            var state = new Dictionary<string, object> { ["nodes"] = nodes, ["slow"] = trail };
            if (lead < nodes.Length) state["fast"] = lead;
            return new VisualizationStep(State: state, HighlightIndices: [], Message: message);
        }

        steps.Add(Step($"n = {n}: remove the 2nd node from the end of 1 -> 2 -> 3 -> 4 -> 5. A dummy node sits in front of head; lead (fast) and trail (slow) both start on it."));

        for (var i = 1; i <= n + 1; i++)
        {
            lead++;
            steps.Add(Step($"Head start {i} of n + 1 = {n + 1}: lead moves to {Name(lead)}."));
        }

        while (lead < nodes.Length)
        {
            lead++;
            trail++;
            var where = lead < nodes.Length ? Name(lead) : "null (off the end)";
            steps.Add(Step($"Both move one step: trail -> {Name(trail)}, lead -> {where}. The gap stays at {n + 1}."));
        }

        var target = nodes[trail + 1];
        var remaining = nodes.Where((_, i) => i != trail + 1).ToArray();
        steps.Add(Step($"lead is null, so trail ({Name(trail)}) is right before the node to remove ({target}). Set trail.Next = trail.Next.Next."));

        var result = remaining.Skip(1).Select(v => (int)v).ToArray();
        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["nodes"] = remaining, ["collected"] = result },
            HighlightIndices: [],
            Message: $"Node {target} is unlinked. Return dummy.Next: {string.Join(" -> ", result)} -> null."
        ));

        return steps;
    }
}
