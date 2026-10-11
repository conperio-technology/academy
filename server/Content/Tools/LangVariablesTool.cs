namespace DsaAcademy.Content.Tools;

public class LangVariablesTool : ITool
{
    public string Id => "lang-variables-types";
    public string Section => "Programming in C# & Python";
    public string Track => "basics";
    public int Order => 10;
    public string Title => "Variables, Types and Expressions";
    public string OneLiner => "int, double, decimal, bool, string and char in both languages, integer division and modulo, overflow, converting between types, and null versus None.";
    public string KeyTakeaway =>
        "In C#, int divided by int is an int (7 / 2 is 3) and an int silently wraps past 2,147,483,647; Python's / always gives " +
        "a float, // floors, and its ints never overflow. Binary floating point (double, float) can't store 0.1 exactly, so " +
        "use decimal for money and never compare floats with ==.";

    public ToolKind ToolKind => ToolKind.LangVariables;

    public string Explanation =>
        "A variable is a name for a value, so you can store something and use it later. Every value has a type, the kind of " +
        "value it is, and the type decides what you can do with it: you can divide numbers, but not text. C# makes you " +
        "state the type when you create a variable (or lets the compiler work it out with var), and then the variable can " +
        "only ever hold that type. Python attaches the type to the value instead, so the same name can point at a number " +
        "now and text later.\n\n" +
        "Numbers come in two families. Integers are whole numbers (C#'s int and long, Python's int). Floating point numbers " +
        "have a fractional part and are stored in binary (C#'s double and float, Python's float), which is fast but means " +
        "values like 0.1 are stored as the nearest binary fraction, slightly off. For values that must be exact in base 10, " +
        "such as money, both languages have a decimal type.\n\n" +
        "An expression is any piece of code that produces a value, such as 2 + 3 * 4 or price * quantity. The operators " +
        "mostly match between the languages, with two differences that catch people constantly: what division does with " +
        "two whole numbers, and how the remainder operator (%) treats negative numbers. Both are shown below with the actual " +
        "output of each line.\n\n" +
        "Converting a value from one type to another (text to number, double to int) is where data from the outside world " +
        "enters a program, so it's also where many errors start. Finally, null (C#) and None (Python) are how each language " +
        "says \"there's no value here\", and using one as if it were a value is the most common crash in both.";
}
