namespace DsaAcademy.Content.Tools;

public class PsScriptingRemotingTool : ITool
{
    public string Id => "ps-scripting-remoting";
    public string Section => "Windows & PowerShell";
    public string Track => "powershell";
    public int Order => 6;
    public string Title => "PowerShell Scripting, Remoting and Execution Policy";
    public string OneLiner => "Write a real script with parameters and error handling, run commands on many machines at once, and understand execution policy.";
    public string KeyTakeaway => "Scripts declare typed parameters with param(), output objects rather than text, and need -ErrorAction Stop (or $ErrorActionPreference = 'Stop') for try/catch to see cmdlet errors. Invoke-Command runs a script block on many computers over WinRM or SSH. Execution policy prevents accidents but isn't a security boundary.";

    public ToolKind ToolKind => ToolKind.PsScriptingRemoting;

    public string Explanation =>
        "Once you're past one-liners, PowerShell scripts need the same things as any program: parameters, error handling and output someone else can use. This lesson builds a small inventory script that checks many computers and returns objects." +
        "\n\n" +
        "Then remoting, PowerShell's way of running commands on other machines, and execution policy, the setting behind the famous \"running scripts is disabled on this system\" error. The simulator shows which scripts each policy allows, depending on where a script came from and whether it's signed.";
}
