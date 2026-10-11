namespace DsaAcademy.Content.Concepts;

// Transfer exercise after House Robber: the street becomes a circle, so the first and last house
// are neighbours. Solved by reducing to the linear version twice.
public class DpHouseRobberCircular : IConcept
{
    public string Id => "dp-house-robber-circular";
    public string Track => "patterns";
    public string Title => "Transfer: House Robber on a Circular Street";
    public string OneLiner => "Same no-two-neighbours rule, but the houses form a circle. Break the circle into two straight streets and reuse the linear answer.";
    public string KeyTakeaway =>
        "When a changed requirement adds one constraint that couples the ends, split on it: either the first " +
        "house is skipped or the last one is (both can't be robbed). Each case is the original linear " +
        "problem on a shorter range, so the answer is the max of two runs of code you already have.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;
    public string? TransferOf => "dp-house-robber";

    public string Explanation =>
        "This follows House Robber with one requirement changed: the houses stand in a circle, so house 0 " +
        "and house n - 1 are neighbours too. Return the most you can collect without robbing two neighbours. " +
        "For [2, 3, 2] the answer is 3: robbing both 2s is no longer allowed, because they are neighbours.\n\n" +
        "Running the linear recurrence once is wrong, since it may pick both ends. Trying to patch the " +
        "recurrence with a flag (\"did I rob house 0?\") works but is easy to get wrong. The cleaner move is " +
        "to split on the new constraint. In any valid choice, at least one of house 0 and house n - 1 is " +
        "skipped. If house 0 is skipped, the rest, houses 1 to n - 1, is an ordinary straight street; if house " +
        "n - 1 is skipped, houses 0 to n - 2 are. Every valid circular choice is a valid choice in one of the " +
        "two straight streets, and every choice in either straight street is valid on the circle, so the " +
        "answer is the larger of the two linear answers.\n\n" +
        "Write the linear solver once as a helper that takes a range (start and end index) and use the same " +
        "two rolling variables as before: cur = max(prev1, prev2 + nums[i]). Watch the small cases: no houses " +
        "gives 0, and a single house has no neighbour at all, so the answer is its value (both ranges would be " +
        "empty otherwise). Two linear passes, O(n) time and O(1) space.\n\n" +
        "The visualization runs [2, 7, 9, 3, 1] as a circle: first the street without the last house, then the " +
        "street without the first house.\n\n" +
        "Explain why the same idea works: before you move on, write two or three sentences on why the two " +
        "straight streets cover every valid circular choice and nothing invalid. Then name another problem " +
        "where a constraint joining the two ends could be handled the same way, by splitting into cases that " +
        "each reduce to a problem you already solved.";

    public List<string> RecognitionSignals =>
    [
        "A known linear DP, but the sequence is circular: the first and last items now interact.",
        "A constraint that couples two specific positions, which you can remove by splitting into a small number of cases.",
    ];

    public List<string> Gotchas =>
    [
        "One house: return its value. Excluding the first or the last house would leave nothing.",
        "The two ranges are 0..n-2 and 1..n-1, both inclusive. Off by one here silently drops a house.",
        "Running the linear version on the whole array can rob both ends: [2, 3, 2] would give 4 instead of 3.",
    ];

    public List<string> ConfusableWith =>
    [
        "1-D DP: House Robber is the same recurrence on a straight street; this version only adds the case split around it.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int RobCircle(int[] nums)\n" +
            "    {\n" +
            "        // TODO: handle 0 houses (0) and 1 house (its value). Otherwise write a\n" +
            "        // helper that runs the linear House Robber on nums[lo..hi] with prev2 and\n" +
            "        // prev1 (cur = max(prev1, prev2 + nums[i])). Return the larger of the\n" +
            "        // helper on 0..n-2 (skip the last house) and on 1..n-1 (skip the first).\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def rob_circle(nums):\n" +
            "    # TODO: handle 0 houses (0) and 1 house (its value). Otherwise write a\n" +
            "    # helper that runs the linear House Robber on nums[lo..hi] with prev2 and\n" +
            "    # prev1 (cur = max(prev1, prev2 + nums[i])). Return the larger of the\n" +
            "    # helper on 0..n-2 (skip the last house) and on 1..n-1 (skip the first).\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.RobCircle",
        ["python"] = "rob_circle",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([2, 3, 2]), "3"),
        new TestCase(Lit.IntArray([1, 2, 3, 1]), "4"),
        new TestCase(Lit.IntArray([1, 2, 3]), "3"),
        new TestCase(Lit.IntArray([5]), "5"),
        new TestCase(Lit.IntArray([]), "0"),
        new TestCase(Lit.IntArray([2, 1]), "2"),
        new TestCase(Lit.IntArray([200, 3, 140, 20, 10]), "340"),
        new TestCase(Lit.IntArray([1, 3, 1, 3, 100]), "103"),
        new TestCase(Lit.IntArray([2, 7, 9, 3, 1]), "11"),
    ];

    public string CSharpCallTemplate => "Solution.RobCircle({input})";
    public string PythonCallTemplate => "rob_circle({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] houses = [2, 7, 9, 3, 1];
        var arr = houses.Select(h => (object)h).ToArray();
        var steps = new List<VisualizationStep>();

        steps.Add(new VisualizationStep(
            new Dictionary<string, object> { ["array"] = arr, ["tracker"] = 0, ["trackerLabel"] = "best so far" },
            [0, 4],
            "Houses [2, 7, 9, 3, 1] in a circle: house 0 and house 4 are now neighbours. On a straight street the best was 12 (2 + 9 + 1), which robs both ends. Not allowed any more."
        ));

        var results = new List<int>();
        foreach (var (lo, hi, label) in new[] { (0, houses.Length - 2, "without the last house"), (1, houses.Length - 1, "without the first house") })
        {
            int prev2 = 0, prev1 = 0;
            for (var i = lo; i <= hi; i++)
            {
                var skip = prev1;
                var take = prev2 + houses[i];
                prev2 = prev1;
                prev1 = Math.Max(skip, take);
                steps.Add(new VisualizationStep(
                    new Dictionary<string, object> { ["array"] = arr, ["tracker"] = prev1, ["trackerLabel"] = $"best {label}" },
                    [i],
                    $"Street {label} (houses {lo} to {hi}), house {i} worth {houses[i]}: skip it ({skip}) or rob it ({take}). Best so far {prev1}."
                ));
            }
            results.Add(prev1);
        }

        steps.Add(new VisualizationStep(
            new Dictionary<string, object> { ["array"] = arr, ["tracker"] = Math.Max(results[0], results[1]), ["trackerLabel"] = "answer" },
            [],
            $"Without the last house the best is {results[0]}; without the first it is {results[1]}. The circle's answer is the larger: {Math.Max(results[0], results[1])}."
        ));
        return steps;
    }
}
