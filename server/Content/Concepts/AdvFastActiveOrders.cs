namespace DsaAcademy.Content.Concepts;

public class AdvFastActiveOrders : IConcept
{
    public string Id => "adv-fast-active-orders";
    public string Section => Basics.Section;
    public string Track => Adv.Track;
    public int Order => 2901;
    public string Title => "Make the Slow Report Fast";
    public string OneLiner => "The starter code is correct but far too slow for 200,000 orders: find its two hidden quadratic costs and remove them without changing a single result.";
    public string KeyTakeaway =>
        "Two classic O(n²) traps hide in innocent-looking code: a membership test on a list inside a loop, and building " +
        "a string with += in a loop. A HashSet or set makes each lookup O(1) on average, and string.Join or \"\".join " +
        "builds the text in one pass. Keep the output identical: optimizations must not change behaviour.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "ActiveOrders(orders, cancelled) returns the ids of the orders that aren't cancelled, in their original order " +
        "and keeping duplicates, joined by commas: orders [\"A1\", \"B2\", \"A1\", \"C3\"] with cancelled [\"B2\"] give " +
        "\"A1,A1,C3\". The starter code already does this correctly. Run it: the small tests pass, but the last test " +
        "generates 200,000 orders with every second one cancelled and reports [length of the result, its first 11 " +
        "characters, its last 11 characters], and the starter runs out of time.\n\n" +
        "Profile it in your head, as the lesson suggests. For each order it checks cancelled.Contains(id) or id in " +
        "cancelled, which scans a list of 100,000 ids: about 10 billion string comparisons in total. And in C# it " +
        "builds the answer with result += id + \",\", which copies the whole string so far every time: hundreds of " +
        "gigabytes of copying for a 744,444 character result. (CPython can often append to a string in place, so in " +
        "Python the lookup is the main trap, but join is still the reliable way.)\n\n" +
        "Fix both: build a HashSet<string> (C#) or set (Python) from cancelled once, so each lookup is O(1) on average, " +
        "and collect the active ids then join them once with string.Join(\",\", ...) or \",\".join(...). The whole thing " +
        "becomes O(n + m) and runs in well under a second.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    // Correct, but O(n * m) lookups and O(n²) string building. Make it fast.\n" +
            "    public static string ActiveOrders(List<string> orders, List<string> cancelled)\n" +
            "    {\n" +
            "        string result = \"\";\n" +
            "        foreach (var id in orders)\n" +
            "        {\n" +
            "            if (!cancelled.Contains(id))\n" +
            "                result += (result.Length == 0 ? \"\" : \",\") + id;\n" +
            "        }\n" +
            "        return result;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "# Correct, but O(n * m) lookups. Make it fast.\n" +
            "def active_orders(orders, cancelled):\n" +
            "    result = \"\"\n" +
            "    for order_id in orders:\n" +
            "        if order_id not in cancelled:\n" +
            "            result += (\",\" if result else \"\") + order_id\n" +
            "    return result\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.ActiveOrders",
        ["python"] = "active_orders",
    };

    // n = 0: use the given lists and return the result. n > 0: generate n orders A0..A(n-1)
    // with every even one cancelled, and summarise the (long) result.
    public string? CSharpHarnessPreamble =>
        "public static class OrdersCheck\n" +
        "{\n" +
        "    public static object Check(string[] orders, string[] cancelled, int n)\n" +
        "    {\n" +
        "        if (n == 0) return Solution.ActiveOrders(orders.ToList(), cancelled.ToList());\n" +
        "        var all = Enumerable.Range(0, n).Select(i => $\"A{i}\").ToList();\n" +
        "        var gone = Enumerable.Range(0, n).Where(i => i % 2 == 0).Select(i => $\"A{i}\").ToList();\n" +
        "        string result = Solution.ActiveOrders(all, gone);\n" +
        "        return new object[] { result.Length, result[..Math.Min(11, result.Length)], result[Math.Max(0, result.Length - 11)..] };\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "def check_orders(orders, cancelled, n):\n" +
        "    if n == 0:\n" +
        "        return active_orders(list(orders), list(cancelled))\n" +
        "    all_orders = [f\"A{i}\" for i in range(n)]\n" +
        "    gone = [f\"A{i}\" for i in range(0, n, 2)]\n" +
        "    result = active_orders(all_orders, gone)\n" +
        "    return [len(result), result[:11], result[-11:]]\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Basics.StrArray("A1", "B2", "A1", "C3"), Basics.StrArray("B2"), Lit.Int(0)), "\"A1,A1,C3\""),
        new TestCase(Lit.Args(Basics.StrArray("A1", "B2"), Basics.StrArray(), Lit.Int(0)), "\"A1,B2\""),
        new TestCase(Lit.Args(Basics.StrArray("A1", "B2"), Basics.StrArray("B2", "A1", "Z9"), Lit.Int(0)), "\"\""),
        new TestCase(Lit.Args(Basics.StrArray(), Basics.StrArray("A1"), Lit.Int(0)), "\"\""),
        new TestCase(Lit.Args(Basics.StrArray("X", "x", "X"), Basics.StrArray("x"), Lit.Int(0)), "\"X,X\""),
        new TestCase(Lit.Args(Basics.StrArray(), Basics.StrArray(), Lit.Int(200000)), "[744444, \"A1,A3,A5,A7\", \"997,A199999\"]"),
    ];

    public string CSharpCallTemplate => "OrdersCheck.Check({input})";
    public string PythonCallTemplate => "check_orders({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        object[] orders = ["A1", "B2", "A1", "C3"];
        return
        [
            Basics.Step(orders, [], "{B2}", "cancelled set", "Build a set from the cancelled ids once: O(m)."),
            Basics.Step(orders, [0], "[A1]", "active", "A1 isn't in the set: an O(1) average lookup instead of scanning the whole cancelled list."),
            Basics.Step(orders, [1], "[A1]", "active", "B2 is cancelled: skip it."),
            Basics.Step(orders, [2, 3], "[A1, A1, C3]", "active", "Keep order and duplicates. Collect into a list rather than growing a string."),
            Basics.Step(orders, [], "\"A1,A1,C3\"", "result", "Join once at the end: one pass over the characters instead of copying the growing string at every step."),
        ];
    }
}
