namespace DsaAcademy.Content.Concepts;

public class RandomShuffle : IConcept
{
    public string Id => "random-shuffle";
    public string Track => "patterns";
    public string Title => "Randomized: Fisher-Yates Shuffle";
    public string OneLiner => "Shuffle an array so every order is equally likely: walk from the end, swapping each position with a random position at or before it. The random picks are given, so the result can be checked.";
    public string KeyTakeaway =>
        "For i from n - 1 down to 1, pick j uniformly from 0 to i and swap a[i] with a[j]. Position i is then " +
        "final, filled by a uniform choice among the values still unplaced, which makes all n! orders equally " +
        "likely in O(n). Picking j from the WHOLE array each time looks similar but is biased.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Shuffle nums using the Fisher-Yates algorithm. Randomness can't be graded, so the random numbers are " +
        "given to you: picks[t] is the random index the generator returned at step t. Step 0 handles i = n - " +
        "1, step 1 handles i = n - 2, and so on down to i = 1, and picks[t] is always between 0 and i. Return " +
        "the array after all the swaps. For nums [1, 2, 3, 4] with picks [0, 0, 0]: swap positions 3 and 0, " +
        "then 2 and 0, then 1 and 0, giving [2, 3, 4, 1].\n\n" +
        "The algorithm: for i from n - 1 down to 1, let j = picks[n - 1 - i] (in real code, rng.Next(i + 1)), " +
        "and swap a[i] with a[j]. Think of the array as two parts: the unplaced prefix a[0..i] and the " +
        "finished suffix after it. Each step picks one of the i + 1 unplaced values uniformly and moves it " +
        "into position i, where it stays.\n\n" +
        "Why it is fair: the last position gets each value with probability 1/n, the next one gets each " +
        "remaining value with probability 1/(n - 1), and so on. Multiplying, every one of the n! permutations " +
        "has probability 1/n!. It runs in O(n) time and O(1) extra space.\n\n" +
        "The famous bug is swapping a[i] with a[rng.Next(n)], choosing from the whole array every time. That " +
        "makes n^n equally likely sequences of choices, and n^n is not divisible by n! for n > 2, so some " +
        "orders must come up more often than others. Sorting by random keys (OrderBy(x => rng.Next())) is " +
        "unbiased only if keys never tie, and it costs O(n log n). In real code, C# has Random.Shuffle (.NET " +
        "8 and later) and Python has random.shuffle, both Fisher-Yates.\n\n" +
        "The visualization shuffles [10, 20, 30, 40, 50] with picks [2, 3, 0, 1]; highlighted cells are " +
        "final.";

    public List<string> RecognitionSignals => [
        "Shuffle, deal cards, random permutation, or \"each order equally likely\".",
        "Random sampling without replacement from an array (stop Fisher-Yates after k steps).",
    ];

    public List<string> Gotchas => [
        "Choosing j from 0 to n - 1 every step instead of 0 to i biases the result.",
        "rng.Next(i) excludes i itself; use rng.Next(i + 1) so an element can stay where it is.",
        "Map step t to i = n - 1 - t: the first pick belongs to the last position.",
    ];

    public List<string> ConfusableWith => [
        "Reservoir Sampling also gives every item an equal chance, but over a stream whose length you don't know in advance.",
        "Randomized quicksort uses randomness to choose pivots for speed; the output is deterministic. Here the randomness is the output.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] Shuffle(int[] nums, int[] picks)\n" +
            "    {\n" +
            "        var a = nums.ToArray();\n" +
            "        // TODO: for i from a.Length - 1 down to 1: j = picks[a.Length - 1 - i]\n" +
            "        // (in real code: rng.Next(i + 1)); swap a[i] and a[j].\n" +
            "        return a;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def shuffle(nums, picks):\n" +
            "    a = list(nums)\n" +
            "    # TODO: for i from len(a) - 1 down to 1: j = picks[len(a) - 1 - i]\n" +
            "    # (in real code: random.randint(0, i)); swap a[i] and a[j].\n" +
            "    return a\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Shuffle",
        ["python"] = "shuffle",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[1, 2, 3, 4], [0, 0, 0]", "[2,3,4,1]"),
        new TestCase("[1, 2, 3, 4], [3, 2, 1]", "[1,2,3,4]"),
        new TestCase("[1, 2, 3], [1, 1]", "[1,3,2]"),
        new TestCase("[7], []", "[7]"),
        new TestCase("[], []", "[]"),
        new TestCase("[5, 6], [0]", "[6,5]"),
        new TestCase("[10, 20, 30, 40, 50], [2, 3, 0, 1]", "[50,20,10,40,30]"),
    ];

    public string CSharpCallTemplate => "Solution.Shuffle({input})";
    public string PythonCallTemplate => "shuffle({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] a = [10, 20, 30, 40, 50];
        int[] picks = [2, 3, 0, 1];
        var steps = new List<VisualizationStep>
        {
            new(new() { ["array"] = a.ToArray() }, [], "Shuffle [10, 20, 30, 40, 50] with the given picks [2, 3, 0, 1]: one pick per position, from the back."),
        };
        for (var i = a.Length - 1; i >= 1; i--)
        {
            var j = picks[a.Length - 1 - i];
            (a[i], a[j]) = (a[j], a[i]);
            steps.Add(new(new() { ["array"] = a.ToArray(), ["tracker"] = j, ["trackerLabel"] = "j" }, Enumerable.Range(i, a.Length - i).ToArray(),
                $"i = {i}: the pick is j = {j}, one of {i + 1} unplaced slots. Swap positions {i} and {j}; position {i} now holds {a[i]} for good."));
        }
        steps.Add(new(new() { ["array"] = a.ToArray() }, Enumerable.Range(0, a.Length).ToArray(), $"Done: [{string.Join(", ", a)}]. With truly random picks every one of the 120 orders is equally likely."));
        return steps;
    }
}
