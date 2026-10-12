namespace DsaAcademy.Content.Concepts;

public class DpStockCooldown : IConcept
{
    public string Id => "dp-stock-cooldown";
    public string Track => "patterns";
    public string Title => "State-Machine DP: Stock Trading with Cooldown";
    public string OneLiner => "Buy and sell as often as you like, but after a sale you must wait a day -- track the best profit for each state you could be in, day by day.";
    public string KeyTakeaway =>
        "When the rules depend on what you did yesterday, give each \"situation\" its own DP value. Here " +
        "there are three: HOLDING a share, just SOLD (cooling down), and RESTING (free to buy). Each day, " +
        "every state's best profit comes from the states allowed to transition into it -- O(n) time, O(1) space.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Warm-up: with ONE buy and one sell, walk the prices once, remember the lowest price seen so far, and " +
        "the answer is the biggest price - lowestSoFar. Now change the rules: you may complete as many " +
        "trades as you like (holding at most one share at a time), but the day after you sell you can't buy. " +
        "For prices [1, 2, 3, 0, 2] the best is 3: buy at 1, sell at 2, cool down on the 3, buy at 0, sell at 2.\n\n" +
        "The cooldown means the right move today depends on what you did yesterday, so one \"best profit so " +
        "far\" number isn't enough. Instead, describe every situation you can be in at the end of a day and " +
        "track the best profit for each. HOLD: you own a share. SOLD: you sold today, so tomorrow is a " +
        "cooldown. REST: you own nothing and are free to buy tomorrow. Now write down which moves lead into " +
        "each state:\n\n" +
        "hold = max(hold, rest - price): keep holding, or buy today, which is only allowed from REST (not " +
        "from SOLD, which is the cooldown rule). sold = hold + price: you can only sell something you were " +
        "holding. rest = max(rest, sold): stay idle, or yesterday's sale finished cooling down. Compute all " +
        "three from YESTERDAY's values, then replace them together. Start with hold = -infinity (you can't " +
        "own a share before day one), sold = -infinity, rest = 0. The answer is max(sold, rest) after the " +
        "last day; ending while holding is never better than having sold.\n\n" +
        "Drawing the states as circles with arrows for the allowed moves is the technique to remember: once " +
        "the diagram is right, the recurrences write themselves. The same method handles the other stock " +
        "follow-ups interviewers chain together: a transaction fee (subtract it in the sell transition), at " +
        "most k transactions (add the trade count to the state), or no cooldown at all (merge SOLD and REST).\n\n" +
        "The visualization walks [1, 2, 3, 0, 2]; the message shows all three state values after each day.";

    public List<string> RecognitionSignals =>
    [
        "A sequence of days or steps where what you may do next depends on what you did last (holding or not, cooldown, a limit on transactions).",
        "Several \"modes\" you can be in, with fixed rules for moving between them -- draw them as a state diagram and give each one a DP value.",
    ];

    public List<string> Gotchas =>
    [
        "Update all three states from the PREVIOUS day's values. Overwriting hold first and then using the new hold to compute sold lets you buy and sell on the same day.",
        "Buying comes from REST only, not from SOLD -- that one restriction is the cooldown.",
        "Starting hold at 0 instead of -infinity pretends you own a free share; and the answer is max(sold, rest), never hold.",
    ];

    public List<string> ConfusableWith =>
    [
        "1-D DP: House Robber (this track) also forbids back-to-back choices, but has one value per position. Here the choice on each day depends on whether you currently own a share, so you need a value per STATE per day.",
        "Monotonic Stack: Find the Next Greater Element (this track) finds the next higher price for each day; it's tempting for stock problems, but it can't account for the cooldown between trades.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int MaxProfit(int[] prices)\n" +
            "    {\n" +
            "        // TODO: three states. hold = int.MinValue / 2 (can't own a share yet),\n" +
            "        // sold = int.MinValue / 2, rest = 0. For each price, from yesterday's values:\n" +
            "        //   newHold = max(hold, rest - price)  (buy only from rest)\n" +
            "        //   newSold = hold + price\n" +
            "        //   newRest = max(rest, sold)\n" +
            "        // Return max(sold, rest).\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def max_profit(prices):\n" +
            "    # TODO: three states. hold = float('-inf'), sold = float('-inf'),\n" +
            "    # rest = 0. For each price, from yesterday's values:\n" +
            "    #   new_hold = max(hold, rest - price)  (buy only from rest)\n" +
            "    #   new_sold = hold + price\n" +
            "    #   new_rest = max(rest, sold)\n" +
            "    # Return max(sold, rest).\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MaxProfit",
        ["python"] = "max_profit",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.IntArray([1, 2, 3, 0, 2]), "3"),
        new TestCase(Lit.IntArray([1]), "0"),
        new TestCase(Lit.IntArray([]), "0"),
        new TestCase(Lit.IntArray([5, 4, 3, 2, 1]), "0"),
        new TestCase(Lit.IntArray([1, 2, 4]), "3"),
        new TestCase(Lit.IntArray([1, 4, 2, 7]), "6"),
        new TestCase(Lit.IntArray([6, 1, 3, 2, 4, 7]), "6"),
    ];

    public string CSharpCallTemplate => "Solution.MaxProfit({input})";
    public string PythonCallTemplate => "max_profit({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] prices = [1, 2, 3, 0, 2];
        var arr = prices.Select(p => (object)p).ToArray();
        const int NegInf = int.MinValue / 2;
        static string Show(int v) => v <= int.MinValue / 4 ? "-∞" : v.ToString();
        int hold = NegInf, sold = NegInf, rest = 0;
        var steps = new List<VisualizationStep>();

        VisualizationStep Step(int day, string message) => new(
            State: new Dictionary<string, object>
            {
                ["array"] = arr,
                ["tracker"] = Math.Max(sold, rest),
                ["trackerLabel"] = "best profit not holding, max(sold, rest)",
            },
            HighlightIndices: day >= 0 ? [day] : [],
            Message: message
        );

        steps.Add(Step(-1, "Before day 0: hold = -∞ (no share yet), sold = -∞ (nothing sold), rest = 0. Buying is allowed only from rest."));

        for (var day = 0; day < prices.Length; day++)
        {
            var p = prices[day];
            var newHold = Math.Max(hold, rest - p);
            var newSold = hold == NegInf ? NegInf : hold + p;
            var newRest = Math.Max(rest, sold);
            var holdWhy = newHold == hold ? "keep the share" : $"buy at {p} from rest {rest}";
            var soldWhy = newSold == NegInf ? "nothing to sell" : $"sell yesterday's hold at {p}";
            var restWhy = newRest == rest ? "stay idle" : "cooling down after yesterday's sale";
            hold = newHold;
            sold = newSold;
            rest = newRest;
            steps.Add(Step(day,
                $"Day {day}, price {p}: hold = {Show(hold)} ({holdWhy}), sold = {Show(sold)} ({soldWhy}), rest = {Show(rest)} ({restWhy})."));
        }

        steps.Add(Step(-1,
            $"Done: max(sold, rest) = {Math.Max(sold, rest)}. Buy at 1, sell at 2, cool down on day 2, buy at 0, sell at 2."));
        return steps;
    }
}
