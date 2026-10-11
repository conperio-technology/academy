namespace DsaAcademy.Content.Tools;

public class ComplexityVariablesTool : ITool
{
    public string Id => "complexity-variables";
    public string Section => "Data Structures & Algorithms";
    public string Track => "complexity";
    public int Order => 4;

    public string Title => "What Is n? Multiple Variables, Input Size and Output Size";
    public string OneLiner => "O(n + m) versus O(n · m), strings of length L, k in top-k, V and E in graphs, and why O(n · W) knapsack is not really polynomial.";
    public string KeyTakeaway =>
        "Before any Big O, say what each letter means. Independent inputs get their own letters and stay separate: " +
        "sequential passes add (n + m), nested passes multiply (n · m). Watch for numbers that are VALUES rather than sizes, " +
        "and for outputs that are bigger than the input.";

    public ToolKind ToolKind => ToolKind.ComplexityVariables;

    public string Explanation =>
        "\"O(n)\" means nothing until you say what n is. For one array it is obvious, but most interview problems have more " +
        "than one size in them: two arrays of lengths n and m, n words of length up to L, a graph with V vertices and E " +
        "edges, a grid with n rows and m columns, a heap that never holds more than k items. Collapsing these into a " +
        "single n is the most common way a correct analysis comes out wrong.\n\n" +
        "The rules for combining them are the same as for one variable. Work done one AFTER the other adds: a pass over a " +
        "then a pass over b is O(n + m). Work done INSIDE other work multiplies: for each of n items, scan m items, is " +
        "O(n · m). You can only drop a term when one variable is known to be bounded by the other: O(V + E) becomes O(E) " +
        "for a connected graph, because E ≥ V minus 1, but O(n + m) stays as it is unless the problem says the lists are " +
        "the same size.\n\n" +
        "Some letters stand for a VALUE, not a length. Trial division up to √x and the O(n · W) knapsack table are " +
        "polynomial in the number x or W, but the input only takes about log x digits to write. Add one digit and the work " +
        "multiplies by 10 (or by √10). These are called pseudo-polynomial, and saying \"O(√x), where x is the value\" " +
        "shows you know the difference. Binary search on the answer has the same flavour: O(n log M) where M is the largest " +
        "value, not the array length.\n\n" +
        "Finally, the output can be the bottleneck. Generating all subsets cannot beat O(n · 2ⁿ), because that is how big " +
        "the answer is. Reporting every pair that matches a condition is O(n log n + k) for k matches, which can be n². " +
        "Bounds that include the output size are called output-sensitive, and naming k is better than guessing.";
}
