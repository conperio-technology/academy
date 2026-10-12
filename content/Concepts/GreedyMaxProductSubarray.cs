namespace DsaAcademy.Content.Concepts;

// Transfer exercise after Maximum Subarray: Kadane's "best run ending here", but for a product,
// where a negative number turns the smallest run into the largest, so both must be carried.
public class GreedyMaxProductSubarray : IConcept
{
    public string Id => "greedy-max-product-subarray";
    public string Track => "greedy";
    public int Order => 111;
    public string Title => "Transfer: Maximum Product Subarray";
    public string OneLiner => "The largest product of a contiguous run. Kadane's one pass still works, but a negative number flips big and small, so track the smallest run ending here as well as the largest.";
    public string KeyTakeaway =>
        "Carry hi and lo, the largest and smallest products of a run ending at i. The next element x " +
        "extends one of them or starts fresh: hi = max(x, hi · x, lo · x) and lo = min(x, hi · x, lo · x), " +
        "both from the old values. The answer is the largest hi seen. One pass, O(1) space.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;
    public string? TransferOf => "greedy-max-subarray";

    public string Explanation =>
        "This follows Maximum Subarray (Kadane's Algorithm) with sum changed to product. Given an integer " +
        "array, return the largest product of a non-empty contiguous subarray. For [2, 3, -2, 4] the answer " +
        "is 6, from [2, 3]. For [-2, 3, -4] it is 24, the whole array: two negatives make a positive.\n\n" +
        "Kadane's question still drives it: what is the best run that ENDS exactly at i? With sums, the " +
        "best run ending at i was either nums[i] alone or the best run ending at i - 1 extended by nums[i]. " +
        "With products that breaks: multiplying by a negative turns the largest product into the smallest " +
        "and the smallest into the largest. In [-2, 3, -4], the best run ending at 3 is 3, but the one that " +
        "wins at -4 is -6 (the smallest run ending at 3) times -4.\n\n" +
        "So carry two values: hi, the largest product of a run ending here, and lo, the smallest (the most " +
        "negative). For the next element x the candidates are x alone, hi · x and lo · x; hi becomes the " +
        "largest of the three and lo the smallest. Compute both from the OLD hi and lo, so save one before " +
        "overwriting it. Start hi, lo and the answer at nums[0], as in the parent lesson, so an all negative " +
        "single element still works. A zero resets both to 0, and the next element starts fresh because " +
        "\"x alone\" is a candidate.\n\n" +
        "It is still one pass with a few variables: O(n) time, O(1) space. As with sums, the restart rule " +
        "is what makes it work: a run is only worth extending if what came before helps, and with products " +
        "\"helps\" can come from either extreme.\n\n" +
        "The visualization runs [2, 3, -2, 4, -1]; the message shows hi and lo after each element.\n\n" +
        "Explain why the same idea works: before you move on, write two or three sentences comparing this " +
        "with Kadane's algorithm for sums. Why is \"the best run ending here\" still the right subproblem, " +
        "why does one value per index stop being enough, and what does a zero do to the runs?";

    public List<string> RecognitionSignals =>
    [
        "Best contiguous run under multiplication, or any operation where a negative can turn the worst value into the best.",
        "Kadane's single pass feels right, but signs flip the comparison, so the minimum matters too.",
    ];

    public List<string> Gotchas =>
    [
        "Compute the new hi and lo from the OLD values; updating hi first and then using it for lo is wrong.",
        "Start from nums[0], not 1 or 0: [-2] must return -2.",
        "Include x alone as a candidate, or a zero would wipe out every later run.",
    ];

    public List<string> ConfusableWith =>
    [
        "Greedy: Maximum Subarray (Kadane's Algorithm) tracks one best run ending here; for products you need the largest and the smallest, because a negative swaps them.",
        "Prefix sums answer subarray SUM questions by subtraction; products have no equally safe division because of zeros, which is why the one pass carries running extremes instead.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int MaxProduct(int[] nums)\n" +
            "    {\n" +
            "        // TODO: hi = lo = best = nums[0]. For each later x: from the OLD hi and\n" +
            "        // lo, hi = max(x, hi * x, lo * x) and lo = min(x, hi * x, lo * x).\n" +
            "        // Update best with hi. Return best.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def max_product(nums):\n" +
            "    # TODO: hi = lo = best = nums[0]. For each later x: from the OLD hi and\n" +
            "    # lo, hi = max(x, hi * x, lo * x) and lo = min(x, hi * x, lo * x).\n" +
            "    # Update best with hi. Return best.\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MaxProduct",
        ["python"] = "max_product",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[2, 3, -2, 4]", "6"),
        new TestCase("[-2, 0, -1]", "0"),
        new TestCase("[-2]", "-2"),
        new TestCase("[-2, 3, -4]", "24"),
        new TestCase("[0, 2]", "2"),
        new TestCase("[-1, -3, -10, 0, 60]", "60"),
        new TestCase("[2, -5, -2, -4, 3]", "24"),
        new TestCase("[-2, -3, 7]", "42"),
        new TestCase("[3, -1, 4]", "4"),
        new TestCase("[-1, -1]", "1"),
    ];

    public string CSharpCallTemplate => "Solution.MaxProduct({input})";
    public string PythonCallTemplate => "max_product({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [2, 3, -2, 4, -1];
        var arr = nums.Select(v => (object)v).ToArray();
        int hi = nums[0], lo = nums[0], best = nums[0];
        var steps = new List<VisualizationStep>
        {
            new(
                new Dictionary<string, object> { ["array"] = arr, ["tracker"] = best, ["trackerLabel"] = "best product" },
                [0],
                $"Start at nums[0] = {nums[0]}: hi = lo = best = {nums[0]}. hi and lo are the largest and smallest products of a run ending here."
            ),
        };

        for (var i = 1; i < nums.Length; i++)
        {
            var x = nums[i];
            int a = hi * x, b = lo * x;
            var newHi = Math.Max(x, Math.Max(a, b));
            var newLo = Math.Min(x, Math.Min(a, b));
            var flip = x < 0 ? " x is negative, so the old smallest run gives the new largest." : "";
            hi = newHi;
            lo = newLo;
            best = Math.Max(best, hi);
            steps.Add(new VisualizationStep(
                new Dictionary<string, object> { ["array"] = arr, ["tracker"] = best, ["trackerLabel"] = "best product" },
                [i],
                $"x = {x}: candidates x = {x}, hi · x = {a}, lo · x = {b}. So hi = {hi}, lo = {lo}.{flip}"
            ));
        }

        steps.Add(new VisualizationStep(
            new Dictionary<string, object> { ["array"] = arr, ["tracker"] = best, ["trackerLabel"] = "best product" },
            [],
            $"Done: the largest product is {best}, from the whole array: the two negatives cancel. A sum based Kadane that kept only hi would have stopped at 6."
        ));
        return steps;
    }
}
