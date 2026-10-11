namespace DsaAcademy.Content.Tools;

public class LangLambdasTool : ITool
{
    public string Id => "lang-lambdas";
    public string Section => "Programming in C# & Python";
    public string Track => "intermediate";
    public int Order => 1000;
    public string Title => "Lambdas and Higher-Order Functions";
    public string OneLiner => "Functions as values: lambdas, Func and Action versus Python callables, passing functions in (sorting with key functions, map and filter), returning functions, closures, and the loop-variable trap.";
    public string KeyTakeaway =>
        "A function is a value: store it, pass it, return it. A lambda is a short inline function, x => x * 2 or lambda x: x * 2. " +
        "A closure captures variables, not their values, so lambdas made in a loop all see the loop variable's final value " +
        "unless you copy it (C#) or bind it as a default argument (Python).";

    public ToolKind ToolKind => ToolKind.LangLambdas;

    public string Explanation =>
        "This is the first lesson of the intermediate track. It assumes the basics track: variables, loops, functions, " +
        "collections and classes in both languages.\n\n" +
        "In both C# and Python, a function is a value like a number or a string. You can keep one in a variable, put it in " +
        "a list, pass it to another function, or have a function build and return a new one. A lambda is a small function " +
        "written inline without a name, which is the usual way to hand a bit of behaviour to another function: \"sort by " +
        "this\", \"keep the items where this is true\", \"call this when the button is pressed\". In C# the type of such a " +
        "value is a delegate, normally one of the ready-made Func and Action types; Python simply calls anything callable.\n\n" +
        "A function that takes or returns another function is a higher-order function. Sorting with a key function, " +
        "LINQ's Where and Select, Python's map, filter, sorted, min and max are all higher-order functions, and so is any " +
        "function of yours that takes a test or a callback as a parameter.\n\n" +
        "A function created inside another function can use the outer function's variables, even after the outer function " +
        "has returned. That function plus the variables it keeps alive is a closure. Closures are how a returned function " +
        "remembers its settings, and they explain the classic bug where lambdas created in a loop all report the same value.";
}
