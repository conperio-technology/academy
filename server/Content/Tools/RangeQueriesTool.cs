namespace DsaAcademy.Content.Tools;

public class RangeQueriesTool : ITool
{
    public string Id => "range-query-structures";
    public string Section => "Data Structures & Algorithms";
    public string Track => "range queries";
    public int Order => 140;

    public string Title => "Range Queries: Prefix Sums vs Segment Trees vs Fenwick Trees";
    public string OneLiner => "Why prefix sums stop working once the array changes, and how a segment tree and a Fenwick tree give O(log n) updates and queries, stepped through node by node.";
    public string KeyTakeaway =>
        "Prefix sums: O(1) query, O(n) update, so only for arrays that don't change. Segment tree: every node " +
        "stores the summary of a range; update and query are O(log n) for any associative operation (sum, min, " +
        "max, gcd). Fenwick tree: tree[i] covers the i & -i positions ending at i; add climbs with i += i & -i, " +
        "prefix descends with i -= i & -i, O(log n) each, about ten lines of code, but only for operations you " +
        "can undo, like sums and counts.";

    public ToolKind ToolKind => ToolKind.RangeQueries;

    public string Explanation =>
        "A range query asks for a summary of a contiguous slice of an array: the sum, minimum, maximum or count of " +
        "nums[l..r]. A point update changes one element; a range update changes every element of a slice. " +
        "Prefix Sums (Patterns track) answers a range sum in O(1) after an O(n) build, but only while the array " +
        "is fixed: changing nums[i] shifts every prefix after i, so each update costs O(n). The interview " +
        "follow-up is almost always \"now the array also changes\". Two structures make both operations " +
        "O(log n).\n\n" +
        "Segment tree. A binary tree in which every node covers a range of indices and stores the summary of " +
        "that range. The root covers [0, n - 1]; a node covering [lo, hi] splits at mid = (lo + hi) / 2 into a " +
        "left child [lo, mid] and a right child [mid + 1, hi]; each leaf covers one index. It lives in a plain " +
        "array like a heap: root at 1, node k's children at 2k and 2k + 1, and 4n slots are always enough. " +
        "Build, O(n): leaves are the elements, each parent combines its two children. " +
        "Point update, O(log n): walk down to the leaf, change it, recompute each ancestor on the way back up. " +
        "One node per level. " +
        "Range query, O(log n): a node completely outside [l, r] returns the identity (the value that changes " +
        "nothing: 0 for sum, infinity for min); a node completely inside returns its stored value without going " +
        "deeper; a node that partly overlaps asks both children. At most about four nodes per level are " +
        "visited. " +
        "The combine can be anything associative, meaning (a op b) op c = a op (b op c), so the tree's fixed " +
        "grouping can't change the answer: sum, min, max, gcd, AND, OR, XOR, or even \"maximum subarray sum\" " +
        "with a few fields per node. That flexibility is the main reason to choose it.\n\n" +
        "Fenwick tree, also called a binary indexed tree or BIT. An array tree[1..n], indexed from 1, where " +
        "tree[i] stores the sum of the lowbit(i) elements ending at position i. lowbit(i) = i & -i is the value " +
        "of i's lowest set bit (see the Bit Manipulation Toolkit): lowbit(12) = lowbit(1100 in binary) = 4, so " +
        "tree[12] holds positions 9 to 12. " +
        "prefix(i), the sum of positions 1..i: add tree[i], then i -= i & -i, until i is 0. Each step clears " +
        "the lowest set bit, so 13 -> 12 -> 8 -> 0 adds ranges [13], [9..12] and [1..8]. At most log n steps. " +
        "add(i, delta): add delta to tree[i], then i += i & -i, until i > n. Each step moves to the next cell " +
        "whose range also covers i: 5 -> 6 -> 8 -> 16. " +
        "Range sum l..r = prefix(r) - prefix(l - 1). Build with n adds in O(n log n), or in O(n) by adding " +
        "each tree[i] into its parent tree[i + lowbit(i)]. " +
        "It is 1-indexed because lowbit(0) = 0, so i += 0 would never move: shift array index i to i + 1. A " +
        "Fenwick tree is shorter to write than a segment tree, uses n + 1 slots instead of 4n, and runs faster, " +
        "but a range answer is a difference of two prefixes, so the operation needs an inverse. Sums and counts " +
        "have one; min and max don't, so range minimum needs a segment tree.\n\n" +
        "Fenwick trees as counters. Index the tree by value instead of position and store how many times each " +
        "value has been seen; then prefix(v) is \"how many seen values are <= v\". That one idea solves Count of " +
        "Smaller Numbers After Self and Count Inversions. When values are huge or negative, first apply " +
        "coordinate compression: sort the distinct values and replace each by its rank, 1 to k.\n\n" +
        "In an interview, the usual expectation is to name the structure, state the costs, and code a Fenwick " +
        "tree or a recursive segment tree with point updates in about 15 minutes. Lazy propagation, for range " +
        "updates, is the next lesson.\n\n" +
        "The widgets: compare total work for a mix of updates and queries, step a segment tree through build, " +
        "update and query, and step a Fenwick tree through its lowbit jumps.";
}
