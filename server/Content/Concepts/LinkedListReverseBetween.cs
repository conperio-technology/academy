namespace DsaAcademy.Content.Concepts;

// Transfer exercise after Reverse a Singly Linked List: the same prev/curr/next flip, applied to
// a middle stretch only, so the two ends of that stretch have to be reconnected afterwards.
public class LinkedListReverseBetween : IConcept
{
    public string Id => "linked-list-reverse-between";
    public string Track => "patterns";
    public string Title => "Transfer: Reverse Part of a Linked List";
    public string OneLiner => "Reverse only the nodes from position left to position right. The same pointer flip as before, plus two reconnections, and a dummy node so left = 1 is not a special case.";
    public string KeyTakeaway =>
        "Walk a dummy node's pointer to the node just before position left (call it before). Reverse the " +
        "next right - left + 1 nodes with the usual prev/curr/next loop. Then reconnect: the old first node " +
        "of the stretch, now its tail, points at curr, and before points at prev, the new first node.";
    public VisualizerKind VisualizerKind => VisualizerKind.LinkedList;
    public string? TransferOf => "linked-list-reverse";

    public string Explanation =>
        "This follows Reverse a Singly Linked List with the requirement changed: reverse only the nodes from " +
        "position left to position right, counting from 1, and leave the rest in place. With " +
        "1 -> 2 -> 3 -> 4 -> 5, left = 2 and right = 4 the result is 1 -> 4 -> 3 -> 2 -> 5. You may assume " +
        "1 <= left <= right <= the list's length.\n\n" +
        "The inner loop is exactly the one you know: save next = curr.Next, point curr.Next at prev, move " +
        "prev and curr forward. Run it right - left + 1 times, starting at the node in position left. When it " +
        "stops, prev is the first node of the reversed stretch (it was at position right), and curr is the " +
        "first node after the stretch (or null).\n\n" +
        "What is new is the two ends. Before reversing, remember before, the node just ahead of position " +
        "left, and tail, the node at position left, which will end up last in the stretch. Afterwards, " +
        "tail.Next = curr links the stretch to the rest of the list, and before.Next = prev links the front " +
        "of the list to the stretch.\n\n" +
        "When left = 1 there is no node before the stretch and the head itself changes. Instead of a " +
        "special case, put a dummy node in front of head and start before at the dummy; walk it left - 1 " +
        "steps. At the end return dummy.Next, which is the right head in every case. One pass, O(n) time, " +
        "O(1) extra space.\n\n" +
        "The visualization reverses positions 2 to 4 of 10 -> 20 -> 30 -> 40 -> 50; the collected list is " +
        "the reversed stretch as it grows.\n\n" +
        "Explain why the same idea works: before you move on, write two or three sentences comparing this " +
        "with reversing the whole list. Which part of the loop is unchanged, which two links does the full " +
        "reversal never have to repair, and what does the dummy node save you?";

    public List<string> RecognitionSignals =>
    [
        "Reverse, rotate or reorder only part of a linked list (a range of positions, every k nodes, the second half).",
        "The head of the list may change, which is the usual sign that a dummy node will simplify the code.",
    ];

    public List<string> Gotchas =>
    [
        "Save the node before the stretch and the stretch's first node before reversing; after the loop you need both to reconnect.",
        "Positions are 1-based: walk the dummy's pointer left - 1 steps to reach the node before position left.",
        "Return dummy.Next, not head: when left = 1 the old head is no longer first.",
    ];

    public List<string> ConfusableWith =>
    [
        "Linked List Pointers: Reverse a Singly Linked List runs the same loop to the end and returns prev. Here the loop stops early and both ends of the stretch must be stitched back.",
        "Two Pointers: Remove the Nth Node From the End also uses a dummy node so the head can be removed without a special case.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    // ListNode (provided): public int Val; public ListNode? Next;\n" +
            "    public static ListNode? ReverseBetween(ListNode? head, int left, int right)\n" +
            "    {\n" +
            "        // TODO: dummy = new ListNode(0, head); before = dummy, moved left - 1 steps.\n" +
            "        // tail = before.Next (it ends up last in the stretch). prev = null,\n" +
            "        // curr = tail; flip right - left + 1 nodes with the usual loop. Then\n" +
            "        // tail.Next = curr and before.Next = prev. Return dummy.Next.\n" +
            "        return head;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "# ListNode (provided): node.val, node.next\n" +
            "def reverse_between(head, left, right):\n" +
            "    # TODO: dummy = ListNode(0, head); before = dummy, moved left - 1 steps.\n" +
            "    # tail = before.next (it ends up last in the stretch). prev = None,\n" +
            "    # curr = tail; flip right - left + 1 nodes with the usual loop. Then\n" +
            "    # tail.next = curr and before.next = prev. Return dummy.next.\n" +
            "    return head\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.ReverseBetween",
        ["python"] = "reverse_between",
    };

    // ListNode plus array <-> list helpers, as in Reverse a Singly Linked List, and a wrapper
    // that passes left and right along.
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
        "public static class ReverseBetweenHarness\n" +
        "{\n" +
        "    public static int[] Run(int[] values, int left, int right)\n" +
        "    {\n" +
        "        return ListBuilder.ToArray(Solution.ReverseBetween(ListBuilder.FromArray(values), left, right));\n" +
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
        "def run_reverse_between(values, left, right):\n" +
        "    return list_to_array(reverse_between(build_list(values), left, right))\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3, 4, 5]), Lit.Int(2), Lit.Int(4)), "[1,4,3,2,5]"),
        new TestCase(Lit.Args(Lit.IntArray([5]), Lit.Int(1), Lit.Int(1)), "[5]"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3]), Lit.Int(1), Lit.Int(3)), "[3,2,1]"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3, 4]), Lit.Int(1), Lit.Int(2)), "[2,1,3,4]"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3, 4]), Lit.Int(3), Lit.Int(4)), "[1,2,4,3]"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3, 4, 5]), Lit.Int(3), Lit.Int(3)), "[1,2,3,4,5]"),
        new TestCase(Lit.Args(Lit.IntArray([3, 5]), Lit.Int(1), Lit.Int(2)), "[5,3]"),
        new TestCase(Lit.Args(Lit.IntArray([9, 8, 7, 6, 5, 4, 3]), Lit.Int(2), Lit.Int(6)), "[9,4,5,6,7,8,3]"),
    ];

    public string CSharpCallTemplate => "ReverseBetweenHarness.Run({input})";
    public string PythonCallTemplate => "run_reverse_between({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] values = [10, 20, 30, 40, 50];
        const int left = 2, right = 4;
        var steps = new List<VisualizationStep>();
        var stretch = new List<int>(); // the reversed part hanging off prev, first node first

        steps.Add(new VisualizationStep(
            new Dictionary<string, object> { ["nodes"] = values, ["collected"] = stretch.ToArray() },
            [left - 2],
            $"Reverse positions {left} to {right}. dummy -> 10 -> ..., walk before {left - 1} step from the dummy: before = {values[left - 2]}, and tail = {values[left - 1]}, the node that will end up last in the stretch."
        ));

        for (var i = left - 1; i < right; i++)
        {
            var next = i + 1 < values.Length ? values[i + 1].ToString() : "null";
            var prev = stretch.Count > 0 ? stretch[0].ToString() : "null";
            stretch.Insert(0, values[i]);
            steps.Add(new VisualizationStep(
                new Dictionary<string, object> { ["nodes"] = values, ["collected"] = stretch.ToArray() },
                [i],
                $"curr = {values[i]}: save next = {next}, set {values[i]}.Next = {prev}, then prev = {values[i]} and curr = {next}. Reversed stretch: {string.Join(" -> ", stretch)}."
            ));
        }

        var curr = right < values.Length ? values[right].ToString() : "null";
        var result = values.Take(left - 1).Concat(stretch).Concat(values.Skip(right)).ToArray();
        steps.Add(new VisualizationStep(
            new Dictionary<string, object> { ["nodes"] = result, ["collected"] = stretch.ToArray() },
            [],
            $"Flipped {right - left + 1} nodes. Reconnect: tail {values[left - 1]}.Next = curr ({curr}), and before {values[left - 2]}.Next = prev ({stretch[0]}). The list is now {string.Join(" -> ", result)} -> null; return dummy.Next."
        ));
        return steps;
    }
}
