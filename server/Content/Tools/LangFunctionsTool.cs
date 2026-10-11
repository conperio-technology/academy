namespace DsaAcademy.Content.Tools;

public class LangFunctionsTool : ITool
{
    public string Id => "lang-functions";
    public string Section => "Programming in C# & Python";
    public string Track => "basics";
    public int Order => 50;
    public string Title => "Functions";
    public string OneLiner => "Defining and calling functions, parameters and return values, default and named arguments, returning tuples, scope, side effects, what a function can change, and a first look at recursion.";
    public string KeyTakeaway =>
        "A function takes inputs, does one job and returns a result. Variables created inside it are local to each call. " +
        "Passing a list passes a reference to the same list, so methods like Add or append change the caller's list, " +
        "but assigning a new list to the parameter doesn't. Python evaluates default values once, so never use a list or " +
        "dict as a default.";

    public ToolKind ToolKind => ToolKind.LangFunctions;

    public string Explanation =>
        "A function is a named block of code you can run (call) from anywhere, as often as you like, with different inputs. " +
        "Functions are how programs avoid repeating themselves and how big problems are split into small, testable pieces. " +
        "In C#, functions always live inside a class and are called methods; Python has free-standing functions as well as " +
        "methods.\n\n" +
        "The inputs listed in a function's definition are its parameters; the actual values supplied in a call are " +
        "arguments. A function can send one value back to its caller with return. Both languages let parameters have " +
        "default values, so callers can leave them out, and let callers name the arguments they pass, which makes calls with " +
        "several settings readable. To hand back several values, return a tuple.\n\n" +
        "Scope is where a name is visible. Variables created inside a function are local: each call gets fresh ones and they " +
        "disappear when it returns. A function that changes things outside itself (a global variable, a list it was " +
        "given, a file) has side effects, which make code harder to follow and test. Knowing exactly what a function can " +
        "and can't change about its arguments is one of the most useful things to get straight early.\n\n" +
        "Finally, a function can call itself. That's recursion, the basis of many algorithms on trees and nested data, " +
        "covered step by step in the recursion lessons of Data Structures & Algorithms.";
}
