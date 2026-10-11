namespace DsaAcademy.Content.Concepts;

public class FenwickCountInversions : IConcept
{
    public string Id => "fenwick-count-inversions";
    public string Track => "range queries";
    public int Order => 142;
    public string Title => "Fenwick Tree: Count Inversions in an Array";
    public string OneLiner => "Count the pairs i < j with nums[i] > nums[j] in O(n log n), using a Fenwick tree of seen values (or merge sort), and return it as a 64-bit number.";
    public string KeyTakeaway =>
        "Scan left to right with a Fenwick tree counting seen values by rank. When you reach nums[j], the " +
        "elements before it that are bigger form inversions with it: seen so far minus prefix(rank), the ones " +
        "less than or equal. Sum that over j. The count can reach n(n - 1) / 2, about 5 * 10^9 for n = 100,000, " +
        "so it needs a long in C#.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "An inversion is a pair of positions i < j where nums[i] > nums[j]: two elements in the wrong order. A " +
        "sorted array has none, a reversed array of n distinct elements has the maximum, n(n - 1) / 2. Counting " +
        "them measures how unsorted an array is; it is also how many adjacent swaps bubble sort or insertion " +
        "sort would make, and it underlies ranking comparisons. Return the count for nums. Equal elements are " +
        "not an inversion.\n\n" +
        "Checking every pair is O(n^2). Instead scan from left to right, keeping a Fenwick tree (binary indexed " +
        "tree) that counts how many times each value has been seen. When you arrive at nums[j], everything in " +
        "the tree came before it, so the inversions that end at j are the seen values strictly greater than " +
        "nums[j]: j (how many have been seen) minus prefix(rank of nums[j]) (how many were less than or equal). " +
        "Add that to the total, then add(rank, 1). Each step is O(log n).\n\n" +
        "As in Count of Smaller Numbers After Self, the tree is indexed by value, so first compress coordinates: " +
        "sort the distinct values and map each to its 1-based rank. Values in the tests run from int.MinValue " +
        "to int.MaxValue, so don't index by the raw value or by value plus an offset.\n\n" +
        "Overflow: with n = 100,000 the answer can be about 5 * 10^9, more than int.MaxValue (about 2.1 * 10^9). " +
        "Return long in C# and accumulate in a long. Python ints don't overflow.\n\n" +
        "The other O(n log n) classic is merge sort. While merging two sorted halves, whenever the next element " +
        "comes from the right half, every element still waiting in the left half is bigger than it and comes " +
        "before it: add (left elements remaining) to the count. Interviewers accept either; the Fenwick version " +
        "generalises to queries like \"inversions with a value window\", and the merge sort version needs no " +
        "compression. Knowing both is the strong answer.\n\n" +
        "The visualization counts the 6 inversions in [3, 1, 4, 1, 5, 2]. Distinct values 1, 2, 3, 4, 5 are " +
        "their own ranks here; the array shown is the Fenwick tree (cell 0 unused).";

    public List<string> RecognitionSignals =>
    [
        "\"How many pairs i < j have nums[i] > nums[j]?\", or how far an array is from sorted.",
        "Minimum adjacent swaps to sort, or counting how many people a runner overtook: inversion counts in disguise.",
        "Pair counting over positions where an O(n^2) answer is obvious and n is large.",
    ];

    public List<string> Gotchas =>
    [
        "The total overflows a 32-bit int for large n: use long in C#.",
        "Equal values are not an inversion: count strictly greater with seen - prefix(rank), not seen - prefix(rank - 1).",
        "Values span the whole int range, so compress to ranks rather than offsetting into an array.",
        "In merge sort, add the count of remaining LEFT elements when taking from the right, and take from the left on ties (<=).",
    ];

    public List<string> ConfusableWith =>
    [
        "Fenwick Tree: Count of Smaller Numbers After Self (this track) wants the per-element counts; the inversion count is their sum.",
        "Sorting: Merge Two Sorted Arrays (Sorting) is the merge step the merge sort solution counts during.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static long CountInversions(int[] nums)\n" +
            "    {\n" +
            "        // TODO: compress values to ranks 1..k; tree = new int[k + 1].\n" +
            "        // For j from 0 to n - 1: r = rank of nums[j];\n" +
            "        //   total += j - Prefix(r);  (seen values strictly greater)\n" +
            "        //   Add(r, 1).\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def count_inversions(nums):\n" +
            "    # TODO: compress values to ranks 1..k; tree = [0] * (k + 1).\n" +
            "    # For j, v in enumerate(nums): r = rank[v];\n" +
            "    #   total += j - prefix(r)  (seen values strictly greater)\n" +
            "    #   add(r, 1)\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CountInversions",
        ["python"] = "count_inversions",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([2, 4, 1, 3, 5]), "3"),
        new TestCase(Lit.IntArray([1, 2, 3, 4]), "0"),
        new TestCase(Lit.IntArray([5, 4, 3, 2, 1]), "10"),
        new TestCase(Lit.IntArray([7]), "0"),
        new TestCase(Lit.IntArray([]), "0"),
        new TestCase(Lit.IntArray([3, 1, 3, 1, 3]), "3"),
        new TestCase(Lit.IntArray([3, 1, 4, 1, 5, 2]), "6"),
        new TestCase(Lit.IntArray([1000000000, -2147483648, 2147483647, 0, -1]), "6"),
        new TestCase(Lit.IntArray([8, 4, 2, 1, 7, 3, 6, 5, 9, 0]), "24"),
    ];

    public string CSharpCallTemplate => "Solution.CountInversions({input})";
    public string PythonCallTemplate => "count_inversions({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [3, 1, 4, 1, 5, 2];
        var viz = new FenwickViz(5, "inversions so far");
        long total = 0;
        viz.Note($"nums = [{string.Join(", ", nums)}]. Scan left to right; the Fenwick tree counts the values seen so far, by rank (here each value is its own rank).");
        for (var j = 0; j < nums.Length; j++)
        {
            var r = nums[j];
            var atMost = viz.Prefix(r, $"j = {j}, nums[j] = {nums[j]}. Seen values <= {nums[j]}:", total);
            var bigger = j - atMost;
            total += bigger;
            viz.Add(r, 1, $"{j} seen, {atMost} of them <= {nums[j]}, so {bigger} bigger one{(bigger == 1 ? "" : "s")} came before it: total = {total}. Record it:", total);
        }
        viz.Note($"Done: {total} inversions, from {nums.Length} prefix queries and {nums.Length} adds, O(n log n).", total);
        return viz.Steps;
    }
}
