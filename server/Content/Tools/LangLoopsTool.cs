namespace DsaAcademy.Content.Tools;

public class LangLoopsTool : ITool
{
    public string Id => "lang-loops";
    public string Section => "Programming in C# & Python";
    public string Track => "basics";
    public int Order => 40;
    public string Title => "Loops";
    public string OneLiner => "Counting for loops and range, foreach and for-in, getting the index with enumerate or Index(), while and do-while, break and continue, off-by-one errors, zip and nested loops.";
    public string KeyTakeaway =>
        "Prefer foreach (C#) or for-in (Python) when you just need the items: they can't run off the end. When you need " +
        "positions, use half-open ranges (i < n, range(n)) so the count is end minus start, and check the empty, single-item " +
        "and last-item cases by hand. break and continue only affect the innermost loop.";

    public ToolKind ToolKind => ToolKind.LangLoops;

    public string Explanation =>
        "A loop runs the same block of code repeatedly; each run is called an iteration. Loops are how a program processes " +
        "every item in a list, retries until something succeeds, or counts through a range of numbers. They're also where " +
        "most running time goes, so understanding how many times a loop runs is the first step towards Big O analysis.\n\n" +
        "There are two kinds. A for loop is for when you know what you're walking through: the numbers 0 to 9, or every " +
        "item in a list. C# has a counting for loop with three parts (start, condition, step) and a foreach loop over a " +
        "collection. Python's for always walks through a sequence; for counting you give it range(...), which produces " +
        "the numbers. A while loop is for when you don't know in advance how many iterations it will take: it keeps going " +
        "as long as a condition stays true.\n\n" +
        "Inside any loop, continue skips to the next iteration and break leaves the loop early. The most common loop bug " +
        "is the off-by-one error, running one time too many or too few, usually from mixing up < with <= or forgetting that " +
        "indexes stop at length minus 1. The samples below show each idea in both languages with the exact output.";
}
