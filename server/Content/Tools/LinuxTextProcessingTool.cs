namespace DsaAcademy.Content.Tools;

public class LinuxTextProcessingTool : ITool
{
    public string Id => "linux-text-processing";
    public string Section => "Linux & the Command Line";
    public string Track => "scripting";
    public int Order => 8;
    public string Title => "Text Processing: grep, sed, awk, cut, sort, uniq and xargs";
    public string OneLiner => "The small tools that answer most questions about logs and CSV files, and the options you'll actually use.";
    public string KeyTakeaway => "grep picks lines, cut and awk pick columns, sed edits text as it streams past, sort and uniq -c count things, tr swaps characters, and xargs turns lines into arguments for another command. Chain them with pipes, quote patterns in single quotes, and use find -print0 | xargs -0 when filenames might contain spaces.";

    public ToolKind ToolKind => ToolKind.LinuxTextProcessing;

    public string Explanation =>
        "Most of the data an IT person handles is text: logs, CSV exports, configuration files, command output. Linux comes with a set of small tools that each do one job on lines of text, and chained together with pipes they answer questions that would otherwise need a script or a spreadsheet." +
        "\n\n" +
        "This lesson goes past the basics in the pipes lesson: regular expressions with grep -E and sed -E, sed's substitute and delete commands, awk's conditions, sums and arrays, sorting by a column numerically, and xargs for acting on many files. Every command in the toolbox below shows the output it really produced against the same small CSV file." +
        "\n\n" +
        "Then you'll answer questions about a server inventory and a web app log on the in-browser Linux machine.";
}
