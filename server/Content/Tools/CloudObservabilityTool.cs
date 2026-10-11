namespace DsaAcademy.Content.Tools;

public class CloudObservabilityTool : ITool
{
    public string Id => "cloud-observability";
    public string Section => "Cloud & DevOps";
    public string Track => "operations";
    public int Order => 6;
    public string Title => "Observability: Metrics, Logs, Traces and Alerts";
    public string OneLiner => "Find out what's wrong in a running system: percentiles, structured logs, distributed traces and alerts worth waking up for.";
    public string KeyTakeaway => "Metrics show that something is wrong, traces show where, logs show why, and a trace ID shared by all three joins them up. Watch percentiles, not averages. Alert on symptoms users feel, with a duration, and make every page actionable.";

    public ToolKind ToolKind => ToolKind.CloudObservability;

    public string Explanation =>
        "When a system is slow or failing, observability is what lets you answer why. This lesson covers the three kinds of telemetry, how to read latency percentiles, structured JSON logging with jq, PromQL and KQL queries, and how to design alerts that people don't learn to ignore." +
        "\n\n" +
        "The simulator follows one incident from a latency graph with an alert rule you tune, to the trace of a slow request, to the log lines that explain it. The jq examples are real runs; the incident data is made up.";
}
