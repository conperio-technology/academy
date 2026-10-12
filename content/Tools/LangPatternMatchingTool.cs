namespace DsaAcademy.Content.Tools;

public class LangPatternMatchingTool : ITool
{
    public string Id => "lang-pattern-matching";
    public string Section => "Programming in C# & Python";
    public string Track => "advanced";
    public int Order => 2600;
    public string Title => "Pattern Matching in Depth";
    public string OneLiner => "C# switch expressions with type, property, relational, positional and list patterns, versus Python's match with class, sequence and mapping patterns and guards, plus the capture-pattern trap and exhaustiveness.";
    public string KeyTakeaway =>
        "A pattern checks a value's shape and extracts its parts in one step; the first matching arm wins, so put specific cases first. C# adds relational and property patterns and warns about gaps; Python adds mapping patterns and guards. In Python a bare name in a case captures instead of comparing: use dotted names for constants.";

    public ToolKind ToolKind => ToolKind.LangPatternMatching;

    public string Explanation =>
        "Pattern matching replaces chains of type checks, casts and nested ifs with a table of shapes. Both languages match on types, tuples, object properties and the layout of lists, and both let you add an extra condition to a case.\n\n" +
        "The lesson works through each kind of pattern side by side with message, command and sensor examples, and covers the traps: arm order, the C# switch expression that throws when nothing matches, and the Python capture pattern that silently overwrites a \"constant\".";
}
