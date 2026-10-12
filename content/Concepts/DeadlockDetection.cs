namespace DsaAcademy.Content.Concepts;

// A graph problem dressed as a concurrency one: no threads run here. The wait-for graph is
// plain data, which keeps it inside the C# sandbox (see wasm-csharp/CodePolicy.cs).
public class DeadlockDetection : IConcept
{
    public string Id => "deadlock-detection";
    public string Section => "Concurrency & Memory";
    public string Track => "concurrency";
    public int Order => 45;
    public string Title => "Detect a Deadlock in a Wait-For Graph";
    public string OneLiner => "Given which threads are waiting on which, find every thread that can never finish: the ones in a cycle, and the ones stuck waiting behind it.";
    public string KeyTakeaway =>
        "A deadlock is a cycle in the wait-for graph. To find every stuck thread, run Kahn's algorithm " +
        "backwards: a thread waiting on nobody can finish, finishing it releases everyone waiting on it, and " +
        "whatever never reaches zero outstanding waits is deadlocked, either in a cycle or blocked behind one.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "This is how a database finds deadlocks. Threads are numbered 0 to n - 1, and each pair [a, b] in " +
        "waitsFor means thread a is blocked waiting for a lock that thread b holds. A thread can run again " +
        "only once every thread it waits for has finished and released its locks. Return, in ascending " +
        "order, every thread that can never finish. If there is no deadlock, return an empty array.\n\n" +
        "Two kinds of thread are stuck. Threads on a cycle (0 waits for 1, 1 waits for 0) are deadlocked " +
        "directly. A thread that waits for a deadlocked thread is stuck too, even though it is not on the " +
        "cycle itself: the thread it needs will never release anything. A thread can also wait on itself, " +
        "which is what happens when code tries to re-enter a lock that is not reentrant.\n\n" +
        "Simulate the release order, the way Kahn's topological sort (an algorithm that orders tasks so each comes after everything it depends on, covered later in Data Structures & Algorithms) does. Count how many threads each " +
        "thread is still waiting for. Every thread with a count of 0 can finish; when one finishes, every " +
        "thread that was waiting on it has one fewer thing to wait for, and any whose count drops to 0 can " +
        "finish next. When nothing more can finish, the threads that never got there are exactly the stuck " +
        "ones. Duplicate pairs never appear in the tests.\n\n" +
        "Watch the array of outstanding waits below: threads reach 0 one by one and finish, until only the " +
        "cycle and the thread behind it are left.";

    public List<string> RecognitionSignals =>
    [
        "Tasks, threads or transactions wait on each other, and the question is which of them can ever complete. That is cycle detection on a directed graph.",
        "\"Can all of these finish?\" is the same question as \"is this graph acyclic?\", which Kahn's algorithm or a three-colour DFS answers in O(V + E).",
    ];

    public List<string> Gotchas =>
    [
        "Edge direction matters: [a, b] means a waits for b, so finishing b is what unblocks a. Build the reverse list (who is waiting on b) to know whose count to decrement.",
        "Threads waiting behind a cycle are stuck too. Returning only the nodes on the cycle misses them.",
        "A self-edge [a, a] is a cycle of length one.",
    ];

    public List<string> ConfusableWith =>
    [
        "Topological Sort (Patterns track) is the same algorithm. There you return the order; here you return what is left over when the order gets stuck.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] FindDeadlocked(int n, int[][] waitsFor)\n" +
            "    {\n" +
            "        // TODO: [a, b] means thread a waits for thread b.\n" +
            "        // Count how many threads each thread is waiting for, and\n" +
            "        // record who is waiting on whom. Every thread waiting on\n" +
            "        // nobody can finish; finishing one decrements the count of\n" +
            "        // each thread waiting on it. Return, in ascending order,\n" +
            "        // the threads that never get to finish.\n" +
            "        return new int[0];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def find_deadlocked(n, waits_for):\n" +
            "    # TODO: [a, b] means thread a waits for thread b.\n" +
            "    # Count how many threads each thread is waiting for, and\n" +
            "    # record who is waiting on whom. Every thread waiting on\n" +
            "    # nobody can finish; finishing one decrements the count of\n" +
            "    # each thread waiting on it. Return, in ascending order,\n" +
            "    # the threads that never get to finish.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.FindDeadlocked",
        ["python"] = "find_deadlocked",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.Int(2), "[[0, 1], [1, 0]]"), "[0,1]"),
        new TestCase(Lit.Args(Lit.Int(3), "[[0, 1], [1, 2]]"), "[]"),
        new TestCase(Lit.Args(Lit.Int(3), "[]"), "[]"),
        new TestCase(Lit.Args(Lit.Int(5), "[[0, 1], [1, 2], [2, 0], [3, 4]]"), "[0,1,2]"),
        new TestCase(Lit.Args(Lit.Int(4), "[[3, 0], [0, 1], [1, 2], [2, 1]]"), "[0,1,2,3]"),
        new TestCase(Lit.Args(Lit.Int(2), "[[0, 0]]"), "[0]"),
        new TestCase(Lit.Args(Lit.Int(6), "[[0, 1], [0, 2], [1, 3], [2, 3], [4, 5], [5, 4]]"), "[4,5]"),
        new TestCase(Lit.Args(Lit.Int(5), "[[0, 1], [0, 4], [1, 2], [2, 3], [3, 1]]"), "[0,1,2,3]"),
    ];

    public string CSharpCallTemplate => "Solution.FindDeadlocked({input})";
    public string PythonCallTemplate => "find_deadlocked({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        // Threads 1 and 2 wait on each other; 0 waits on 1; 3 waits on 4; 4 waits on nobody.
        const int n = 5;
        int[][] waitsFor = [[0, 1], [1, 2], [2, 1], [3, 4]];
        var waitingOn = new int[n];
        var waiters = new List<int>[n];
        for (var i = 0; i < n; i++) waiters[i] = [];
        foreach (var e in waitsFor)
        {
            waitingOn[e[0]]++;
            waiters[e[1]].Add(e[0]);
        }

        var steps = new List<VisualizationStep>();
        var finished = new bool[n];
        object[] Snapshot() => waitingOn.Select(v => (object)v).ToArray();

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = Snapshot() },
            HighlightIndices: [],
            Message: "Edges: 0 waits for 1, 1 waits for 2, 2 waits for 1, 3 waits for 4. Each cell is how many threads that thread is still waiting for."
        ));

        var ready = new Queue<int>();
        for (var i = 0; i < n; i++) if (waitingOn[i] == 0) ready.Enqueue(i);

        while (ready.Count > 0)
        {
            var t = ready.Dequeue();
            finished[t] = true;
            var freed = new List<int>();
            foreach (var w in waiters[t])
                if (--waitingOn[w] == 0) { ready.Enqueue(w); freed.Add(w); }

            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = Snapshot() },
                HighlightIndices: [t],
                Message: freed.Count > 0
                    ? $"Thread {t} waits for nobody, so it finishes and releases its locks. Now thread {string.Join(", ", freed)} can run too."
                    : $"Thread {t} waits for nobody, so it finishes and releases its locks."
            ));
        }

        var stuck = Enumerable.Range(0, n).Where(i => !finished[i]).ToArray();
        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = Snapshot() },
            HighlightIndices: stuck,
            Message: $"Nothing else can finish. Threads 1 and 2 wait on each other (a cycle) and thread 0 waits behind them. Answer: [{string.Join(", ", stuck)}]."
        ));

        return steps;
    }
}
