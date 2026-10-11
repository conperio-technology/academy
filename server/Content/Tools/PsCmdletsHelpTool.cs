namespace DsaAcademy.Content.Tools;

public class PsCmdletsHelpTool : ITool
{
    public string Id => "ps-cmdlets-help";
    public string Section => "Windows & PowerShell";
    public string Track => "powershell";
    public int Order => 5;
    public string Title => "PowerShell Cmdlets: Verb-Noun, Get-Help and Get-Member";
    public string OneLiner => "Guess a command's name, find out how to use it, and discover what it gives you back.";
    public string KeyTakeaway => "Cmdlets are named Verb-Noun from a fixed list of verbs, so names are predictable. Get-Command finds commands, Get-Help NAME -Examples shows how to use them, and Get-Member shows what kind of object you have and its properties and methods. -WhatIf shows what a command would change without changing it.";

    public ToolKind ToolKind => ToolKind.PsCmdletsHelp;

    public string Explanation =>
        "Nobody memorises PowerShell. What experienced admins know is how to find out: the naming convention that lets you guess a command, the help system, and Get-Member for inspecting whatever a command returns." +
        "\n\n" +
        "This lesson covers Get-Command, Get-Help, parameters, aliases and -WhatIf, then a game where you build the cmdlet for a task from its verb and noun, and a Get-Member viewer for three common object types.";
}
