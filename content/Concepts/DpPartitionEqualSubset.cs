namespace DsaAcademy.Content.Concepts;

public class DpPartitionEqualSubset : IConcept
{
    public string Id => "dp-partition-equal-subset";
    public string Track => "patterns";
    public string Title => "Transfer: Partition Equal Subset Sum";
    public string OneLiner => "Can the numbers be split into two groups with equal sums? Only if some subset sums to half the total, which is 0/1 knapsack with a yes or no table.";
    public string KeyTakeaway =>
        "Two equal halves means one subset summing to total / 2 (and the total must be even). That is 0/1 " +
        "knapsack: reachable[s] says whether some subset of the numbers seen so far sums to s. For each " +
        "number x, update s from high to low: reachable[s] |= reachable[s - x]. Going downwards is what stops " +
        "x from being used twice. O(n · target) time, O(target) space.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;
    public string? TransferOf => "knapsack-01";

    public string Explanation =>
        "This follows 0/1 Knapsack with the question changed. Given positive integers nums, return true if " +
        "they can be split into two groups with the same sum. [1, 5, 11, 5] is true (11 and 1 + 5 + 5). [1, " +
        "2, 3, 5] is false.\n\n" +
        "First, reframe. If the two groups have equal sums, each is total / 2. So if the total is odd, the " +
        "answer is false straight away; otherwise the question is just \"is there a subset summing to target = " +
        "total / 2?\" The other group is automatically everything else.\n\n" +
        "Each number is either in the subset or not, and can be used at most once: that is 0/1 knapsack, " +
        "where the capacity is target and you only care whether a sum is reachable, not about values. Keep a " +
        "boolean array reachable of size target + 1 with reachable[0] = true (the empty subset). For each x, " +
        "for s from target down to x: if reachable[s - x], set reachable[s] = true. The answer is " +
        "reachable[target].\n\n" +
        "Why loop downwards? With one row reused, going upwards would let reachable[s - x] already include x " +
        "from this same round, so x could be counted twice (that is the unbounded knapsack loop, as in Coin " +
        "Change Ways). Going downwards reads only values from before x was considered. You can also stop " +
        "early once reachable[target] becomes true.\n\n" +
        "There are n numbers and target + 1 sums: O(n · target) time and O(target) space. That is " +
        "pseudo-polynomial: fast when the numbers are small, slow when they are huge even if there are few of " +
        "them.\n\n" +
        "Explain why the same idea works: before you move on, write two or three sentences comparing this " +
        "with 0/1 Knapsack. What plays the role of the capacity and the value, and why must the inner loop " +
        "run from high to low?\n\n" +
        "The visualization runs [1, 5, 11, 5] (target 11). The array is reachable[0..11], 1 for reachable.";

    public List<string> RecognitionSignals => [
        "Split a set into two groups with equal (or as close as possible) sums.",
        "\"Is there a subset that sums to T\" with small integers: a boolean knapsack over sums.",
    ];

    public List<string> Gotchas => [
        "Skip the DP when the total is odd: return false.",
        "Iterating s upwards reuses the same number within one round.",
        "reachable[0] must start true, or nothing is ever reachable.",
    ];

    public List<string> ConfusableWith => [
        "0/1 Knapsack maximises value under a weight limit; here every item's weight is its value and you only ask whether an exact sum is reachable.",
        "Coin Change Ways counts combinations with unlimited reuse, so its inner loop runs upwards.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static bool CanPartition(int[] nums)\n" +
            "    {\n" +
            "        var total = nums.Sum();\n" +
            "        if (total % 2 != 0) return false;\n" +
            "        var target = total / 2;\n" +
            "        var reachable = new bool[target + 1]; // reachable[s]: some subset sums to s\n" +
            "        reachable[0] = true;\n" +
            "        // TODO: for each x in nums, for s from target DOWN to x:\n" +
            "        // if reachable[s - x], set reachable[s] = true. Return reachable[target].\n" +
            "        return false;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def can_partition(nums):\n" +
            "    total = sum(nums)\n" +
            "    if total % 2:\n" +
            "        return False\n" +
            "    target = total // 2\n" +
            "    reachable = [True] + [False] * target  # reachable[s]: some subset sums to s\n" +
            "    # TODO: for each x in nums, for s from target DOWN to x:\n" +
            "    # if reachable[s - x], set reachable[s] = True. Return reachable[target].\n" +
            "    return False\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CanPartition",
        ["python"] = "can_partition",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[1, 5, 11, 5]", "true"),
        new TestCase("[1, 2, 3, 5]", "false"),
        new TestCase("[1, 1]", "true"),
        new TestCase("[2]", "false"),
        new TestCase("[3, 3, 3, 4, 5]", "true"),
        new TestCase("[1, 2, 5]", "false"),
        new TestCase("[100, 100, 100, 100, 100, 100, 100, 100]", "true"),
        new TestCase("[2, 2, 1, 1]", "true"),
    ];

    public string CSharpCallTemplate => "Solution.CanPartition({input})";
    public string PythonCallTemplate => "can_partition({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [1, 5, 11, 5];
        var target = nums.Sum() / 2;
        var reachable = new int[target + 1];
        reachable[0] = 1;
        var steps = new List<VisualizationStep>
        {
            new(new() { ["array"] = reachable.ToArray() }, [0], $"[1, 5, 11, 5] sums to {nums.Sum()}, so each half must be {target}. reachable[0] = 1: the empty subset sums to 0."),
        };
        foreach (var x in nums)
        {
            var added = new List<int>();
            for (var s = target; s >= x; s--)
            {
                if (reachable[s - x] == 1 && reachable[s] == 0)
                {
                    reachable[s] = 1;
                    added.Add(s);
                }
            }
            var what = added.Count > 0 ? $"newly reachable: {string.Join(", ", added.OrderBy(v => v))}" : "nothing new";
            steps.Add(new(new() { ["array"] = reachable.ToArray() }, added.ToArray(),
                $"Take {x}: for s from {target} down to {x}, s is reachable if s - {x} was. {char.ToUpper(what[0])}{what[1..]}."));
        }
        steps.Add(new(new() { ["array"] = reachable.ToArray() }, [target], $"reachable[{target}] = {reachable[target]}: the subset [11] makes {target}, and [1, 5, 5] is the other half."));
        return steps;
    }
}
