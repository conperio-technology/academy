namespace DsaAcademy.Content.Tools;

public class LazyPropagationTool : ITool
{
    public string Id => "segment-tree-lazy-propagation";
    public string Section => "Data Structures & Algorithms";
    public string Track => "range queries";
    public int Order => 141;

    public string Title => "Lazy Propagation, and Choosing a Range-Query Structure";
    public string OneLiner => "How a segment tree handles \"add x to a whole range\" in O(log n) by postponing work, and a decision guide for prefix sums, difference arrays, sparse tables, Fenwick trees and segment trees.";
    public string KeyTakeaway =>
        "When an update covers a node's whole range, fix that node's summary now and leave a lazy tag (\"my " +
        "children still owe +x\") instead of visiting the children. Push the tag down only when a later " +
        "operation needs to go below that node. Range update and range query both stay O(log n). Pick the " +
        "simplest structure that fits: static data, prefix sums or a sparse table; point updates with sums, a " +
        "Fenwick tree; anything else, a segment tree.";

    public ToolKind ToolKind => ToolKind.LazyPropagation;

    public string Explanation =>
        "The segment tree in the previous lesson handles point updates. A range update such as \"add 3 to every " +
        "element in [2, 6]\" would be one point update per element, O(n log n) for a wide range, which is worse " +
        "than editing the array directly. Lazy propagation makes a range update O(log n) as well.\n\n" +
        "The idea is to postpone work. Walk the tree as a range query would. When the update's range completely " +
        "covers a node, update that node's own summary right away (for sums: add delta times the number of " +
        "elements it covers) and record a lazy tag on it: a note that says \"every element below me should also " +
        "get +delta, but I haven't told my children yet\". Don't visit the children. Partly covered nodes " +
        "recurse into both children and then recompute themselves, exactly like a point update.\n\n" +
        "The tag is paid off later, only if needed. Before any operation (update or query) goes below a node " +
        "that carries a tag, it pushes the tag down: apply it to both children (adjust their sums, add to their " +
        "tags) and clear it on the parent. This push-down step is the propagation. A query that stops at a " +
        "fully covered node never needs to push, because that node's summary is already correct. Each " +
        "operation still visits O(log n) nodes, so range update plus range query costs O(log n) each.\n\n" +
        "Tags have to combine. Two adds merge into one add (+3 then +2 is +5). Mixing \"assign x\" with \"add d\" " +
        "needs an order rule: an assign wipes any pending add. Getting that composition right is the hard part " +
        "of harder lazy problems.\n\n" +
        "At interview level you are rarely asked to code full lazy propagation in 45 minutes, but you should be " +
        "able to explain it, say when it's needed, and know the cheaper tools:\n\n" +
        "Difference array: when every update comes before every query (offline), add delta at l and -delta at " +
        "r + 1, then take one prefix pass. O(n + q), no tree at all.\n\n" +
        "Range add, point query, interleaved: the same difference array inside a Fenwick tree (graded in " +
        "this track as Range Add, Point Query).\n\n" +
        "Range add and range sum, interleaved: lazy segment tree, or two Fenwick trees (a known trick that " +
        "keeps the sum of delta and of delta times index).\n\n" +
        "Static array, min or max: a sparse table, which stores the min of every window whose length is a " +
        "power of two, O(n log n) to build, and answers [l, r] in O(1) from two overlapping windows.\n\n" +
        "Point updates with sums or counts: Fenwick tree. Point updates with min, max or another associative " +
        "operation: segment tree.\n\n" +
        "Counting smaller or larger elements before or after each position: Fenwick tree over compressed " +
        "values, or merge sort.\n\n" +
        "The widgets: step through range adds and queries on a lazy segment tree and watch tags appear and get " +
        "pushed down, then test yourself on which structure fits each scenario.";
}
