namespace DsaAcademy.Content.Tools;

public class CloudKubernetesTool : ITool
{
    public string Id => "cloud-kubernetes";
    public string Section => "Cloud & DevOps";
    public string Track => "cloud";
    public int Order => 3;
    public string Title => "Kubernetes in Practice: Labels, Services, Probes and kubectl";
    public string OneLiner => "The Kubernetes objects you use every day, how they find each other, and how to work out why a pod isn't running.";
    public string KeyTakeaway => "Deployments keep pods running, Services send traffic to the ready pods whose labels match their selector, and ConfigMaps and Secrets keep settings out of the image. Readiness controls traffic, liveness controls restarts. kubectl describe, kubectl logs --previous and the events explain most broken pods.";

    public ToolKind ToolKind => ToolKind.CloudKubernetes;

    public string Explanation =>
        "Kubernetes is where many containerised apps run in production, usually as a managed service such as AKS, EKS or GKE. This lesson goes through a real Deployment, Service and ConfigMap, explains requests, limits and probes, and turns the common pod statuses (Pending, ImagePullBackOff, CrashLoopBackOff, OOMKilled) into a troubleshooting checklist." +
        "\n\n" +
        "The manifests in the lesson pass schema validation with kubeconform. No cluster is available here, so kubectl output is shown as typical output.";
}
