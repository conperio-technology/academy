namespace DsaAcademy.Content.Tools;

public class LangRegexTool : ITool
{
    public string Id => "lang-regex";
    public string Section => "Programming in C# & Python";
    public string Track => "intermediate";
    public int Order => 1750;
    public string Title => "Regular Expressions";
    public string OneLiner => "The regex syntax you'll use every day, checking, finding, extracting with groups, replacing and splitting in C# and Python, greedy versus lazy, and avoiding catastrophic backtracking.";
    public string KeyTakeaway => "Write patterns as verbatim (@\"...\") or raw (r\"...\") strings, anchor with ^...$ (or fullmatch) to validate a whole string, use groups to pull out parts, and prefer a negated set like [^,]+ to a greedy .*. Never run nested quantifiers such as (a+)+ on user input: use a timeout or NonBacktracking in .NET, and simpler patterns in Python.";

    public ToolKind ToolKind => ToolKind.LangRegex;

    public string Explanation =>
        "Regular expressions describe the shape of text, and both languages build them in: Regex in C# and the re module in Python. This lesson teaches the syntax that covers nearly all real use, then the two APIs side by side for checking, extracting, replacing and splitting." +
        "\n\n" +
        "It also covers the two classic traps: greedy matching that grabs too much, and catastrophic backtracking, where a short input can make a careless pattern run for minutes. Two graded exercises follow: extracting codes from a log with a regex, and building a tiny regex matcher yourself with dynamic programming.";
}
