namespace DsaAcademy.Content.Tools;

public class VirtualizationVmsTool : ITool
{
    public string Id => "virtualization-vms";
    public string Section => "Computer Fundamentals";
    public string Track => "operating systems and runtimes";
    public int Order => 100;
    public string Title => "Virtualization: Hypervisors, VMs and Containers";
    public string OneLiner => "Type 1 and type 2 hypervisors, hardware-assisted virtualization, VMs versus containers, snapshots, templates, live migration, overcommit and thin provisioning.";
    public string KeyTakeaway => "A hypervisor shares one machine's hardware among VMs that each run their own OS; containers share the host's kernel and isolate only processes, so they're lighter but a weaker boundary. Snapshots are for quick rollback, not backups, and overcommitted CPU, memory or thin disks work until everyone needs them at once.";

    public ToolKind ToolKind => ToolKind.VirtualizationVms;

    public string Explanation =>
        "Nearly every server you'll work on is a virtual machine, whether in a company's VMware cluster or a cloud. This lesson explains what a hypervisor does, how VMs differ from containers, and the features that make VMs easy to manage: snapshots, templates and live migration." +
        "\n\n" +
        "It also covers overcommit and thin provisioning, which explain both why virtualization is cheap and how a busy host or a full datastore slows or stops every VM on it.";
}
