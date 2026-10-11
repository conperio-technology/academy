namespace DsaAcademy.Content.Tools;

public class WinEventLogsTool : ITool
{
    public string Id => "win-event-logs";
    public string Section => "Windows & PowerShell";
    public string Track => "windows";
    public int Order => 2;
    public string Title => "Event Viewer and Windows Logs";
    public string OneLiner => "Find out why a server rebooted, why a service died or who locked an account, from the Windows event logs.";
    public string KeyTakeaway => "Windows writes events to the System, Application and Security logs, each with a source and a numeric event ID. A dozen IDs answer most questions: 41, 1074 and 6008 for reboots, 7031 and 7034 for crashed services, 4624, 4625 and 4740 for sign-ins and lockouts. Query them with Get-WinEvent -FilterHashtable.";

    public ToolKind ToolKind => ToolKind.WinEventLogs;

    public string Explanation =>
        "The event logs are the first place to look when something on a Windows machine went wrong: an unexpected restart, a service that stopped, an application crash, a user who keeps getting locked out." +
        "\n\n" +
        "You'll learn which log holds what, the event IDs worth memorising, and how to query events with PowerShell instead of scrolling in Event Viewer. The simulator is one night on a server, with a DNS outage, a crash, a lockout and a planned update reboot; filter it and read what each event means.";
}
