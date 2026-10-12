namespace DsaAcademy.Content.Concepts;

// Transfer exercise after Top-K Elements: the K SMALLEST by a computed key (distance), with ties
// broken by the point itself. The capped heap flips to a max-heap.
public class HeapKClosestPoints : IConcept
{
    public string Id => "heap-k-closest-points";
    public string Track => "patterns";
    public string Title => "Transfer: K Closest Points to the Origin";
    public string OneLiner => "Keep the k points nearest (0, 0). Same capped heap as Top-K, but now you want the smallest keys, so the heap has to evict the largest.";
    public string KeyTakeaway =>
        "Top-K with a heap works for any key you can compute, not just the values themselves. To keep the K " +
        "SMALLEST keys, cap a MAX-heap at size K: its top is the worst point you are keeping, which is exactly " +
        "the one to evict when a closer point arrives. Compare squared distances to stay in integers.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;
    public string? TransferOf => "top-k-heap";

    public string Explanation =>
        "This follows Top-K Elements with the requirement changed in two ways: you want the k closest points " +
        "to the origin (the k smallest distances, not the k largest values), and the key is computed from " +
        "each item rather than being the item. Given points as [x, y] pairs and k, return the k points with " +
        "the smallest distance to (0, 0). To make the answer unique, a tie in distance goes to the smaller x, " +
        "then the smaller y, and the result is listed in that same order (nearest first).\n\n" +
        "Distance is sqrt(x^2 + y^2), but sqrt never changes which of two distances is smaller, so compare " +
        "x^2 + y^2 and stay in exact integers. The full key is the triple (x^2 + y^2, x, y): one point is " +
        "closer than another when its triple is smaller.\n\n" +
        "In Top-K Elements you kept a MIN-heap of size k, because to keep the largest you must be able to " +
        "throw away the smallest of your candidates. Here everything flips. To keep the k smallest keys you " +
        "need to find the LARGEST key among your candidates, so use a MAX-heap capped at k: push each point, " +
        "and whenever the heap holds more than k, pop its top (the farthest, with ties going to the larger x " +
        "and y). At the end the heap holds the k closest; sort them by key for the answer.\n\n" +
        "In C#, PriorityQueue is a min-heap, so give it a comparer that reverses the order of the key, or " +
        "negate the key. In Python, heapq is a min-heap too: push (-d, -x, -y) so the farthest point is on top. " +
        "Each of the n points costs O(log k), so O(n log k) time and O(k) space, against O(n log n) for " +
        "sorting all of them.\n\n" +
        "The visualization runs points [3, 3], [5, -1], [-2, 4], [1, 1] with k = 2. The cells are the heap's " +
        "contents as (squared distance) point.\n\n" +
        "Explain why the same idea works: before you move on, write two or three sentences on why Top-K " +
        "Elements needed a MIN-heap but this needs a MAX-heap, even though both keep \"the best k\". What " +
        "does the top of the heap have to be in each case, and why is that the only element you ever need " +
        "to look at?";

    public List<string> RecognitionSignals =>
    [
        "The k nearest, cheapest, smallest or most similar items by some computed score.",
        "A stream or large input where you only need to remember k items at a time.",
    ];

    public List<string> Gotchas =>
    [
        "To keep the k SMALLEST keys, evict the largest: a max-heap. A min-heap here throws away the closest points.",
        "Compare x * x + y * y, not the square root: integers compare exactly and the order is the same.",
        "Ties: the key must include x and y, or which of two equally distant points survives depends on heap order.",
    ];

    public List<string> ConfusableWith =>
    [
        "Top-K Elements: Use a Heap is the same capped heap for the k largest values, which needs the opposite (min) heap.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[][] KClosest(int[][] points, int k)\n" +
            "    {\n" +
            "        // TODO: key each point by (x*x + y*y, x, y). Keep a MAX-heap of at most k\n" +
            "        // points: a PriorityQueue<int[], (int, int, int)> built with a comparer that\n" +
            "        // reverses the key order. Push each point; when Count > k, Dequeue (drops\n" +
            "        // the farthest). Finally sort what is left by key, nearest first.\n" +
            "        return new int[0][];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def k_closest(points, k):\n" +
            "    # TODO: key each point by (x*x + y*y, x, y). Keep a MAX-heap of at most k\n" +
            "    # points with heapq by pushing the negated key (-d, -x, -y). Push each\n" +
            "    # point; when len(heap) > k, heappop (drops the farthest). Finally sort\n" +
            "    # what is left by key, nearest first, and return the [x, y] pairs.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.KClosest",
        ["python"] = "k_closest",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[[1, 3], [-2, 2]], 1", "[[-2,2]]"),
        new TestCase("[[3, 3], [5, -1], [-2, 4]], 2", "[[3,3],[-2,4]]"),
        new TestCase("[[0, 1], [1, 0]], 2", "[[0,1],[1,0]]"),
        new TestCase("[[1, 1], [2, 2], [3, 3]], 3", "[[1,1],[2,2],[3,3]]"),
        new TestCase("[[5, 5]], 1", "[[5,5]]"),
        new TestCase("[[-1, -1], [1, 1], [2, 0], [0, 0]], 2", "[[0,0],[-1,-1]]"),
        new TestCase("[[1, 0], [0, 1], [-1, 0], [0, -1], [2, 2]], 2", "[[-1,0],[0,-1]]"),
        new TestCase("[[6, 8], [-6, -8], [10, 0], [0, -10], [3, 4], [7, 7]], 4", "[[3,4],[7,7],[-6,-8],[0,-10]]"),
    ];

    public string CSharpCallTemplate => "Solution.KClosest({input})";
    public string PythonCallTemplate => "k_closest({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[][] points = [[3, 3], [5, -1], [-2, 4], [1, 1]];
        const int k = 2;
        var heap = new List<(int D, int X, int Y)>();
        var steps = new List<VisualizationStep>();

        Dictionary<string, object> State() => new()
        {
            ["array"] = heap.Count == 0
                ? new object[] { "(empty)" }
                : heap.OrderByDescending(p => p).Select(p => (object)$"({p.D}) [{p.X}, {p.Y}]").ToArray(),
            ["tracker"] = heap.Count,
            ["trackerLabel"] = "points kept",
        };

        steps.Add(new VisualizationStep(State(), [],
            "k = 2. A max-heap keyed by squared distance: the farthest point kept sits on top (the first cell), ready to be evicted."));

        foreach (var p in points)
        {
            var key = (p[0] * p[0] + p[1] * p[1], p[0], p[1]);
            heap.Add(key);
            var message = $"Push [{p[0]}, {p[1]}] with squared distance {key.Item1}.";
            if (heap.Count > k)
            {
                var top = heap.Max();
                heap.Remove(top);
                message += top == key
                    ? $" Now 3 points: the farthest is the new one ({top.D}), so it is popped straight away."
                    : $" Now 3 points: pop the top, [{top.X}, {top.Y}] at {top.D}, the farthest of the three.";
            }
            steps.Add(new VisualizationStep(State(), [0], message));
        }

        steps.Add(new VisualizationStep(State(), [],
            "Done: the heap holds the 2 closest, [1, 1] (2) and [3, 3] (18). Sorted nearest first: [[1, 1], [3, 3]]."));
        return steps;
    }
}
