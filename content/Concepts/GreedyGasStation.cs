namespace DsaAcademy.Content.Concepts;

public class GreedyGasStation : IConcept
{
    public string Id => "greedy-gas-station";
    public string Track => "greedy";
    public int Order => 111;
    public string Title => "Greedy: Gas Station";
    public string OneLiner => "Find the station to start a full loop from: if the tank ever goes negative, no station up to here can be the start.";
    public string KeyTakeaway =>
        "Two facts give an O(n) answer. If total gas < total cost, no start works. Otherwise, run a tank from a " +
        "candidate start; whenever it drops below zero at station i, every station from the candidate up to i " +
        "fails too, so the next candidate is i + 1. The last candidate standing is the answer.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "n gas stations sit on a circular road. Station i has gas[i] litres, and driving from station i to " +
        "station i + 1 (wrapping from the last back to 0) burns cost[i]. You start with an empty tank at some " +
        "station, fill up there, and drive round. Return the index of the station where you can start and get " +
        "all the way round, or -1 if there is none. The problem promises at most one answer. For gas = [1, 2, 3, " +
        "4, 5], cost = [3, 4, 5, 1, 2] the answer is 3.\n\n" +
        "Simulating a loop from every start is O(n^2). Instead look at diff[i] = gas[i] - cost[i], the net change " +
        "in the tank at each step. First fact: if the sum of every diff is negative, you burn more than you can " +
        "ever collect, so return -1. If the sum is zero or more, some start works (that's a theorem; the scan below " +
        "finds it).\n\n" +
        "Second fact, the greedy step. Start at candidate s with tank = 0 and add diff[i] for i = s, s + 1, and so " +
        "on. Suppose the tank first goes negative after station i. Could any station k between s and i be a " +
        "better start? No: you reached k from s with a tank of zero or more, so starting at k with an empty tank " +
        "gives you no more fuel than you had, and you'd still run dry at i. So skip them all: the next candidate " +
        "is i + 1, with the tank reset to 0. One pass over the stations, keeping total and tank, gives the answer " +
        "in O(n) time and O(1) space.\n\n" +
        "Why don't you need to loop back round after picking the last candidate? Because the total is " +
        "non-negative and the stretch before the candidate summed to a negative amount, the stretch from the " +
        "candidate to the end must carry enough surplus to cover it.\n\n" +
        "The visualization shows diff = gas - cost for the example. The tracker is the tank from the current " +
        "candidate.";

    public List<string> RecognitionSignals =>
    [
        "A circular route with gains and costs, asking for a valid starting point.",
        "A running total that must never drop below zero, where a failure lets you rule out a whole stretch of starts at once.",
        "A brute-force O(n^2) \"try every start\" with an obvious O(n) total check sitting next to it.",
    ];

    public List<string> Gotchas =>
    [
        "Reset the tank to 0 when you move the candidate; don't carry the negative amount forward.",
        "Check the grand total separately (or at the end). The candidate after the scan is only valid when total >= 0.",
        "The new candidate is i + 1, not s + 1: every station between s and i is ruled out too.",
    ];

    public List<string> ConfusableWith =>
    [
        "Maximum Subarray (Kadane's algorithm, this track) uses the same \"a negative running sum is never worth keeping, restart after it\" move.",
        "Prefix Sums: the tank from start s at station i is a difference of two prefix sums, and the answer is the station just after the lowest prefix sum.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int CanCompleteCircuit(int[] gas, int[] cost)\n" +
            "    {\n" +
            "        // TODO: keep total (sum of gas[i] - cost[i] over every station), tank\n" +
            "        // (the same sum since the current candidate start) and start = 0.\n" +
            "        // If tank drops below 0 at i, the candidate becomes i + 1 and tank resets to 0.\n" +
            "        // Return start if total >= 0, otherwise -1.\n" +
            "        return -2;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def can_complete_circuit(gas, cost):\n" +
            "    # TODO: keep total (sum of gas[i] - cost[i] over every station), tank\n" +
            "    # (the same sum since the current candidate start) and start = 0.\n" +
            "    # If tank drops below 0 at i, the candidate becomes i + 1 and tank resets to 0.\n" +
            "    # Return start if total >= 0, otherwise -1.\n" +
            "    return -2\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CanCompleteCircuit",
        ["python"] = "can_complete_circuit",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[1, 2, 3, 4, 5], [3, 4, 5, 1, 2]", "3"),
        new TestCase("[2, 3, 4], [3, 4, 3]", "-1"),
        new TestCase("[5], [4]", "0"),
        new TestCase("[2], [2]", "0"),
        new TestCase("[3, 1, 1], [1, 2, 2]", "0"),
        new TestCase("[1, 2], [2, 1]", "1"),
        new TestCase("[5, 1, 2, 3, 4], [4, 4, 1, 5, 1]", "4"),
        new TestCase("[4, 5, 2, 6, 5, 3], [3, 2, 7, 3, 2, 9]", "-1"),
        new TestCase("[1, 1, 1, 10], [2, 2, 2, 1]", "3"),
    ];

    public string CSharpCallTemplate => "Solution.CanCompleteCircuit({input})";
    public string PythonCallTemplate => "can_complete_circuit({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] gas = [1, 2, 3, 4, 5];
        int[] cost = [3, 4, 5, 1, 2];
        var diff = gas.Zip(cost, (g, c) => g - c).ToArray();
        var steps = new List<VisualizationStep>();
        int total = 0, tank = 0, start = 0;

        Dictionary<string, object> State() => new()
        {
            ["array"] = diff,
            ["tracker"] = tank,
            ["trackerLabel"] = $"tank since candidate {start}",
        };

        steps.Add(new VisualizationStep(State(), [],
            "gas = [1, 2, 3, 4, 5], cost = [3, 4, 5, 1, 2]. The cells show diff = gas - cost: what one station plus the drive after it adds to the tank. Candidate start = 0."));

        for (var i = 0; i < diff.Length; i++)
        {
            total += diff[i];
            tank += diff[i];
            if (tank < 0)
            {
                steps.Add(new VisualizationStep(State(), Enumerable.Range(start, i - start + 1).ToArray(),
                    $"Station {i}: tank = {tank}, below zero. No station from {start} to {i} can be the start. Next candidate: {i + 1}, tank reset to 0. (total so far {total})"));
                start = i + 1;
                tank = 0;
            }
            else
            {
                steps.Add(new VisualizationStep(State(), Enumerable.Range(start, i - start + 1).ToArray(),
                    $"Station {i}: diff {diff[i]}, tank = {tank} >= 0. Candidate {start} survives. (total so far {total})"));
            }
        }

        steps.Add(new VisualizationStep(State(), [start],
            $"total = {total} >= 0, so a full loop exists, and the surviving candidate is station {start}. Answer: {start}."));
        return steps;
    }
}
