namespace DsaAcademy.Content.Tools;

public class LangMemoryTool : ITool
{
    public string Id => "lang-memory";
    public string Section => "Programming in C# & Python";
    public string Track => "advanced";
    public int Order => 2000;
    public string Title => "Memory, Allocations and Span<T>";
    public string OneLiner => "Who frees memory and when: the .NET generational garbage collector versus CPython's reference counting, counting allocations, boxing, structs versus classes, Span<T> and stackalloc, memoryview, and __slots__.";
    public string KeyTakeaway =>
        "In .NET most objects die young, so the GC checks generation 0 often and old objects rarely; fewer allocations in hot loops means fewer pauses. Span<T> slices arrays and strings without copying. CPython frees an object when its last reference goes, a cycle collector handles the rest, and __slots__ shrinks objects you create by the thousand.";

    public ToolKind ToolKind => ToolKind.LangMemory;

    public string Explanation =>
        "This is the first lesson of the advanced track. It assumes the basics and intermediate tracks, especially values versus references, records and dataclasses, and generics.\n\n" +
        "Neither C# nor Python makes you free memory by hand, but both reward knowing how they do it. .NET's garbage collector traces which objects are still reachable and sorts survivors into generations, so allocating in a hot loop costs time later. Python counts references and frees objects the moment they're unused, with a separate collector for reference cycles.\n\n" +
        "The lesson measures what code allocates, shows when a value is boxed or copied, slices memory without copying using Span<T>, ReadOnlySpan<char> and stackalloc (and Python's memoryview), and shrinks Python objects with __slots__. These are the topics behind common interview questions such as \"what is boxing?\" and \"how does Python free memory?\".";
}
