namespace DsaAcademy.Content.Concepts;

public class InterChunkList : IConcept
{
    public string Id => "inter-chunk-list";
    public string Section => Basics.Section;
    public string Track => Inter.Track;
    public int Order => 1401;
    public string Title => "Split into Chunks with yield";
    public string OneLiner => "Write a lazy iterator that cuts any sequence, even an endless one, into lists of a given size.";
    public string KeyTakeaway =>
        "Collect items into a small buffer and yield it each time it fills, then yield whatever is left at the end. " +
        "Because nothing is read ahead, the same code works on a list, a file or an endless sequence, using memory for " +
        "one chunk at a time.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write Chunks(items, size), which yields the items in lists of size items each, in order; the last chunk may be " +
        "shorter. Chunks([1, 2, 3, 4, 5], 2) yields [1, 2], [3, 4] and then [5]. An empty input yields nothing. size is " +
        "at least 1.\n\n" +
        "The input is any sequence, IEnumerable<int> in C# and any iterable in Python, and it may never end: one test " +
        "passes the endless sequence 1, 2, 3, ... and takes just the first few chunks. So you can't ask for its length, " +
        "index into it, slice it, or turn it into a list first (that would never finish). Loop over it once with " +
        "foreach / for.\n\n" +
        "Keep a list for the current chunk. Add each item; when the chunk reaches size, yield it and start a new list " +
        "(in C#, a new List<int>, not Clear() on the old one, which the caller already holds). After the loop, yield " +
        "the last chunk if it isn't empty. The C# method returns IEnumerable<List<int>> and uses yield return; the " +
        "Python function uses yield. The tests show the chunks as a list of lists, with an endlessChunks argument " +
        "saying how many chunks to take from the endless sequence (0 means use the given items).";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static IEnumerable<List<int>> Chunks(IEnumerable<int> items, int size)\n" +
            "    {\n" +
            "        var chunk = new List<int>();\n" +
            "        foreach (var item in items)\n" +
            "        {\n" +
            "            // TODO: add the item; when the chunk is full, yield return it and start a new one.\n" +
            "        }\n" +
            "        // TODO: yield the last, shorter chunk if there is one.\n" +
            "        yield break;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def chunks(items, size):\n" +
            "    chunk = []\n" +
            "    for item in items:\n" +
            "        pass  # TODO: add the item; when the chunk is full, yield it and start a new one.\n" +
            "    # TODO: yield the last, shorter chunk if there is one.\n" +
            "    yield from ()\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Chunks",
        ["python"] = "chunks",
    };

    // endlessChunks = 0 chunks the given items; otherwise the source is 1, 2, 3, ... forever and that many chunks are taken.
    public string? CSharpHarnessPreamble =>
        "public static class ChunkCheck\n" +
        "{\n" +
        "    public static List<List<int>> Check(int[] items, int size, int endlessChunks)\n" +
        "    {\n" +
        "        if (endlessChunks == 0) return Solution.Chunks(items, size).ToList();\n" +
        "        return Solution.Chunks(Naturals(), size).Take(endlessChunks).ToList();\n" +
        "    }\n" +
        "\n" +
        "    private static IEnumerable<int> Naturals()\n" +
        "    {\n" +
        "        for (var n = 1; ; n++) yield return n;\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "import itertools as _itertools\n" +
        "\n" +
        "\n" +
        "def check_chunks(items, size, endless_chunks):\n" +
        "    if endless_chunks == 0:\n" +
        "        return [list(c) for c in chunks(items, size)]\n" +
        "    endless = _itertools.count(1)\n" +
        "    return [list(c) for c in _itertools.islice(chunks(endless, size), endless_chunks)]\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3, 4, 5]), Lit.Int(2), Lit.Int(0)), "[[1, 2], [3, 4], [5]]"),
        new TestCase(Lit.Args(Lit.IntArray([1, 2, 3]), Lit.Int(3), Lit.Int(0)), "[[1, 2, 3]]"),
        new TestCase(Lit.Args(Lit.IntArray([]), Lit.Int(4), Lit.Int(0)), "[]"),
        new TestCase(Lit.Args(Lit.IntArray([7]), Lit.Int(1), Lit.Int(0)), "[[7]]"),
        new TestCase(Lit.Args(Lit.IntArray([]), Lit.Int(3), Lit.Int(2)), "[[1, 2, 3], [4, 5, 6]]"),
        new TestCase(Lit.Args(Lit.IntArray([]), Lit.Int(1), Lit.Int(3)), "[[1], [2], [3]]"),
    ];

    public string CSharpCallTemplate => "ChunkCheck.Check({input})";
    public string PythonCallTemplate => "check_chunks({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] sample = [1, 2, 3, 4, 5];
        var arr = Basics.Boxed(sample);
        var steps = new List<VisualizationStep> { Basics.Step(arr, [], "[]", "chunk", "Chunks of 2. The current chunk starts empty.") };
        var chunk = new List<int>();
        for (var i = 0; i < sample.Length; i++)
        {
            chunk.Add(sample[i]);
            if (chunk.Count == 2)
            {
                steps.Add(Basics.Step(arr, [i - 1, i], "[" + string.Join(", ", chunk) + "]", "chunk", $"The chunk is full: yield it. The caller gets [{string.Join(", ", chunk)}] now, before {(i + 1 < sample.Length ? sample[i + 1].ToString() : "anything else")} is even read."));
                chunk = [];
            }
            else steps.Add(Basics.Step(arr, [i], "[" + string.Join(", ", chunk) + "]", "chunk", $"Add {sample[i]}."));
        }
        steps.Add(Basics.Step(arr, [4], "[5]", "chunk", "The input ran out with [5] left over: yield it as the last, shorter chunk."));
        return steps;
    }
}
