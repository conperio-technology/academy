namespace DsaAcademy.Content.Tools;

public class LangFilesFormattingTool : ITool
{
    public string Id => "lang-files-formatting";
    public string Section => "Programming in C# & Python";
    public string Track => "intermediate";
    public int Order => 1700;
    public string Title => "Files, Formatting and Parsing";
    public string OneLiner => "Reading and writing text files, using and with for clean-up, format strings for width, alignment and decimals, parsing numbers safely, culture and rounding surprises, splitting CSV, and JSON in both languages.";
    public string KeyTakeaway =>
        "Open files inside using (C#) or with (Python) so they're always closed, and say the encoding in Python. Parse " +
        "untrusted text with TryParse or try/except. C# formats and parses numbers with the computer's culture, so use " +
        "CultureInfo.InvariantCulture for data files. Both languages round exact halves to even when formatting doubles.";

    public ToolKind ToolKind => ToolKind.LangFilesFormatting;

    public string Explanation =>
        "Programs spend a lot of their time turning text into data and data back into text: reading a CSV export, " +
        "writing a report, loading a settings file, calling a web API that speaks JSON. This lesson covers the everyday " +
        "tools for all of it.\n\n" +
        "Files first: the one-call helpers for small files, reading big ones line by line, and the using and with " +
        "statements that guarantee a file is closed even when something goes wrong. Then formatting: C#'s {value,width:format} " +
        "and Python's {value:>width.decimals} for lining up columns and controlling decimals. Then parsing: turning text " +
        "into numbers without crashing on bad input, and splitting lines into fields.\n\n" +
        "Two traps get special attention because they bite experienced developers. C# formats and parses numbers using " +
        "the computer's culture (its language and region settings), so a file written on one machine can be misread on " +
        "another. And rounding: values like 2.675 aren't stored exactly, and exact halves like 2.5 round to the nearest " +
        "even number. The lesson ends with JSON serialization, turning objects into text and back.\n\n" +
        "The samples work with real files. The graded exercises after the lesson pass text in as a string instead, " +
        "because the exercise sandbox has no file system; the parsing and formatting code is identical.";
}
