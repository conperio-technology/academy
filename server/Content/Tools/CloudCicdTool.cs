namespace DsaAcademy.Content.Tools;

public class CloudCicdTool : ITool
{
    public string Id => "cloud-cicd";
    public string Section => "Cloud & DevOps";
    public string Track => "delivery";
    public int Order => 4;
    public string Title => "CI/CD Pipelines";
    public string OneLiner => "How every commit gets built, tested and deployed automatically, and how to release without downtime.";
    public string KeyTakeaway => "CI builds and tests every change; CD keeps every passing change deployable and releases it with an approval or automatically. Build the artifact once and promote the same one through every environment, keep configuration and secrets outside it, require green checks before merging, and know how to roll back.";

    public ToolKind ToolKind => ToolKind.CloudCicd;

    public string Explanation =>
        "A pipeline is the safety net between a developer's commit and production. You'll see a GitHub Actions workflow that tests pull requests and deploys main through an approval, the principles that make pipelines trustworthy, and the release strategies (rolling, blue-green, canary, feature flags) that avoid downtime." +
        "\n\n" +
        "The workflow file in the lesson passes actionlint. The simulator lets you run the pipeline for a pull request or a merge, break any stage, and approve or reject the production deployment.";
}
