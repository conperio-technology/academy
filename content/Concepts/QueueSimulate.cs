namespace DsaAcademy.Content.Concepts;

public class QueueSimulate : IConcept
{
    public string Id => "queue-simulate";
    public string Track => "fundamentals";

    // See ArrayTraversalSum.cs -- keeps this track ahead of Trees/Graphs/Sorting/DP/
    // Patterns so Hashing (Order = 60) can slot in right after it.
    public int Order => 50;

    public string Title => "Queues: Simulate Enqueue/Dequeue";
    public string OneLiner => "First in, first out -- the mirror image of a stack's LIFO. Add to the back, remove from the front.";
    public string KeyTakeaway =>
        "A queue is FIFO (first in, first out) -- the opposite discipline from a stack's LIFO (last " +
        "in, first out). Real systems rely on this exact ordering guarantee constantly: task " +
        "schedulers, message queues, and (later in this app) BFS's frontier all depend on \"whoever " +
        "got in line first gets served first,\" no matter what gets added after them.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "A queue supports two moves: enqueue (add to the BACK) and dequeue (remove from the FRONT). " +
        "That's the entire difference from a stack (see Stacks: Valid Parentheses), which adds and " +
        "removes from the SAME end -- a queue's two ends are different, which is what gives it " +
        "first-in-first-out order instead of last-in-first-out. This lesson encodes a sequence of " +
        "operations as one array to keep it a single, plain function: each positive number means " +
        "\"enqueue this value,\" and a 0 means \"dequeue -- remove and record whatever's at the front.\" " +
        "Return the values that got dequeued, in the order they came out. Watch out for the classic " +
        "mix-up: dequeuing from the wrong end (the back, like a stack would) instead of the front is " +
        "the single most common bug when a queue gets implemented with an array or list that makes " +
        "\"remove from the end\" the easy/fast operation to reach for out of habit.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] ProcessQueueOps(int[] ops)\n" +
            "    {\n" +
            "        // TODO: walk ops. A positive value means enqueue(value) (add to the back).\n" +
            "        // A 0 means dequeue: remove the value at the FRONT and record it.\n" +
            "        // Return every dequeued value, in order.\n" +
            "        return new int[0];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def process_queue_ops(ops):\n" +
            "    # TODO: walk ops. A positive value means enqueue(value) (add to the back).\n" +
            "    # A 0 means dequeue: remove the value at the FRONT and record it.\n" +
            "    # Return every dequeued value, in order.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.ProcessQueueOps",
        ["python"] = "process_queue_ops",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([1, 2, 3, 0, 0]), "[1,2]"),
        new TestCase(Lit.IntArray([5, 0, 6, 7, 0, 0]), "[5,6,7]"),
        new TestCase(Lit.IntArray([1, 0]), "[1]"),
        new TestCase(Lit.IntArray([1, 2, 0, 3, 0, 0]), "[1,2,3]"),
    ];

    public string CSharpCallTemplate => "Solution.ProcessQueueOps({input})";
    public string PythonCallTemplate => "process_queue_ops({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] ops = [1, 2, 3, 0, 0];
        var steps = new List<VisualizationStep>();
        var queue = new List<int>();
        var dequeued = new List<int>();

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = queue.ToArray() },
            HighlightIndices: [],
            Message: $"Operations: [{string.Join(", ", ops)}]. Positive = enqueue (add to the back, right side). 0 = dequeue (remove from the front, left side). Empty queue to start."
        ));

        foreach (var op in ops)
        {
            if (op != 0)
            {
                queue.Add(op);
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = queue.ToArray() },
                    HighlightIndices: [queue.Count - 1],
                    Message: $"enqueue({op}) -- added to the back. Queue: [{string.Join(", ", queue)}] (front is the left end)."
                ));
            }
            else
            {
                var front = queue[0];
                queue.RemoveAt(0);
                dequeued.Add(front);
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = queue.ToArray(), ["tracker"] = front, ["trackerLabel"] = "just dequeued" },
                    HighlightIndices: [],
                    Message: $"dequeue() -- remove from the front: {front}. Queue: [{string.Join(", ", queue)}]. Dequeued so far: [{string.Join(", ", dequeued)}]."
                ));
            }
        }

        return steps;
    }
}
