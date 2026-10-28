namespace DsaAcademy.Content.Concepts;

public class SortingMergeSort : IConcept
{
    public string Id => "sorting-merge-sort";
    public string Track => "sorting";
    public string Title => "Merge Sort";
    public string OneLiner => "Split the array in half, sort each half, then merge the two sorted halves. Guaranteed O(n log n), and stable.";
    public string KeyTakeaway =>
        "Merge sort is divide and conquer: sorting n items is two sorts of n/2 items plus one O(n) merge. The " +
        "halving gives log n levels and each level merges n items in total, so O(n log n) every time, at the " +
        "cost of O(n) extra space for the merge.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Return the numbers in nums sorted in ascending order. You already know how to merge two sorted " +
        "arrays with two pointers (Merge Two Sorted Arrays, earlier in this track). Merge sort is that merge " +
        "plus one idea: an array of 0 or 1 elements is already sorted, so keep splitting until you reach " +
        "those, then merge your way back up.\n\n" +
        "Concretely: if nums has fewer than 2 elements, return a copy. Otherwise split at mid = n / 2, sort " +
        "the left half and the right half recursively, and merge the two sorted halves into one. For [5, 2, " +
        "4, 6, 1, 3] the halves become [2, 4, 5] and [1, 3, 6], and one merge gives [1, 2, 3, 4, 5, 6].\n\n" +
        "Why O(n log n): each level of the recursion halves the pieces, so there are about log₂ n levels. At " +
        "every level the merges together touch each of the n elements once. n work per level times log n " +
        "levels is O(n log n), and that holds for any input, sorted, reversed or random. That predictability " +
        "is merge sort's selling point over quicksort.\n\n" +
        "The cost is space. The merge writes into a new array, so merge sort uses O(n) extra memory (plus " +
        "O(log n) for the recursion). When the left and right heads are equal, take the left one (<=, not <): " +
        "equal elements keep their original order, which makes merge sort stable. Stability matters when you " +
        "sort records by one key after another.\n\n" +
        "Merge sort is also the standard way to sort a linked list (no random access needed) and the base of " +
        "external sorting, where data too big for memory is sorted in chunks and the sorted chunks are " +
        "merged. Python's sorted() and C#'s List.Sort for some types use hybrids that start from these ideas " +
        "(Timsort, introsort).\n\n" +
        "The visualization sorts [5, 2, 4, 6, 1, 3] and shows the array after each merge, with the merged " +
        "range highlighted.";

    public List<string> RecognitionSignals => [
        "You need a guaranteed O(n log n) sort, or a stable one.",
        "Sorting a linked list, or data that arrives as sorted runs you can merge.",
        "Counting something across pairs during a sort (inversions, smaller elements after self): the merge step sees every left element against every right one.",
    ];

    public List<string> Gotchas => [
        "Forgetting to copy the leftovers: when one half runs out, append the rest of the other.",
        "Using < instead of <= when heads are equal breaks stability.",
        "Splitting at mid but recursing on the whole array again never terminates; the halves must shrink.",
    ];

    public List<string> ConfusableWith => [
        "Quicksort also divides and conquers, but does its work before recursing (partition) and none after, in place. Merge sort does its work after recursing (merge) and needs O(n) extra space.",
        "Merge Two Sorted Arrays is just the merge step on its own; merge sort calls it log n levels deep.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] MergeSort(int[] nums)\n" +
            "    {\n" +
            "        // TODO: if nums.Length < 2, return a copy.\n" +
            "        // Otherwise sort nums[..mid] and nums[mid..] recursively,\n" +
            "        // then merge the two sorted halves with two pointers\n" +
            "        // (take the left head when the heads are equal).\n" +
            "        return nums;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def merge_sort(nums):\n" +
            "    # TODO: if len(nums) < 2, return a copy.\n" +
            "    # Otherwise sort nums[:mid] and nums[mid:] recursively,\n" +
            "    # then merge the two sorted halves with two pointers\n" +
            "    # (take the left head when the heads are equal).\n" +
            "    return nums\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MergeSort",
        ["python"] = "merge_sort",
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

    public string CSharpCallTemplate => "Solution.MergeSort({input})";
    public string PythonCallTemplate => "merge_sort({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [5, 2, 4, 6, 1, 3];
        var steps = new List<VisualizationStep>
        {
            new(new() { ["array"] = nums.ToArray() }, [], "Sort [5, 2, 4, 6, 1, 3]. Split into halves until each piece has one element, then merge back up."),
        };

        void Sort(int lo, int hi)
        {
            if (hi - lo < 2) return;
            var mid = (lo + hi) / 2;
            Sort(lo, mid);
            Sort(mid, hi);
            var left = nums[lo..mid];
            var right = nums[mid..hi];
            int i = 0, j = 0, k = lo;
            while (i < left.Length && j < right.Length) nums[k++] = left[i] <= right[j] ? left[i++] : right[j++];
            while (i < left.Length) nums[k++] = left[i++];
            while (j < right.Length) nums[k++] = right[j++];
            steps.Add(new(new() { ["array"] = nums.ToArray() }, Enumerable.Range(lo, hi - lo).ToArray(),
                $"Merge [{string.Join(", ", left)}] and [{string.Join(", ", right)}] into [{string.Join(", ", nums[lo..hi])}] at positions {lo} to {hi - 1}."));
        }

        Sort(0, nums.Length);
        steps.Add(new(new() { ["array"] = nums.ToArray() }, [], "Sorted. Three levels of merges, each touching all six elements: about n log n work."));
        return steps;
    }
}
