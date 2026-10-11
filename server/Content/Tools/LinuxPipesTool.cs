namespace DsaAcademy.Content.Tools;

public class LinuxPipesTool : ITool
{
    public string Id => "linux-pipes";
    public string Section => "Linux & the Command Line";
    public string Track => "terminal";
    public int Order => 3;
    public string Title => "Pipes, Redirection and Searching Logs";
    public string OneLiner => "Chain small commands together to answer real questions about a log file.";
    public string KeyTakeaway =>
        "| sends one command's output into the next, > saves output to a file (replacing it), >> appends. " +
        "grep finds lines, wc -l counts them, sort and uniq -c group them, awk picks out columns, head and " +
        "tail trim. Together they answer most \"what happened on this server?\" questions in one line.";

    public ToolKind ToolKind => ToolKind.LinuxPipes;

    public string Explanation =>
        "Unix commands are deliberately small: each does one job on lines of text. The power comes from " +
        "connecting them. A pipe, |, takes everything one command prints and feeds it to the next as input, " +
        "so grep ERROR app.log | wc -l means \"find the error lines, then count them\".\n\n" +
        "Redirection sends output somewhere other than the screen. > file writes it into a file, replacing " +
        "whatever was there -- easy to lose data with, so double-check. >> file adds to the end instead. " +
        "2> file captures error messages, which travel separately from normal output.\n\n" +
        "The toolkit you'll use most: grep (lines that match; -c counts, -i ignores case, -v inverts), head " +
        "and tail (first or last lines; tail -f follows a log as it grows), wc -l (count lines), sort (sort " +
        "lines; -n numerically, -r reversed), uniq -c (collapse repeated neighbouring lines into a count -- " +
        "which is why you sort first), cut and awk (pull out columns: awk '{print $4}' prints the 4th " +
        "space-separated field).\n\n" +
        "The log in this lesson is the kind of file you'd be handed during an incident. Each line is date, " +
        "time, level, client IP, request and result. Questions like \"how many errors?\" and \"who's hitting " +
        "us hardest?\" are a single pipeline each.";
}
