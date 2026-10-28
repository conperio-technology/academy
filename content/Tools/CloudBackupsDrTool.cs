namespace DsaAcademy.Content.Tools;

public class CloudBackupsDrTool : ITool
{
    public string Id => "cloud-backups-dr";
    public string Section => "Cloud & DevOps";
    public string Track => "operations";
    public int Order => 7;
    public string Title => "Backups, RAID and Disaster Recovery";
    public string OneLiner => "Full, incremental and differential backups, 3-2-1 and immutable copies, RPO and RTO, the RAID levels with a capacity calculator, restore testing, and DR strategies.";
    public string KeyTakeaway => "RAID keeps a server up when a disk dies; only backups bring back deleted, corrupted or encrypted data. Follow 3-2-1 with one immutable or offline copy, choose the schedule from the RPO and the restore design from the RTO, and restore regularly: a backup you haven't restored is a hope, not a backup.";

    public ToolKind ToolKind => ToolKind.CloudBackupsDr;

    public string Explanation =>
        "Disk failures, mistakes, ransomware and lost data centers are different disasters, and RAID, backups and disaster recovery plans are different defences against them. This lesson explains each one and how they fit together." +
        "\n\n" +
        "You can plan a restore from full, incremental and differential backups, size RAID arrays and fail their disks, and see a backup with a working restore test. The shell sample was run to get the output shown.";
}
