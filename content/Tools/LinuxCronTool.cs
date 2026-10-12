namespace DsaAcademy.Content.Tools;

public class LinuxCronTool : ITool
{
    public string Id => "linux-cron";
    public string Section => "Linux & the Command Line";
    public string Track => "administration";
    public int Order => 11;
    public string Title => "Scheduling with cron and systemd Timers";
    public string OneLiner => "Run jobs on a schedule: read and write cron expressions, avoid the classic traps, and know when a systemd timer is the better tool.";
    public string KeyTakeaway => "A cron line is five time fields (minute, hour, day of month, month, day of week) and a command. Cron runs it with a minimal environment, so use absolute paths and redirect output to a log. When both day fields are set, either one matching is enough. systemd timers do the same with logging, catch-up after downtime and list-timers.";

    public ToolKind ToolKind => ToolKind.LinuxCron;

    public string Explanation =>
        "Backups, clean-ups, reports and certificate renewals all run on a clock. cron has done this on Unix for decades and is still everywhere, including containers. Its five-field schedule syntax shows up in Kubernetes CronJobs, CI pipelines and cloud schedulers too, so it's worth being fluent in." +
        "\n\n" +
        "The widget reads any schedule back in plain English with its next run times, and sets you challenges to write your own. Then you'll see the same job as a systemd timer, with real output from systemd-analyze calendar, and when each approach is the better choice.";
}
