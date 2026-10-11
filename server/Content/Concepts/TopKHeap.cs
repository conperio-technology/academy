namespace DsaAcademy.Content.Concepts;

public class TopKHeap : IConcept
{
    public string Id => "top-k-heap";
    public string Track => "patterns";
    public string Title => "Top-K Elements: Use a Heap Instead of Fully Sorting";
    public string OneLiner => "Need only the K largest (or smallest) values out of n? A heap of size K finds them in O(n log k) -- without ever fully sorting the other n-k elements you don't care about.";
    public string KeyTakeaway =>
        "Sorting the whole array to grab the top K wastes work sorting the n-k elements you're going " +
        "to throw away -- a MIN-heap capped at size K (push every element, pop the smallest whenever " +
        "the heap exceeds K) keeps exactly the K largest seen so far at any point, in O(n log k) " +
        "instead of a full O(n log n) sort.";
    public VisualizerKind VisualizerKind => VisualizerKind.Tree;

    public string Explanation =>
        "The full-sort approach to \"find the K largest elements\" works but does more work than " +
        "necessary: sorting costs O(n log n), sorting ALL n elements including the n-k you're going to " +
        "discard. A heap-based approach only ever tracks K elements at a time. Push every value from " +
        "nums into a MIN-heap (see Heap: Push and Pop): if the heap's size ever exceeds K, immediately " +
        "pop its minimum. Since a min-heap's minimum is always at the top, whatever's SMALLEST among " +
        "the current top-K candidates gets evicted first the moment a bigger element shows up -- " +
        "exactly the behavior needed to keep only the K largest seen so far.\n\n" +
        "Using a MIN-heap (not a max-heap) to find the K LARGEST elements is the part that trips people " +
        "up at first -- it's backwards from the intuitive choice. The min-heap's whole job is answering " +
        "\"what's the smallest of my current top-K candidates, so I know what to evict when something " +
        "bigger arrives\" -- that's a min-heap question, even though the overall goal is finding the " +
        "largest values. (Finding the K SMALLEST elements flips it: use a MAX-heap capped at size K " +
        "instead, for the symmetric reason.)\n\n" +
        "After processing every element, whatever remains in the heap -- all K of them -- are exactly " +
        "the K largest values from the whole input, in whatever order the heap happens to hold them " +
        "(not necessarily sorted, since a heap only guarantees the ROOT is the min/max, not full " +
        "order) -- this lesson sorts them before returning so there's one unambiguous answer.";

    public List<string> RecognitionSignals =>
    [
        "The problem asks for the top K, bottom K, K-th largest/smallest, or \"K closest\" out of a larger collection.",
        "You're tempted to sort the whole array just to read off the first or last K elements.",
    ];

    public List<string> Gotchas =>
    [
        "Finding the K LARGEST needs a MIN-heap (to know what's smallest among your current candidates, and therefore what to evict) -- reaching for a max-heap here is the classic backwards mistake.",
        "Popping BEFORE checking whether the heap exceeds K (instead of after) can evict a value that should have stayed, shrinking the candidate set below K.",
    ];

    public List<string> ConfusableWith =>
    [
        "Heap: Push and Pop (Trees track) is the raw mechanism this pattern is built on, without the \"cap at size K, evict the extreme\" rule layered on top.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] TopKLargest(int[] nums, int k)\n" +
            "    {\n" +
            "        // TODO: push every value into a min-heap. Whenever the heap's size\n" +
            "        // exceeds k, pop the minimum. After processing everything, the heap\n" +
            "        // holds exactly the k largest values -- pop them all and sort ascending.\n" +
            "        return new int[0];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def top_k_largest(nums, k):\n" +
            "    # TODO: push every value into a min-heap. Whenever the heap's size\n" +
            "    # exceeds k, pop the minimum. After processing everything, the heap\n" +
            "    # holds exactly the k largest values -- pop them all and sort ascending.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.TopKLargest",
        ["python"] = "top_k_largest",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([3, 1, 4, 1, 5, 9, 2, 6]), Lit.Int(3)), "[5,6,9]"),
        new TestCase(Lit.Args(Lit.IntArray([7, 2, 9, 4, 1]), Lit.Int(2)), "[7,9]"),
        new TestCase(Lit.Args(Lit.IntArray([5]), Lit.Int(1)), "[5]"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3, 4, 5]), Lit.Int(5)), "[1,2,3,4,5]"),
        new TestCase(Lit.Args(Lit.IntArray([10, 10, 10]), Lit.Int(2)), "[10,10]"),
    ];

    public string CSharpCallTemplate => "Solution.TopKLargest({input})";
    public string PythonCallTemplate => "top_k_largest({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [3, 1, 4, 1, 5, 9, 2];
        const int k = 3;
        var heap = new List<int>();
        var steps = new List<VisualizationStep>();

        object Snapshot() => heap.Select(v => (int?)v).ToArray();

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["tree"] = Snapshot() },
            HighlightIndices: [],
            Message: $"nums = [{string.Join(", ", nums)}], k = {k}. Push every value into a min-heap, evicting the minimum whenever size exceeds {k}."
        ));

        foreach (var value in nums)
        {
            heap.Add(value);
            var i = heap.Count - 1;
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["tree"] = Snapshot() },
                HighlightIndices: [i],
                Message: $"push({value}): append at the next open slot (index {i})."
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

            if (heap.Count > k)
            {
                var popped = heap[0];
                heap[0] = heap[^1];
                heap.RemoveAt(heap.Count - 1);
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["tree"] = Snapshot() },
                    HighlightIndices: heap.Count > 0 ? [0] : [],
                    Message: $"Heap size exceeded {k} -- pop the minimum ({popped}), it's not in the top {k} seen so far."
                ));

                var j = 0;
                while (true)
                {
                    var left = 2 * j + 1;
                    var right = 2 * j + 2;
                    var smallest = j;
                    if (left < heap.Count && heap[left] < heap[smallest]) smallest = left;
                    if (right < heap.Count && heap[right] < heap[smallest]) smallest = right;
                    if (smallest == j) break;

                    (heap[j], heap[smallest]) = (heap[smallest], heap[j]);
                    steps.Add(new VisualizationStep(
                        State: new Dictionary<string, object> { ["tree"] = Snapshot() },
                        HighlightIndices: [smallest],
                        Message: $"Sift down: swap with the smaller child (now at index {smallest})."
                    ));
                    j = smallest;
                }
            }
        }

        var result = heap.OrderBy(v => v).ToList();
        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["tree"] = Snapshot() },
            HighlightIndices: [],
            Message: $"Done -- the top {k} largest values (sorted): [{string.Join(", ", result)}]."
        ));

        return steps;
    }
}
