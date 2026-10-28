namespace DsaAcademy.Content.Concepts;

public class SortingCountingSort : IConcept
{
    public string Id => "sorting-counting-sort";
    public string Track => "sorting";
    public string Title => "Counting Sort";
    public string OneLiner => "When the values fall in a small range, count how many times each value appears and write them back in order. O(n + k), no comparisons at all.";
    public string KeyTakeaway =>
        "Comparison sorts cannot beat O(n log n), but counting sort does not compare: it tallies each value " +
        "in an array indexed by value (offset by the minimum) and then reads the tallies in order. O(n + k) " +
        "time and O(k) space, where k is the range max - min + 1, so it wins when k is not much bigger than " +
        "n.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Return nums sorted in ascending order using counting sort. The values may be negative, but the range " +
        "from the smallest to the largest is small.\n\n" +
        "Every sort so far compares elements, and it can be proved that any comparison sort needs about n log " +
        "n comparisons in the worst case. Counting sort sidesteps that by using the values themselves as " +
        "array indices. Find min and max, make counts of size k = max - min + 1, and for each x add one to " +
        "counts[x - min] (the offset maps min to index 0, which also handles negatives). Then walk counts " +
        "from left to right and write value i + min out counts[i] times.\n\n" +
        "Both passes are linear: O(n) to count and O(n + k) to write out, so O(n + k) total, with O(k) for " +
        "the counts. That is excellent for exam scores 0 to 100, ages, or bytes 0 to 255. It is terrible when " +
        "the range is huge: sorting [1, 1000000000] would allocate a billion counters. That trade between n " +
        "and k is the whole decision.\n\n" +
        "Counting sort is also the building block of radix sort, which sorts large integers by running a " +
        "stable counting sort on one digit at a time. For that, the write-out phase uses prefix sums of the " +
        "counts to find each value's position, which keeps equal keys in their original order. Bucket sort is " +
        "the related idea for real numbers spread evenly over a range.\n\n" +
        "The visualization sorts [4, 2, 2, 8, 3, 3, 1]: the array shows the counts as they build up, then the " +
        "output.";

    public List<string> RecognitionSignals => [
        "Integers in a small known range (scores, ages, letters a to z, digits).",
        "\"Sort in linear time\" or \"faster than n log n\": only possible without comparisons.",
        "Frequency counting of bounded values, then producing them in order (the same counts array feeds Top K Frequent with bucket sort).",
    ];

    public List<string> Gotchas => [
        "Forgetting the min offset: negative values give a negative index.",
        "k is max - min + 1, not max - min; the top value needs a slot too.",
        "Handle the empty array before calling min and max.",
    ];

    public List<string> ConfusableWith => [
        "Comparison sorts (merge, quick, heap) work for any values in O(n log n); counting sort only works for small integer ranges but runs in O(n + k).",
        "A hash map of counts (Word Frequency) also tallies values, but has no order; counting sort's array is indexed by value, so reading it left to right is sorted order.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] CountingSort(int[] nums)\n" +
            "    {\n" +
            "        // TODO: return [] for an empty array. Find min and max, make\n" +
            "        // counts = new int[max - min + 1], and add 1 to counts[x - min] for each x.\n" +
            "        // Then write value i + min out counts[i] times, for i from 0 upwards.\n" +
            "        return nums;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def counting_sort(nums):\n" +
            "    # TODO: return [] for an empty list. Find lo = min and hi = max, make\n" +
            "    # counts = [0] * (hi - lo + 1), and add 1 to counts[x - lo] for each x.\n" +
            "    # Then write value i + lo out counts[i] times, for i from 0 upwards.\n" +
            "    return nums\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CountingSort",
        ["python"] = "counting_sort",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[4, 2, 2, 8, 3, 3, 1]", "[1,2,2,3,3,4,8]"),
        new TestCase("[]", "[]"),
        new TestCase("[7]", "[7]"),
        new TestCase("[0, 0, 0]", "[0,0,0]"),
        new TestCase("[-2, 3, -2, 0, 1, -5]", "[-5,-2,-2,0,1,3]"),
        new TestCase("[10, 9, 8, 7, 6, 5]", "[5,6,7,8,9,10]"),
        new TestCase("[1, 1000, 1]", "[1,1,1000]"),
    ];

    public string CSharpCallTemplate => "Solution.CountingSort({input})";
    public string PythonCallTemplate => "counting_sort({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [4, 2, 2, 8, 3, 3, 1];
        var min = nums.Min();
        var counts = new int[nums.Max() - min + 1];
        var steps = new List<VisualizationStep>
        {
            new(new() { ["array"] = nums.ToArray() }, [], $"Sort [4, 2, 2, 8, 3, 3, 1]. min = {min}, max = {nums.Max()}, so counts needs {counts.Length} slots, one per value from {min} to {nums.Max()}."),
        };
        foreach (var x in nums)
        {
            counts[x - min]++;
            steps.Add(new(new() { ["array"] = counts.ToArray(), ["tracker"] = x - min, ["trackerLabel"] = $"value {x}" }, [x - min],
                $"Count {x}: counts[{x} - {min}] = counts[{x - min}] becomes {counts[x - min]}. The array now shows counts for values {min} to {nums.Max()}."));
        }
        var output = new List<int>();
        for (var i = 0; i < counts.Length; i++) for (var c = 0; c < counts[i]; c++) output.Add(i + min);
        steps.Add(new(new() { ["array"] = output.ToArray() }, [],
            $"Read counts left to right, writing value i + {min} counts[i] times: [{string.Join(", ", output)}]. No two elements were ever compared."));
        return steps;
    }
}
