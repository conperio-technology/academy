namespace DsaAcademy.Content.Concepts;

public class HashMapTwoSum : IConcept
{
    public string Id => "hashmap-two-sum";
    public string Track => "fundamentals";

    // See ArrayTraversalSum.cs -- keeps this track ahead of Trees/Graphs/Sorting/DP/
    // Patterns so Hashing (Order = 60) can slot in right after it.
    public int Order => 50;

    public string Title => "Hash Maps: Two Sum";
    public string OneLiner => "Trade memory for speed: remember what you've seen so far so you never have to look back.";
    public string KeyTakeaway =>
        "A hash map (C#'s Dictionary, Python's dict: a store of key-value pairs that finds the value for a " +
        "key in about one step) turns \"have I seen this value before\" from an O(n) re-scan into an O(1) average-case lookup. Any problem shaped like \"find a pair / a complement / a duplicate\" is " +
        "a candidate for \"store what you've seen in a map as you walk, check it before you add.\"";
    public VisualizerKind VisualizerKind => VisualizerKind.HashMap;

    public string Explanation =>
        "The brute-force way to find two numbers that add up to a target is a nested loop -- for " +
        "every number, scan every other number -- O(n^2). A hash map does it in one pass: walk the " +
        "array once, and at each number, ask \"have I already seen the complement (target - this " +
        "number)?\" If yes, you're done -- return both indices. If no, remember this number (and its " +
        "index) in the map and keep going. The map turns \"have I seen X\" from a re-scan into a " +
        "lookup, which is what takes this from O(n^2) to O(n). Watch out for using the SAME element " +
        "twice (nums=[3,3] with target 6 is valid -- two different indices holding equal values -- " +
        "but you can't pair an element with itself using one index twice).";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] TwoSum(int[] nums, int target)\n" +
            "    {\n" +
            "        // TODO: walk nums once. At each index, check whether (target - nums[i])\n" +
            "        // is already in a map of value -> index. If so, return [thatIndex, i].\n" +
            "        // Otherwise, add nums[i] -> i to the map and keep going.\n" +
            "        return new int[0];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def two_sum(nums, target):\n" +
            "    # TODO: walk nums once. At each index, check whether (target - nums[i])\n" +
            "    # is already in a dict of value -> index. If so, return [that_index, i].\n" +
            "    # Otherwise, add nums[i] -> i to the dict and keep going.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.TwoSum",
        ["python"] = "two_sum",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([2, 7, 11, 15]), Lit.Int(9)), "[0,1]"),
        new TestCase(Lit.Args(Lit.IntArray([3, 2, 4]), Lit.Int(6)), "[1,2]"),
        new TestCase(Lit.Args(Lit.IntArray([3, 3]), Lit.Int(6)), "[0,1]"),
        new TestCase(Lit.Args(Lit.IntArray([1, 5, 3, 7]), Lit.Int(10)), "[2,3]"),
    ];

    public string CSharpCallTemplate => "Solution.TwoSum({input})";
    public string PythonCallTemplate => "two_sum({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [2, 7, 11, 15];
        const int target = 9;
        var steps = new List<VisualizationStep>();
        var map = new List<int[]>(); // [value, index] pairs, insertion order

        object MapState() => map.Select(p => new[] { p[0], p[1] }).ToArray();

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = nums, ["hashMap"] = MapState() },
            HighlightIndices: [],
            Message: $"Looking for two numbers in [{string.Join(", ", nums)}] that add up to {target}. Empty map to start."
        ));

        for (var i = 0; i < nums.Length; i++)
        {
            var complement = target - nums[i];
            var found = map.FirstOrDefault(p => p[0] == complement);

            if (found is not null)
            {
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["array"] = nums, ["hashMap"] = MapState() },
                    HighlightIndices: [i],
                    Message: $"nums[{i}] = {nums[i]}. Need {complement} to reach {target} -- and {complement} is already in the map (from index {found[1]})! Return [{found[1]}, {i}]."
                ));
                break;
            }

            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = nums, ["hashMap"] = MapState() },
                HighlightIndices: [i],
                Message: $"nums[{i}] = {nums[i]}. Need {complement} to reach {target} -- not in the map yet. Add {nums[i]} -> index {i} and keep going."
            ));
            map.Add([nums[i], i]);
        }

        return steps;
    }
}
