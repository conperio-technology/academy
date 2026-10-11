namespace DsaAcademy.Content.Concepts;

public class HeapPushPop : IConcept
{
    public string Id => "heap-push-pop";
    public string Track => "trees";
    public string Title => "Heap: Push and Pop";
    public string OneLiner => "A binary heap IS a binary tree -- same shape as a BST, but the invariant is different: every parent is smaller (or bigger) than its children, not ordered left/right.";
    public string KeyTakeaway =>
        "A heap only guarantees ONE thing: every parent is <= (min-heap) or >= (max-heap) its " +
        "children -- unlike a BST, there's no left/right ordering rule, so a value could legally be on " +
        "either side. That weaker invariant is exactly what makes push/pop O(log n) with a much " +
        "simpler operation than a BST's: always insert/remove at the END (the next open array slot, " +
        "keeping the tree perfectly complete), then \"bubble\" the disturbance up or down until the " +
        "heap property holds again.";
    public VisualizerKind VisualizerKind => VisualizerKind.Tree;

    public string Explanation =>
        "A binary heap is stored exactly like the trees in this app already are -- a level-order " +
        "array, parent at i, children at 2i+1/2i+2 -- which is no accident, it's the standard way to " +
        "implement one, since a heap is always a COMPLETE tree (every level full except possibly the " +
        "last, filled left to right), so array positions never have gaps to represent. PUSH: append " +
        "the new value at the next open slot (keeps the tree complete), then \"sift up\" -- while it's " +
        "smaller than its parent (min-heap), swap with the parent and repeat. POP: the minimum is " +
        "always the root (that's the whole point of the invariant), so save it, move the LAST element " +
        "into the root position (keeps the tree complete again), shrink by one slot, then \"sift " +
        "down\" -- while it's bigger than its smallest child, swap with that child and repeat. This " +
        "lesson encodes a sequence of operations as one array, same trick Queues used: a positive " +
        "value means push(value), and 0 means pop (remove and record the current minimum). Watch out " +
        "for sifting down against the WRONG child -- you must compare against the SMALLER of the two " +
        "children, not just the left one, or the heap property can end up violated on the side you " +
        "didn't check.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] ProcessHeapOps(int[] ops)\n" +
            "    {\n" +
            "        // TODO: maintain a MIN-heap as a List<int> (array-based: parent i,\n" +
            "        // children 2i+1/2i+2). Positive op -> push(op) then sift up.\n" +
            "        // 0 -> pop the minimum (swap root with the last element, remove the\n" +
            "        // last slot, sift the new root down), and record the popped value.\n" +
            "        // Return every popped value, in order.\n" +
            "        return new int[0];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def process_heap_ops(ops):\n" +
            "    # TODO: maintain a MIN-heap as a list (array-based: parent i,\n" +
            "    # children 2i+1/2i+2). Positive op -> push(op) then sift up.\n" +
            "    # 0 -> pop the minimum (swap root with the last element, remove the\n" +
            "    # last slot, sift the new root down), and record the popped value.\n" +
            "    # Return every popped value, in order.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.ProcessHeapOps",
        ["python"] = "process_heap_ops",
    };

    public List<string> RecognitionSignals =>
    [
        "You repeatedly need \"the current smallest/largest\" out of a changing collection -- not a one-time sort, a running priority.",
        "The problem mentions \"top K,\" \"kth largest/smallest,\" \"priority,\" or a scheduler-like \"always process the most urgent thing next.\"",
    ];

    public List<string> Gotchas =>
    [
        "Sifting down must compare against the SMALLER of the two children (min-heap), not just the left one -- comparing only one side can leave the heap property broken on the other.",
        "Both push and pop must keep the tree COMPLETE (no gaps) -- push always appends at the end, pop always pulls the LAST element up to fill the root's old spot, never leaving a hole in the middle.",
        "A heap only guarantees the ROOT is the min -- nothing about the relative order of any two sibling or cousin nodes. Don't assume a heap is \"mostly sorted\"; only the very top is guaranteed.",
    ];

    public List<string> ConfusableWith =>
    [
        "Binary Search Trees: Insert (this track) looks similar (a tree, comparisons while walking down) but enforces a completely different invariant (left < node <= right vs. parent <= children) and, unlike a heap, is NOT always kept complete/balanced by plain insertion.",
    ];

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([5, 3, 8, 0, 0]), "[3,5]"),
        new TestCase(Lit.IntArray([1, 0]), "[1]"),
        new TestCase(Lit.IntArray([9, 4, 6, 1, 0, 0, 0, 0]), "[1,4,6,9]"),
        new TestCase(Lit.IntArray([7, 2, 9, 4, 1, 0, 0, 0]), "[1,2,4]"),
        new TestCase(Lit.IntArray([3, 0, 3, 0]), "[3,3]"),
    ];

    public string CSharpCallTemplate => "Solution.ProcessHeapOps({input})";
    public string PythonCallTemplate => "process_heap_ops({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] ops = [5, 3, 8, 1, 0, 0];
        var heap = new List<int>();
        var steps = new List<VisualizationStep>();

        object Snapshot() => heap.Select(v => (int?)v).ToArray();

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["tree"] = Snapshot() },
            HighlightIndices: [],
            Message: $"Operations: [{string.Join(", ", ops)}]. Positive = push, 0 = pop the minimum. Empty min-heap to start."
        ));

        foreach (var op in ops)
        {
            if (op != 0)
            {
                heap.Add(op);
                var i = heap.Count - 1;
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["tree"] = Snapshot() },
                    HighlightIndices: [i],
                    Message: $"push({op}): append at the next open slot (index {i})."
                ));

                while (i > 0)
                {
                    var parent = (i - 1) / 2;
                    if (heap[i] >= heap[parent]) break;
                    (heap[i], heap[parent]) = (heap[parent], heap[i]);
                    steps.Add(new VisualizationStep(
                        State: new Dictionary<string, object> { ["tree"] = Snapshot() },
                        HighlightIndices: [parent],
                        Message: $"{heap[parent]} < parent -- sift up, swap with parent (now at index {parent})."
                    ));
                    i = parent;
                }
            }
            else
            {
                var popped = heap[0];
                heap[0] = heap[^1];
                heap.RemoveAt(heap.Count - 1);
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["tree"] = Snapshot() },
                    HighlightIndices: heap.Count > 0 ? [0] : [],
                    Message: $"pop(): the minimum is the root ({popped}). Move the last element to the root, shrink by one slot."
                ));

                var i = 0;
                while (true)
                {
                    var left = 2 * i + 1;
                    var right = 2 * i + 2;
                    var smallest = i;
                    if (left < heap.Count && heap[left] < heap[smallest]) smallest = left;
                    if (right < heap.Count && heap[right] < heap[smallest]) smallest = right;
                    if (smallest == i) break;

                    (heap[i], heap[smallest]) = (heap[smallest], heap[i]);
                    steps.Add(new VisualizationStep(
                        State: new Dictionary<string, object> { ["tree"] = Snapshot() },
                        HighlightIndices: [smallest],
                        Message: $"Sift down: swap with the smaller child (now at index {smallest})."
                    ));
                    i = smallest;
                }
            }
        }

        return steps;
    }
}
