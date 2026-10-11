namespace DsaAcademy.Content.Tools;

public class CloudContainerImagesTool : ITool
{
    public string Id => "cloud-container-images";
    public string Section => "Cloud & DevOps";
    public string Track => "cloud";
    public int Order => 2;
    public string Title => "Container Images and Registries";
    public string OneLiner => "Name, build, store and ship container images safely: registries, tags and digests, multi-stage builds and image hygiene.";
    public string KeyTakeaway => "An image name is registry/repository:tag, and a tag is a movable label; only a digest (@sha256:...) always means the same bits. Use multi-stage builds so build tools stay out of the final image, run as a non-root user, keep secrets out of every layer, and build in CI from a commit.";

    public ToolKind ToolKind => ToolKind.CloudContainerImages;

    public string Explanation =>
        "Containers package an app with everything it needs, and registries are where those packages live between the build and the server. This lesson covers how images are named and versioned, why :latest causes surprises, and the habits that keep production images small and safe, using this academy's own multi-stage Dockerfile as the example." +
        "\n\n" +
        "It builds on the Containers and Kubernetes lesson in the Linux section, which explains layers and the build cache. Docker can't run in this app, so the commands are shown without captured output.";
}
