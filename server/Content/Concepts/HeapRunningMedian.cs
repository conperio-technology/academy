namespace DsaAcademy.Content.Concepts;

public class HeapRunningMedian : IConcept
{
    public string Id => "heap-running-median";
    public string Track => "patterns";
    public string Title => "Two Heaps: Median of a Data Stream";
    public string OneLiner => "Keep the smaller half of the numbers in a max-heap and the larger half in a min-heap; the median is always sitting on top of one or both.";
    public string KeyTakeaway =>
        "Split the values seen so far into a LOW half (a max-heap, so its largest is on top) and a HIGH " +
        "half (a min-heap, so its smallest is on top), with every low value <= every high value and the " +
        "low half the same size or one bigger. Then the median is low's top (odd count) or the average of " +
        "both tops (even count), and each insert costs O(log n).";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Numbers arrive one at a time. After each one, report the median of everything seen so far. For " +
        "the stream [1, 2, 3] the answer is [1, 1.5, 2]: the median of [1] is 1, of [1, 2] it's the average " +
        "1.5, and of [1, 2, 3] it's 2. Re-sorting after every arrival costs O(n log n) per value. Keeping a " +
        "sorted list and inserting into it costs O(n) per value because of the shifting. Both are too slow " +
        "for a long stream.\n\n" +
        "The median only depends on the one or two values in the MIDDLE of the sorted order. So split the " +
        "values into two halves: the smaller half and the larger half. If you can see the largest value of " +
        "the smaller half and the smallest value of the larger half, you can see the middle. That is exactly " +
        "what a max-heap and a min-heap give you: their tops, in O(1).\n\n" +
        "Maintain two rules. Order: every value in low is <= every value in high. Size: low has the same " +
        "number of values as high, or exactly one more. A simple insert that keeps both rules: push the new " +
        "value into low, then move low's largest into high (this fixes the order rule, whatever the new " +
        "value was), then if high has become bigger than low, move high's smallest back to low (this fixes " +
        "the size rule). After that, if low is bigger, the median is low's top; if they're equal, it's the " +
        "average of the two tops. Each insert does at most five heap pushes and pops, O(log n), and reading the " +
        "median is O(1).\n\n" +
        "Neither standard library has a max-heap. In Python, heapq is a min-heap, so store NEGATED values in " +
        "low and negate again when you read them. In C#, PriorityQueue<TElement, TPriority> is a min-heap on " +
        "the priority: either enqueue each value with its negated priority, or pass a reversed comparer such " +
        "as Comparer<int>.Create((a, b) => b.CompareTo(a)). Compute the average as a double (in C#, cast " +
        "before adding, which also avoids overflow on large ints). The same two-heap split answers \"sliding " +
        "window median\" (with lazy deletion) and scheduling problems that pick the best of two groups.\n\n" +
        "The visualization feeds in [5, 15, 1, 3, 8, 7]; the highlighted cells are the values seen so far, " +
        "and the message shows both heaps after each insert.";

    public List<string> RecognitionSignals =>
    [
        "A running median, or any \"middle\" statistic, recomputed after every insertion into a growing collection.",
        "You need quick access to the largest of the small values AND the smallest of the large values at the same time.",
        "Re-sorting after each new value would work but is far too slow for the stream length.",
    ];

    public List<string> Gotchas =>
    [
        "Pushing the new value straight into whichever half \"looks right\" without rebalancing breaks one of the rules; always route it through low into high (or compare against a top) and then fix the sizes.",
        "Both Python's heapq and C#'s PriorityQueue are min-heaps. The low half needs a max-heap: negate the values (Python) or use a reversed comparer or negated priority (C#).",
        "The even-count median is an average: compute it in floating point. Integer division turns 1.5 into 1, and in C# adding two large ints before casting can overflow.",
    ];

    public List<string> ConfusableWith =>
    [
        "Top-K with a Heap (this track) keeps ONE heap capped at size k. Here there are two heaps that together hold every value, and the work is in keeping their sizes balanced so the middle is always on top.",
        "Sorting (or binary-search insertion into a sorted list) gives the median too, but costs O(n) or worse per arrival because of the shifting; the heaps only ever touch O(log n) positions.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static double[] RunningMedian(int[] stream)\n" +
            "    {\n" +
            "        // TODO: low = max-heap of the smaller half (PriorityQueue<int, int>\n" +
            "        // with Comparer<int>.Create((a, b) => b.CompareTo(a))), high = min-heap\n" +
            "        // of the larger half. For each x: push x into low, move low's top into\n" +
            "        // high, and if high.Count > low.Count move high's top back into low.\n" +
            "        // Median: low.Peek() if low is bigger, else the average of both tops.\n" +
            "        return new double[0];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "import heapq\n\n\n" +
            "def running_median(stream):\n" +
            "    # TODO: low = max-heap of the smaller half (store -x in a heapq list),\n" +
            "    # high = min-heap of the larger half. For each x: push x into low, move\n" +
            "    # low's top into high, and if len(high) > len(low) move high's top back\n" +
            "    # into low. Median: -low[0] if low is bigger, else the average of both tops.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.RunningMedian",
        ["python"] = "running_median",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([1, 2, 3]), "[1,1.5,2]"),
        new TestCase(Lit.IntArray([5, 15, 1, 3]), "[5,10,5,4]"),
        new TestCase(Lit.IntArray([6, 10, 2, 6, 5, 0, 6, 3, 1, 0, 0]), "[6,8,6,6,6,5.5,6,5.5,5,4,3]"),
        new TestCase(Lit.IntArray([-1, -2, -3, -4, -5]), "[-1,-1.5,-2,-2.5,-3]"),
        new TestCase(Lit.IntArray([2, 2, 2, 2]), "[2,2,2,2]"),
        new TestCase(Lit.IntArray([10, 1]), "[10,5.5]"),
        new TestCase(Lit.IntArray([5]), "[5]"),
        new TestCase(Lit.IntArray([]), "[]"),
    ];

    public string CSharpCallTemplate => "Solution.RunningMedian({input})";
    public string PythonCallTemplate => "running_median({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] stream = [5, 15, 1, 3, 8, 7];
        var arr = stream.Select(v => (object)v).ToArray();
        var low = new List<int>();  // kept sorted here only for display; the real thing is a max-heap
        var high = new List<int>(); // likewise, a min-heap
        var medians = new List<double>();
        var steps = new List<VisualizationStep>();

        string Show(List<int> xs) => "[" + string.Join(", ", xs.OrderBy(v => v)) + "]";

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = arr },
            HighlightIndices: [],
            Message: "low is a max-heap holding the smaller half, high is a min-heap holding the larger half. low may have one extra value; the median lives on the tops."
        ));

        for (var i = 0; i < stream.Length; i++)
        {
            var x = stream[i];
            low.Add(x);
            var lowTop = low.Max();
            low.Remove(lowTop);
            high.Add(lowTop);
            var moves = $"Push {x} into low, then move low's largest ({lowTop}) into high";
            if (high.Count > low.Count)
            {
                var highTop = high.Min();
                high.Remove(highTop);
                low.Add(highTop);
                moves += $"; high is now bigger, so move its smallest ({highTop}) back to low";
            }

            double median;
            string how;
            if (low.Count > high.Count)
            {
                median = low.Max();
                how = $"odd count, so the median is low's top, {median}";
            }
            else
            {
                median = (low.Max() + (double)high.Min()) / 2;
                how = $"even count, so the median is ({low.Max()} + {high.Min()}) / 2 = {median}";
            }
            medians.Add(median);

            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object>
                {
                    ["array"] = arr,
                    ["tracker"] = median,
                    ["trackerLabel"] = "median so far",
                },
                HighlightIndices: Enumerable.Range(0, i + 1).ToArray(),
                Message: $"{moves}. low = {Show(low)}, high = {Show(high)}: {how}."
            ));
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = arr },
            HighlightIndices: [],
            Message: $"Done: [{string.Join(", ", medians)}]. Every insert touched each heap only O(log n) times."
        ));
        return steps;
    }
}
