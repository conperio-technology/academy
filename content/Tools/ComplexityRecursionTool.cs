namespace DsaAcademy.Content.Tools;

public class ComplexityRecursionTool : ITool
{
    public string Id => "complexity-recursion";
    public string Section => "Data Structures & Algorithms";
    public string Track => "complexity";
    public int Order => 2;

    public string Title => "Recursion, Recurrences and the Master Theorem";
    public string OneLiner => "How to get a Big O out of a function that calls itself: count the call tree, sum it level by level, or read it off the Master theorem.";
    public string KeyTakeaway =>
        "Recursive time is (number of calls) × (work per call). Draw the call tree: its branching factor and depth give the " +
        "call count, and summing the work level by level gives the total. Recursive space is the depth of that tree times " +
        "the memory per frame, because only one root to leaf path is ever on the stack at once.";

    public ToolKind ToolKind => ToolKind.ComplexityRecursion;

    public string Explanation =>
        "A loop tells you its trip count in its header. A recursive function hides it, so you write it down as a " +
        "recurrence: T(n) is the cost on input size n, expressed through the cost of the calls it makes. Merge sort makes " +
        "two calls on halves and merges in linear time, so T(n) = 2T(n/2) + O(n). Naive Fibonacci makes two calls on " +
        "n minus 1 and n minus 2, so T(n) = T(n minus 1) + T(n minus 2) + O(1). Writing that line is the first thing to do " +
        "out loud in an interview.\n\n" +
        "Then solve it by drawing the call tree. Two numbers do most of the work: the branching factor (calls per call) " +
        "and the depth (how many times the argument can shrink before hitting the base case). If the argument shrinks by " +
        "subtraction, the depth is about n; if it shrinks by division, the depth is about log n. Two branches with depth n " +
        "means about 2ⁿ calls. Two branches with depth log n means 2 to the log n, which is just n. That one contrast " +
        "explains why halving and branching twice is cheap and subtracting one and branching twice is exponential.\n\n" +
        "When the work per call is not constant, use the recursion tree method: add the work at each level, then add the " +
        "levels. For merge sort each level sums to n and there are log n levels, so O(n log n). For T(n) = T(n minus 1) + " +
        "O(n), the levels are n, n minus 1, n minus 2 and so on, so O(n²).\n\n" +
        "For divide and conquer recurrences of the form T(n) = a T(n / b) + O(n^d), the Master theorem compares log_b a " +
        "(how fast the number of calls grows) with d (how fast the work per call shrinks). If log_b a is bigger, the leaves " +
        "win and the answer is n to the log_b a. If they are equal, every level costs the same and you get n^d log n. If d " +
        "is bigger, the top call wins and the answer is n^d. It does not cover recurrences that subtract (n minus 1); unroll " +
        "those.\n\n" +
        "Memoization changes the count, not the method: with a cache, each distinct argument is computed once, so time " +
        "becomes (number of distinct states) × (work per state). Fibonacci has n + 1 distinct arguments, so the 2ⁿ tree " +
        "collapses to O(n). Space is the cache plus the deepest chain of calls still waiting.\n\n" +
        "Below, pick a function and drag n: the tree is built by actually running the recursion, and the table sums each " +
        "level for you. Then try the Master theorem calculator on the classic recurrences.";
}
