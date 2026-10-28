namespace DsaAcademy.Content.Tools;

public class AgileScrumKanbanTool : ITool
{
    public string Id => "agile-scrum-kanban";
    public string Section => "Professional Dev Skills";
    public string Track => "ways of working";
    public int Order => 100;
    public string Title => "Agile, Scrum and Kanban, Without the Hype";
    public string OneLiner => "What agile actually says, Scrum versus Kanban, the roles, artifacts and ceremonies, estimation in story points and velocity, and where a design doc fits.";
    public string KeyTakeaway => "Agile means building in small steps, showing working software often and adjusting. Scrum uses fixed sprints and three roles; Kanban uses continuous flow with work-in-progress limits. Estimate in relative story points, not hours, and use velocity to forecast for one team only. Write a short design doc before large changes so disagreement happens on paper.";

    public ToolKind ToolKind => ToolKind.AgileScrumKanban;

    public string Explanation =>
        "Agile is building software in small steps and adjusting as you learn, rather than planning everything up front. This lesson explains what the manifesto actually says, and the two frameworks teams use to practise it: Scrum and Kanban." +
        "\n\n" +
        "It covers the roles, artifacts and ceremonies in plain English, why estimation uses points rather than hours, and where a design doc fits, with an eye on the difference between doing the ceremonies and actually being agile.";
}
