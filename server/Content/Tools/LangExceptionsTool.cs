namespace DsaAcademy.Content.Tools;

public class LangExceptionsTool : ITool
{
    public string Id => "lang-exceptions";
    public string Section => "Programming in C# & Python";
    public string Track => "basics";
    public int Order => 70;
    public string Title => "Errors and Exceptions";
    public string OneLiner => "What an exception is, reading a stack trace in each language, try/catch/finally versus try/except/else/finally, throw and raise, when to check instead, and the matching exception names.";
    public string KeyTakeaway =>
        "An exception unwinds the call stack until a matching catch or except handles it; finally always runs. Catch " +
        "specific types, put them before broad ones, and never swallow an exception silently. A C# stack trace lists the " +
        "failing call first; a Python traceback lists it last, so read Python's from the bottom up.";

    public ToolKind ToolKind => ToolKind.LangExceptions;

    public string Explanation =>
        "Programs fail: a file is missing, a sensor sends text where a number belongs, a list is empty when the code " +
        "expected at least one item. When a function hits a problem it can't deal with, it throws (C#) or raises (Python) " +
        "an exception, an object describing what went wrong. The function stops at that point and the exception travels " +
        "back up through the functions that called it, a process called unwinding the stack, until some code catches it.\n\n" +
        "If nothing catches it, the program stops and prints a stack trace: the exception's type and message plus the " +
        "chain of calls that led there, with file names and line numbers. Learning to read one quickly is one of the most " +
        "valuable debugging skills there is, so this lesson shows real traces from both languages.\n\n" +
        "To handle an exception you wrap the risky code in a try block and add a catch (C#) or except (Python) clause for " +
        "each kind of exception you can actually deal with, plus an optional finally block for cleanup that must happen " +
        "either way. Your own functions can throw exceptions too, to refuse bad input loudly instead of carrying on with " +
        "nonsense.\n\n" +
        "The languages have different habits. C# reserves exceptions for unexpected problems and offers TryParse-style " +
        "methods for failures you expect. Python code commonly just tries an operation and handles the exception. Both " +
        "agree that an empty catch block that hides an error is never the answer.";
}
