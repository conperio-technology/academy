namespace DsaAcademy.Content.Concepts;

public class ArrayProductExceptSelf : IConcept
{
    public string Id => "array-product-except-self";
    public string Track => "patterns";
    public string Title => "Prefix Products: Product of Array Except Self";
    public string OneLiner => "For each position, the product of every other element, without division: multiply the product of everything to its left by the product of everything to its right.";
    public string KeyTakeaway =>
        "answer[i] = (product of nums[0..i - 1]) · (product of nums[i + 1..n - 1]). Fill answer with running " +
        "left products in one pass, then sweep from the right multiplying in a running right product. Two " +
        "passes, O(n), and O(1) extra space besides the output. No division, so zeros need no special cases.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Return an array where answer[i] is the product of all elements of nums except nums[i], in O(n) time " +
        "and without using division. [1, 2, 3, 4] gives [24, 12, 8, 6].\n\n" +
        "Dividing the total product by nums[i] is the obvious idea and the one that's ruled out, partly " +
        "because zeros break it: with one zero, every other answer is 0 and the zero's own answer is the " +
        "product of the rest; with two zeros, everything is 0. The prefix approach handles all of that " +
        "without a single special case.\n\n" +
        "Split \"everything except i\" into \"everything before i\" and \"everything after i\". Those are prefix " +
        "and suffix products, the multiplicative cousin of Prefix Sums. Pass 1, left to right: keep prefix = " +
        "1; set answer[i] = prefix, then prefix *= nums[i]. Now answer[i] holds the product of everything to " +
        "the left. Pass 2, right to left: keep suffix = 1; multiply answer[i] by suffix, then suffix *= " +
        "nums[i]. Now each answer[i] also includes everything to the right.\n\n" +
        "Two passes, O(n) time. Using the output array to hold the left products means only two running " +
        "variables of extra space, O(1) (the output itself is usually not counted). Building separate left " +
        "and right arrays first is a fine stepping stone at O(n) space.\n\n" +
        "The visualization runs [1, 2, 3, 4]: the array is answer after each step.";

    public List<string> RecognitionSignals => [
        "\"For each element, combine all the OTHER elements\": split into a prefix part and a suffix part.",
        "Division (or subtraction) is banned or breaks on zeros.",
    ];

    public List<string> Gotchas => [
        "Updating prefix before writing answer[i] includes nums[i] in its own product.",
        "Starting prefix or suffix at 0 instead of 1 zeroes everything.",
        "Dividing the total product fails when the array contains zeros.",
    ];

    public List<string> ConfusableWith => [
        "Prefix Sums answers range-sum queries from one prefix array; here each answer combines a prefix with a suffix.",
        "Trapping Rain Water also needs a left-side and right-side summary for each position (max height), computed by the same two sweeps.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] ProductExceptSelf(int[] nums)\n" +
            "    {\n" +
            "        var answer = new int[nums.Length];\n" +
            "        // TODO: pass 1, left to right: prefix = 1; answer[i] = prefix; prefix *= nums[i].\n" +
            "        // Pass 2, right to left: suffix = 1; answer[i] *= suffix; suffix *= nums[i].\n" +
            "        return answer;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def product_except_self(nums):\n" +
            "    answer = [1] * len(nums)\n" +
            "    # TODO: pass 1, left to right: prefix = 1; answer[i] = prefix; prefix *= nums[i].\n" +
            "    # Pass 2, right to left: suffix = 1; answer[i] *= suffix; suffix *= nums[i].\n" +
            "    return answer\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.ProductExceptSelf",
        ["python"] = "product_except_self",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[1, 2, 3, 4]", "[24,12,8,6]"),
        new TestCase("[-1, 1, 0, -3, 3]", "[0,0,9,0,0]"),
        new TestCase("[2, 3]", "[3,2]"),
        new TestCase("[0, 0]", "[0,0]"),
        new TestCase("[5, 1, 1, 1]", "[1,5,5,5]"),
        new TestCase("[2, -3, 4, -5]", "[60,-40,30,-24]"),
        new TestCase("[0, 4, 0]", "[0,0,0]"),
    ];

    public string CSharpCallTemplate => "Solution.ProductExceptSelf({input})";
    public string PythonCallTemplate => "product_except_self({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] nums = [1, 2, 3, 4];
        var answer = new int[nums.Length];
        var steps = new List<VisualizationStep>
        {
            new(new() { ["array"] = answer.ToArray() }, [], "nums = [1, 2, 3, 4]. Pass 1 writes the product of everything to the left of each position."),
        };
        var prefix = 1;
        for (var i = 0; i < nums.Length; i++)
        {
            answer[i] = prefix;
            steps.Add(new(new() { ["array"] = answer.ToArray(), ["tracker"] = i, ["trackerLabel"] = "i" }, [i], $"answer[{i}] = left product {prefix}. Then prefix *= {nums[i]} gives {prefix * nums[i]}."));
            prefix *= nums[i];
        }
        var suffix = 1;
        for (var i = nums.Length - 1; i >= 0; i--)
        {
            answer[i] *= suffix;
            steps.Add(new(new() { ["array"] = answer.ToArray(), ["tracker"] = i, ["trackerLabel"] = "i" }, [i], $"Pass 2: answer[{i}] *= right product {suffix}, giving {answer[i]}. Then suffix *= {nums[i]} gives {suffix * nums[i]}."));
            suffix *= nums[i];
        }
        steps.Add(new(new() { ["array"] = answer.ToArray() }, [], $"Done: [{string.Join(", ", answer)}], with no division."));
        return steps;
    }
}
