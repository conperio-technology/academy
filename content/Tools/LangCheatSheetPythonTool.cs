namespace DsaAcademy.Content.Tools;

public class LangCheatSheetPythonTool : ITool
{
    public string Id => "lang-cheat-python";
    public string Section => "Programming in C# & Python";
    public string Track => "cheat sheets";
    public int Order => 5001;
    public string Title => "Python Cheat Sheet";
    public string OneLiner => "One searchable page of Python: syntax, strings, lists, dicts and sets with their Big O, comprehensions and generators, classes and dataclasses, exceptions, lambdas and type hints, protocols and equality, files and parsing, asyncio, pytest, memory, threads and processes, decorators and context managers, special methods, match, itertools and retries, and interview idioms like heapq, deque, Counter and defaultdict.";
    public string KeyTakeaway =>
        "list, dict, set, collections.deque, collections.Counter, collections.defaultdict and heapq cover almost every " +
        "interview problem. Use deque.popleft(), not list.pop(0); join strings with \"\".join; sort with key= functions; " +
        "and remember that / always gives a float while // floors.";

    public ToolKind ToolKind => ToolKind.LangCheatSheetPython;

    public string Explanation =>
        "A compact reference for everyday and interview Python. Every snippet runs as shown with Python 3.12 or later " +
        "(most need only 3.10; generic [T] syntax and itertools.batched need 3.12), with the output in the comments. Search by keyword or filter by topic, copy any " +
        "snippet with its button, and use Print for a paper copy: the controls and the sidebar are left off the printout.\n\n" +
        "Big O figures are for CPython's built-in types: \"amortized\" means an occasional slow operation averaged out " +
        "over many fast ones, and \"avg\" for dicts and sets means typical inputs. The C# Cheat Sheet covers the same " +
        "ground, and the C# vs Python Translation Table puts the two side by side.";
}
