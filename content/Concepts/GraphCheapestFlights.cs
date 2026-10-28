namespace DsaAcademy.Content.Concepts;

public class GraphCheapestFlights : IConcept
{
    public string Id => "graph-cheapest-flights";
    public string Track => "patterns";
    public string Title => "Graphs: Cheapest Flights Within K Stops";
    public string OneLiner => "Cheapest route with at most k stopovers. Dijkstra can't cap the number of edges, so run Bellman-Ford for exactly k + 1 rounds, each from a copy of the previous round's prices.";
    public string KeyTakeaway =>
        "With at most k stops a route uses at most k + 1 flights. After round r of Bellman-Ford (relax every " +
        "edge once), price[v] is the cheapest cost using at most r flights, provided every round reads from " +
        "the previous round's prices (a copy). Stop after k + 1 rounds: O(k · E) time, O(V) space.";
    public VisualizerKind VisualizerKind => VisualizerKind.Graph;

    public string Explanation =>
        "There are n cities and flights[i] = [from, to, price], one-way. Return the cheapest price from src " +
        "to dst using at most k stops (k intermediate cities, so at most k + 1 flights), or -1 if no such " +
        "route exists. With flights 0 -> 1 (100), 1 -> 2 (100), 0 -> 2 (500) and k = 1, the answer is 200; " +
        "with k = 0 it is 500, because the direct flight is the only route with no stops.\n\n" +
        "Plain Dijkstra finds the cheapest route but ignores how many flights it takes, and once it finalizes " +
        "a city with a cheap but long route it never reconsiders a pricier, shorter one. You need cost under " +
        "a hop limit, which is exactly what Bellman-Ford's rounds measure.\n\n" +
        "Bellman-Ford: price[src] = 0, everything else infinity. One round relaxes every flight once: if " +
        "price[u] + w < price[v], lower price[v]. After r rounds, price[v] is at most the cheapest route with " +
        "r flights. The catch for this problem: within one round, a price you just lowered must not be used " +
        "to relax another edge in the same round, or a route of two flights sneaks into round one. So each " +
        "round reads from the previous round's array and writes into a copy: next = price.ToArray(); relax " +
        "from price into next; then price = next.\n\n" +
        "Run exactly k + 1 rounds and return price[dst], or -1 if it is still infinity. Each round scans all " +
        "E flights and copies V prices: O(k · (V + E)), usually written O(k · E), with O(V) space. A BFS over " +
        "(city, stops) states, or Dijkstra over (cost, city, stops), also works; Bellman-Ford with the copy " +
        "is the shortest correct version.\n\n" +
        "The visualization runs flights 0 -> 1 (100), 1 -> 2 (100), 2 -> 0 (100), 1 -> 3 (600), 2 -> 3 (200) " +
        "from 0 to 3 with k = 1.";

    public List<string> RecognitionSignals => [
        "Shortest or cheapest path with a limit on the number of edges, stops or hops.",
        "Weighted graph where Dijkstra's greedy finalization would lock in a route that breaks a constraint.",
    ];

    public List<string> Gotchas => [
        "Relaxing in place within a round lets one round use several flights; always relax from the previous round's copy.",
        "k stops means k + 1 flights, so k + 1 rounds.",
        "Adding to infinity: skip edges whose source price is still infinite (and in C#, int.MaxValue + w overflows).",
    ];

    public List<string> ConfusableWith => [
        "Network Delay Time is plain Dijkstra: no limit on hops, so greedy finalization is safe.",
        "Plain Bellman-Ford runs V - 1 rounds to find shortest paths with any number of edges and can detect negative cycles; here the round count is the constraint itself.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int FindCheapestPrice(int n, int[][] flights, int src, int dst, int k)\n" +
            "    {\n" +
            "        const int Inf = int.MaxValue;\n" +
            "        var price = Enumerable.Repeat(Inf, n).ToArray();\n" +
            "        price[src] = 0;\n" +
            "        // TODO: repeat k + 1 times: next = price.ToArray(); for each [u, v, w] in flights,\n" +
            "        // if price[u] != Inf and price[u] + w < next[v], set next[v] = price[u] + w.\n" +
            "        // Then price = next. Return price[dst], or -1 if it is still Inf.\n" +
            "        return -1;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def find_cheapest_price(n, flights, src, dst, k):\n" +
            "    INF = float(\"inf\")\n" +
            "    price = [INF] * n\n" +
            "    price[src] = 0\n" +
            "    # TODO: repeat k + 1 times: nxt = price[:]; for each u, v, w in flights,\n" +
            "    # if price[u] + w < nxt[v], set nxt[v] = price[u] + w.\n" +
            "    # Then price = nxt. Return price[dst], or -1 if it is still INF.\n" +
            "    return -1\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.FindCheapestPrice",
        ["python"] = "find_cheapest_price",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("4, [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], 0, 3, 1", "700"),
        new TestCase("3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 1", "200"),
        new TestCase("3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 0", "500"),
        new TestCase("3, [[0, 1, 100]], 0, 2, 1", "-1"),
        new TestCase("2, [[0, 1, 5]], 1, 1, 0", "0"),
        new TestCase("5, [[0, 1, 5], [1, 2, 5], [0, 3, 2], [3, 1, 2], [1, 4, 1], [4, 2, 1]], 0, 2, 2", "7"),
        new TestCase("5, [[0, 1, 5], [1, 2, 5], [0, 3, 2], [3, 1, 2], [1, 4, 1], [4, 2, 1]], 0, 2, 1", "10"),
        new TestCase("4, [[0, 1, 1], [0, 2, 5], [1, 2, 1], [2, 3, 1]], 0, 3, 1", "6"),
    ];

    public string CSharpCallTemplate => "Solution.FindCheapestPrice({input})";
    public string PythonCallTemplate => "find_cheapest_price({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[][] flights = [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]];
        const int n = 4, src = 0, dst = 3, k = 1;
        var positions = new Dictionary<string, object>
        {
            ["0"] = new { x = 80, y = 100 },
            ["1"] = new { x = 240, y = 40 },
            ["2"] = new { x = 240, y = 165 },
            ["3"] = new { x = 460, y = 100 },
        };
        var edges = flights.Select(f => (object)new[] { f[0], f[1], f[2] }).ToArray();
        int?[] price = [0, null, null, null];
        Dictionary<string, object> State(int[] changed) => new()
        {
            ["positions"] = positions,
            ["edges"] = edges,
            ["visited"] = Enumerable.Range(0, n).Where(i => price[i] is not null).ToArray(),
            ["frontier"] = changed,
            ["distances"] = Enumerable.Range(0, n).ToDictionary(i => i.ToString(), i => (object)(price[i]?.ToString() ?? "inf")),
        };
        var steps = new List<VisualizationStep>
        {
            new(State([]), [], "Cheapest from 0 to 3 with at most k = 1 stop, so at most 2 flights: 2 rounds. Flights are one-way: 0 -> 1, 1 -> 2, 2 -> 0, 1 -> 3, 2 -> 3."),
        };
        for (var round = 1; round <= k + 1; round++)
        {
            var next = price.ToArray();
            var changed = new List<string>();
            foreach (var f in flights)
            {
                if (price[f[0]] is not int p) continue;
                if (next[f[1]] is null || p + f[2] < next[f[1]])
                {
                    next[f[1]] = p + f[2];
                    changed.Add($"{f[1]} = {p} + {f[2]} = {p + f[2]}");
                }
            }
            var updated = Enumerable.Range(0, n).Where(i => next[i] != price[i]).ToArray();
            price = next;
            steps.Add(new(State(updated), [], $"Round {round} relaxes every flight from round {round - 1}'s prices (a copy): {(changed.Count > 0 ? string.Join(", ", changed) : "no change")}. Prices now use at most {round} flight{(round == 1 ? "" : "s")}."));
        }
        steps.Add(new(State([dst]), [], $"After k + 1 = 2 rounds, price[3] = {price[dst]} (0 -> 1 -> 3). The cheaper 0 -> 1 -> 2 -> 3 costs 400 but needs 2 stops, so a third round would have found it."));
        return steps;
    }
}
