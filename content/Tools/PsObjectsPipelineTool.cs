namespace DsaAcademy.Content.Tools;

public class PsObjectsPipelineTool : ITool
{
    public string Id => "ps-objects-pipeline";
    public string Section => "Windows & PowerShell";
    public string Track => "powershell";
    public int Order => 4;
    public string Title => "PowerShell: Objects in the Pipeline";
    public string OneLiner => "Why PowerShell passes objects instead of text, and how to filter, sort, select and measure them.";
    public string KeyTakeaway => "PowerShell commands pass .NET objects with named properties, so you filter and sort by property name instead of cutting columns out of text. Where-Object filters, Sort-Object sorts, Select-Object picks properties or the first N, and Format-Table only displays. Filter left, format right.";

    public ToolKind ToolKind => ToolKind.PsObjectsPipeline;

    public string Explanation =>
        "PowerShell is the shell for Windows administration, and since version 7 it runs on Linux and macOS too. Its one big difference from bash is that commands hand each other objects, not lines of text, which makes scripts shorter and far less fragile." +
        "\n\n" +
        "You'll see the same question answered in both shells, then build a pipeline in the simulator stage by stage and watch exactly which objects flow out of each step. The lesson ends with the rule that saves the most confusion: formatting cmdlets go last.";
}
