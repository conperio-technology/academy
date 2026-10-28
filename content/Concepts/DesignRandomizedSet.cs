namespace DsaAcademy.Content.Concepts;

public class DesignRandomizedSet : IConcept
{
    public string Id => "design-randomized-set";
    public string Track => "patterns";
    public string Title => "Design: Insert, Delete, GetRandom in O(1)";
    public string OneLiner => "A set with O(1) insert, remove and uniform random pick. A list gives random access, a map from value to index gives fast lookup, and swap-with-last makes removal O(1).";
    public string KeyTakeaway =>
        "Keep the values in a list (random pick = one random index) and a dictionary from value to its index " +
        "in that list (O(1) membership). To remove, move the LAST value into the removed value's slot, update " +
        "its index in the map, and pop the end. No shifting, so every operation is O(1) on average.";
    public VisualizerKind VisualizerKind => VisualizerKind.HashMap;

    public string Explanation =>
        "Design a class RandomizedSet with Insert(val), which adds val and returns true if it was not already " +
        "present; Remove(val), which removes it and returns true if it was present; and GetRandom(), which " +
        "returns a uniformly random current element (it is only called when the set is non-empty). All three " +
        "must run in O(1) on average.\n\n" +
        "The grader runs a list of operations. For insert and remove it checks the returned booleans. For " +
        "getRandom it calls your method 300 times and checks that every value returned is currently in the " +
        "set and that every current element came up at least once, which a uniform pick does with " +
        "overwhelming probability and a biased or stale one does not.\n\n" +
        "No single built-in structure does all three. A hash set has O(1) insert and remove but cannot pick a " +
        "random element without walking it. A list can pick list[random index] in O(1), but finding and " +
        "removing a value is O(n). So use both: a List<int> of values and a Dictionary<int, int> from value " +
        "to its index in the list.\n\n" +
        "Insert: if the value is in the map, return false. Otherwise record index[val] = list.Count and " +
        "append it. Remove: if it is not in the map, return false. Otherwise look up its index i, take the " +
        "last value of the list, write it into slot i and set index[last] = i, then remove the list's last " +
        "slot and delete val from the map. Order within the list doesn't matter, which is the whole trick: " +
        "removing from the end is O(1), removing from the middle is not. GetRandom: " +
        "list[rng.Next(list.Count)].\n\n" +
        "Every operation is O(1) on average (hash map operations plus O(1) list work), and the two structures " +
        "together use O(n) space. The same \"swap with last, then pop\" move deletes from any unordered array " +
        "in O(1).\n\n" +
        "The visualization runs insert 10, 20, 30, then remove 10: the array is the list and the map shows " +
        "value to index.";

    public List<string> RecognitionSignals => [
        "O(1) insert, delete AND random access, or delete from an array whose order doesn't matter.",
        "\"Design\" questions where one structure handles lookup and another handles position.",
    ];

    public List<string> Gotchas => [
        "Forgetting to update the moved value's index in the map leaves it pointing at a stale slot.",
        "Removing the last element itself: i is the last index, so writing it onto itself and popping must still work (update the map before deleting val).",
        "Returning a value from a separate HashSet for GetRandom is not O(1), and new Random() on every call can repeat values; create one Random and reuse it.",
    ];

    public List<string> ConfusableWith => [
        "LRU Cache also pairs a dictionary with a second structure (a linked list), but to keep recency order; here order is irrelevant, so an array and swap-with-last suffice.",
        "A plain HashSet gives O(1) insert and remove but has no O(1) random pick.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class RandomizedSet\n" +
            "{\n" +
            "    private readonly List<int> values = new();\n" +
            "    private readonly Dictionary<int, int> indexOf = new(); // value -> its index in values\n" +
            "    private readonly Random rng = new();\n" +
            "\n" +
            "    public bool Insert(int val)\n" +
            "    {\n" +
            "        // TODO: false if present; else indexOf[val] = values.Count, append, true.\n" +
            "        return false;\n" +
            "    }\n" +
            "\n" +
            "    public bool Remove(int val)\n" +
            "    {\n" +
            "        // TODO: false if absent. Else move the last value into val's slot,\n" +
            "        // update its index, remove the last slot and val's map entry, true.\n" +
            "        return false;\n" +
            "    }\n" +
            "\n" +
            "    public int GetRandom()\n" +
            "    {\n" +
            "        // TODO: a uniformly random element of values.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "import random\n" +
            "\n" +
            "\n" +
            "class RandomizedSet:\n" +
            "    def __init__(self):\n" +
            "        self.values = []\n" +
            "        self.index_of = {}  # value -> its index in values\n" +
            "\n" +
            "    def insert(self, val):\n" +
            "        # TODO: False if present; else index_of[val] = len(values), append, True.\n" +
            "        return False\n" +
            "\n" +
            "    def remove(self, val):\n" +
            "        # TODO: False if absent. Else move the last value into val's slot,\n" +
            "        # update its index, pop the last slot and delete val's entry, True.\n" +
            "        return False\n" +
            "\n" +
            "    def get_random(self):\n" +
            "        # TODO: a uniformly random element of values.\n" +
            "        return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "RandomizedSet",
        ["python"] = "RandomizedSet",
    };

    public string? CSharpHarnessPreamble => "public static class RandomizedSetHarness\n" +
        "{\n" +
        "    // insert and remove report their booleans; getRandom is called 300 times and reports\n" +
        "    // whether every pick was a current member and every member was picked at least once.\n" +
        "    public static List<bool> Run(string[] ops, int[][] args)\n" +
        "    {\n" +
        "        var set = new RandomizedSet();\n" +
        "        var shadow = new HashSet<int>();\n" +
        "        var results = new List<bool>();\n" +
        "        for (var i = 0; i < ops.Length; i++)\n" +
        "        {\n" +
        "            if (ops[i] == \"insert\")\n" +
        "            {\n" +
        "                results.Add(set.Insert(args[i][0]));\n" +
        "                shadow.Add(args[i][0]);\n" +
        "            }\n" +
        "            else if (ops[i] == \"remove\")\n" +
        "            {\n" +
        "                results.Add(set.Remove(args[i][0]));\n" +
        "                shadow.Remove(args[i][0]);\n" +
        "            }\n" +
        "            else\n" +
        "            {\n" +
        "                var seen = new HashSet<int>();\n" +
        "                var ok = true;\n" +
        "                for (var t = 0; t < 300; t++)\n" +
        "                {\n" +
        "                    var v = set.GetRandom();\n" +
        "                    if (!shadow.Contains(v)) ok = false;\n" +
        "                    seen.Add(v);\n" +
        "                }\n" +
        "                results.Add(ok && seen.SetEquals(shadow));\n" +
        "            }\n" +
        "        }\n" +
        "        return results;\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble => "def run_randomized_set(ops, args):\n" +
        "    # insert and remove report their booleans; getRandom is called 300 times and reports\n" +
        "    # whether every pick was a current member and every member was picked at least once.\n" +
        "    s = RandomizedSet()\n" +
        "    shadow = set()\n" +
        "    results = []\n" +
        "    for op, a in zip(ops, args):\n" +
        "        if op == \"insert\":\n" +
        "            results.append(s.insert(a[0]))\n" +
        "            shadow.add(a[0])\n" +
        "        elif op == \"remove\":\n" +
        "            results.append(s.remove(a[0]))\n" +
        "            shadow.discard(a[0])\n" +
        "        else:\n" +
        "            picks = [s.get_random() for _ in range(300)]\n" +
        "            results.append(all(p in shadow for p in picks) and set(picks) == shadow)\n" +
        "    return results\n";

    public List<TestCase> TestCases =>
    [
        new TestCase("[\"insert\", \"remove\", \"insert\", \"getRandom\", \"remove\", \"insert\", \"getRandom\"], [[1], [2], [2], [], [1], [2], []]", "[true,false,true,true,true,false,true]"),
        new TestCase("[\"insert\", \"insert\", \"insert\", \"getRandom\", \"remove\", \"getRandom\"], [[10], [20], [30], [], [20], []]", "[true,true,true,true,true,true]"),
        new TestCase("[\"remove\", \"insert\", \"insert\", \"remove\", \"insert\", \"getRandom\"], [[5], [5], [5], [5], [7], []]", "[false,true,false,true,true,true]"),
        new TestCase("[\"insert\", \"insert\", \"insert\", \"insert\", \"remove\", \"remove\", \"getRandom\", \"insert\", \"getRandom\"], [[1], [2], [3], [4], [1], [4], [], [-9], []]", "[true,true,true,true,true,true,true,true,true]"),
        new TestCase("[\"insert\", \"remove\", \"remove\", \"insert\", \"getRandom\"], [[0], [0], [0], [0], []]", "[true,true,false,true,true]"),
    ];

    public string CSharpCallTemplate => "RandomizedSetHarness.Run({input})";
    public string PythonCallTemplate => "run_randomized_set({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        var values = new List<int>();
        var indexOf = new Dictionary<int, int>();
        var steps = new List<VisualizationStep>();
        Dictionary<string, object> State() => new()
        {
            ["array"] = values.ToArray(),
            ["hashMap"] = indexOf.Select(kv => new[] { kv.Key, kv.Value }).ToArray(),
        };
        steps.Add(new(State(), [], "values is a list (random pick by index); indexOf maps each value to its slot (O(1) lookup)."));
        foreach (var v in new[] { 10, 20, 30 })
        {
            indexOf[v] = values.Count;
            values.Add(v);
            steps.Add(new(State(), [values.Count - 1], $"Insert {v}: it goes at the end, slot {values.Count - 1}, and indexOf[{v}] = {values.Count - 1}."));
        }
        steps.Add(new(State(), [1], "GetRandom: pick a random slot from 0 to 2. Each value is equally likely."));
        var i = indexOf[10];
        var last = values[^1];
        values[i] = last;
        indexOf[last] = i;
        steps.Add(new(State(), [i], $"Remove 10, at slot {i}. Don't shift: copy the last value, {last}, into slot {i} and set indexOf[{last}] = {i}."));
        values.RemoveAt(values.Count - 1);
        indexOf.Remove(10);
        steps.Add(new(State(), [], "Pop the end and delete 10 from the map. The list is out of order, which never mattered, and every step was O(1)."));
        return steps;
    }
}
