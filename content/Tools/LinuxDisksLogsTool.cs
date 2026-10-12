namespace DsaAcademy.Content.Tools;

public class LinuxDisksLogsTool : ITool
{
    public string Id => "linux-disks-logs";
    public string Section => "Linux & the Command Line";
    public string Track => "administration";
    public int Order => 13;
    public string Title => "Disks, Filesystems and Logs";
    public string OneLiner => "Find out why a disk is full, mount a new one safely, and keep logs from filling the disk again.";
    public string KeyTakeaway => "df shows how full each filesystem is (df -i for inodes); du -sh dir/* | sort -h shows where the space went. Deleting a file another process has open frees nothing until it's closed, so truncate logs instead. Mount disks by UUID in /etc/fstab and test with mount -a. logrotate rotates, compresses and deletes old logs.";

    public ToolKind ToolKind => ToolKind.LinuxDisksLogs;

    public string Explanation =>
        "A full disk stops databases, logging and deployments, and it's one of the most common incidents on any server. Finding the cause quickly is a skill: df to see which filesystem, du to follow the space down, find for the big files, and lsof for the deleted file that's still holding on to its space." +
        "\n\n" +
        "You'll work a disk-full incident in a simulator, see real output from du, find, df -i and lsof, learn how disks are formatted and mounted (and kept mounted with /etc/fstab), and set up logrotate so the same log never fills the disk again. The lab on the in-browser Linux machine has you find what's using the space yourself.";
}
