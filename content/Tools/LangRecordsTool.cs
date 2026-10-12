namespace DsaAcademy.Content.Tools;

public class LangRecordsTool : ITool
{
    public string Id => "lang-records";
    public string Section => "Programming in C# & Python";
    public string Track => "intermediate";
    public int Order => 1500;
    public string Title => "Records, Dataclasses and Equality";
    public string OneLiner => "C# records and Python dataclasses, copies with with and replace, value equality versus identity, Equals and GetHashCode versus __eq__ and __hash__, why changeable keys break sets and dictionaries, and ordering your own types.";
    public string KeyTakeaway =>
        "Records and dataclasses generate a constructor, readable printing and value equality from the field list. Sets " +
        "and dictionaries use a hash code and then equality, so equal objects must hash equally: override both together, " +
        "and only use objects that can't change (records, frozen dataclasses, strings, tuples) as keys.";

    public ToolKind ToolKind => ToolKind.LangRecords;

    public string Explanation =>
        "Many classes exist mainly to hold data: a reading, an order line, a point. Writing their constructors, " +
        "printing and comparison by hand is repetitive and easy to get subtly wrong, so C# has record types and Python " +
        "has dataclasses, which generate all of it from a list of fields.\n\n" +
        "The most important thing they generate is value equality: two objects with the same data are equal, the way two " +
        "strings with the same text are. Ordinary classes compare by identity instead, asking whether both sides are the " +
        "same object. Neither is wrong; they suit different things.\n\n" +
        "Equality matters most inside hash sets and dictionaries. These find a key by first computing its hash code, a " +
        "number derived from the key that says which bucket to look in, and then checking equality within that bucket. " +
        "So objects that are equal must produce the same hash code, and a key must not change while it's stored, or it " +
        "will be looked for in the wrong bucket. The lesson shows both failures and how records, frozen dataclasses and " +
        "a hand-written Equals and GetHashCode (or __eq__ and __hash__) avoid them. It ends with ordering: making your " +
        "own types sortable with IComparable<T> or order=True.";
}
