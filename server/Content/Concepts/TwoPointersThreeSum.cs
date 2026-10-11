namespace DsaAcademy.Content.Concepts;

// Transfer exercise after sorted Two Sum: the requirement changes from one pair to every
// distinct triplet, which becomes "fix one number, run the two pointer scan on the rest".
public class TwoPointersThreeSum : IConcept
{
    public string Id => "two-pointers-three-sum";
    public string Track => "patterns";
    public string Title => "Transfer: 3Sum, Every Triplet That Sums to Zero";
    public string OneLiner => "Find every distinct triplet that adds up to 0. Sort once, fix the first number, and the rest is the sorted Two Sum scan you already know.";
    public string KeyTakeaway =>
        "A k-sum problem on sorted input peels down to two pointers: fix nums[i], then find pairs summing to " +
        "-nums[i] in the part to its right with left and right moving inward. Skipping equal neighbours, both " +
        "for the fixed number and after each match, is what keeps the triplets distinct.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;
    public string? TransferOf => "two-pointers-sorted-two-sum";

    public string Explanation =>
        "This follows Two Sum on a Sorted Array, with the requirement changed twice: three numbers instead " +
        "of two, and every answer instead of one. Given an unsorted array nums, return every distinct " +
        "triplet [a, b, c] of values at three different positions with a + b + c = 0. Write each triplet in " +
        "ascending order and list the triplets in ascending order (compare the first value, then the second), " +
        "with no triplet repeated.\n\n" +
        "Trying every triple is O(n^3). Sort first (O(n log n), and it also makes duplicate handling easy). " +
        "Then for each index i, the question \"which two numbers to the right of i sum to -nums[i]?\" is " +
        "exactly the sorted Two Sum problem on nums[i + 1 ..]: left = i + 1, right = n - 1, move left up when " +
        "the sum is too small and right down when it is too big. The only change inside the scan is that a " +
        "match does not end it: record the triplet, move both pointers inward, and keep going, because " +
        "other pairs may also work.\n\n" +
        "Duplicates are the part that needs care. If nums[i] equals nums[i - 1], every triplet it could start " +
        "was already found, so skip it. After a match, step left past every copy of the value just used (and " +
        "right likewise), or [-2, 0, 0, 2, 2] reports [-2, 0, 2] twice. Because the array is sorted and i, " +
        "left and right only move forward and inward, the triplets come out already in the required order.\n\n" +
        "A small speed-up: once nums[i] is greater than 0, everything to its right is too, so no triplet " +
        "can sum to 0 and the outer loop can stop. Overall O(n^2): n choices of i, each with an O(n) scan.\n\n" +
        "The visualization runs the sorted array [-4, -1, -1, 0, 1, 2]; the highlighted cells are i, left and " +
        "right.\n\n" +
        "Explain why the same idea works: before you move on, write two or three sentences on why the " +
        "two pointer scan is still correct inside each fixed i. Why does moving left up (or right down) " +
        "never skip a valid pair, and what exactly does sorting buy you twice in this problem?";

    public List<string> RecognitionSignals =>
    [
        "Find all distinct combinations of a fixed small size (three, four) that hit a target sum.",
        "You are allowed to sort, and the answer is about values, not original indices.",
    ];

    public List<string> Gotchas =>
    [
        "Skip a fixed value equal to the previous one, and skip repeats after each match, or the same triplet appears more than once.",
        "Don't stop the scan at the first match: other pairs to the right of i can also work.",
        "A hash set of triplets removes duplicates too, but costs extra memory and still needs sorted triplets to compare.",
    ];

    public List<string> ConfusableWith =>
    [
        "Hash Maps: Two Sum keeps a map because its input is unsorted and it must return original indices. Here sorting is allowed, so two pointers need no map.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static List<int[]> ThreeSum(int[] nums)\n" +
            "    {\n" +
            "        // TODO: sort a copy of nums. For each i (skip i when nums[i] equals\n" +
            "        // nums[i - 1]): left = i + 1, right = last index. While left < right,\n" +
            "        // compare nums[i] + nums[left] + nums[right] to 0. Too small -> left++.\n" +
            "        // Too big -> right--. Zero -> record [nums[i], nums[left], nums[right]],\n" +
            "        // then move both pointers inward past any repeats of those values.\n" +
            "        return new List<int[]>();\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def three_sum(nums):\n" +
            "    # TODO: sort a copy of nums. For each i (skip i when nums[i] equals\n" +
            "    # nums[i - 1]): left = i + 1, right = last index. While left < right,\n" +
            "    # compare nums[i] + nums[left] + nums[right] to 0. Too small -> left += 1.\n" +
            "    # Too big -> right -= 1. Zero -> record [nums[i], nums[left], nums[right]],\n" +
            "    # then move both pointers inward past any repeats of those values.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.ThreeSum",
        ["python"] = "three_sum",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([-1, 0, 1, 2, -1, -4]), "[[-1,-1,2],[-1,0,1]]"),
        new TestCase(Lit.IntArray([0, 1, 1]), "[]"),
        new TestCase(Lit.IntArray([0, 0, 0]), "[[0,0,0]]"),
        new TestCase(Lit.IntArray([0, 0, 0, 0]), "[[0,0,0]]"),
        new TestCase(Lit.IntArray([]), "[]"),
        new TestCase(Lit.IntArray([-2, 0, 1, 1, 2]), "[[-2,0,2],[-2,1,1]]"),
        new TestCase(Lit.IntArray([2, -2, 0, 2, 0, -2]), "[[-2,0,2]]"),
        new TestCase(Lit.IntArray([-4, -2, -2, -2, 0, 1, 2, 2, 2, 3, 3, 4, 4, 6, 6]),
            "[[-4,-2,6],[-4,0,4],[-4,1,3],[-4,2,2],[-2,-2,4],[-2,0,2]]"),
    ];

    public string CSharpCallTemplate => "Solution.ThreeSum({input})";
    public string PythonCallTemplate => "three_sum({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [-4, -1, -1, 0, 1, 2];
        var arr = nums.Select(n => (object)n).ToArray();
        var steps = new List<VisualizationStep>();
        var found = new List<string>();

        Dictionary<string, object> State() => new()
        {
            ["array"] = arr,
            ["tracker"] = found.Count,
            ["trackerLabel"] = "triplets found",
        };

        steps.Add(new VisualizationStep(State(), [],
            "Sorted: [-4, -1, -1, 0, 1, 2]. Fix each i in turn and look for a pair to its right summing to -nums[i]."));

        for (var i = 0; i < nums.Length - 2; i++)
        {
            if (i > 0 && nums[i] == nums[i - 1])
            {
                steps.Add(new VisualizationStep(State(), [i],
                    $"i = {i}: nums[{i}] = {nums[i]} equals the previous value, so every triplet it starts was already found. Skip it."));
                continue;
            }
            if (nums[i] > 0) break;
            int left = i + 1, right = nums.Length - 1;
            while (left < right)
            {
                var sum = nums[i] + nums[left] + nums[right];
                if (sum < 0)
                {
                    steps.Add(new VisualizationStep(State(), [i, left, right],
                        $"i = {i}: {nums[i]} + {nums[left]} + {nums[right]} = {sum}, too small. left++."));
                    left++;
                }
                else if (sum > 0)
                {
                    steps.Add(new VisualizationStep(State(), [i, left, right],
                        $"i = {i}: {nums[i]} + {nums[left]} + {nums[right]} = {sum}, too big. right--."));
                    right--;
                }
                else
                {
                    found.Add($"[{nums[i]}, {nums[left]}, {nums[right]}]");
                    steps.Add(new VisualizationStep(State(), [i, left, right],
                        $"i = {i}: {nums[i]} + {nums[left]} + {nums[right]} = 0. Record [{nums[i]}, {nums[left]}, {nums[right]}], then move both pointers inward past repeats and keep scanning."));
                    var lv = nums[left];
                    var rv = nums[right];
                    while (left < right && nums[left] == lv) left++;
                    while (left < right && nums[right] == rv) right--;
                }
            }
        }

        steps.Add(new VisualizationStep(State(), [],
            $"Done: {string.Join(", ", found)}. Each fixed i ran the sorted Two Sum scan once, so the whole thing is O(n^2)."));
        return steps;
    }
}
