namespace DsaAcademy.Content.Concepts;

public class HashMapLongestConsecutive : IConcept
{
    public string Id => "hashmap-longest-consecutive";
    public string Track => "patterns";
    public string Title => "Hash Set: Longest Consecutive Sequence";
    public string OneLiner => "The longest run of consecutive integers in an unsorted array, in O(n): put everything in a set and only start counting from numbers that begin a run.";
    public string KeyTakeaway =>
        "Sorting gives O(n log n). For O(n), put the numbers in a hash set and walk upwards only from x where " +
        "x - 1 is NOT in the set, the start of a run. Each run is then walked once from its start, so the " +
        "inner while loop does n steps in total across the whole pass, not per number.";
    public VisualizerKind VisualizerKind => VisualizerKind.HashMap;

    public string Explanation =>
        "Given an unsorted array of integers, return the length of the longest sequence of consecutive values " +
        "(x, x + 1, x + 2, ...) that all appear in it. Their positions don't matter. [100, 4, 200, 1, 3, 2] " +
        "gives 4, for 1, 2, 3, 4. Duplicates count once. The target is O(n) time.\n\n" +
        "Sorting and scanning for runs works in O(n log n) and is worth saying first. To beat it, use a hash " +
        "set for O(1) \"is this value present?\" checks. The naive set version, \"for each x, count upwards " +
        "while x + 1 is in the set\", is O(n²) on input like [1, 2, 3, ..., n], because every number re-walks " +
        "the rest of the run.\n\n" +
        "The fix is one condition: only start counting from x if x - 1 is not in the set. Then x is the " +
        "smallest number of its run, and every run is walked exactly once, from its start. A number in the " +
        "middle of a run is skipped in O(1). The inner while loop therefore takes n steps in total over the " +
        "whole outer loop, which is why the nested loops are still O(n). Iterate over the set rather than the " +
        "array, so duplicates don't start the same run twice.\n\n" +
        "O(n) time on average (hash set operations), O(n) space for the set. Union-Find, joining x with x + " +
        "1, also works and is a good follow-up answer.\n\n" +
        "The visualization runs [100, 4, 200, 1, 3, 2]: the left side is the array, the right side shows each " +
        "run start and its length.";

    public List<string> RecognitionSignals => [
        "\"Consecutive\" values in an unsorted array with an O(n) requirement.",
        "A nested loop that would be O(n²) unless each element is only ever the start of one walk.",
    ];

    public List<string> Gotchas => [
        "Counting upwards from every number is O(n²); only start where x - 1 is missing.",
        "Looping over the array instead of the set makes duplicate run starts walk twice.",
        "An empty array has answer 0, not 1.",
    ];

    public List<string> ConfusableWith => [
        "Longest Increasing Subsequence keeps the array order and allows gaps; this ignores positions and needs values with no gaps.",
        "Two Sum also uses a hash set for O(1) lookups, but looks for one partner per element, not a chain.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int LongestConsecutive(int[] nums)\n" +
            "    {\n" +
            "        var set = new HashSet<int>(nums);\n" +
            "        var best = 0;\n" +
            "        // TODO: for each x in set: if set contains x - 1, skip it (not a run start).\n" +
            "        // Otherwise count y = x upwards while set contains y + 1, and update\n" +
            "        // best with the run length y - x + 1.\n" +
            "        return best;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def longest_consecutive(nums):\n" +
            "    values = set(nums)\n" +
            "    best = 0\n" +
            "    # TODO: for each x in values: if x - 1 in values, skip it (not a run start).\n" +
            "    # Otherwise count y = x upwards while y + 1 in values, and update\n" +
            "    # best with the run length y - x + 1.\n" +
            "    return best\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.LongestConsecutive",
        ["python"] = "longest_consecutive",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[100, 4, 200, 1, 3, 2]", "4"),
        new TestCase("[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]", "9"),
        new TestCase("[]", "0"),
        new TestCase("[1]", "1"),
        new TestCase("[1, 2, 0, 1]", "3"),
        new TestCase("[9, 1, -3, 2, 4, 8, 3, -1, 6, -2, -4, 7]", "4"),
        new TestCase("[10, 30, 20]", "1"),
        new TestCase("[5, 5, 5]", "1"),
    ];

    public string CSharpCallTemplate => "Solution.LongestConsecutive({input})";
    public string PythonCallTemplate => "longest_consecutive({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [100, 4, 200, 1, 3, 2];
        var set = new HashSet<int>(nums);
        var runs = new List<int[]>();
        var best = 0;
        var steps = new List<VisualizationStep>
        {
            new(new() { ["array"] = nums, ["hashMap"] = runs.ToArray(), ["mapLabel"] = "run start → length" }, [], "Put all six numbers in a set. A number starts a run only if the number below it is missing."),
        };
        for (var i = 0; i < nums.Length; i++)
        {
            var x = nums[i];
            if (set.Contains(x - 1))
            {
                steps.Add(new(new() { ["array"] = nums, ["hashMap"] = runs.ToArray(), ["mapLabel"] = "run start → length" }, [i], $"{x}: {x - 1} is in the set, so {x} is inside a run that starts lower. Skip it."));
                continue;
            }
            var y = x;
            while (set.Contains(y + 1)) y++;
            best = Math.Max(best, y - x + 1);
            runs.Add([x, y - x + 1]);
            steps.Add(new(new() { ["array"] = nums, ["hashMap"] = runs.ToArray(), ["mapLabel"] = "run start → length" }, [i],
                $"{x}: {x - 1} is missing, so a run starts here. Walk up: {string.Join(", ", Enumerable.Range(x, y - x + 1))}, length {y - x + 1}. Best {best}."));
        }
        steps.Add(new(new() { ["array"] = nums, ["hashMap"] = runs.ToArray(), ["mapLabel"] = "run start → length" }, [], $"Longest run: {best}. Each run was walked once, from its start, so the walks total n steps."));
        return steps;
    }
}
