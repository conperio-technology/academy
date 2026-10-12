namespace DsaAcademy.Content.Tools;

public class LinuxScriptingBasicsTool : ITool
{
    public string Id => "linux-scripting-basics";
    public string Section => "Linux & the Command Line";
    public string Track => "scripting";
    public int Order => 6;
    public string Title => "Shell Scripts: Variables, Quoting and Conditionals";
    public string OneLiner => "Turn the commands you type into a script: arguments, variables, quoting, if and case, then write real scripts on a Linux machine in your browser.";
    public string KeyTakeaway => "A script is the commands you'd type, saved in a file with a shebang line and made executable. Variables are plain strings; $1, $# and $@ are the arguments. Put double quotes around every \"$variable\", or a value with a space becomes two arguments. if runs a command and branches on its exit status, and [ is just a command, so it needs spaces.";

    public ToolKind ToolKind => ToolKind.LinuxScriptingBasics;

    public string Explanation =>
        "Once you've typed the same five commands twice, it's time for a script. A shell script is a text file of commands that bash (or another shell) runs top to bottom. The same language you use at the prompt is the programming language: variables, if, loops and functions are all there, with a few rules that trip everyone up once." +
        "\n\n" +
        "The biggest of those rules is quoting. The shell splits unquoted variables into words and expands wildcards in them, so a filename with a space turns into two arguments. Double quotes keep a value whole while still expanding it; single quotes keep everything literal. The widget below shows exactly what a command receives in each case." +
        "\n\n" +
        "Conditions work differently from C# or Python: if runs a command and checks whether it succeeded (exit status 0). The [ ... ] test is itself a command, which is why the spaces inside it matter. The lesson ends on a real Linux machine running in your browser, where you write and run your own scripts.";
}
