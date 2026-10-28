namespace DsaAcademy.Content.Tools;

public class CloudNetworkingIamTool : ITool
{
    public string Id => "cloud-networking-iam";
    public string Section => "Cloud & DevOps";
    public string Track => "cloud";
    public int Order => 1;
    public string Title => "Cloud Networking and IAM: VPCs, Security Groups, Roles and Policies";
    public string OneLiner => "VPCs, public and private subnets, route tables, NAT gateways, security groups versus network ACLs, IAM users, roles and policies, how a request is allowed or denied, and serverless cold starts.";
    public string KeyTakeaway => "Put only load balancers in public subnets, keep apps and databases private with security groups that name each other, and reach servers without public SSH. Give code IAM roles with temporary credentials, never stored keys, and write narrow policies: anything not allowed is denied, and an explicit deny always wins.";

    public ToolKind ToolKind => ToolKind.CloudNetworkingIam;

    public string Explanation =>
        "In the cloud, the network and identity decide what can reach what, and most cloud breaches come from a gap in one of them. This lesson builds a typical VPC layout piece by piece, then explains IAM users, roles and policies and the rule every request is checked against." +
        "\n\n" +
        "An evaluator lets you try policies against requests. It ends with serverless functions and cold starts, and a table of the same ideas on AWS, Azure and Google Cloud.";
}
