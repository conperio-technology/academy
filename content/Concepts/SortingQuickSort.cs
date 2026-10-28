namespace DsaAcademy.Content.Concepts;

public class SortingQuickSort : IConcept
{
    public string Id => "sorting-quicksort";
    public string Track => "sorting";
    public string Title => "Quicksort";
    public string OneLiner => "Partition around a pivot, then quicksort each side. O(n log n) on average, in place, and the usual fastest general sort in practice.";
    public string KeyTakeaway =>
        "Quicksort puts one pivot in its final place with an O(n) partition, then recurses on the two sides. " +
        "Good pivots halve the range, giving O(n log n); a pivot that is always the smallest or largest gives " +
        "O(n²). Picking the middle element (or a random one) makes that worst case unlikely on real data.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Return nums sorted in ascending order using quicksort. The partition step from Quicksort Partition, " +
        "earlier in this track, does the real work: it rearranges a range so everything smaller than the " +
        "pivot comes first, then the pivot, then everything else, and tells you where the pivot landed. That " +
        "pivot is now in its final sorted position.\n\n" +
        "Quicksort just repeats that. Sort(lo, hi): if the range has fewer than 2 elements, stop. Otherwise " +
        "partition it, getting the pivot's index p, then Sort(lo, p - 1) and Sort(p + 1, hi). Nothing needs " +
        "combining afterwards: once both sides are sorted, the whole range is sorted, because every element " +
        "on the left is smaller than the pivot and every element on the right is not.\n\n" +
        "Use the Lomuto partition you already know, with the last element of the range as the pivot. Before " +
        "partitioning, swap the middle element of the range into the last slot. On already sorted input, " +
        "always using the last element as pivot would split n into n - 1 and 0 at every level: n levels of " +
        "O(n) work, O(n²). Taking the middle element splits sorted input evenly.\n\n" +
        "On average quicksort is O(n log n) with about log n levels of recursion, and it sorts in place, " +
        "needing only the O(log n) recursion stack. Its inner loop is a tight compare and swap over " +
        "contiguous memory, which is why it usually beats merge sort in practice. It is not stable. Real " +
        "libraries (C#'s Array.Sort uses introsort) switch to heap sort if the recursion gets too deep, which " +
        "caps the worst case at O(n log n).\n\n" +
        "The visualization sorts [5, 2, 4, 6, 1, 3] and highlights each pivot once it is in its final place.";

    public List<string> RecognitionSignals => [
        "Sort in place with O(log n) extra space and good average speed.",
        "Any problem built on partition: k-th smallest or largest (quickselect), Dutch national flag, moving values that match a test to one side.",
    ];

    public List<string> Gotchas => [
        "Always taking the first or last element as pivot makes sorted or reversed input O(n²) with n levels of recursion.",
        "Recursing on (lo, p) instead of (lo, p - 1) includes the pivot again and can loop forever when p == hi.",
        "Lomuto partition with many equal values still works but degrades; three-way partitioning (see Sort Colors) handles duplicates best.",
    ];

    public List<string> ConfusableWith => [
        "Merge sort does its work after the recursive calls (merging) and is stable but needs O(n) space; quicksort does its work before (partitioning), in place, and is not stable.",
        "Quickselect partitions the same way but recurses into only the side that holds the k-th element, so it averages O(n) instead of O(n log n).",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] QuickSort(int[] nums)\n" +
            "    {\n" +
            "        var a = nums.ToArray();\n" +
            "        Sort(a, 0, a.Length - 1);\n" +
            "        return a;\n" +
            "    }\n" +
            "\n" +
            "    private static void Sort(int[] a, int lo, int hi)\n" +
            "    {\n" +
            "        // TODO: stop when lo >= hi. Swap the middle element into a[hi],\n" +
            "        // partition a[lo..hi] around a[hi] (Lomuto) to get the pivot index p,\n" +
            "        // then Sort(a, lo, p - 1) and Sort(a, p + 1, hi).\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def quick_sort(nums):\n" +
            "    a = list(nums)\n" +
            "\n" +
            "    def sort(lo, hi):\n" +
            "        # TODO: stop when lo >= hi. Swap the middle element into a[hi],\n" +
            "        # partition a[lo..hi] around a[hi] (Lomuto) to get the pivot index p,\n" +
            "        # then sort(lo, p - 1) and sort(p + 1, hi).\n" +
            "        pass\n" +
            "\n" +
            "    sort(0, len(a) - 1)\n" +
            "    return a\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.QuickSort",
        ["python"] = "quick_sort",
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

    public string CSharpCallTemplate => "Solution.QuickSort({input})";
    public string PythonCallTemplate => "quick_sort({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] a = [5, 2, 4, 6, 1, 3];
        var steps = new List<VisualizationStep>
        {
            new(new() { ["array"] = a.ToArray() }, [], "Sort [5, 2, 4, 6, 1, 3]. Each round partitions a range around a pivot taken from its middle."),
        };
        var done = new SortedSet<int>();

        void Sort(int lo, int hi)
        {
            if (lo > hi) return;
            if (lo == hi)
            {
                done.Add(lo);
                steps.Add(new(new() { ["array"] = a.ToArray() }, done.ToArray(), $"Range {lo} to {hi} has one element, {a[lo]}, already in place."));
                return;
            }
            var mid = (lo + hi) / 2;
            (a[mid], a[hi]) = (a[hi], a[mid]);
            var pivot = a[hi];
            var i = lo;
            for (var j = lo; j < hi; j++)
            {
                if (a[j] < pivot)
                {
                    (a[i], a[j]) = (a[j], a[i]);
                    i++;
                }
            }
            (a[i], a[hi]) = (a[hi], a[i]);
            done.Add(i);
            steps.Add(new(new() { ["array"] = a.ToArray() }, done.ToArray(),
                $"Partition positions {lo} to {hi} around the middle value {pivot}: smaller values go left, and {pivot} lands at index {i}, its final place."));
            Sort(lo, i - 1);
            Sort(i + 1, hi);
        }

        Sort(0, a.Length - 1);
        steps.Add(new(new() { ["array"] = a.ToArray() }, [], "Sorted. Every element became a pivot or a one-element range, and nothing had to be merged."));
        return steps;
    }
}
