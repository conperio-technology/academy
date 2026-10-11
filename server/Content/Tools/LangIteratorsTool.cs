namespace DsaAcademy.Content.Tools;

public class LangIteratorsTool : ITool
{
    public string Id => "lang-iterators";
    public string Section => "Programming in C# & Python";
    public string Track => "intermediate";
    public int Order => 1400;
    public string Title => "Iterators and Generators";
    public string OneLiner => "What a loop really does (IEnumerable and MoveNext, iter and next), writing sequences with yield in both languages, laziness, endless sequences and pipelines, and making your own classes loopable.";
    public string KeyTakeaway =>
        "A method with yield return (C#) or a function with yield (Python) produces a lazy sequence: its body runs only " +
        "as items are requested, pausing at each yield. That lets you process endless or huge sequences in constant " +
        "memory, but a Python generator can be read once, and a C# iterator reruns from the top every time it's enumerated.";

    public ToolKind ToolKind => ToolKind.LangIterators;

    public string Explanation =>
        "Every foreach and for loop works the same way underneath: it asks the collection for an iterator, an object " +
        "that hands out one item at a time and remembers its place, and keeps asking until there are no more. In C# the " +
        "collection is an IEnumerable<T> and the iterator an IEnumerator<T>; in Python they're any object with __iter__ " +
        "and __next__, and the end is signalled by StopIteration.\n\n" +
        "The useful part is that you can write your own sequences without building a list. A C# method containing yield " +
        "return, or a Python function containing yield (a generator), hands back one value at a time, pausing between " +
        "them with its local variables intact. Nothing runs until the first item is requested, and the rest never runs if " +
        "nobody asks for it.\n\n" +
        "That lazy evaluation makes it possible to describe endless sequences (all the natural numbers, every Fibonacci " +
        "number) and to chain steps into pipelines that read a huge file or stream line by line in constant memory. It " +
        "also has traps, covered in the questions: generators are one-shot, and an iterator's code runs later than it looks.";
}
