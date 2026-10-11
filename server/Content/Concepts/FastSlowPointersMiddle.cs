namespace DsaAcademy.Content.Concepts;

public class FastSlowPointersMiddle : IConcept
{
    public string Id => "fast-slow-pointers-middle";
    public string Track => "patterns";
    public string Title => "Fast & Slow Pointers: Find the Middle of a Linked List";
    public string OneLiner => "Two pointers moving at different speeds down the SAME list -- when the fast one reaches the end, the slow one is sitting exactly at the middle.";
    public string KeyTakeaway =>
        "Fast & slow (Floyd's) pointers solve \"where's the middle\" and \"is there a cycle\" without " +
        "ever counting the list's length first -- fast moves two steps for every one the slow pointer " +
        "takes, so by the time fast has covered the whole list, slow has covered exactly half of it.";
    public VisualizerKind VisualizerKind => VisualizerKind.LinkedList;

    public string Explanation =>
        "The obvious way to find a linked list's middle node is two passes: walk the whole list once " +
        "to count its length n, then walk again to node n/2. Fast & slow pointers do it in ONE pass: " +
        "start both pointers at the head, then loop advancing slow by one node and fast by two nodes " +
        "each iteration, stopping the moment fast reaches the end (or has no next node left to jump " +
        "to). Because fast always covers exactly twice the distance slow does, the moment fast has " +
        "traveled the full list, slow has traveled exactly half of it -- sitting right at the middle, " +
        "no length-counting required.\n\n" +
        "This exact same \"two speeds, one pass\" idea also detects a CYCLE in a linked list (Floyd's " +
        "cycle detection): if the list loops back on itself instead of ending, the fast pointer " +
        "eventually LAPS the slow pointer and they land on the same node again -- if that ever " +
        "happens, there's a cycle; if fast reaches a real null ending first, there isn't one. Both " +
        "problems are the identical mechanism pointed at two different questions.\n\n" +
        "Watch the two pointers below advance at their different speeds -- slow (blue) takes one step " +
        "at a time; fast (amber) takes two, and the walkthrough stops the instant fast can't safely " +
        "take another full 2-step hop.";

    public List<string> RecognitionSignals =>
    [
        "The problem is about a linked list's MIDDLE, or about detecting a CYCLE/loop, and you'd otherwise need to know the list's length up front.",
        "You need an answer in one pass without a separate length-counting pass first.",
    ];

    public List<string> Gotchas =>
    [
        "The stopping condition has to check BOTH \"fast isn't null\" AND \"fast's next isn't null\" before advancing fast by two -- checking only one crashes on some odd-vs-even-length lists.",
        "For an even-length list this lands on the SECOND of the two middle nodes by convention -- double check which middle a problem actually wants if it matters.",
    ];

    public List<string> ConfusableWith =>
    [
        "Two Pointers: Two Sum on a Sorted Array (this track) also uses two pointers, but moving toward each other from opposite ends of an ARRAY, not one chasing the other down a LINKED LIST at different speeds -- same name, genuinely different mechanism.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int FindMiddle(ListNode? head)\n" +
            "    {\n" +
            "        // TODO: slow = head, fast = head. While fast != null and fast.Next != null:\n" +
            "        // slow = slow.Next; fast = fast.Next.Next. Return slow.Val.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def find_middle(head):\n" +
            "    # TODO: slow = head, fast = head. While fast is not None and fast.next is not None:\n" +
            "    # slow = slow.next; fast = fast.next.next. Return slow.val.\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.FindMiddle",
        ["python"] = "find_middle",
    };

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

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([1, 2, 3, 4, 5]), "3"),
        new TestCase(Lit.IntArray([1, 2, 3, 4, 5, 6]), "4"),
        new TestCase(Lit.IntArray([1]), "1"),
        new TestCase(Lit.IntArray([1, 2]), "2"),
        new TestCase(Lit.IntArray([10, 20, 30, 40, 50, 60, 70]), "40"),
    ];

    public string CSharpCallTemplate => "Solution.FindMiddle(ListBuilder.FromArray({input}))";
    public string PythonCallTemplate => "find_middle(build_list({input}))";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] values = [10, 20, 30, 40, 50, 60, 70];
        var steps = new List<VisualizationStep>();
        var slow = 0;
        var fast = 0;

        Dictionary<string, object> Snapshot() => new()
        {
            ["nodes"] = values,
            ["slow"] = slow,
            ["fast"] = fast,
        };

        steps.Add(new VisualizationStep(
            State: Snapshot(),
            HighlightIndices: [],
            Message: "slow = head, fast = head. Each step: slow moves 1 node, fast moves 2."
        ));

        while (fast < values.Length - 1 && fast + 1 < values.Length)
        {
            slow += 1;
            fast += 2;
            var fastLabel = fast < values.Length ? $"node {fast} (val {values[fast]})" : "past the end";
            steps.Add(new VisualizationStep(
                State: Snapshot(),
                HighlightIndices: [],
                Message: $"slow -> node {slow} (val {values[slow]}). fast -> {fastLabel}."
            ));
        }

        steps.Add(new VisualizationStep(
            State: Snapshot(),
            HighlightIndices: [],
            Message: $"fast can't take a full 2-step hop anymore -- stop. Middle = node {slow} (val {values[slow]})."
        ));

        return steps;
    }
}
