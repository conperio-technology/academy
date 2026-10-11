namespace DsaAcademy.Content.Concepts;

public class LinkedListReverse : IConcept
{
    public string Id => "linked-list-reverse";
    public string Track => "patterns";
    public string Title => "Linked List Pointers: Reverse a Singly Linked List";
    public string OneLiner => "Walk the list once with three pointers (prev, curr, next) and flip each node's Next to point backward.";
    public string KeyTakeaway =>
        "Before you overwrite curr.Next, save it: next = curr.Next; curr.Next = prev; prev = curr; " +
        "curr = next. When curr runs off the end, prev is the new head. Every linked list rewiring " +
        "problem is this same discipline: never cut a link you still need to walk.";
    public VisualizerKind VisualizerKind => VisualizerKind.LinkedList;

    public string Explanation =>
        "Given the head of a singly linked list, reverse it and return the new head: 1 -> 2 -> 3 -> null " +
        "becomes 3 -> 2 -> 1 -> null. You could copy the values into an array and rebuild, but that costs " +
        "O(n) extra space and skips the actual skill, which is rewiring pointers in place.\n\n" +
        "Keep two pointers: prev (the head of the part you have already reversed, starting as null) and " +
        "curr (the next node to process, starting at head). At each node, do four things in this order. " +
        "Save next = curr.Next, because the next line destroys it. Set curr.Next = prev, which flips this " +
        "node to point backward. Move prev = curr, since curr is now the head of the reversed part. Move " +
        "curr = next to continue down the part that hasn't been touched yet. When curr becomes null, every " +
        "node has been flipped and prev points at the old tail, which is the new head.\n\n" +
        "At every moment the list is split into two separate chains: the reversed chain starting at prev, " +
        "and the untouched chain starting at curr. Each step moves one node from the front of the second " +
        "chain to the front of the first. Thinking of it that way makes the order of the four lines obvious, " +
        "and it is the same mental model you need for harder variants: reversing only positions m to n, " +
        "reversing in groups of k, or checking whether a list is a palindrome by reversing its second half.\n\n" +
        "A recursive version also works (reverse the rest, then set head.Next.Next = head and head.Next = " +
        "null), but it uses O(n) call stack, so the iterative one is the version to know cold.\n\n" +
        "The visualization shows the original list with curr highlighted; \"collected so far\" is the " +
        "reversed chain hanging off prev.";

    public List<string> RecognitionSignals =>
    [
        "The problem asks you to reverse a linked list, or a piece of one (a range, every k nodes, the second half).",
        "You must rearrange nodes in place with O(1) extra space, so copying values into an array isn't allowed.",
        "A list needs to be read backward (palindrome check, adding numbers stored most significant digit first) and there are no Prev pointers.",
    ];

    public List<string> Gotchas =>
    [
        "Save curr.Next before overwriting it; if you set curr.Next = prev first, the rest of the list is unreachable.",
        "Return prev, not head or curr. After the loop curr is null and head is the new TAIL, whose Next is now null.",
        "Start prev at null, not at head. Starting at head makes the old head point to itself and the result loops forever.",
    ];

    public List<string> ConfusableWith =>
    [
        "Linked Lists: Reverse a Doubly Linked List (Fundamentals) swaps two pointers per node and needs no separate prev variable, because each node already knows its predecessor. Here only Next exists, so you carry prev yourself.",
        "Array Reversal: Two Pointers, One Pass (Fundamentals) swaps values from both ends inward. A singly linked list can't walk backward from the tail, so you reverse the links front to back instead of swapping values.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static ListNode? ReverseList(ListNode? head)\n" +
            "    {\n" +
            "        // TODO: prev = null, curr = head. While curr != null: save\n" +
            "        // next = curr.Next, point curr.Next at prev, then move prev = curr\n" +
            "        // and curr = next. Return prev (the old tail is the new head).\n" +
            "        return head;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def reverse_list(head):\n" +
            "    # TODO: prev = None, curr = head. While curr is not None: save\n" +
            "    # nxt = curr.next, point curr.next at prev, then move prev = curr\n" +
            "    # and curr = nxt. Return prev (the old tail is the new head).\n" +
            "    return head\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.ReverseList",
        ["python"] = "reverse_list",
    };

    // ListNode plus array <-> list helpers, as in LinkedListTraversal. ToArray gives up
    // after 10,000 nodes so a result that accidentally loops (e.g. prev started at head)
    // fails with a clear message instead of a timeout.
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
        "    return result\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([1, 2, 3, 4, 5]), "[5,4,3,2,1]"),
        new TestCase(Lit.IntArray([]), "[]"),
        new TestCase(Lit.IntArray([7]), "[7]"),
        new TestCase(Lit.IntArray([1, 2]), "[2,1]"),
        new TestCase(Lit.IntArray([3, 3, 1]), "[1,3,3]"),
        new TestCase(Lit.IntArray([-1, 0, 9, 4, 2, 8]), "[8,2,4,9,0,-1]"),
    ];

    public string CSharpCallTemplate => "ListBuilder.ToArray(Solution.ReverseList(ListBuilder.FromArray({input})))";
    public string PythonCallTemplate => "list_to_array(reverse_list(build_list({input})))";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] values = [10, 20, 30, 40, 50];
        var steps = new List<VisualizationStep>();
        var reversed = new List<int>(); // the chain hanging off prev, head first

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["nodes"] = values, ["collected"] = reversed.ToArray() },
            HighlightIndices: [0],
            Message: "prev = null, curr = head (10). The reversed chain (collected so far) starts empty."
        ));

        for (var i = 0; i < values.Length; i++)
        {
            var next = i + 1 < values.Length ? values[i + 1].ToString() : "null";
            var prev = reversed.Count > 0 ? reversed[0].ToString() : "null";
            reversed.Insert(0, values[i]);
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["nodes"] = values, ["collected"] = reversed.ToArray() },
                HighlightIndices: [i],
                Message: $"curr = {values[i]}: save next = {next}, set {values[i]}.Next = {prev}, then prev = {values[i]} and curr = {next}. Reversed chain: {string.Join(" -> ", reversed)} -> null."
            ));
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["nodes"] = values, ["collected"] = reversed.ToArray() },
            HighlightIndices: [],
            Message: $"curr is null, so every link has been flipped. Return prev ({reversed[0]}), the new head: {string.Join(" -> ", reversed)} -> null."
        ));

        return steps;
    }
}
