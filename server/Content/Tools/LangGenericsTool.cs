namespace DsaAcademy.Content.Tools;

public class LangGenericsTool : ITool
{
    public string Id => "lang-generics";
    public string Section => "Programming in C# & Python";
    public string Track => "intermediate";
    public int Order => 1300;
    public string Title => "Generics and Type Hints";
    public string OneLiner => "Writing code for any type without losing type checking: generic methods and classes, constraints and bounds, nullable and optional values, and Python's type hints, which a type checker reads but Python ignores at run time.";
    public string KeyTakeaway =>
        "A type parameter T lets one function or class work for any type while the compiler still checks every use. " +
        "Constraints (where T : IComparable<T>) say what T must support. Python's hints, list[T], int | None, look similar " +
        "but are only checked by tools like mypy or Pyright, never when the program runs.";

    public ToolKind ToolKind => ToolKind.LangGenerics;

    public string Explanation =>
        "You've used generic types since the basics: List<int> and Dictionary<string, int> are the generic List<T> and " +
        "Dictionary<TKey, TValue> with their type parameters filled in. This lesson shows how to write your own generics " +
        "in both languages, and how Python's optional types fit in.\n\n" +
        "C# checks types when it compiles, so a function that should work for ints, strings and anything else needs a " +
        "placeholder for the type, a type parameter, usually called T. The compiler works out T from each call and checks " +
        "it there. A constraint limits T to types that can do something, such as be compared, so the code inside can rely on it.\n\n" +
        "Python never needed generics to run: any function accepts anything. What it has instead are type hints, " +
        "annotations such as items: list[str] -> int | None that describe the intended types. Python ignores them when " +
        "running; a static type checker (mypy, Pyright, or the one in your editor) reads them and points out mistakes " +
        "before you run anything. Python 3.12 added a compact syntax for type parameters, def first[T](...), and the lesson " +
        "shows the older TypeVar spelling too.\n\n" +
        "Values that might be missing get the same treatment: int? in C# is a real type the compiler makes you check, " +
        "and int | None in Python is a hint.";
}
