namespace DsaAcademy.Content.Tools;

public class LinuxScriptingRobustTool : ITool
{
    public string Id => "linux-scripting-robust";
    public string Section => "Linux & the Command Line";
    public string Track => "scripting";
    public int Order => 7;
    public string Title => "Shell Scripts: Loops, Functions, Exit Codes and set -euo pipefail";
    public string OneLiner => "Loop over files and lines, write functions, read exit codes, and make scripts stop loudly instead of carrying on after a failure.";
    public string KeyTakeaway => "Every command returns an exit status: 0 for success, anything else for failure, and $? holds the last one. By default bash ignores failures and keeps going. set -euo pipefail makes a script exit on a failing command, on an unset variable and on a failure anywhere in a pipeline, and trap ... EXIT cleans up however it ends.";

    public ToolKind ToolKind => ToolKind.LinuxScriptingRobust;

    public string Explanation =>
        "Scripts that run unattended (from cron, a CI pipeline or a deploy) need to do two things well: repeat work over many files or lines, and notice when something has gone wrong. This lesson covers for and while loops, reading a file line by line, and functions, which in the shell return an exit status rather than a value." +
        "\n\n" +
        "Exit codes are how every Linux program reports success or failure, and how && and || decide what runs next. Bash's default of carrying on after a failed command is the source of many bad deploys, so the widget lets you switch on set -e, set -u and pipefail one at a time against the same script and see the real output for each mix." +
        "\n\n" +
        "You'll finish with a script that checks its arguments, fails with a clear message, and cleans up its temporary files whatever happens, then practise loops and exit codes on the in-browser Linux machine.";
}
