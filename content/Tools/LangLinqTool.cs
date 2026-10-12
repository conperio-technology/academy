namespace DsaAcademy.Content.Tools;

public class LangLinqTool : ITool
{
    public string Id => "lang-linq";
    public string Section => "Programming in C# & Python";
    public string Track => "intermediate";
    public int Order => 1100;
    public string Title => "LINQ and Comprehensions";
    public string OneLiner => "Querying collections: LINQ's Where, Select, OrderBy, GroupBy, Any, All and First next to list, dict and set comprehensions and generator expressions, with deferred execution and a side-by-side table.";
    public string KeyTakeaway =>
        "xs.Where(x => x > 0).Select(x => x * 2) is [x * 2 for x in xs if x > 0]. LINQ queries and Python generator " +
        "expressions are lazy: nothing runs until something reads the results. A LINQ query runs again every time you read " +
        "it and a generator can be read only once, so call ToList() or list() when you need the results more than once.";

    public ToolKind ToolKind => ToolKind.LangLinq;

    public string Explanation =>
        "Most code that works with collections does a few things over and over: keep some items, transform each one, sort, " +
        "group, add up, or ask whether any or all of them match. Writing a loop each time works, but says how rather than " +
        "what. Both languages have a compact way to say what.\n\n" +
        "In C# it's LINQ: methods like Where (keep the items that pass a test), Select (turn each item into something " +
        "else), OrderBy, GroupBy, Sum and Any, each taking a lambda and chained one after another. They work on any " +
        "sequence: arrays, lists, dictionaries, and even database tables through libraries like Entity Framework.\n\n" +
        "Python's equivalent is the comprehension, [expression for item in items if condition], with curly-brace versions " +
        "that build dicts and sets, plus built-ins like sum, any, all, min, max and sorted. A generator expression, the " +
        "same thing in round brackets, produces items one at a time instead of building a list.\n\n" +
        "Both rely on lazy evaluation, which C# calls deferred execution: a query describes the work, and the work happens " +
        "only when something reads the results. That saves work and memory, but has two consequences worth knowing by " +
        "heart, both shown in the lesson: a LINQ query runs again each time it's read, and a Python generator is empty " +
        "the second time.";
}
