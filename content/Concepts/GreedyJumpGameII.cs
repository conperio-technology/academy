namespace DsaAcademy.Content.Concepts;

public class GreedyJumpGameII : IConcept
{
    public string Id => "greedy-jump-game-ii";
    public string Track => "greedy";
    public int Order => 111;
    public string Title => "Greedy: Jump Game II (Fewest Jumps)";
    public string OneLiner => "The fewest jumps to the last index: treat each jump as a BFS level and grow the next level as far as it can go.";
    public string KeyTakeaway =>
        "Indexes reachable in exactly k jumps form a contiguous block, so BFS levels are just ranges. Scan left to " +
        "right keeping currentEnd (the edge of the block you can reach with the jumps taken so far) and farthest " +
        "(the edge of the next block). When i hits currentEnd you must jump again: jumps++, currentEnd = farthest. " +
        "O(n) time, O(1) space.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Same setup as Jump Game: nums[i] is the maximum jump length from index i, and you start at index 0. This " +
        "time the last index is always reachable, and you return the MINIMUM number of jumps to get there. For " +
        "[2, 3, 1, 1, 4] the answer is 2: jump 1 step to index 1, then 3 steps to the end.\n\n" +
        "\"Fewest steps\" usually means BFS (breadth-first search: explore everything one step away, then " +
        "everything two steps away, and so on). Here every BFS level is a contiguous range of indexes, for the " +
        "same reason as in Jump Game: if a jump can reach index 7 it can stop at 5 or 6 too. Level 0 is just index " +
        "0. Level 1 is every index from 1 up to nums[0]. Level k + 1 runs from the end of level k up to the " +
        "farthest index any index in level k can reach. So you never need a queue, only two numbers.\n\n" +
        "Scan i from 0 to n - 2 (you never jump FROM the last index). Update farthest = max(farthest, i + " +
        "nums[i]), the edge of the next level. When i == currentEnd you have looked at every index in the current " +
        "level, so one more jump is needed: jumps++ and currentEnd = farthest. Return jumps.\n\n" +
        "The greedy part: within a level you don't decide WHICH index to jump from until you reach the level's " +
        "end, and then you implicitly pick the one that reaches farthest. Any other choice reaches a subset of the " +
        "indexes, so it can't need fewer jumps afterwards. Stopping the loop at n - 2 matters: with i running to n " +
        "- 1, a scan that lands exactly on currentEnd at the last index would count one jump too many.\n\n" +
        "The visualization walks [2, 3, 1, 1, 4]. The highlighted cells are the level currently being scanned.";

    public List<string> RecognitionSignals =>
    [
        "\"Minimum number of jumps / steps / moves\" on a line where each position allows a range of moves.",
        "A BFS would work, but the levels are contiguous ranges, so two boundaries replace the queue.",
        "The input guarantees the end is reachable (otherwise check reachability like Jump Game first).",
    ];

    public List<string> Gotchas =>
    [
        "Loop to n - 2, not n - 1. Jumping from the last index is never needed, and including it can add an extra jump.",
        "Update farthest BEFORE checking i == currentEnd, so the level boundary uses everything the level can reach.",
        "A single-element array needs 0 jumps.",
    ];

    public List<string> ConfusableWith =>
    [
        "Jump Game (this track) only asks whether the end is reachable, so one running maximum is enough.",
        "Breadth-first search on a graph finds fewest steps in general; this is BFS where every level is an interval, which is what makes it O(1) space.",
        "Dynamic programming (dp[i] = fewest jumps to reach i) is correct but O(n^2), because each index scans every earlier index.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int Jump(int[] nums)\n" +
            "    {\n" +
            "        // TODO: jumps = 0, currentEnd = 0, farthest = 0.\n" +
            "        // For i from 0 to nums.Length - 2: farthest = max(farthest, i + nums[i]);\n" +
            "        // if i == currentEnd, you've used up this level: jumps++, currentEnd = farthest.\n" +
            "        // Return jumps.\n" +
            "        return -1;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def jump(nums):\n" +
            "    # TODO: jumps = 0, current_end = 0, farthest = 0.\n" +
            "    # For i from 0 to len(nums) - 2: farthest = max(farthest, i + nums[i]);\n" +
            "    # if i == current_end, you've used up this level: jumps += 1, current_end = farthest.\n" +
            "    # Return jumps.\n" +
            "    return -1\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Jump",
        ["python"] = "jump",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[2, 3, 1, 1, 4]", "2"),
        new TestCase("[2, 3, 0, 1, 4]", "2"),
        new TestCase("[0]", "0"),
        new TestCase("[1, 2]", "1"),
        new TestCase("[1, 1, 1, 1]", "3"),
        new TestCase("[5, 1, 1, 1, 1, 1]", "1"),
        new TestCase("[1, 2, 1, 1, 1]", "3"),
        new TestCase("[2, 1]", "1"),
        new TestCase("[7, 0, 9, 6, 9, 6, 1, 7, 9, 0, 1, 2, 9, 0, 3]", "2"),
    ];

    public string CSharpCallTemplate => "Solution.Jump({input})";
    public string PythonCallTemplate => "jump({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [2, 3, 1, 1, 4];
        var steps = new List<VisualizationStep>();
        int jumps = 0, currentEnd = 0, farthest = 0, levelStart = 0;

        Dictionary<string, object> State() => new()
        {
            ["array"] = nums,
            ["tracker"] = jumps,
            ["trackerLabel"] = "jumps",
        };

        steps.Add(new VisualizationStep(State(), [0],
            "nums = [2, 3, 1, 1, 4]. Level 0 is just index 0 (zero jumps). currentEnd = 0, farthest = 0."));

        for (var i = 0; i < nums.Length - 1; i++)
        {
            farthest = Math.Max(farthest, i + nums[i]);
            var level = Enumerable.Range(levelStart, currentEnd - levelStart + 1).ToArray();
            if (i == currentEnd)
            {
                jumps++;
                var msg = $"i = {i}: farthest = {farthest}. i has reached currentEnd = {currentEnd}, the end of this level, so one more jump is needed. jumps = {jumps}; the next level is indexes {currentEnd + 1} to {Math.Min(farthest, nums.Length - 1)}.";
                levelStart = currentEnd + 1;
                currentEnd = farthest;
                steps.Add(new VisualizationStep(State(), level, msg));
            }
            else
            {
                steps.Add(new VisualizationStep(State(), level,
                    $"i = {i} is inside the current level (ends at {currentEnd}). i + nums[i] = {i + nums[i]}, so farthest = {farthest}."));
            }
        }

        steps.Add(new VisualizationStep(State(), [nums.Length - 1],
            $"The last index lies inside the level reached with {jumps} jumps (it ends at {currentEnd}). Answer: {jumps}."));
        return steps;
    }
}
