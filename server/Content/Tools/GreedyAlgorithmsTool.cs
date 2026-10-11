namespace DsaAcademy.Content.Tools;

public class GreedyAlgorithmsTool : ITool
{
    public string Id => "greedy-algorithms";
    public string Section => "Data Structures & Algorithms";
    public string Track => "greedy";
    public int Order => 110;

    public string Title => "Greedy Algorithms: When the Best Next Step Is Enough";
    public string OneLiner => "Take the locally best choice and never look back: how to tell when that's safe, how to prove it with an exchange argument, and the classic cases where it fails.";
    public string KeyTakeaway =>
        "A greedy algorithm is only correct when you can argue that the locally best choice is part of SOME " +
        "optimal answer. The usual proof is an exchange argument: take any optimal answer, swap its first choice " +
        "for the greedy one, and show it gets no worse. If you can't make that argument, try to break the greedy " +
        "rule on a tiny input; one counterexample (coins {1, 3, 4} for amount 6) means you need dynamic " +
        "programming instead.";

    public ToolKind ToolKind => ToolKind.GreedyAlgorithms;

    public string Explanation =>
        "A greedy algorithm builds its answer one decision at a time, always taking the option that looks best " +
        "right now (the earliest finish, the biggest coin, the cheapest edge), and never undoing a decision. That " +
        "makes greedy code short and fast, usually a sort followed by one pass, O(n log n). The catch is that it's " +
        "often wrong, and it looks just as convincing when it is.\n\n" +
        "Two properties make greedy correct. The greedy-choice property: some optimal solution starts with the " +
        "greedy choice. Optimal substructure: after making that choice, what's left is a smaller copy of the same " +
        "problem, so the same rule can keep going. Dynamic programming needs optimal substructure too; the " +
        "difference is that DP tries every choice and keeps the best, while greedy commits to one without " +
        "comparing.\n\n" +
        "The exchange argument is how you show the greedy-choice property. Start from any optimal solution O. If " +
        "O's first choice differs from the greedy choice g, swap it for g, and show the result is still valid and " +
        "no worse. Then O with g is also optimal, and you repeat the argument on the rest. For interval " +
        "scheduling (keep as many non-overlapping intervals as possible), g is the interval that ends earliest: " +
        "swapping it in for O's first interval can't create an overlap, because g ends no later, so everything " +
        "after it in O still fits. A related proof style, \"greedy stays ahead\", shows that after every step the " +
        "greedy partial answer is at least as good as any other, as in Jump Game, where the farthest reach after " +
        "k indexes is the best anyone can have.\n\n" +
        "Where greedy fails. Coin change with coins {1, 3, 4} and amount 6: always taking the largest coin gives " +
        "4 + 1 + 1, three coins, but 3 + 3 is two. (With real-world coin systems such as {1, 5, 10, 25} greedy " +
        "happens to be optimal, which is exactly why people trust it too much.) Interval scheduling with the wrong " +
        "rule: \"earliest start\" or \"shortest first\" each have a small counterexample, shown below. 0/1 knapsack " +
        "by value per kilo: greedy is optimal when you may take fractions of items, but with whole items it can " +
        "fill the bag badly. In all three, the fix is DP: Coin Change and 0/1 Knapsack have their own lessons in " +
        "the Patterns track.\n\n" +
        "A practical interview routine: state the greedy rule in one sentence; try to break it on two or three " +
        "tiny inputs, including ties and extremes; if it survives, give the exchange argument out loud; if it " +
        "breaks, say so and move to DP. Interviewers reward the counterexample as much as the proof. Greedy " +
        "algorithms you already know include Dijkstra's shortest path (always finalise the closest unvisited " +
        "node), Kruskal's minimum spanning tree (always add the cheapest edge that doesn't close a cycle), Huffman " +
        "coding, and Non-overlapping Intervals in the Patterns track.\n\n" +
        "The widgets below let you break greedy yourself: a coin-change counterexample finder, four interval " +
        "rules on inputs chosen to defeat them, the knapsack comparison, and a quick \"greedy or not?\" check.";
}
