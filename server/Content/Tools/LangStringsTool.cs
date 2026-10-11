namespace DsaAcademy.Content.Tools;

public class LangStringsTool : ITool
{
    public string Id => "lang-strings";
    public string Section => "Programming in C# & Python";
    public string Track => "basics";
    public int Order => 20;
    public string Title => "Strings";
    public string OneLiner => "Indexing, slicing and Substring, why strings can't be changed in place, interpolation and formatting, everyday methods, and building strings efficiently with StringBuilder or join.";
    public string KeyTakeaway =>
        "Strings are immutable in both languages: every method that seems to change one returns a new string, so assign the " +
        "result. Python slices are s[start:end] with the end excluded; C#'s Substring takes (start, length), and its ranges " +
        "s[start..end] work like Python's. Build a long string from many pieces with StringBuilder in C# or a list plus " +
        "\"\".join in Python, not with + in a loop.";

    public ToolKind ToolKind => ToolKind.LangStrings;

    public string Explanation =>
        "A string is a piece of text: a sequence of characters such as letters, digits, spaces and punctuation. Almost every " +
        "program handles text, whether it's names, tag IDs, log lines, file contents or messages from another system, so " +
        "string handling is where you'll spend a lot of everyday coding time.\n\n" +
        "Each character in a string has a position, called its index, counting from 0. Indexing reads one character; " +
        "slicing reads a run of them. The two languages agree on the idea but spell it differently, and the differences " +
        "(C#'s Substring takes a length, Python quietly clamps a slice that runs off the end) are a steady source of bugs.\n\n" +
        "Strings are immutable, meaning a string can't be changed once it exists. Upper-casing, trimming or replacing " +
        "always produces a new string. That makes strings safe to share between parts of a program, but it also means " +
        "that gluing pieces together with + inside a loop copies the whole string every time, which gets slow for large " +
        "outputs. Each language has a standard tool for building text efficiently.\n\n" +
        "Below: indexing and slicing, immutability, interpolation (putting values into text) and number formatting, the " +
        "everyday methods side by side, and characters as numbers. Every sample's output is shown in its comments.";
}
