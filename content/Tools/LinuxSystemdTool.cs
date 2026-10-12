namespace DsaAcademy.Content.Tools;

public class LinuxSystemdTool : ITool
{
    public string Id => "linux-systemd";
    public string Section => "Linux & the Command Line";
    public string Track => "administration";
    public int Order => 9;
    public string Title => "systemd Services and journalctl";
    public string OneLiner => "How Linux starts, stops and restarts the programs a server runs, and how to read their logs.";
    public string KeyTakeaway => "systemd is process 1 on almost every Linux server. A unit file describes a service: what to run, as which user, and whether to restart it. start and stop act now; enable and disable decide what happens at boot; after editing a unit run daemon-reload. journalctl -u NAME shows that service's logs, and -b -1 the previous boot's.";

    public ToolKind ToolKind => ToolKind.LinuxSystemd;

    public string Explanation =>
        "On a server, the programs that matter (the web server, the database, your own app) run as services: started at boot, restarted when they crash, stopped cleanly at shutdown. On current Linux distributions systemd does all of that, and also collects every service's output into one searchable log, the journal." +
        "\n\n" +
        "You'll read a real unit file line by line, learn the handful of systemctl commands you'll use daily, and see why \"started\" and \"enabled\" are different things. The simulator lets you crash a service in different ways under each restart policy, edit its unit file, forget daemon-reload, and reboot, while the status and journal update the way systemd's do." +
        "\n\n" +
        "The lesson ends with journalctl filters and a checklist for the moment a service won't start.";
}
