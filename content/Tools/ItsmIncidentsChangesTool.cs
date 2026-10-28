namespace DsaAcademy.Content.Tools;

public class ItsmIncidentsChangesTool : ITool
{
    public string Id => "itsm-incidents-changes";
    public string Section => "Professional Dev Skills";
    public string Track => "IT service management";
    public int Order => 100;
    public string Title => "IT Service Management: Incidents, Problems, Changes and SLAs";
    public string OneLiner => "Incidents, service requests, problems and changes in plain English, severity levels, SLAs, SLOs and error budgets, running a major incident, blameless postmortems, the 5 whys and change management.";
    public string KeyTakeaway => "Restore service first (incident), then remove the cause (problem). Agree what each severity means before you need it, give a major incident a commander and regular updates, and follow it with a blameless postmortem whose actions have owners and dates. Most outages follow a change, so changes need a plan and a way back.";

    public ToolKind ToolKind => ToolKind.ItsmIncidentsChanges;

    public string Explanation =>
        "IT and operations teams run on tickets, and the vocabulary comes from ITIL. This lesson explains the processes you'll work in, without the certification jargon: the kinds of ticket, how severity and SLAs set priorities, how a major incident runs, and how teams learn from one afterwards." +
        "\n\n" +
        "It finishes with change management and how to write a ticket someone can act on straight away.";
}
