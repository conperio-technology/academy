namespace DsaAcademy.Content.Concepts;

public class LinkedListCycleStart : IConcept
{
    public string Id => "linked-list-cycle-start";
    public string Track => "patterns";
    public string Title => "Fast & Slow Pointers: Find Where a Cycle Starts";
    public string OneLiner => "Floyd's algorithm in two phases: let fast and slow meet inside the loop, then walk one pointer from the head and one from the meeting point until they meet at the cycle's entrance.";
    public string KeyTakeaway =>
        "If the distance from head to the cycle start is a, then after fast and slow meet, walking a more " +
        "steps from the meeting point also lands exactly on the cycle start. So reset one pointer to head, " +
        "move both one step at a time, and the node where they meet is the answer, with O(1) extra space.";
    public VisualizerKind VisualizerKind => VisualizerKind.LinkedList;

    public string Explanation =>
        "Given the head of a singly linked list, return the node where a cycle begins, or null if the list " +
        "ends normally. A cycle means the tail's Next points back to some earlier node instead of null. The " +
        "easy answer is a hash set of visited nodes: the first node you see twice is the cycle start. That is " +
        "O(n) time and O(n) space. Floyd's tortoise and hare does it in O(1) space.\n\n" +
        "Phase 1 is the cycle detection from the middle-of-a-list lesson: slow moves one node per step, fast " +
        "moves two. If fast reaches null, there is no cycle, so return null. Otherwise fast gains one node on " +
        "slow every step once both are inside the loop, so it can't jump over slow and they must land on the " +
        "same node.\n\n" +
        "Phase 2 finds the entrance. Say the cycle starts a steps from head, the meeting point is b steps past " +
        "the cycle start, and the cycle has length c. When they meet, slow has walked a + b steps and fast " +
        "has walked 2(a + b). The extra a + b steps fast took were whole laps of the cycle, so a + b is a " +
        "multiple of c. That means a is the same as \"c - b, plus some whole laps\", and c - b is exactly the " +
        "distance from the meeting point forward to the cycle start. So put one pointer back at head, leave " +
        "the other at the meeting point, and move both ONE step at a time. After a steps the first pointer " +
        "reaches the cycle start from outside, and the second reaches it by going around the loop. The node " +
        "where they first meet is the answer.\n\n" +
        "Return the node itself, not its value: values can repeat, and the tests check which node you " +
        "returned. Each test is built from an array of values and pos, the index the tail links back to " +
        "(-1 for no cycle). Your function never sees pos.\n\n" +
        "The visualizer draws the list straight, so remember the last node's arrow really goes back to the " +
        "cycle start named in the first step.";

    public List<string> RecognitionSignals =>
    [
        "A linked list (or any \"next\" function, like repeatedly applying f(x)) might loop, and you need the point where the loop begins.",
        "O(1) extra space is required, ruling out a visited set.",
        "A sequence of values in a fixed range must repeat somewhere (find the duplicate in an array of n + 1 numbers from 1 to n) and you can treat value -> index as a next pointer.",
    ];

    public List<string> Gotchas =>
    [
        "In phase 2 both pointers move ONE step. Keeping fast at two steps breaks the a = c - b argument.",
        "Check fast != null && fast.Next != null before each double step, or a list without a cycle crashes on the last node.",
        "Compare nodes by reference, not by value; duplicate values can make two different nodes look equal.",
        "A single node whose Next is itself is a cycle starting at index 0. Phase 1 must move the pointers before comparing them, or they \"meet\" at head before moving.",
    ];

    public List<string> ConfusableWith =>
    [
        "Fast & Slow Pointers: Find the Middle of a Linked List (this track) uses the same two speeds but stops when fast reaches the end. Here a meeting means a cycle, and a second phase is needed to find where it starts.",
        "Hash Map style \"seen before\" detection finds the same node in one pass but costs O(n) space. Reach for it when space doesn't matter or when there's no single next pointer to follow.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static ListNode? DetectCycleStart(ListNode? head)\n" +
            "    {\n" +
            "        // TODO: phase 1: slow moves 1, fast moves 2 while fast and fast.Next\n" +
            "        // aren't null. If fast runs out, there's no cycle: return null. If\n" +
            "        // slow == fast, they met inside the loop.\n" +
            "        // Phase 2: move one pointer back to head; step both by 1 until they\n" +
            "        // are the same node. Return that node.\n" +
            "        return null;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def detect_cycle_start(head):\n" +
            "    # TODO: phase 1: slow moves 1, fast moves 2 while fast and fast.next\n" +
            "    # aren't None. If fast runs out, there's no cycle: return None. If\n" +
            "    # slow is fast, they met inside the loop.\n" +
            "    # Phase 2: move one pointer back to head; step both by 1 until they\n" +
            "    # are the same node. Return that node.\n" +
            "    return None\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.DetectCycleStart",
        ["python"] = "detect_cycle_start",
    };

    // The input is "values, pos": the harness builds the list, links the tail back to the
    // node at index pos (no link for -1), calls the learner's function, and reports the
    // INDEX of the node it returned (-1 for null), so duplicate values can't fake a pass.
    public string? CSharpHarnessPreamble =>
        "public class ListNode\n" +
        "{\n" +
        "    public int Val;\n" +
        "    public ListNode? Next;\n" +
        "    public ListNode(int val, ListNode? next = null) { Val = val; Next = next; }\n" +
        "}\n" +
        "public static class CycleHarness\n" +
        "{\n" +
        "    public static int Run(int[] values, int pos)\n" +
        "    {\n" +
        "        var nodes = values.Select(v => new ListNode(v)).ToArray();\n" +
        "        for (var i = 0; i + 1 < nodes.Length; i++) nodes[i].Next = nodes[i + 1];\n" +
        "        if (pos >= 0) nodes[^1].Next = nodes[pos];\n" +
        "        var result = Solution.DetectCycleStart(nodes.Length > 0 ? nodes[0] : null);\n" +
        "        if (result == null) return -1;\n" +
        "        var index = Array.IndexOf(nodes, result);\n" +
        "        if (index < 0) throw new InvalidOperationException(\"The returned node isn't one of the list's nodes.\");\n" +
        "        return index;\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "class ListNode:\n" +
        "    def __init__(self, val, next=None):\n" +
        "        self.val = val\n" +
        "        self.next = next\n" +
        "\n" +
        "def run_cycle_start(values, pos):\n" +
        "    nodes = [ListNode(v) for v in values]\n" +
        "    for i in range(len(nodes) - 1):\n" +
        "        nodes[i].next = nodes[i + 1]\n" +
        "    if pos >= 0:\n" +
        "        nodes[-1].next = nodes[pos]\n" +
        "    result = detect_cycle_start(nodes[0] if nodes else None)\n" +
        "    if result is None:\n" +
        "        return -1\n" +
        "    for i, node in enumerate(nodes):\n" +
        "        if node is result:\n" +
        "            return i\n" +
        "    raise ValueError(\"The returned node isn't one of the list's nodes.\")\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([3, 2, 0, -4]), Lit.Int(1)), "1"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2]), Lit.Int(0)), "0"),
        new TestCase(Lit.Args(Lit.IntArray([1]), Lit.Int(-1)), "-1"),
        new TestCase(Lit.Args(Lit.IntArray([1]), Lit.Int(0)), "0"),
        new TestCase(Lit.Args(Lit.IntArray([]), Lit.Int(-1)), "-1"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3, 4, 5, 6]), Lit.Int(-1)), "-1"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), Lit.Int(7)), "7"),
        new TestCase(Lit.Args(Lit.IntArray([5, 5, 5, 5, 5]), Lit.Int(2)), "2"),
    ];

    public string CSharpCallTemplate => "CycleHarness.Run({input})";
    public string PythonCallTemplate => "run_cycle_start({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] values = [1, 2, 3, 4, 5, 6];
        const int pos = 2;
        int Next(int i) => i + 1 < values.Length ? i + 1 : pos;
        var steps = new List<VisualizationStep>();
        var slow = 0;
        var fast = 0;

        VisualizationStep Step(string message) => new(
            State: new Dictionary<string, object> { ["nodes"] = values, ["slow"] = slow, ["fast"] = fast },
            HighlightIndices: [],
            Message: message);

        steps.Add(Step($"The last node ({values[^1]}) links back to index {pos} (value {values[pos]}), not to null. Phase 1: slow and fast both start at head."));

        do
        {
            slow = Next(slow);
            fast = Next(Next(fast));
            var met = slow == fast ? " They're on the same node: there is a cycle." : "";
            steps.Add(Step($"slow moves 1 to index {slow}, fast moves 2 to index {fast}.{met}"));
        } while (slow != fast);

        var meeting = slow;
        slow = 0;
        steps.Add(Step($"Phase 2: put slow back at head and leave fast at the meeting point (index {meeting}). Now both move ONE step at a time."));

        while (slow != fast)
        {
            slow = Next(slow);
            fast = Next(fast);
            var met = slow == fast ? " Same node again." : "";
            steps.Add(Step($"slow -> index {slow}, fast -> index {fast}.{met}"));
        }

        steps.Add(Step($"They meet at index {slow} (value {values[slow]}): that's where the cycle starts. The head was {slow} steps from it, and so was the meeting point, going around the loop."));
        return steps;
    }
}
