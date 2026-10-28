namespace DsaAcademy.Content.Concepts;

public class SortingHeapSort : IConcept
{
    public string Id => "sorting-heap-sort";
    public string Track => "sorting";
    public string Title => "Heap Sort";
    public string OneLiner => "Turn the array into a max-heap in place, then repeatedly swap the largest element to the end and fix the heap. O(n log n) worst case with O(1) extra space.";
    public string KeyTakeaway =>
        "Heap sort reuses the array as a binary heap (children of i at 2i + 1 and 2i + 2). Building the heap " +
        "bottom up is O(n); then n times you swap the root (the max) behind the heap and sift the new root " +
        "down in O(log n). O(n log n) always, in place, not stable.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Return nums sorted in ascending order using heap sort. You met binary heaps in Heap Push and Pop: a " +
        "complete binary tree stored in an array, where the children of index i sit at 2i + 1 and 2i + 2. In " +
        "a max-heap every parent is at least as large as its children, so the largest value is always at " +
        "index 0.\n\n" +
        "Phase 1, build the heap. Leaves are already valid one-node heaps, so start at the last parent, n / 2 " +
        "- 1, and walk down to 0, sifting each one down: while it is smaller than its larger child, swap it " +
        "with that child. After this pass the whole array is a max-heap. It looks like n log n work but it is " +
        "O(n), because most nodes are near the bottom and sift only a step or two.\n\n" +
        "Phase 2, sort. The max is at index 0, so swap it with the last element of the heap: it is now in its " +
        "final place. Shrink the heap by one and sift the new root down to restore the heap. Repeat until the " +
        "heap has one element. Each round costs O(log n), so this phase is O(n log n).\n\n" +
        "Heap sort's appeal is that it is O(n log n) in the worst case like merge sort, yet needs only O(1) " +
        "extra space like quicksort. In practice it is slower than quicksort because the jumps between i and " +
        "2i + 1 are unfriendly to the CPU cache, and it is not stable. Its main real use is as the fallback " +
        "inside introsort, the algorithm behind C#'s Array.Sort.\n\n" +
        "The visualization sorts [5, 2, 4, 6, 1, 3]. It shows the heap after it is built, then each round, " +
        "with the sorted tail highlighted.";

    public List<string> RecognitionSignals => [
        "You need a worst-case O(n log n) sort with O(1) extra space.",
        "The problem already has a heap and asks for everything in order: popping all n items from a heap is heap sort.",
    ];

    public List<string> Gotchas => [
        "Sifting down must compare against the LARGER child; swapping with the first larger child you find can break the heap on the other side.",
        "In phase 2, sift only within the shrinking heap (indices below end), or the sorted tail gets pulled back in.",
        "Start building at n / 2 - 1, not n - 1: leaves have no children to sift past.",
    ];

    public List<string> ConfusableWith => [
        "Top K with a Heap keeps a heap of size k and stops early; heap sort heapifies everything and drains it, O(n log n).",
        "Selection sort also moves the max (or min) to its place each round but finds it with an O(n) scan; the heap finds it in O(1) and repairs itself in O(log n).",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] HeapSort(int[] nums)\n" +
            "    {\n" +
            "        var a = nums.ToArray();\n" +
            "        // TODO: build a max-heap: for i from a.Length / 2 - 1 down to 0, SiftDown(a, i, a.Length).\n" +
            "        // Then for end from a.Length - 1 down to 1: swap a[0] and a[end], SiftDown(a, 0, end).\n" +
            "        return a;\n" +
            "    }\n" +
            "\n" +
            "    private static void SiftDown(int[] a, int i, int size)\n" +
            "    {\n" +
            "        // TODO: while i has a child below size, find the larger child (2i + 1 or 2i + 2);\n" +
            "        // if it is larger than a[i], swap them and continue from the child, else stop.\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def heap_sort(nums):\n" +
            "    a = list(nums)\n" +
            "\n" +
            "    def sift_down(i, size):\n" +
            "        # TODO: while i has a child below size, find the larger child (2i + 1 or 2i + 2);\n" +
            "        # if it is larger than a[i], swap them and continue from the child, else stop.\n" +
            "        pass\n" +
            "\n" +
            "    # TODO: build a max-heap: for i from len(a) // 2 - 1 down to 0, sift_down(i, len(a)).\n" +
            "    # Then for end from len(a) - 1 down to 1: swap a[0] and a[end], sift_down(0, end).\n" +
            "    return a\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.HeapSort",
        ["python"] = "heap_sort",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[5, 2, 4, 6, 1, 3]", "[1,2,3,4,5,6]"),
        new TestCase("[]", "[]"),
        new TestCase("[1]", "[1]"),
        new TestCase("[2, 1]", "[1,2]"),
        new TestCase("[3, 3, 1, 2, 1]", "[1,1,2,3,3]"),
        new TestCase("[-4, 10, 0, -4, 7]", "[-4,-4,0,7,10]"),
        new TestCase("[9, 8, 7, 6, 5, 4, 3, 2, 1]", "[1,2,3,4,5,6,7,8,9]"),
        new TestCase("[1, 2, 3, 4, 5]", "[1,2,3,4,5]"),
        new TestCase("[2, 2, 2, 2]", "[2,2,2,2]"),
    ];

    public string CSharpCallTemplate => "Solution.HeapSort({input})";
    public string PythonCallTemplate => "heap_sort({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] a = [5, 2, 4, 6, 1, 3];
        var steps = new List<VisualizationStep>
        {
            new(new() { ["array"] = a.ToArray() }, [], "Sort [5, 2, 4, 6, 1, 3]. The array is read as a tree: the children of index i are at 2i + 1 and 2i + 2."),
        };

        void SiftDown(int i, int size)
        {
            while (true)
            {
                int left = 2 * i + 1, right = left + 1, big = i;
                if (left < size && a[left] > a[big]) big = left;
                if (right < size && a[right] > a[big]) big = right;
                if (big == i) return;
                (a[i], a[big]) = (a[big], a[i]);
                i = big;
            }
        }

        for (var i = a.Length / 2 - 1; i >= 0; i--) SiftDown(i, a.Length);
        steps.Add(new(new() { ["array"] = a.ToArray() }, [0],
            $"Built the max-heap bottom up, sifting down from index {a.Length / 2 - 1} to 0. The largest value, {a[0]}, is at the root."));
        for (var end = a.Length - 1; end > 0; end--)
        {
            var max = a[0];
            (a[0], a[end]) = (a[end], a[0]);
            SiftDown(0, end);
            steps.Add(new(new() { ["array"] = a.ToArray() }, Enumerable.Range(end, a.Length - end).ToArray(),
                $"Swap the max {max} to index {end}, its final place, then sift the new root down within the first {end} slots. Root is now {a[0]}."));
        }
        steps.Add(new(new() { ["array"] = a.ToArray() }, [], "Sorted in place: no second array, only swaps."));
        return steps;
    }
}
