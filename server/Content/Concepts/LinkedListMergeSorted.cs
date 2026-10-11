namespace DsaAcademy.Content.Concepts;

public class LinkedListMergeSorted : IConcept
{
    public string Id => "linked-list-merge-sorted";
    public string Track => "patterns";
    public string Title => "Linked List Pointers: Merge Two Sorted Lists";
    public string OneLiner => "Splice the existing nodes into one sorted list: a dummy head, a tail pointer, and at each step attach whichever list's front node is smaller.";
    public string KeyTakeaway =>
        "Merging linked lists needs no new nodes and no extra array: you only change Next pointers. Start " +
        "from a dummy node, keep a tail pointer to the last node attached, and when one list runs out, " +
        "attach the whole rest of the other in a single assignment.";
    public VisualizerKind VisualizerKind => VisualizerKind.LinkedList;

    public string Explanation =>
        "Given the heads of two singly linked lists, each sorted in ascending order, return one sorted list " +
        "made of all their nodes. 1 -> 2 -> 4 and 1 -> 3 -> 4 merge into 1 -> 1 -> 2 -> 3 -> 4 -> 4. The " +
        "comparison logic is the same as merging two sorted arrays; what changes is that you don't write into " +
        "an output buffer. You relink the nodes that already exist, so the extra space is O(1).\n\n" +
        "Create a dummy node and a tail pointer that starts on it. While both lists still have nodes, look " +
        "at the two front nodes, a and b. Attach the smaller one with tail.Next = smaller, advance that " +
        "list's pointer past it, and move tail = tail.Next. On a tie take from the first list, which keeps the " +
        "merge stable (equal values keep their original order). When one list is empty, the other is already sorted and every value in it is at " +
        "least as big as everything attached so far, so tail.Next = the rest of it finishes the job in one " +
        "step. Return dummy.Next.\n\n" +
        "The dummy node removes the awkward first step: without it you'd have to decide which list provides " +
        "the head before the loop, and handle either list being empty separately. With it, the first " +
        "attachment works exactly like every other one.\n\n" +
        "This splice is a building block. Merge sort on a linked list splits the list at the middle (fast " +
        "and slow pointers) and merges the halves with this function, sorting in a guaranteed, stable O(n log n) " +
        "with no extra array, which is why it is the usual choice for lists. Merging k lists can pair them up and merge repeatedly, or use a heap.\n\n" +
        "The visualization shows the merged chain growing from the dummy; the message shows what's left of " +
        "each input list.";

    public List<string> RecognitionSignals =>
    [
        "Two (or a few) inputs are each already sorted linked lists and the output is one sorted list.",
        "The result should reuse the input nodes, or O(1) extra space is required.",
        "A linked list merge sort, or any step that combines two sorted runs of nodes.",
    ];

    public List<string> Gotchas =>
    [
        "Forgetting to advance tail after attaching a node means every attachment overwrites the previous one.",
        "After the loop, attach the leftover list with one assignment. Looping over it node by node works but misses the point, and forgetting it entirely drops the largest values.",
        "Return dummy.Next, not dummy: the dummy's own value is not part of the answer.",
    ];

    public List<string> ConfusableWith =>
    [
        "Sorting: Merge Two Sorted Arrays (Fundamentals) uses the same compare-the-fronts loop but copies values into a new array. With linked lists you relink existing nodes instead, and the leftover tail is attached in O(1) rather than copied.",
        "K-way Merge: Merge K Sorted Arrays (this track) merges many sorted inputs with a min-heap of the k current fronts. With only two inputs, one comparison per step does the job and a heap adds nothing.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static ListNode? MergeTwoLists(ListNode? a, ListNode? b)\n" +
            "    {\n" +
            "        // TODO: dummy = new ListNode(0); tail = dummy. While a and b are both\n" +
            "        // non-null: attach the smaller front node (tail.Next = it), advance\n" +
            "        // that list, then tail = tail.Next. Attach whichever list is left\n" +
            "        // with one assignment. Return dummy.Next.\n" +
            "        return a;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def merge_two_lists(a, b):\n" +
            "    # TODO: dummy = ListNode(0); tail = dummy. While a and b are both\n" +
            "    # not None: attach the smaller front node (tail.next = it), advance\n" +
            "    # that list, then tail = tail.next. Attach whichever list is left\n" +
            "    # with one assignment. Return dummy.next.\n" +
            "    return a\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MergeTwoLists",
        ["python"] = "merge_two_lists",
    };

    // ListNode plus array <-> list helpers, as in LinkedListReverse; the input is two
    // arrays, so a small harness builds both lists before calling the learner's function.
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
        "public static class MergeHarness\n" +
        "{\n" +
        "    public static int[] Run(int[] a, int[] b)\n" +
        "    {\n" +
        "        return ListBuilder.ToArray(Solution.MergeTwoLists(ListBuilder.FromArray(a), ListBuilder.FromArray(b)));\n" +
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
        "def run_merge(a, b):\n" +
        "    return list_to_array(merge_two_lists(build_list(a), build_list(b)))\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 4]), Lit.IntArray([1, 3, 4])), "[1,1,2,3,4,4]"),
        new TestCase(Lit.Args(Lit.IntArray([]), Lit.IntArray([])), "[]"),
        new TestCase(Lit.Args(Lit.IntArray([]), Lit.IntArray([0])), "[0]"),
        new TestCase(Lit.Args(Lit.IntArray([5]), Lit.IntArray([])), "[5]"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3]), Lit.IntArray([4, 5, 6])), "[1,2,3,4,5,6]"),
        new TestCase(Lit.Args(Lit.IntArray([4, 5, 6]), Lit.IntArray([1, 2, 3])), "[1,2,3,4,5,6]"),
        new TestCase(Lit.Args(Lit.IntArray([-3, 0, 0, 7]), Lit.IntArray([-5, 0, 10])), "[-5,-3,0,0,0,7,10]"),
    ];

    public string CSharpCallTemplate => "MergeHarness.Run({input})";
    public string PythonCallTemplate => "run_merge({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] a = [1, 4, 6, 9];
        int[] b = [2, 3, 7];
        var merged = new List<object> { "dummy" };
        var steps = new List<VisualizationStep>();
        int i = 0, j = 0;

        string Rest(int[] list, int from) => from < list.Length ? string.Join(" -> ", list.Skip(from)) : "empty";

        VisualizationStep Step(string message) => new(
            State: new Dictionary<string, object> { ["nodes"] = merged.ToArray() },
            HighlightIndices: [merged.Count - 1],
            Message: message);

        steps.Add(Step($"a: {Rest(a, 0)}. b: {Rest(b, 0)}. tail starts on the dummy node."));

        while (i < a.Length && j < b.Length)
        {
            string message;
            if (a[i] <= b[j])
            {
                merged.Add(a[i]);
                message = $"{a[i]} <= {b[j]}: tail.Next = a's {a[i]}, advance a, tail moves to it.";
                i++;
            }
            else
            {
                merged.Add(b[j]);
                message = $"{b[j]} < {a[i]}: tail.Next = b's {b[j]}, advance b, tail moves to it.";
                j++;
            }
            steps.Add(Step($"{message} Left in a: {Rest(a, i)}. Left in b: {Rest(b, j)}."));
        }

        var leftover = i < a.Length ? a.Skip(i).ToArray() : b.Skip(j).ToArray();
        var which = i < a.Length ? "a" : "b";
        foreach (var v in leftover) merged.Add(v);
        steps.Add(Step($"The other list is empty, so tail.Next = the rest of {which} ({string.Join(" -> ", leftover)}) in one assignment."));

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["nodes"] = merged.ToArray(), ["collected"] = merged.Skip(1).ToArray() },
            HighlightIndices: [],
            Message: $"Return dummy.Next: {string.Join(" -> ", merged.Skip(1))} -> null. No new nodes were created."
        ));
        return steps;
    }
}
