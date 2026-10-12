namespace DsaAcademy.Content.Tools;

public class LangConditionalsTool : ITool
{
    public string Id => "lang-conditionals";
    public string Section => "Programming in C# & Python";
    public string Track => "basics";
    public int Order => 30;
    public string Title => "Conditionals and Boolean Logic";
    public string OneLiner => "if, else if and elif, comparison and logical operators, short-circuit evaluation, Python truthiness versus C#'s strict bools, the conditional expression, and switch versus match.";
    public string KeyTakeaway =>
        "&& / and and || / or short-circuit: the right side runs only when it can change the answer, which makes \"check it " +
        "isn't null, then use it\" safe in one condition. Python treats 0, empty strings, empty collections and None as false; " +
        "C# accepts only real bools. In Python's match, a bare name in a case captures instead of comparing.";

    public ToolKind ToolKind => ToolKind.LangConditionals;

    public string Explanation =>
        "A conditional lets a program make a decision: run this code only if something is true, otherwise run that. The " +
        "thing being tested is a condition, an expression that is either true or false. Values that are only ever true or " +
        "false are called booleans (bool in both languages), after George Boole, who worked out the algebra of true and " +
        "false in the 1840s.\n\n" +
        "Conditions are built from comparisons (is this bigger than that, are these equal) joined with logical operators: " +
        "and (both must be true), or (at least one must be true) and not (flip it). Both languages stop working out an " +
        "and/or as soon as the answer is certain, which is called short-circuit evaluation and is used deliberately all " +
        "the time.\n\n" +
        "The languages differ on what may appear in a condition. C# insists on a real bool. Python lets any value stand in a " +
        "condition and decides whether it counts as true (truthy) or false (falsy): zero, empty text, empty collections " +
        "and None are falsy. That's convenient and idiomatic, and also a source of bugs when 0 or empty text is a valid " +
        "value.\n\n" +
        "For choosing among many cases there's C#'s switch (a statement and, more usefully, an expression that produces a " +
        "value) and Python's match, which arrived in Python 3.10 and does structural pattern matching: it can check the " +
        "shape of a value and pull pieces out of it, not just compare it with constants.";
}
