namespace DsaAcademy.Content.Concepts;

public class TwoPointersTrappingRainWater : IConcept
{
    public string Id => "two-pointers-trapping-rain-water";
    public string Track => "patterns";
    public string Title => "Two Pointers: Trapping Rain Water";
    public string OneLiner => "Water above a bar is min(tallest to its left, tallest to its right) minus its height; two pointers find that min without extra arrays.";
    public string KeyTakeaway =>
        "Water at i = min(maxLeft, maxRight) - height[i]. Start pointers at both ends and track leftMax and " +
        "rightMax. Whichever side is LOWER is the bottleneck: its water level is already decided by its own " +
        "max, because the other side is known to have something at least as tall. Settle that side, move it " +
        "inward, repeat. O(n) time, O(1) space.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "An array gives the heights of bars of width 1. After it rains, how many units of water sit between " +
        "them? For [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] the answer is 6.\n\n" +
        "Look at a single position i. Water there rises until it would spill over the lower of the two walls " +
        "around it: the tallest bar anywhere to its left and the tallest bar anywhere to its right. So water[i] " +
        "= min(maxLeft[i], maxRight[i]) - height[i], counting the bar itself in both maxes so it is never " +
        "negative. The straightforward solution precomputes both max arrays in two passes and sums. That is " +
        "O(n) time and O(n) space, and a perfectly good first answer in an interview.\n\n" +
        "The two-pointer version drops the arrays. Put left at 0 and right at n - 1, and keep leftMax (tallest " +
        "seen from the left so far) and rightMax. If height[left] < height[right], then the right side already " +
        "has a bar taller than height[left], so for position left the limiting wall is leftMax, whatever lies " +
        "in between. Update leftMax, add leftMax - height[left], and move left inward. Otherwise do the mirror " +
        "image on the right. Each step settles one position for good, so the pointers meet after n - 1 steps.\n\n" +
        "Interviewers like this one because the greedy move needs a justification: say out loud why the lower " +
        "side is safe to settle. Other answers they accept: the two max arrays above, or a monotonic stack " +
        "that fills water layer by layer as it pops shorter bars. A common follow-up is the 2-D version " +
        "(Trapping Rain Water II), which replaces the two pointers with a min-heap of boundary cells.";

    public List<string> RecognitionSignals =>
    [
        "The answer at each position depends on the maximum to its LEFT and the maximum to its RIGHT (water, skyline, elevation profiles).",
        "A first solution with two precomputed prefix/suffix arrays works, and the follow-up asks for O(1) extra space.",
        "Two ends of an array can be processed independently as long as you always move the side that is \"limited\" -- the same move-the-smaller-side logic as Container With Most Water.",
    ];

    public List<string> Gotchas =>
    [
        "Using only the max on one side (for example, a single left-to-right pass) overcounts water next to a tall left wall with a short right side.",
        "Move the pointer on the LOWER side, not the higher one: only the lower side's water level is guaranteed by its own max.",
        "Update the side's max before adding water, so a new tallest bar adds 0 rather than a negative amount. Empty and single-bar inputs trap 0.",
    ];

    public List<string> ConfusableWith =>
    [
        "Two Pointers: Two Sum on a Sorted Array (this track) also closes in from both ends, but decides which pointer to move by comparing a sum with a target; here you move whichever side has the lower bar.",
        "Prefix Sums: Answer Range-Sum Queries in O(1) (this track) is the precompute-a-running-value idea behind the two max arrays; the two-pointer solution is what lets you skip storing them.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int Trap(int[] height)\n" +
            "    {\n" +
            "        // TODO: left = 0, right = height.Length - 1, leftMax = rightMax = 0.\n" +
            "        // While left < right: if height[left] < height[right], update\n" +
            "        // leftMax, add leftMax - height[left] to the water, left++.\n" +
            "        // Otherwise do the same on the right side and right--.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def trap(height):\n" +
            "    # TODO: left = 0, right = len(height) - 1, left_max = right_max = 0.\n" +
            "    # While left < right: if height[left] < height[right], update\n" +
            "    # left_max, add left_max - height[left] to the water, left += 1.\n" +
            "    # Otherwise do the same on the right side and right -= 1.\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Trap",
        ["python"] = "trap",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]), "6"),
        new TestCase(Lit.IntArray([4, 2, 0, 3, 2, 5]), "9"),
        new TestCase(Lit.IntArray([]), "0"),
        new TestCase(Lit.IntArray([5]), "0"),
        new TestCase(Lit.IntArray([1, 2, 3, 4]), "0"),
        new TestCase(Lit.IntArray([5, 4, 1, 2]), "1"),
        new TestCase(Lit.IntArray([2, 0, 2, 0, 2]), "4"),
    ];

    public string CSharpCallTemplate => "Solution.Trap({input})";
    public string PythonCallTemplate => "trap({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];
        var array = height.Select(h => (object)h).ToArray();
        var steps = new List<VisualizationStep>();
        int left = 0, right = height.Length - 1, leftMax = 0, rightMax = 0, water = 0;

        Dictionary<string, object> State() => new()
        {
            ["array"] = array,
            ["tracker"] = water,
            ["trackerLabel"] = "water so far",
        };

        steps.Add(new VisualizationStep(
            State: State(),
            HighlightIndices: [left, right],
            Message: "Pointers at both ends, leftMax = rightMax = 0. Each step settles the LOWER side, since its water level depends only on its own max."
        ));

        while (left < right)
        {
            string message;
            int settled;
            if (height[left] < height[right])
            {
                settled = left;
                leftMax = Math.Max(leftMax, height[left]);
                var added = leftMax - height[left];
                water += added;
                message = $"height[{left}] = {height[left]} < height[{right}] = {height[right]}, so settle the left side. leftMax = {leftMax}, " +
                          (added > 0 ? $"water here = {leftMax} - {height[left]} = {added}." : "no water fits here.");
                left++;
            }
            else
            {
                settled = right;
                rightMax = Math.Max(rightMax, height[right]);
                var added = rightMax - height[right];
                water += added;
                message = $"height[{right}] = {height[right]} <= height[{left}] = {height[left]}, so settle the right side. rightMax = {rightMax}, " +
                          (added > 0 ? $"water here = {rightMax} - {height[right]} = {added}." : "no water fits here.");
                right--;
            }
            steps.Add(new VisualizationStep(
                State: State(),
                HighlightIndices: [settled],
                Message: message
            ));
        }

        steps.Add(new VisualizationStep(
            State: State(),
            HighlightIndices: [],
            Message: $"The pointers met at index {left}, the tallest bar, which holds no water. Total trapped: {water}."
        ));
        return steps;
    }
}
