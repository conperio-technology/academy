namespace DsaAcademy.Content.Tools;

public class ConsistentHashingTool : ITool
{
    public string Id => "sd-consistent-hashing";
    public string Section => "System Design";
    public string Track => "building blocks";
    public int Order => 6;
    public string Title => "Consistent Hashing";
    public string OneLiner => "Spread keys over servers so that adding or removing a server moves only a small fraction of them.";
    public string KeyTakeaway =>
        "Put servers and keys on the same hash ring and give each key to the next server clockwise: adding or " +
        "removing a server then moves only about 1/N of the keys instead of nearly all of them. Virtual nodes " +
        "give each server many points on the ring so the load evens out.";

    public ToolKind ToolKind => ToolKind.ConsistentHashing;

    public string Explanation =>
        "The simple way to pick a server for a key is hash(key) mod N. It spreads keys evenly and needs no lookup " +
        "table, and it works until N changes. Add one server to a cluster of 4 and the remainder changes for about " +
        "4 out of 5 keys, so 80% of the data has to move. For a distributed cache it's worse than slow: almost every " +
        "lookup suddenly misses, and all that traffic falls on the database at once. Servers fail and get added all " +
        "the time, so this matters.\n\n" +
        "Consistent hashing fixes this by hashing servers and keys onto the same circle, the ring: think of the " +
        "32-bit hash range bent so that the largest value wraps around to 0. A key belongs to the first server you " +
        "reach going clockwise from the key's position. When a server is added, it only takes the keys between " +
        "itself and the previous server; when one is removed, only its keys move, to the next server clockwise. " +
        "Every other key stays put, so a change moves about 1/N of the keys. Add and remove servers in the demo and " +
        "compare the two numbers.\n\n" +
        "With one point per server the ring is split at random places, so some servers own big arcs and others tiny " +
        "ones, and when a server leaves, all of its load lands on a single neighbor. Virtual nodes fix both: each " +
        "server is hashed onto the ring many times (S1#0, S1#1, ...), so its share is the sum of many small arcs and " +
        "the randomness averages out. Move the slider from 1 to 50 and watch the standard deviation drop. Virtual " +
        "nodes also let a bigger machine take a bigger share, simply by giving it more points.\n\n" +
        "Replication fits naturally: store the key on its owner and copy it to the next N-1 distinct servers " +
        "clockwise, skipping extra virtual nodes of servers already chosen so the copies end up on different " +
        "machines. That's how Amazon's Dynamo and Cassandra place data. The same idea routes requests in " +
        "distributed caches (memcached clients, Redis Cluster uses a fixed set of hash slots in a similar spirit), " +
        "in CDNs and load balancers that want the same client or URL to keep hitting the same server, and in " +
        "sharded databases that need to grow without moving everything.\n\n" +
        "In an interview, mention consistent hashing whenever you shard or cache across many nodes and expect the " +
        "node count to change, and mention virtual nodes in the same sentence.";
}
