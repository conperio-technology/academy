namespace DsaAcademy.Content.Concepts;

public class BlockTopKWords : BuildingBlock
{
    public override string Id => "block-top-k-words";
    public override string Title => "Block: A Heap of Tuples";
    public override string OneLiner => "Return the k most frequent words, most frequent first and ties in alphabetical order, using a min-heap of (priority, word) tuples.";
    public override string KeyTakeaway =>
        "Put the whole ordering into the heap's priority as a tuple. A min-heap pops the smallest, so negate the count to get the most frequent first; the word as the second part breaks ties.";

    public override string Explanation =>
        "Return the k most frequent words in words, sorted by frequency (highest first), and words with the same frequency in alphabetical order. k is at most the number of distinct words.\n" +
        "\n" +
        "Count with a hashmap, then push each word with the priority (-count, word). Python's heapq compares tuples part by part, so heapq.heappush(heap, (-count, word)) and k heappops give the answer. In C#, PriorityQueue<string, (int, string)> works the same way; pass a comparer that compares the count, then the word with string.CompareOrdinal. Top K Frequent, K Closest Points and task schedulers are this block.";

    protected override string[] Plan =>
    [
        "Count each word with a hashmap.",
        "Give each word the priority (negative count, word), so the smallest is the most frequent, ties alphabetical.",
        "Push every word with its priority onto a min-heap.",
        "Pop k times, collecting the words.",
        "Return them.",
    ];

    protected override string CSharpSignature => "public static List<string> TopKWords(string[] words, int k)";
    protected override string CSharpReturnStub => "return new List<string>();";
    protected override string PythonSignature => "def top_k_words(words, k):";
    protected override string PythonReturnStub => "return []";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.TopKWords",
        ["python"] = "top_k_words",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("[\"i\", \"love\", \"leetcode\", \"i\", \"love\", \"coding\"], 2", "[\"i\",\"love\"]"),
        new TestCase("[\"the\", \"day\", \"is\", \"sunny\", \"the\", \"the\", \"the\", \"sunny\", \"is\", \"is\"], 4", "[\"the\",\"is\",\"sunny\",\"day\"]"),
        new TestCase("[\"a\"], 1", "[\"a\"]"),
        new TestCase("[\"b\", \"a\", \"c\"], 2", "[\"a\",\"b\"]"),
        new TestCase("[\"x\", \"y\", \"x\", \"y\", \"z\"], 3", "[\"x\",\"y\",\"z\"]"),
    ];

    public override string CSharpCallTemplate => "Solution.TopKWords({input})";
    public override string PythonCallTemplate => "top_k_words({input})";

    public override List<string> Gotchas =>
    [
        "Using the count as the priority in a min-heap, which pops the least frequent first.",
        "Leaving the tiebreak out of the tuple, so equal counts come out in any order.",
    ];
}
