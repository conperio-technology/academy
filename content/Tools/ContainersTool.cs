namespace DsaAcademy.Content.Tools;

public class ContainersTool : ITool
{
    public string Id => "linux-containers";
    public string Section => "Linux & the Command Line";
    public string Track => "containers";
    public int Order => 20;
    public string Title => "Containers and Kubernetes";
    public string OneLiner => "What a container image really is, and how Kubernetes keeps your app running when things break.";
    public string KeyTakeaway =>
        "A container is an ordinary Linux process with its own view of the filesystem and network, started " +
        "from an image built in cached layers. Kubernetes doesn't run commands for you: you declare what " +
        "you want (3 copies of version 2), and its controllers keep changing reality until it matches.";

    public ToolKind ToolKind => ToolKind.Containers;

    public string Explanation =>
        "A container isn't a small virtual machine (a whole simulated computer running its own operating system). It's a normal process on a Linux machine, the same kind " +
        "you met in the processes lesson, that the kernel (the core of the operating system, shared by every container on the machine) fences off: it sees its own filesystem, its own " +
        "process list and its own network, and it can be limited to a share of CPU and memory. That's why " +
        "containers start in milliseconds and why so much of this section is Linux underneath.\n\n" +
        "The filesystem a container starts with comes from an image, built from a Dockerfile. Each " +
        "instruction produces a layer, and Docker caches layers: on the next build it reuses everything up " +
        "to the first instruction whose inputs changed, then re-runs the rest. That's why Dockerfiles copy " +
        "the project file and restore packages before copying the source code -- try the buttons in part 1 " +
        "to see the difference it makes. The image is the same artifact on your laptop, in CI and in " +
        "production, which is most of the point.\n\n" +
        "Kubernetes runs containers across a group of machines (nodes). You don't tell it to start a " +
        "container on node 2; you give it a Deployment that says \"I want 3 replicas of academy:v1\", and a " +
        "controller loop compares that with what's actually running, over and over, fixing any difference. " +
        "Each running copy is a pod. Crash a pod or fail a node in part 2 and watch the loop replace what was " +
        "lost; raise the replicas and it adds more. A Service gives the pods one stable address and spreads " +
        "requests across the ones that are ready.\n\n" +
        "Changing the version starts a rolling update: start one new pod, wait until it's ready, retire " +
        "one old pod, repeat. Users keep being served throughout, which is why apps need to start up and " +
        "shut down cleanly (remember SIGTERM). A small web app like this one typically needs four objects: " +
        "a Deployment, a Service, an Ingress and a network policy.\n\n" +
        "The demo is a simplified model, not a real cluster; the real controllers work the same way, with " +
        "more detail (health checks, resource requests, scheduling rules).";
}
