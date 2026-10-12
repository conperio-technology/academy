namespace DsaAcademy.Content.Tools;

public class CloudIacTool : ITool
{
    public string Id => "cloud-iac";
    public string Section => "Cloud & DevOps";
    public string Track => "delivery";
    public int Order => 5;
    public string Title => "Infrastructure as Code: Terraform and Bicep";
    public string OneLiner => "Describe cloud infrastructure in reviewed, versioned code, and learn to read a Terraform plan before it deletes your database.";
    public string KeyTakeaway => "IaC tools compare the code with what exists and change the difference. Terraform tracks what it manages in a state file that should live in a shared, locked backend; Bicep uses Azure's own records. Always read the plan: + creates, ~ updates in place, -/+ replaces (and a replaced database is empty), - destroys.";

    public ToolKind ToolKind => ToolKind.CloudIac;

    public string Explanation =>
        "Clicking resources together in a portal can't be reviewed, repeated or rebuilt. This lesson shows the same Azure web app in Terraform and in Bicep, explains state, plan and apply, and compares the tools." +
        "\n\n" +
        "The plan simulator replays real Terraform 1.9.8 runs: a first apply, an in-place update, a forced replacement, drift, and a rename with and without a moved block. The Azure Terraform passes terraform validate and the Bicep file compiles with bicep build.";
}
