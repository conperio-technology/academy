namespace DsaAcademy.Content.Tools;

public class BashVsPowerShellTool : ITool
{
    public string Id => "bash-vs-powershell";
    public string Section => "Windows & PowerShell";
    public string Track => "powershell";
    public int Order => 7;
    public string Title => "Bash vs PowerShell Side by Side";
    public string OneLiner => "The same everyday tasks in both shells, searchable, plus the differences in philosophy that trip people up.";
    public string KeyTakeaway => "bash passes text and you pick fields by position; PowerShell passes objects and you pick properties by name. Most tasks map one to one: grep is Select-String, tail -f is Get-Content -Wait, systemctl is Get-Service and friends, ssh host cmd is Invoke-Command. Watch for case sensitivity, $? and comparison operators.";

    public ToolKind ToolKind => ToolKind.BashVsPowerShell;

    public string Explanation =>
        "Most IT jobs mix Linux and Windows, so you'll switch between bash and PowerShell constantly. This lesson is a phrasebook: a searchable table of everyday tasks in both shells, the differences in how they think, and one real task solved both ways.";
}
