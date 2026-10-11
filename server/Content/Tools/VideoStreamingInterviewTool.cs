namespace DsaAcademy.Content.Tools;

public class VideoStreamingInterviewTool : ITool
{
    public string Id => "sd-interview-video-streaming";
    public string Section => "System Design";
    public string Track => "interview walk-throughs";
    public int Order => 27;
    public string Title => "Design a Video Streaming Service";
    public string OneLiner => "YouTube as a 45-minute design round: resumable uploads, a parallel transcoding pipeline, adaptive streaming and a CDN that carries tens of terabits per second.";
    public string KeyTakeaway =>
        "Spend compute once at upload so every view is cheap: split the video into segments, transcode them in " +
        "parallel into a ladder of renditions, and let the player switch between them per segment. Then serve " +
        "almost every byte from caches near the viewer, because bandwidth and storage, not servers, are the bill.";

    public ToolKind ToolKind => ToolKind.DesignVideoStreaming;

    public string Explanation =>
        "Same format as the other walk-throughs: write your answer for each stage first, then compare it with the " +
        "model answer and tick what you covered.\n\n" +
        "This problem is two systems that share a storage layer. The upload side is a batch pipeline: chunked, " +
        "resumable uploads into object storage, then a transcoding job that splits each video at keyframes and " +
        "encodes the pieces into several resolutions and codecs in parallel, as a graph of small retryable tasks. " +
        "The watch side is almost entirely static files: HLS or DASH manifests and segments a few seconds long, fetched " +
        "from a CDN while the player picks a quality for each segment based on its bandwidth and buffer.\n\n" +
        "The difficulty sits in the numbers. 500,000 hours uploaded a day becomes petabytes of storage per day and " +
        "a six-figure vCPU fleet for transcoding, and 333 million hours watched a day is around 35 Tbps of egress " +
        "on average. Candidates who skip estimation miss that no origin can serve this and that cost has to shape " +
        "the design: which codecs to encode for which videos, when to move originals to cold storage, and how high " +
        "the CDN hit ratio must be. The metadata, by contrast, is a few terabytes and an ordinary sharded database.\n\n" +
        "Deep dives usually go to one or two of: resumable uploads, the transcoding DAG, adaptive bitrate " +
        "streaming, CDN tiers for popular versus long-tail videos, and counting views without a hot row. Expect " +
        "follow-ups such as \"a video goes viral ten minutes after upload: what reaches the origin?\"";
}
