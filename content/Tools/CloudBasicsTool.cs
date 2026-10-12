namespace DsaAcademy.Content.Tools;

public class CloudBasicsTool : ITool
{
    public string Id => "cloud-basics";
    public string Section => "Cloud & DevOps";
    public string Track => "cloud";
    public int Order => 1;
    public string Title => "Cloud Fundamentals: Service Models, Regions and Shared Responsibility";
    public string OneLiner => "What renting computing from Azure, AWS or Google Cloud really means, who is responsible for what, and how zones and regions keep things running.";
    public string KeyTakeaway => "IaaS rents you virtual machines, PaaS a platform to run code and data on, SaaS finished software. The further you go towards SaaS, the more the provider runs, but your data, your accounts and your configuration are always yours. Spread production across availability zones; redundancy is not a backup.";

    public ToolKind ToolKind => ToolKind.CloudBasics;

    public string Explanation =>
        "Most companies now run at least part of their IT in a public cloud. This lesson explains the service models, the shared responsibility model that decides whose job a patch or a breach is, regions and availability zones, and where unexpected cloud bills come from." +
        "\n\n" +
        "This section comes after System Design on purpose: it puts the building blocks from that section (load balancers, replicas, queues, caches) onto real platforms, and adds the delivery side, getting code from a commit into production safely, that a working engineer or IT professional needs alongside the design.";
}
