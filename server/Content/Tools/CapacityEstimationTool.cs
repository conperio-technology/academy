namespace DsaAcademy.Content.Tools;

public class CapacityEstimationTool : ITool
{
    public string Id => "sd-capacity-estimation";
    public string Section => "System Design";
    public string Track => "fundamentals";
    public int Order => 1;
    public string Title => "Back-of-the-Envelope Estimation";
    public string OneLiner => "Turn users and actions into requests per second, storage and bandwidth in a few lines of rounded arithmetic.";
    public string KeyTakeaway =>
        "Estimate before you design: QPS (queries per second) = daily requests / 10^5, storage = writes per day x object size x days x copies. " +
        "Round hard and keep orders of magnitude right, because the point is to learn whether you need one server or a thousand, " +
        "and whether the hard part is reads, writes or bytes.";

    public ToolKind ToolKind => ToolKind.CapacityEstimation;

    public string Explanation =>
        "In a system design interview, the first few minutes after clarifying requirements usually go to a rough estimate: how many " +
        "requests per second, how much data, how much bandwidth. The interviewer isn't checking your arithmetic. They want to see " +
        "that your design follows from the numbers. A service doing 50 writes per second fits on one database; one doing 500,000 needs " +
        "sharding (splitting the data across many databases), queues and a very different conversation. The estimate also tells you which part is hard: a URL shortener " +
        "is all about read QPS, a photo service is all about storage and bandwidth, a chat app is all about writes.\n\n" +
        "The method is always the same. Start from daily active users and what each one does per day to get writes per day. Divide by " +
        "the seconds in a day to get average QPS, multiply by the read:write ratio to get reads, and multiply by a peak factor (2 to 5 " +
        "is typical) because traffic isn't flat. Storage is writes per day times object size, times 365, times the years you keep it, " +
        "times the number of copies. Outbound bandwidth is read QPS times the size of what you send back. Part 1 does exactly this and " +
        "shows each line of arithmetic.\n\n" +
        "A few constants make it fast. A day has 86,400 seconds; call it 10^5, so 100 million requests a day is about 1,000 per second. " +
        "Powers of two line up with powers of ten: 2^10 is about a thousand (KB), 2^20 a million (MB), 2^30 a billion (GB), 2^40 a " +
        "trillion (TB), 2^50 PB. A character is a byte or two, a typical database row is a few hundred bytes to a few KB, a photo is a " +
        "few MB, a minute of video tens of MB. A single ordinary server handles roughly thousands to tens of thousands of simple " +
        "requests per second.\n\n" +
        "Round aggressively. 86,400 becomes 100,000, 365 becomes 400 if that makes the multiplication easy, 3.7 becomes 4. Each " +
        "rounding is off by a little, and you only care whether the answer is 10 GB or 10 TB. Say your assumptions out loud as you " +
        "go, write the numbers down, and state the result in a sensible unit: 1.2 PB, not 1,200,000 GB.\n\n" +
        "Part 2 is the table of latency numbers that goes with this. The exact values have improved since they were first published " +
        "(memory and SSDs are faster now), but the ratios are what matter: memory is about 1,000 times faster than an SSD read, a " +
        "round trip inside a datacenter costs half a millisecond, and crossing an ocean costs 150 milliseconds no matter how fast your " +
        "servers are. Those gaps are the reason caches, CDNs and batching exist.";
}
