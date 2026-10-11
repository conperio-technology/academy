namespace DsaAcademy.Content.Tools;

public class RideSharingInterviewTool : ITool
{
    public string Id => "sd-interview-ride-sharing";
    public string Section => "System Design";
    public string Track => "interview walk-throughs";
    public int Order => 28;
    public string Title => "Design a Ride-Sharing Service";
    public string OneLiner => "Uber or Lyft as a 45-minute design round: live driver locations, geospatial search, dispatch, and a trip that is never double-booked.";
    public string KeyTakeaway =>
        "Keep driver positions in an in-memory geospatial index sharded by region, where losing an update is " +
        "harmless, and keep trip and driver assignment in a strongly consistent store where every transition is a " +
        "conditional write. Match by road-network ETA, offer to one driver at a time, and charge the card after " +
        "the trip, asynchronously.";

    public ToolKind ToolKind => ToolKind.DesignRideSharing;

    public string Explanation =>
        "Same format as the other walk-throughs: write your answer for each stage first, then compare it with the " +
        "model answer and tick what you covered.\n\n" +
        "Ride-sharing looks like a big-data problem and isn't. A million drivers online at peak, each reporting " +
        "every 4 seconds, is 250,000 updates a second, but the current position of every driver fits in about " +
        "100 MB. The estimation stage should lead you to an in-memory index updated at a high rate, sharded by " +
        "region for throughput and isolation rather than size, with no database write per update.\n\n" +
        "The difficulty sits in mixing two consistency levels in one system. Locations are lossy and a few " +
        "seconds stale by design. Assignments are not: a driver must never be on two trips, and a retried request " +
        "must never create a second one. Strong answers say exactly where that boundary is and enforce it with a " +
        "trip state machine, conditional writes or a local transaction, and idempotency keys.\n\n" +
        "Deep dives usually go to the geospatial index (geohash, quadtree or H3, and the cell-boundary problem), " +
        "matching (why straight-line distance is wrong, and offering to one driver at a time with a timeout), " +
        "and the double-booking race. Surge pricing per cell and asynchronous payments are common follow-ups, as " +
        "is \"the rider cancels at the same moment the driver accepts: what happens?\"";
}
