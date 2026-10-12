namespace DsaAcademy.Content.Tools;

public class LangMetaprogrammingTool : ITool
{
    public string Id => "lang-metaprogramming";
    public string Section => "Programming in C# & Python";
    public string Track => "advanced";
    public int Order => 2400;
    public string Title => "Dunder Methods, Operators and Reflection";
    public string OneLiner => "Making your types work with + and ==, len, indexing, in and for: operator overloading and Python's special methods versus C# indexers and IEnumerable, properties and descriptors, reflection, and metaclasses at the level an interview expects.";
    public string KeyTakeaway =>
        "Python's syntax calls dunder methods (__add__, __len__, __getitem__, __iter__); C# uses static operator methods, indexers and interfaces. Overload operators only for value-like types and keep equality and hashing consistent. Reflection and metaclasses are powerful but rarely the right first tool.";

    public ToolKind ToolKind => ToolKind.LangMetaprogramming;

    public string Explanation =>
        "Metaprogramming is code that works with code: making your own types respond to the language's operators and built-in functions, inspecting types at run time, and changing how classes are created.\n\n" +
        "The lesson builds a vector type with operators in both languages, makes a class behave like a built-in collection, explains Python's descriptors (the mechanism behind property), uses reflection to list and call members by name, and introduces metaclasses and __init_subclass__.\n\n" +
        "Reflection is blocked in the exercise sandbox, so the two exercises after this lesson practise operators and collection protocols instead.";
}
