namespace DsaAcademy.Content.Tools;

public class ComplexitySpaceTool : ITool
{
    public string Id => "complexity-space";
    public string Section => "Data Structures & Algorithms";
    public string Track => "complexity";
    public int Order => 6;

    public string Title => "Space Complexity in Depth: Stack, Auxiliary and Output";
    public string OneLiner => "Where the memory actually goes: the call stack, memo tables, copies, the output, and why BFS and DFS use different amounts of it.";
    public string KeyTakeaway =>
        "Space is the PEAK memory in use at any one moment, not the total ever allocated. Count what is live at the worst " +
        "point: the deepest chain of recursive calls (depth × memory per frame), every collection that grows with the input, " +
        "and the output if you are counting it. Say separately which part is auxiliary and which part is the answer.";

    public ToolKind ToolKind => ToolKind.ComplexitySpace;

    public string Explanation =>
        "Three terms come up in interviews. Total space counts everything, including the input. Auxiliary (extra) space " +
        "counts only what the algorithm adds, and it is what people usually mean by \"space complexity\". Output space is " +
        "the memory for the answer you return. Reversing an array in place is O(1) auxiliary; generating all subsets is " +
        "O(n) auxiliary for the path and stack but O(n · 2ⁿ) for the output. Saying \"O(1) extra, not counting the output\" " +
        "is a complete answer; saying \"O(1)\" for the subsets is not.\n\n" +
        "Recursion is the space cost people miss. A function that allocates nothing still uses one stack frame per call " +
        "that has not returned yet, so its space is the maximum depth of the recursion times the size of a frame. A " +
        "balanced tree traversal is O(log n); the same code on a tree that has degenerated into a chain is O(n). If each " +
        "frame also holds its own copy of something (a slice, a path list), multiply: n frames each holding up to n items " +
        "is O(n²).\n\n" +
        "Space measures the peak, not the sum. Merge sort allocates a merge buffer at every call, n log n in total over its " +
        "life, but only one level's worth is alive at a time, so its space is O(n). Naive Fibonacci makes 2ⁿ calls but only " +
        "ever has n of them on the stack. Garbage that has already been released costs time (the collector has to clean it " +
        "up), not peak space.\n\n" +
        "Traversals show the difference clearly. DFS keeps one root to leaf path: its space is the HEIGHT of the tree or the " +
        "depth of the search. BFS keeps a whole frontier: its space is the WIDTH of the widest level, about n / 2 for a " +
        "balanced binary tree. So DFS is O(log n) and BFS is O(n) on a balanced tree, while on a long chain it is the other " +
        "way around. Memoization trades space for time: a memo table has one entry per distinct state, so its size is the " +
        "state count, and a DP table can often be shrunk to the last row or two when each state only looks back that far.\n\n" +
        "Step through DFS and BFS on three tree shapes below and watch the stack or queue, then classify the space of some " +
        "everyday functions.";
}
