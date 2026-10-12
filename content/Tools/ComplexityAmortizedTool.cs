namespace DsaAcademy.Content.Tools;

public class ComplexityAmortizedTool : ITool
{
    public string Id => "complexity-amortized";
    public string Section => "Data Structures & Algorithms";
    public string Track => "complexity";
    public int Order => 3;

    public string Title => "Amortized Analysis: When One Slow Step Is Fine";
    public string OneLiner => "Why appending to a list is O(1) even though some appends copy everything, and why a while inside a for is often still O(n).";
    public string KeyTakeaway =>
        "Amortized analysis bounds the TOTAL cost of a sequence of operations, then divides by the count. If every element " +
        "can only be pushed once and popped once, or a pointer can only move forward, count those moves over the whole run " +
        "instead of multiplying the loop bounds.";

    public ToolKind ToolKind => ToolKind.ComplexityAmortized;

    public string Explanation =>
        "Worst case per operation can be misleading. A dynamic array (C# List<T>, Python list) has spare capacity; when it " +
        "runs out, it allocates a bigger array and copies every element, which costs O(n) for that one append. But because " +
        "it grows by a constant FACTOR, the expensive appends get exponentially rarer: copying 4, then 8, then 16 items, up " +
        "to n, adds up to less than 2n. So n appends cost O(n) in total, and we say each append is amortized O(1). Grow by " +
        "a constant AMOUNT instead and the copies add up to O(n²). Hash tables use the same trick when they resize.\n\n" +
        "Amortized is not the same as average case. Average case is about random inputs (a hash lookup is O(1) on average " +
        "over hash values). Amortized is a guarantee over any sequence of operations: no input can make n appends cost more " +
        "than O(n). Interviewers like hearing that distinction.\n\n" +
        "The same counting argument explains loops that look nested but are linear. In a sliding window, the right pointer " +
        "moves n times and the left pointer can only move forward, so it moves at most n times in total, however the while " +
        "loop is written. In a monotonic stack, each element is pushed exactly once and popped at most once, so the inner " +
        "while loop pops at most n times over the whole run. A queue built from two stacks moves each element between stacks " +
        "once. In all of these the right question is not \"how many times can the inner loop run per outer trip\" but \"how " +
        "many times can it run in total\".\n\n" +
        "Below: the cost of every individual append under four growth policies, then two tracers that count the inner loop " +
        "trips of a monotonic stack and a sliding window step by step.";
}
