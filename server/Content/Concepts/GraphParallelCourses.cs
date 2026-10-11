namespace DsaAcademy.Content.Concepts;

// Transfer exercise after Topological Sort: Kahn's algorithm again, but processed one layer at a
// time, because the question is how many rounds it takes rather than which order.
public class GraphParallelCourses : IConcept
{
    public string Id => "graph-parallel-courses";
    public string Track => "patterns";
    public string Title => "Transfer: Fewest Semesters to Finish Every Course";
    public string OneLiner => "Take as many courses per semester as you like, once their prerequisites are done. How many semesters? Kahn's algorithm, counted in layers.";
    public string KeyTakeaway =>
        "Run Kahn's algorithm one layer at a time: every task with in-degree 0 right now forms this " +
        "semester; taking them all lowers their dependents' in-degrees, and the ones that reach 0 form the " +
        "next semester. The number of layers is the answer, and if some task is never taken there is a " +
        "cycle, so return -1.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;
    public string? TransferOf => "topological-sort";

    public string Explanation =>
        "This follows Topological Sort: Order Tasks by Dependency with the question changed. There are n " +
        "courses numbered 0 to n - 1, and each pair [a, b] in prerequisites means a must be finished before " +
        "b, as in the parent lesson. In one semester you may take any number of courses, as long as all of " +
        "each one's prerequisites were finished in earlier semesters. Return the fewest semesters needed to " +
        "take every course, or -1 if it can't be done.\n\n" +
        "The parent lesson took ready tasks one at a time. Here every ready task should be taken at once, " +
        "because waiting never helps. So process Kahn's queue in layers: the courses with in-degree 0 at the " +
        "start are semester 1. Take all of them: for each, decrement the in-degree of every course it " +
        "unlocks. The courses that reach 0 during this round are exactly the ones whose last prerequisite " +
        "was just finished, and they form semester 2. Repeat until a round finds nothing new.\n\n" +
        "In code that is a BFS by levels: note the queue's size at the start of a round, pop exactly that " +
        "many, and count one semester per round. Keep a count of courses taken. If it ends below n, the " +
        "rest are stuck on a cycle, the same signal as in the parent lesson, and the answer is -1.\n\n" +
        "Why is this the fewest? A course can't be taken before the semester after its latest prerequisite, " +
        "and the layered schedule takes every course at exactly that earliest moment. The number of layers " +
        "is the number of courses on the longest prerequisite chain. Each course and each edge is handled " +
        "once: O(V + E) time and space.\n\n" +
        "The visualization runs n = 7 with prerequisites [5, 0], [0, 1], [6, 1], [1, 2], [3, 2], [2, 4]; the " +
        "array shows each course's remaining in-degree and the highlighted cells are the current semester.\n\n" +
        "Explain why the same idea works: before you move on, write two or three sentences comparing this " +
        "with the parent lesson. What does one layer of Kahn's algorithm mean here, why does taking every " +
        "ready course at once give the fewest semesters, and why does the same cycle check still work?";

    public List<string> RecognitionSignals =>
    [
        "Tasks with prerequisites that can run in parallel, and the question is how many rounds, stages or time steps are needed.",
        "\"Minimum number of semesters\", \"levels\" or \"build waves\" over a dependency graph.",
    ];

    public List<string> Gotchas =>
    [
        "Count rounds, not courses: pop exactly the courses that were ready when the round began.",
        "A course whose in-degree reaches 0 during a round belongs to the next round, not the current one.",
        "If fewer than n courses are ever taken there is a cycle; return -1 rather than the round count.",
    ];

    public List<string> ConfusableWith =>
    [
        "Topological Sort: Order Tasks by Dependency returns one valid order. This uses the same in-degree bookkeeping but groups the order into layers and counts them.",
        "Multi-Source BFS: Rotting Oranges counts minutes the same way, one BFS level per minute, on a grid instead of a dependency graph.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int MinimumSemesters(int n, int[][] prerequisites)\n" +
            "    {\n" +
            "        // TODO: build adj and in-degree from prerequisites (a before b: edge a -> b).\n" +
            "        // Queue every course with in-degree 0. While the queue is not empty:\n" +
            "        // semesters++, then pop exactly queue.Count courses; for each, count it\n" +
            "        // as taken and decrement its dependents, enqueueing any that reach 0.\n" +
            "        // Return semesters if every course was taken, otherwise -1.\n" +
            "        return -1;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def minimum_semesters(n, prerequisites):\n" +
            "    # TODO: build adj and in-degree from prerequisites (a before b: edge a -> b).\n" +
            "    # Start the current layer with every course of in-degree 0. While the\n" +
            "    # layer is not empty: semesters += 1, and for each course in it, count\n" +
            "    # it as taken and decrement its dependents; those that reach 0 form the\n" +
            "    # next layer. Return semesters if every course was taken, otherwise -1.\n" +
            "    return -1\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MinimumSemesters",
        ["python"] = "minimum_semesters",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.Int(3), "[[0, 2], [1, 2]]"), "2"),
        new TestCase(Lit.Args(Lit.Int(3), "[[0, 1], [1, 2], [2, 0]]"), "-1"),
        new TestCase(Lit.Args(Lit.Int(1), "[]"), "1"),
        new TestCase(Lit.Args(Lit.Int(4), "[]"), "1"),
        new TestCase(Lit.Args(Lit.Int(5), "[[0, 1], [1, 2], [2, 3], [3, 4]]"), "5"),
        new TestCase(Lit.Args(Lit.Int(4), "[[0, 1], [0, 2], [1, 3], [2, 3]]"), "3"),
        new TestCase(Lit.Args(Lit.Int(6), "[[0, 3], [1, 3], [3, 4], [2, 4], [4, 5], [0, 5]]"), "4"),
        new TestCase(Lit.Args(Lit.Int(2), "[[1, 1]]"), "-1"),
        new TestCase(Lit.Args(Lit.Int(7), "[[5, 0], [0, 1], [6, 1], [1, 2], [3, 2], [2, 4]]"), "5"),
        new TestCase(Lit.Args(Lit.Int(4), "[[0, 1], [2, 3], [3, 2]]"), "-1"),
    ];

    public string CSharpCallTemplate => "Solution.MinimumSemesters({input})";
    public string PythonCallTemplate => "minimum_semesters({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        const int n = 7;
        int[][] prereqs = [[5, 0], [0, 1], [6, 1], [1, 2], [3, 2], [2, 4]];
        var adj = Enumerable.Range(0, n).Select(_ => new List<int>()).ToArray();
        var indegree = new int[n];
        foreach (var p in prereqs)
        {
            adj[p[0]].Add(p[1]);
            indegree[p[1]]++;
        }

        var steps = new List<VisualizationStep>();
        var semesters = 0;
        var taken = 0;
        object[] Snapshot() => indegree.Select(v => (object)v).ToArray();
        Dictionary<string, object> State() => new()
        {
            ["array"] = Snapshot(),
            ["tracker"] = semesters,
            ["trackerLabel"] = "semesters",
        };

        var layer = Enumerable.Range(0, n).Where(i => indegree[i] == 0).ToList();
        steps.Add(new VisualizationStep(State(), [.. layer],
            $"in-degree[i] = prerequisites course i still needs. Courses {string.Join(", ", layer)} need none, so they are all ready for semester 1."));

        while (layer.Count > 0)
        {
            semesters++;
            taken += layer.Count;
            var next = new List<int>();
            foreach (var course in layer)
                foreach (var after in adj[course])
                    if (--indegree[after] == 0) next.Add(after);
            next.Sort();
            steps.Add(new VisualizationStep(State(), [.. layer],
                next.Count > 0
                    ? $"Semester {semesters}: take {string.Join(", ", layer)}. That finishes the last prerequisite of {string.Join(", ", next)}, so {(next.Count == 1 ? "it is" : "they are")} the next semester."
                    : $"Semester {semesters}: take {string.Join(", ", layer)}. Nothing new becomes ready."));
            layer = next;
        }

        steps.Add(new VisualizationStep(State(), [],
            taken == n
                ? $"All {n} courses taken in {semesters} semesters: the longest chain, 5 -> 0 -> 1 -> 2 -> 4, has {semesters} courses."
                : "Some courses were never ready: they sit on a cycle. Return -1."));
        return steps;
    }
}
