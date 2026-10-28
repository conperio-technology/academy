namespace DsaAcademy.Content.Concepts;

public class RandomReservoirSampling : IConcept
{
    public string Id => "random-reservoir-sampling";
    public string Track => "patterns";
    public string Title => "Randomized: Reservoir Sampling";
    public string OneLiner => "Keep a fair random sample of k items from a stream you can only read once and whose length you don't know: item i replaces a random slot with probability k / (i + 1).";
    public string KeyTakeaway =>
        "Fill the reservoir with the first k items. For each later item at index i, draw j uniformly from 0 " +
        "to i; if j < k, the item replaces reservoir[j], otherwise it is dropped. Every item seen so far ends " +
        "up in the sample with the same probability k / (i + 1), using O(k) memory and one pass.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Items arrive one by one from a stream too large to store, maybe of unknown length. Keep a sample of " +
        "k of them such that, at the end, every item had the same chance to be in it. As in Fisher-Yates " +
        "Shuffle, randomness can't be graded, so the draws are given: draws[i] is the random integer from 0 " +
        "to i that the generator returned for the item at index i (the values for i < k are not used). Return " +
        "the reservoir after the whole stream.\n\n" +
        "Algorithm R: put stream[0..k - 1] straight into the reservoir. For each later index i, let j = " +
        "draws[i] (in real code, rng.Next(i + 1)). If j < k, replace reservoir[j] with stream[i]; otherwise " +
        "skip the item. For [10, 20, 30, 40, 50], k = 2 and draws [0, 0, 1, 3, 0]: start [10, 20]; 30 draws 1 " +
        "and replaces 20; 40 draws 3, which is not below 2, so it is skipped; 50 draws 0 and replaces 10. " +
        "Result [50, 30].\n\n" +
        "Why it is fair: item i enters with probability k / (i + 1). Later item m (m > i) then evicts that " +
        "particular slot with probability 1 / (m + 1), so item i survives it with probability m / (m + 1). " +
        "Multiplying from i + 1 to n - 1 telescopes: (k / (i + 1)) · ((i + 1) / (i + 2)) · ... · ((n - 1) / " +
        "n) = k / n, the same for every item. The first k items work out to k / n as well.\n\n" +
        "One pass, O(1) work per item: O(n) time and O(k) space, and you can stop at any moment with a valid " +
        "sample of what has been seen so far. Monitoring and logging systems use it to keep a representative " +
        "handful of examples, and it is the answer to \"pick a random node from a linked list of unknown " +
        "length\" (k = 1: replace the choice with probability 1 / (i + 1)).\n\n" +
        "The visualization runs the example above.";

    public List<string> RecognitionSignals => [
        "A random sample from a stream, a huge file or a linked list, in one pass and without knowing the length.",
        "\"Each item must be chosen with equal probability\" and you can't store everything.",
    ];

    public List<string> Gotchas => [
        "Keeping item i with probability k / n needs n in advance; the point of the algorithm is k / (i + 1), using only what you have seen.",
        "Draw j from 0 to i inclusive; 0 to i - 1 makes the newest item too likely.",
        "If the stream has fewer than k items, the reservoir is simply all of them.",
    ];

    public List<string> ConfusableWith => [
        "Fisher-Yates Shuffle needs the whole array in memory; reservoir sampling never stores more than k items.",
        "Top K with a Heap also keeps k items from a stream, but chooses them by value, not at random.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] ReservoirSample(int[] stream, int k, int[] draws)\n" +
            "    {\n" +
            "        var reservoir = stream.Take(k).ToArray();\n" +
            "        // TODO: for i from k to stream.Length - 1: j = draws[i]\n" +
            "        // (real code: rng.Next(i + 1)); if j < k, reservoir[j] = stream[i].\n" +
            "        return reservoir;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def reservoir_sample(stream, k, draws):\n" +
            "    reservoir = list(stream[:k])\n" +
            "    # TODO: for i from k to len(stream) - 1: j = draws[i]\n" +
            "    # (real code: random.randint(0, i)); if j < k, reservoir[j] = stream[i].\n" +
            "    return reservoir\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.ReservoirSample",
        ["python"] = "reservoir_sample",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[10, 20, 30, 40, 50], 2, [0, 0, 1, 3, 0]", "[50,30]"),
        new TestCase("[10, 20, 30, 40, 50], 2, [0, 0, 2, 3, 4]", "[10,20]"),
        new TestCase("[1, 2, 3], 1, [0, 1, 0]", "[3]"),
        new TestCase("[4, 5, 6, 7, 8, 9], 3, [0, 0, 0, 1, 4, 0]", "[9,7,6]"),
        new TestCase("[9, 8], 5, [0, 0]", "[9,8]"),
        new TestCase("[1, 2, 3, 4], 4, [0, 0, 0, 0]", "[1,2,3,4]"),
    ];

    public string CSharpCallTemplate => "Solution.ReservoirSample({input})";
    public string PythonCallTemplate => "reservoir_sample({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] stream = [10, 20, 30, 40, 50];
        int[] draws = [0, 0, 1, 3, 0];
        const int k = 2;
        var reservoir = stream.Take(k).ToArray();
        var steps = new List<VisualizationStep>
        {
            new(new() { ["array"] = reservoir.ToArray() }, [0, 1], "k = 2: the first two items, 10 and 20, fill the reservoir."),
        };
        for (var i = k; i < stream.Length; i++)
        {
            var j = draws[i];
            if (j < k)
            {
                var old = reservoir[j];
                reservoir[j] = stream[i];
                steps.Add(new(new() { ["array"] = reservoir.ToArray() }, [j], $"Item {stream[i]} (index {i}) draws {j} from 0 to {i}. {j} < {k}, so it replaces {old} in slot {j}. It got in with probability {k}/{i + 1}."));
            }
            else
            {
                steps.Add(new(new() { ["array"] = reservoir.ToArray() }, [], $"Item {stream[i]} (index {i}) draws {j} from 0 to {i}. {j} is not below {k}, so it is skipped."));
            }
        }
        steps.Add(new(new() { ["array"] = reservoir.ToArray() }, [], $"Stream finished: sample [{string.Join(", ", reservoir)}]. Every item had probability 2/5 of ending up here."));
        return steps;
    }
}
