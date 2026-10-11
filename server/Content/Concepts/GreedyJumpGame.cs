namespace DsaAcademy.Content.Concepts;

public class GreedyJumpGame : IConcept
{
    public string Id => "greedy-jump-game";
    public string Track => "greedy";
    public int Order => 111;
    public string Title => "Greedy: Jump Game";
    public string OneLiner => "Can you reach the last index? Track the farthest index reachable so far in one left-to-right pass.";
    public string KeyTakeaway =>
        "You don't need to know HOW you'd reach an index, only WHETHER you can. Keep farthest, the furthest index " +
        "any jump so far can land on. If the scan ever reaches an index beyond farthest, you're stuck; otherwise " +
        "extend farthest with i + nums[i]. One pass, O(n) time, O(1) space.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "You start at index 0 of nums. nums[i] is the MAXIMUM jump length from index i, so from i you can land on " +
        "any index from i + 1 to i + nums[i]. Return true if you can reach the last index. For [2, 3, 1, 1, 4] the " +
        "answer is true (0 to 1, then 1 to 4). For [3, 2, 1, 0, 4] it is false: every route lands on index 3, " +
        "whose value is 0, and nothing jumps over it.\n\n" +
        "The brute force tries every jump from every index, which is exponential, or a dynamic programming table " +
        "(\"can I reach the end from i?\") filled right to left in O(n^2). The greedy view is simpler. The set of " +
        "indexes you can reach is always one unbroken block starting at 0: if you can reach index 5, you can reach " +
        "every index before it too, because the jump that passed over them could have stopped short. So the whole " +
        "state is one number, farthest, the right edge of that block.\n\n" +
        "Scan i from 0. If i > farthest, index i can't be reached, and neither can anything after it: return " +
        "false. Otherwise index i is reachable, so update farthest = max(farthest, i + nums[i]). If farthest " +
        "reaches the last index, return true. Each index is looked at once: O(n) time, two variables of space.\n\n" +
        "Why is this greedy? At every index it keeps only the best reach and forgets which jumps produced it. That " +
        "is safe because a bigger reach can only add reachable indexes, never remove them. The follow-up, Jump " +
        "Game II (next lesson), asks for the FEWEST jumps and needs a little more bookkeeping on the same idea.\n\n" +
        "The visualization walks [3, 2, 1, 0, 4], the failing example: farthest stalls at 3 and index 4 is never " +
        "reached.";

    public List<string> RecognitionSignals =>
    [
        "\"Can you reach the end?\" where each position says how far you may move from it.",
        "Only reachability matters, not the path, so the state collapses to one running maximum.",
        "A DP over positions would work but each cell only asks \"is anything to my left reaching me?\"",
    ];

    public List<string> Gotchas =>
    [
        "nums[i] is the MAXIMUM jump, not an exact jump. Treating it as exact turns this into a graph search and gives wrong answers.",
        "Check i > farthest BEFORE using nums[i]; an unreachable index's value must not extend the reach.",
        "A single-element array is already at the last index: true, even if the value is 0.",
    ];

    public List<string> ConfusableWith =>
    [
        "Jump Game II (this track) asks for the minimum number of jumps, which is BFS by levels rather than a single running maximum.",
        "Merge Intervals is the same \"extend the right edge while the next start is covered\" idea, applied to intervals [i, i + nums[i]].",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static bool CanJump(int[] nums)\n" +
            "    {\n" +
            "        // TODO: keep farthest = the furthest index reachable so far (start at 0).\n" +
            "        // For each i: if i > farthest you're stuck, return false.\n" +
            "        // Otherwise farthest = max(farthest, i + nums[i]).\n" +
            "        // Return true once the scan finishes (or farthest reaches the last index).\n" +
            "        return false;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def can_jump(nums):\n" +
            "    # TODO: keep farthest = the furthest index reachable so far (start at 0).\n" +
            "    # For each i: if i > farthest you're stuck, return False.\n" +
            "    # Otherwise farthest = max(farthest, i + nums[i]).\n" +
            "    # Return True once the scan finishes (or farthest reaches the last index).\n" +
            "    return False\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CanJump",
        ["python"] = "can_jump",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[2, 3, 1, 1, 4]", "true"),
        new TestCase("[3, 2, 1, 0, 4]", "false"),
        new TestCase("[0]", "true"),
        new TestCase("[0, 1]", "false"),
        new TestCase("[1, 0]", "true"),
        new TestCase("[2, 0, 0]", "true"),
        new TestCase("[1, 1, 0, 1]", "false"),
        new TestCase("[5, 0, 0, 0, 0, 0]", "true"),
        new TestCase("[1, 2, 0, 0, 1]", "false"),
    ];

    public string CSharpCallTemplate => "Solution.CanJump({input})";
    public string PythonCallTemplate => "can_jump({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [3, 2, 1, 0, 4];
        var steps = new List<VisualizationStep>();
        var farthest = 0;

        Dictionary<string, object> State() => new()
        {
            ["array"] = nums,
            ["tracker"] = farthest,
            ["trackerLabel"] = "farthest reachable index",
        };

        steps.Add(new VisualizationStep(State(), [0],
            "nums = [3, 2, 1, 0, 4]. Start at index 0 with farthest = 0. Each value is the longest jump allowed from that index."));

        for (var i = 0; i < nums.Length; i++)
        {
            if (i > farthest)
            {
                steps.Add(new VisualizationStep(State(), [i],
                    $"i = {i} is past farthest = {farthest}: no jump reaches it. Return false."));
                return steps;
            }
            var before = farthest;
            farthest = Math.Max(farthest, i + nums[i]);
            steps.Add(new VisualizationStep(State(), Enumerable.Range(0, farthest + 1).Where(k => k < nums.Length).ToArray(),
                farthest > before
                    ? $"i = {i} is reachable. i + nums[i] = {i + nums[i]} beats {before}: farthest = {farthest}. Highlighted cells are every index reachable so far."
                    : $"i = {i} is reachable, but i + nums[i] = {i + nums[i]} doesn't beat farthest = {farthest}."));
        }

        steps.Add(new VisualizationStep(State(), [], "The scan finished without getting stuck: return true."));
        return steps;
    }
}
