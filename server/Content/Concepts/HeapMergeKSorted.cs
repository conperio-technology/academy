namespace DsaAcademy.Content.Concepts;

public class HeapMergeKSorted : IConcept
{
    public string Id => "heap-merge-k-sorted";
    public string Track => "patterns";
    public string Title => "K-way Merge: Merge K Sorted Arrays";
    public string OneLiner => "Merge k sorted arrays into one by keeping only each array's current head in a min-heap: the heap's top is always the next value of the output.";
    public string KeyTakeaway =>
        "The next output value must be the head of one of the k lists, so you never need more than k " +
        "candidates at once. Keep those k heads in a min-heap of (value, which list, position); pop the " +
        "smallest, append it, and push the next value from the SAME list. Each of the n values is pushed " +
        "and popped once: O(n log k).";
    public VisualizerKind VisualizerKind => VisualizerKind.Tree;

    public string Explanation =>
        "Given k arrays, each sorted ascending, return one sorted array containing every value from all of " +
        "them. For [[1, 4, 5], [1, 3, 4], [2, 6]] the answer is [1, 1, 2, 3, 4, 4, 5, 6]. Concatenating " +
        "everything and sorting works in O(n log n), where n is the total number of values, but it throws " +
        "away the fact that each array is already sorted.\n\n" +
        "Think about how you merge TWO sorted arrays: a pointer into each, compare the two values under the " +
        "pointers, take the smaller, advance that pointer. With k arrays the same idea needs the smallest of " +
        "k values under k pointers at every step. Scanning all k heads each time costs O(k) per output " +
        "value, O(n·k) in total. A min-heap answers \"which head is smallest\" in O(log k) instead.\n\n" +
        "Start by pushing the first value of every non-empty array into a min-heap, along with which array " +
        "it came from and its position there. Then repeat until the heap is empty: pop the smallest entry, " +
        "append its value to the output, and if that array has another value, push it. The heap never " +
        "holds more than k entries (one per array), every value goes in and comes out exactly once, and " +
        "each heap operation costs O(log k), so the whole merge is O(n log k).\n\n" +
        "The entry must remember where it came from: when you pop a value you need to know which array to " +
        "pull the replacement from. In C# use PriorityQueue<(int List, int Pos), int> with the value as the " +
        "priority; in Python push tuples (value, list_index, position) with heapq, which compares tuples " +
        "element by element, so ties on value fall back to the list index and never try to compare " +
        "anything that can't be compared. The same pattern merges k sorted linked lists, k sorted files " +
        "too big for memory, or finds the smallest range covering one value from each of k lists.\n\n" +
        "The visualization merges [[1, 4, 7], [2, 5], [3, 6, 8]] and draws the heap as a tree (the values " +
        "only); the message says which array each entry came from and what the output holds so far.";

    public List<string> RecognitionSignals =>
    [
        "Several inputs that are EACH already sorted, and you need one combined sorted output (or the overall smallest few values across them).",
        "\"k sorted lists\", \"k sorted files\", or a matrix whose rows are sorted and you need the k-th smallest overall.",
        "Merging two sorted arrays is easy, and the problem is that same merge with many inputs.",
    ];

    public List<string> Gotchas =>
    [
        "After popping, push the next value from the array the popped value CAME FROM, not from whichever array you happen to be looking at; the heap entry has to carry that array's index.",
        "Skip empty arrays when seeding the heap, and check the position before pushing a replacement, or you'll index past the end of a short array.",
        "In Python, pushing (value, array) without an index makes heapq compare the arrays themselves on ties -- needless element-by-element work here, and a TypeError when the payload isn't comparable (ListNode objects in the linked-list version); (value, list_index, position) always has a cheap, comparable tie-breaker.",
    ];

    public List<string> ConfusableWith =>
    [
        "Top-K with a Heap (this track) also keeps a small heap, but it caps the heap at k by evicting the extreme and keeps what survives. Here the heap holds one CURRENT HEAD per input and every value passes through it once on its way to the output.",
        "Merging two sorted arrays uses two pointers and a single comparison per step. With k inputs that comparison becomes \"smallest of k\", which is the job the heap takes over.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int[] MergeKSorted(int[][] lists)\n" +
            "    {\n" +
            "        // TODO: a PriorityQueue<(int List, int Pos), int> keyed by value. Push\n" +
            "        // (i, 0) for every non-empty lists[i]. While the heap isn't empty:\n" +
            "        // Dequeue the smallest, append lists[List][Pos] to the output, and if\n" +
            "        // Pos + 1 is still inside that list, push (List, Pos + 1).\n" +
            "        return new int[0];\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "import heapq\n\n\n" +
            "def merge_k_sorted(lists):\n" +
            "    # TODO: a heap of (value, list_index, position). Push the first value\n" +
            "    # of every non-empty list. While the heap isn't empty: heappop the\n" +
            "    # smallest, append its value to the output, and if that list has a\n" +
            "    # value at position + 1, push it.\n" +
            "    return []\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MergeKSorted",
        ["python"] = "merge_k_sorted",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[[1, 4, 5], [1, 3, 4], [2, 6]]", "[1,1,2,3,4,4,5,6]"),
        new TestCase("[[1, 2, 3], [4, 5, 6], [7, 8, 9]]", "[1,2,3,4,5,6,7,8,9]"),
        new TestCase("[[-3, 0, 7], [-5, -5, 10], [2]]", "[-5,-5,-3,0,2,7,10]"),
        new TestCase("[[2, 2], [2], [1, 2]]", "[1,2,2,2,2]"),
        new TestCase("[[5]]", "[5]"),
        new TestCase("[[], [1]]", "[1]"),
        new TestCase("[[]]", "[]"),
        new TestCase("[]", "[]"),
    ];

    public string CSharpCallTemplate => "Solution.MergeKSorted({input})";
    public string PythonCallTemplate => "merge_k_sorted({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[][] lists = [[1, 4, 7], [2, 5], [3, 6, 8]];
        var heap = new List<(int Value, int List, int Pos)>();
        var output = new List<int>();
        var steps = new List<VisualizationStep>();

        bool Less((int Value, int List, int Pos) a, (int Value, int List, int Pos) b) =>
            a.Value < b.Value || (a.Value == b.Value && a.List < b.List);

        object Snapshot() => heap.Select(e => (int?)e.Value).ToArray();
        string Entries() => string.Join(", ", heap.Select(e => $"{e.Value} (list {e.List})"));
        string Output() => "[" + string.Join(", ", output) + "]";

        void Push((int Value, int List, int Pos) entry)
        {
            heap.Add(entry);
            var i = heap.Count - 1;
            while (i > 0 && Less(heap[i], heap[(i - 1) / 2]))
            {
                (heap[i], heap[(i - 1) / 2]) = (heap[(i - 1) / 2], heap[i]);
                i = (i - 1) / 2;
            }
        }

        (int Value, int List, int Pos) Pop()
        {
            var top = heap[0];
            heap[0] = heap[^1];
            heap.RemoveAt(heap.Count - 1);
            var i = 0;
            while (true)
            {
                int left = 2 * i + 1, right = 2 * i + 2, smallest = i;
                if (left < heap.Count && Less(heap[left], heap[smallest])) smallest = left;
                if (right < heap.Count && Less(heap[right], heap[smallest])) smallest = right;
                if (smallest == i) break;
                (heap[i], heap[smallest]) = (heap[smallest], heap[i]);
                i = smallest;
            }
            return top;
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["tree"] = Snapshot() },
            HighlightIndices: [],
            Message: "Merge list 0 = [1, 4, 7], list 1 = [2, 5], list 2 = [3, 6, 8]. Each list is sorted, so the next output value is always one of the three heads."
        ));

        for (var li = 0; li < lists.Length; li++)
            Push((lists[li][0], li, 0));
        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["tree"] = Snapshot() },
            HighlightIndices: [0],
            Message: $"Seed the min-heap with every list's first value: {Entries()}. The smallest head sits at the root."
        ));

        while (heap.Count > 0)
        {
            var (value, list, pos) = Pop();
            output.Add(value);
            string message;
            if (pos + 1 < lists[list].Length)
            {
                var next = lists[list][pos + 1];
                Push((next, list, pos + 1));
                message = $"Pop {value} (list {list}) and append it. Push list {list}'s next value, {next}. Heap: {Entries()}. Output: {Output()}.";
            }
            else
            {
                message = heap.Count > 0
                    ? $"Pop {value} (list {list}) and append it. List {list} is used up, so nothing replaces it. Heap: {Entries()}. Output: {Output()}."
                    : $"Pop {value} (list {list}) and append it. List {list} is used up and the heap is empty. Output: {Output()}.";
            }
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["tree"] = Snapshot() },
                HighlightIndices: heap.Count > 0 ? [0] : [],
                Message: message
            ));
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["tree"] = Snapshot() },
            HighlightIndices: [],
            Message: $"Done: {Output()}. The heap never held more than 3 entries (one per list), and each of the 8 values went in and out once."
        ));
        return steps;
    }
}
