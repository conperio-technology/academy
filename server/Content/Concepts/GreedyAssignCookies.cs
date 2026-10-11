namespace DsaAcademy.Content.Concepts;

public class GreedyAssignCookies : IConcept
{
    public string Id => "greedy-assign-cookies";
    public string Track => "greedy";
    public int Order => 111;
    public string Title => "Greedy: Assign Cookies";
    public string OneLiner => "Sort the children and the cookies, then give each cookie to the least greedy child it can satisfy.";
    public string KeyTakeaway =>
        "Sort both lists and walk them with two pointers. The smallest cookie that satisfies the least greedy " +
        "child is never a waste: any bigger cookie you could have used instead is at least as useful to someone " +
        "greedier. Sorting is the expensive part, O(n log n); the matching pass is linear.";
    public VisualizerKind VisualizerKind => VisualizerKind.Grid;

    public string Explanation =>
        "Each child i has a greed factor g[i], the smallest cookie size that makes them content. Each cookie j " +
        "has a size s[j]. A child gets at most one cookie, and cookie j satisfies child i when s[j] >= g[i]. " +
        "Return the most children you can make content. For g = [1, 2, 3] and s = [1, 1] the answer is 1: both " +
        "cookies have size 1, and only the child with greed 1 is happy with that.\n\n" +
        "A greedy algorithm builds the answer one choice at a time, always taking the choice that looks best right " +
        "now and never going back. It is only correct when you can argue that the local choice never hurts later " +
        "ones. Here the choice is: give the smallest cookie that works to the least greedy child who is still " +
        "waiting. Why is that safe? Take any best assignment. If it feeds the least greedy child a bigger cookie, " +
        "swap that cookie with the smallest one that works: the least greedy child is still content, and whoever " +
        "had the small cookie (if anyone) can only gain from the bigger one. Nobody loses, so the count never " +
        "drops. That swap is called an exchange argument, and it is the standard way to show a greedy choice is " +
        "correct.\n\n" +
        "In code: sort g and s ascending. Keep child = 0 and walk the cookies from smallest to largest. If " +
        "s[cookie] >= g[child], that child is content: move child forward. Either way the cookie is used up or " +
        "useless (too small for this child means too small for every greedier child too), so move to the next " +
        "cookie. Stop when you run out of children or cookies; child is the answer.\n\n" +
        "Both languages sort in place: Array.Sort(g) in C#, g.sort() in Python (sorted(g) makes a copy). " +
        "Sorting dominates at O(n log n + m log m) for n children and m cookies; the pass is O(n + m).\n\n" +
        "The visualization shows both sorted lists, children on top and cookies below. Green cells are content " +
        "children and the cookies that fed them; red cookies were too small for anyone still waiting.";

    public List<string> RecognitionSignals =>
    [
        "Two lists where items of one \"satisfy\" items of the other by a size comparison, and you want the most matches.",
        "Each item can be used at most once, and a bigger resource can always stand in for a smaller one.",
        "Sorting both sides lines up a natural smallest-first matching order.",
    ];

    public List<string> Gotchas =>
    [
        "Move to the next cookie whether or not it fed someone; only move the child pointer when the child is content.",
        "Walking from the top also works (largest cookie to the greediest child it can satisfy), but mixing the directions, such as offering the smallest cookie to the greediest child, throws away cookies that a less greedy child could have used.",
        "Empty lists are valid input: no children or no cookies means 0, not an index error.",
    ];

    public List<string> ConfusableWith =>
    [
        "Two Pointers on a sorted array (Two Sum II) also walks sorted data with two indexes, but both pointers move inward over one array; here each pointer walks its own list forward.",
        "0/1 Knapsack looks similar (pick items under a size limit) but has no ordering that makes one choice always safe, so it needs dynamic programming.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int FindContentChildren(int[] g, int[] s)\n" +
            "    {\n" +
            "        // TODO: sort g (greed factors) and s (cookie sizes) ascending.\n" +
            "        // Walk the cookies smallest first with a child pointer starting at 0:\n" +
            "        // if the cookie is big enough for g[child], that child is content (child++).\n" +
            "        // Return how many children are content.\n" +
            "        return -1;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def find_content_children(g, s):\n" +
            "    # TODO: sort g (greed factors) and s (cookie sizes) ascending.\n" +
            "    # Walk the cookies smallest first with a child pointer starting at 0:\n" +
            "    # if the cookie is big enough for g[child], that child is content (child += 1).\n" +
            "    # Return how many children are content.\n" +
            "    return -1\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.FindContentChildren",
        ["python"] = "find_content_children",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[1, 2, 3], [1, 1]", "1"),
        new TestCase("[1, 2], [1, 2, 3]", "2"),
        new TestCase("[10, 9, 8, 7], [5, 6, 7, 8]", "2"),
        new TestCase("[], [1, 2]", "0"),
        new TestCase("[1, 2, 3], []", "0"),
        new TestCase("[2, 2, 2], [1, 1, 1, 2]", "1"),
        new TestCase("[1, 1, 1], [1, 1, 1, 1]", "3"),
        new TestCase("[5, 10, 2, 9, 15, 9], [6, 1, 20, 3, 8]", "3"),
    ];

    public string CSharpCallTemplate => "Solution.FindContentChildren({input})";
    public string PythonCallTemplate => "find_content_children({input})";

    private static int[][] Cells(IEnumerable<(int R, int C)> cells) => cells.Select(p => new[] { p.R, p.C }).ToArray();

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] g = [5, 10, 2, 9, 15, 9];
        int[] s = [6, 1, 20, 3, 8];
        var gs = g.OrderBy(x => x).ToArray();
        var ss = s.OrderBy(x => x).ToArray();
        var grid = new object[][] { gs.Select(x => (object)x).ToArray(), ss.Select(x => (object)x).ToArray() };
        var fed = new List<(int, int)>();
        var wasted = new List<(int, int)>();
        var steps = new List<VisualizationStep>();

        Dictionary<string, object> State(int child, int cookie) => new()
        {
            ["grid"] = grid,
            ["rowLabels"] = new[] { "greed", "cookie" },
            ["visited"] = Cells(fed),
            ["rejected"] = Cells(wasted),
            ["highlight"] = Cells(new[] { (0, child), (1, cookie) }.Where(p => p.Item2 < (p.Item1 == 0 ? gs.Length : ss.Length))),
            ["tracker"] = fed.Count / 2,
            ["trackerLabel"] = "content children",
        };

        steps.Add(new VisualizationStep(State(0, 0), [],
            "g = [5, 10, 2, 9, 15, 9] and s = [6, 1, 20, 3, 8], both sorted ascending. Start with the least greedy child and the smallest cookie."));

        var c = 0;
        for (var k = 0; k < ss.Length && c < gs.Length; k++)
        {
            string msg;
            if (ss[k] >= gs[c])
            {
                fed.Add((0, c));
                fed.Add((1, k));
                msg = $"Cookie {ss[k]} >= greed {gs[c]}: this child is content. Move to the next child and the next cookie.";
                steps.Add(new VisualizationStep(State(c + 1, k + 1), [], msg));
                c++;
            }
            else
            {
                wasted.Add((1, k));
                msg = $"Cookie {ss[k]} < greed {gs[c]}: too small for this child, so too small for every greedier child as well. Skip it.";
                steps.Add(new VisualizationStep(State(c, k + 1), [], msg));
            }
        }

        steps.Add(new VisualizationStep(State(gs.Length, ss.Length), [],
            $"Out of cookies: {c} children are content. The children with greed 9, 10 and 15 go without, because 20 was the only cookie left big enough for any of them."));
        return steps;
    }
}
