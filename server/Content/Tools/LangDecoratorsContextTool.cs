namespace DsaAcademy.Content.Tools;

public class LangDecoratorsContextTool : ITool
{
    public string Id => "lang-decorators-context";
    public string Section => "Programming in C# & Python";
    public string Track => "advanced";
    public int Order => 2300;
    public string Title => "Decorators, Context Managers and IDisposable";
    public string OneLiner => "Wrapping functions with Python decorators and C# delegates, decorators with settings and caching, guaranteed clean-up with using and IDisposable versus with and context managers, @contextmanager and ExitStack, and how C# attributes differ from decorators.";
    public string KeyTakeaway =>
        "A decorator wraps a function to add behaviour around it (logging, caching, retries) and @name applies it; C# wraps delegates or uses the decorator pattern. Anything that must be released goes in using (IDisposable) or with (a context manager), which run the clean-up on every path, in reverse order of acquisition.";

    public ToolKind ToolKind => ToolKind.LangDecoratorsContext;

    public string Explanation =>
        "Two everyday tools for real code. Decorators add behaviour to a function without changing its code: logging, timing, caching, permission checks, retries. Python has @ syntax for them; C# gets the same effect by wrapping delegates or with the decorator design pattern.\n\n" +
        "Files, connections, locks and transactions must be released even when an error happens. C#'s using statement and IDisposable, and Python's with statement and context managers, guarantee that. The lesson writes both by hand, then the short forms (using declarations, @contextmanager), handles a variable number of resources, and shows how C# attributes, labels read by frameworks, differ from decorators.\n\n" +
        "The two exercises after this lesson practise each half: a clean-up order checker and a memoizing wrapper.";
}
