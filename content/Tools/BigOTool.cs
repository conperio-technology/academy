namespace DsaAcademy.Content.Tools;

public class BigOTool : ITool
{
    public string Id => "big-o-notation";
    public string Section => "Data Structures & Algorithms";
    public string Track => "complexity";

    // Sits above every DSA concept -- this is prerequisite knowledge, not one topic
    // among many. Every other lesson's "O(n)" / "O(n^2)" references assume this one.
    public int Order => 0;

    public string Title => "Big O Notation: Time & Space Complexity";
    public string OneLiner => "Not \"how fast is it\" -- \"how does the work (or the memory) grow as the input grows.\"";
    public string KeyTakeaway =>
        "Big O describes the SHAPE of a growth curve, not a stopwatch time: O(1) < O(log n) < O(n) " +
        "< O(n log n) < O(n^2) < O(2^n), and the gap between neighbors explodes as n grows. The same " +
        "notation measures two different things -- TIME complexity (how the operation count grows) " +
        "and SPACE complexity (how the EXTRA memory used, beyond the input itself, grows) -- and an " +
        "algorithm can be great at one and bad at the other.";

    public ToolKind ToolKind => ToolKind.BigOChart;

    public string Explanation =>
        "Big O answers one question: as the input size n grows, how does the amount of work grow " +
        "with it? It deliberately throws away the details that don't matter at scale -- constant " +
        "factors and lower-order terms. An algorithm that does exactly 3n + 20 operations is still " +
        "O(n): double n and the work roughly doubles, and that linear relationship is the only thing " +
        "Big O is describing. This is also why it's a WORST-CASE, not an average-runtime, measure by " +
        "default -- \"O(n)\" is a promise about the growth trend, not a benchmark. In practice, reading " +
        "code for its Big O comes down to a few shapes: one loop over n items is O(n); a loop inside " +
        "a loop, each over n, is O(n^2); cutting the problem in half every step (binary search) is O(log " +
        "n), where log n (the base-2 logarithm) is how many times you can halve n before reaching 1, so about 20 for a million; doing an O(n) pass at each of the log n levels of a divide-and-conquer split (cut " +
        "the input in half, solve each half, combine) is O(n log n); and trying every possible combination of n choices (generating all subsets, as " +
        "in Backtracking) is O(2^n). Every lesson in the Patterns track is, at its core, an exercise in " +
        "noticing a brute-force (try every possibility) O(n^2) (or worse) approach and finding the trick -- a hash map, a " +
        "sorted-array two-pointer scan, a sliding window -- that gets it down to O(n). Play with the " +
        "chart below: at small n every curve looks similar, but slide n up and watch how fast O(n^2) " +
        "and especially O(2^n) pull away from everything else.\n\n" +
        "Space complexity uses the exact same growth vocabulary, but for memory instead of operations " +
        "-- specifically, EXTRA (auxiliary) memory beyond whatever was already handed to the function " +
        "as input. Reversing an array in place (see Array Reversal: Two Pointers) is O(1) space -- a " +
        "couple of index variables, regardless of how big the array is. Building a brand-new reversed " +
        "copy instead would be O(n) space. Recursion has a sneaky space cost too: every call sitting on " +
        "the call stack (the list of calls that have started but not yet returned; see Recursion: Factorial) uses memory until it returns, so a recursive " +
        "function with a call depth of n is generally O(n) space even if it never allocates anything " +
        "explicitly -- this is also exactly why unbounded recursion eventually crashes with a stack " +
        "overflow, not just \"runs slowly.\" Time and space are usually a trade-off, not a package " +
        "deal: Hash Maps: Two Sum trades O(n) extra space for O(n) time (down from the O(n^2) " +
        "brute-force nested loop); the two-pointer version of the same problem gets O(1) space, but " +
        "only works because the input is sorted first. The cheat sheets below are the two tables " +
        "you'll want to come back to again and again -- common data structure operations, and common " +
        "sorting algorithms, each with both time (best/average/worst where they differ) and space.";
}
