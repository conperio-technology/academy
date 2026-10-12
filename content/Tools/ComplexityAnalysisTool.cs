namespace DsaAcademy.Content.Tools;

public class ComplexityAnalysisTool : ITool
{
    public string Id => "complexity-analysis";
    public string Section => "Data Structures & Algorithms";
    public string Track => "complexity";

    // Right after Big O Notation (Order = 0), which teaches what the notations MEAN --
    // this teaches how to derive one from code you're looking at.
    public int Order => 1;

    public string Title => "How to Analyze Time & Space Complexity";
    public string OneLiner => "Big O tells you what O(n²) means; this is the skill of looking at actual code and working out which one it is.";
    public string KeyTakeaway =>
        "Complexity is two questions multiplied together: (1) how many times does the loop or recursion run -- " +
        "decided by the code's STRUCTURE -- and (2) what does each trip through it cost -- decided by which " +
        "data-structure operations you call inside. The same loop is O(n) or O(n²) depending only on whether " +
        "the thing inside it is a hash lookup or a list scan.";

    public ToolKind ToolKind => ToolKind.ComplexityAnalysis;

    public string Explanation =>
        "The Big O lesson gives you a vocabulary and a lookup table. Neither helps much when someone hands you " +
        "twelve lines of code and asks \"what's the complexity?\" -- that's a separate skill, and it comes down to " +
        "a short procedure you can run on any snippet.\n\n" +
        "Step 1 -- count how many times the work repeats, from the code's shape alone. A single loop over n items " +
        "runs n times. A loop nested in another loop over n runs n x n times. A loop that cuts its remaining range " +
        "in half every trip (binary search, or `while (n > 1) n /= 2`) runs log n times. Two loops one AFTER the " +
        "other add (n + n is still O(n)); loops one INSIDE the other multiply. A recursive function that calls " +
        "itself twice per call roughly doubles at every level -- that's exponential, unless memoization (remembering the " +
        "result of each call so a repeat is just a lookup) collapses the repeats.\n\n" +
        "Step 2 -- price each trip. This is where the data-structure cost table earns its keep: indexing an array " +
        "is O(1), a hash-set lookup is O(1) on average, scanning a list with Contains is O(n), sorting is " +
        "O(n log n), a heap push or pop is O(log n). Multiply Step 1 by Step 2. A loop over n items that calls " +
        "`list.Contains(x)` inside is n x n = O(n²); the identical loop calling `set.Contains(x)` is n x 1 = O(n). " +
        "That one swap is the entire reason a hash map turns Two Sum from O(n²) into O(n).\n\n" +
        "Step 3 -- keep only the biggest term and drop constants: n² + n becomes n², and 3n becomes n. " +
        "Space works the same way, but you count what you ALLOCATE rather than what you repeat: a new array or " +
        "hash set that grows with the input is O(n), and recursion costs one stack frame per level of depth, so a " +
        "recursion n levels deep is O(n) space even if it allocates nothing else. Variables that don't grow with " +
        "the input are O(1).\n\n" +
        "Try the drill below. Each snippet asks for time or space; after you answer you get the two-step " +
        "breakdown, not just a verdict.";
}
