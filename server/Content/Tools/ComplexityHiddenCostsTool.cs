namespace DsaAcademy.Content.Tools;

public class ComplexityHiddenCostsTool : ITool
{
    public string Id => "complexity-hidden-costs";
    public string Section => "Data Structures & Algorithms";
    public string Track => "complexity";
    public int Order => 5;

    public string Title => "Hidden Costs in Library Calls (C# and Python)";
    public string OneLiner => "One line of library code can be a whole loop: slicing, in on a list, insert at the front, LINQ, string +=, max() in a loop.";
    public string KeyTakeaway =>
        "Before you multiply, price every call inside the loop. Anything that copies (slices, Substring, ToList, path + [x]), " +
        "scans (Contains or in on a list, count, max, LINQ with a predicate) or shifts (insert or remove at the front) is O(n), " +
        "and an O(n) call inside an O(n) loop is O(n²) no matter how short the line looks.";

    public ToolKind ToolKind => ToolKind.ComplexityHiddenCosts;

    public string Explanation =>
        "The cost per trip in Step 2 of the analysis procedure is where most wrong answers come from, because library calls " +
        "hide their loops. A Python slice a[1:] or a C# range a[1..] on an array copies the rest of it. x in my_list and " +
        "List.Contains walk the list. list.pop(0) and RemoveAt(0) shift every remaining element. max(a), sum(a) and LINQ's " +
        "Count(predicate) all scan. None of these look like loops, and each one is O(n).\n\n" +
        "Strings deserve extra care. They are immutable in both C# and Python, so building one with += in a loop copies " +
        "everything built so far on every trip: O(n²) in the total length. CPython sometimes avoids the copy when nothing " +
        "else refers to the string, but that is an optimization you cannot rely on, so write \"\".join(parts) in Python and " +
        "use StringBuilder (or string.Join, string.Concat) in C#. Comparing or hashing a string is O(L) in its length, which " +
        "is why a dictionary keyed by words is O(L) per operation, not O(1).\n\n" +
        "LINQ and generators are lazy. Chaining Where and Select is still one pass when you finally enumerate it, which is " +
        "good. The trap is the opposite: enumerating the same lazy query more than once (calling Count(), then ElementAt, " +
        "then foreach) reruns the whole pipeline every time. Materialize it once with ToList() if you need it again.\n\n" +
        "Sorting is O(n log n) in time in both languages, but the extra space differs: Array.Sort and List.Sort in C# are " +
        "introsort with O(log n) recursion, LINQ OrderBy buffers O(n) and is stable, and Python's Timsort can use O(n) " +
        "extra. Say which one you are using when you state space.\n\n" +
        "For each trap below, look at the C# and Python versions, predict the total, then reveal the reason and the fix. " +
        "The table under it is a reference for the calls that show up in interview code most.";
}
