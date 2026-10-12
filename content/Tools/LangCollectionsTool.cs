namespace DsaAcademy.Content.Tools;

public class LangCollectionsTool : ITool
{
    public string Id => "lang-collections";
    public string Section => "Programming in C# & Python";
    public string Track => "basics";
    public int Order => 60;
    public string Title => "Collections: Lists, Dictionaries, Sets and Tuples";
    public string OneLiner => "Create, add, look up and loop over arrays and lists, dictionaries, sets and tuples in both languages, the modify-while-iterating trap, and the Big O of every common operation.";
    public string KeyTakeaway =>
        "Lists are O(1) by index and for adding at the end, but O(n) to search or to insert at the front. Dictionaries and " +
        "sets find, add and remove by key in O(1) on average, so a lookup inside a loop belongs in one of them. Assigning " +
        "a collection to another variable shares it rather than copying it, and changing a collection while looping over " +
        "it is a bug in both languages.";

    public ToolKind ToolKind => ToolKind.LangCollections;

    public string Explanation =>
        "A collection holds many values under one name. Four kinds cover nearly everything you'll write. A list keeps " +
        "items in order and reaches them by position (index). A dictionary, also called a map, stores pairs of a key and a " +
        "value and finds the value for a key almost instantly. A set holds unique values and answers \"is this in here?\" " +
        "almost instantly. A tuple bundles a small, fixed number of values, such as a name and a reading.\n\n" +
        "C# has two kinds of list: an array, whose length is fixed when it's created, and List<T>, which grows. The <T> " +
        "part names the type of item, so a List<int> can only hold ints; that's a generic type. Python's list grows and can " +
        "hold any mix of types. Dictionary<TKey, TValue> matches Python's dict, and HashSet<T> matches set.\n\n" +
        "Choosing the right collection is mostly about which operations must be fast. Big O notation describes how the " +
        "cost of an operation grows with the number of items n: O(1) means constant, however big the collection; O(n) " +
        "means proportional to its size. Reading a list by index is O(1), but searching a list for a value is O(n), while " +
        "a dictionary or set lookup is O(1) on average thanks to hashing. The table at the end of this lesson lists the " +
        "costs for every common operation.\n\n" +
        "Two mistakes cause most collection bugs: thinking that assigning a list to a new variable copies it (it doesn't, " +
        "both names share one list), and adding or removing items while looping over the same collection.";
}
