namespace DsaAcademy.Content.Tools;

public class ReplicationShardingTool : ITool
{
    public string Id => "sd-replication-sharding";
    public string Section => "System Design";
    public string Track => "building blocks";
    public int Order => 5;
    public string Title => "Replication and Sharding";
    public string OneLiner => "Copy your data to survive failures and serve more reads, and split it to handle more writes and more data than one machine can hold.";
    public string KeyTakeaway =>
        "Replication copies the same data to several machines for read capacity and availability, but async replicas " +
        "lag behind and a failover (switching to a standby when the main machine dies) can lose the last writes. Sharding splits the data so each machine " +
        "holds a part, and the shard key decides whether the load is even and which queries stay cheap.";

    public ToolKind ToolKind => ToolKind.ReplicationSharding;

    public string Explanation =>
        "A single database server eventually runs out of something: read capacity, write capacity, disk, or " +
        "simply luck, because one machine is one failure away from an outage. Replication and sharding are the " +
        "two answers, and most large systems use both. Replication keeps full copies of the same data on several " +
        "machines. Sharding (also called partitioning) splits the data so each machine holds only part of it.\n\n" +
        "Replicate for two reasons. Reads: most apps read far more than they write, so a few read replicas can " +
        "take most of the traffic off the main server. Availability: if a machine dies, another one already has " +
        "the data and can take over. The common setup is leader-follower: one leader accepts all writes and " +
        "streams them to followers, which serve reads. Multi-leader lets several nodes (often one per region) " +
        "accept writes and sync with each other, which helps writes in many regions but means two leaders can " +
        "change the same row at once and the conflict must be resolved. Leaderless systems such as Dynamo and " +
        "Cassandra send each write to several replicas directly and use quorums (requiring a minimum number of replicas to answer) so that reads overlap the replicas that took the latest completed write.\n\n" +
        "Replication can be synchronous or asynchronous. Synchronous means the leader waits for a replica to " +
        "confirm before telling the client the write succeeded: no data is lost if the leader dies, but every " +
        "write is as slow as that replica, and if it is down writes stop. Asynchronous means the leader confirms " +
        "right away and replicas catch up later, usually within milliseconds, sometimes seconds under load. That " +
        "lag causes the read-after-write problem in part 1: you save, read from a replica, and see your old data. " +
        "A common fix is to read your own recent writes from the leader. Lag also means a failover can lose writes " +
        "the leader confirmed but never shipped, which is why many databases run one synchronous replica and the " +
        "rest async.\n\n" +
        "Replication doesn't help with writes, because every copy still has to apply every write, and it doesn't " +
        "help when the data is bigger than one machine. That's what sharding is for: each shard holds a subset of " +
        "the rows and takes the writes for them. The hard part is the shard key. Hashing the key spreads data " +
        "evenly but scatters ranges across all shards. Ranges (by id, by date, by name) keep related rows together " +
        "for range queries but can be uneven, and a range by time or by increasing id sends all new writes to one " +
        "shard. And no shard key fixes a single hot key, like a celebrity with millions of followers; that needs " +
        "caching or special handling for the hot key itself.\n\n" +
        "Sharding has real costs. A query that doesn't include the shard key has to ask every shard and combine " +
        "the results. Joins across shards and transactions that touch rows on two shards are slow or unsupported, " +
        "so you pick the shard key so that the common queries stay on one shard (for example, shard by user id so " +
        "all of one user's data lives together). Resharding when you add machines means moving data while serving " +
        "traffic. With hash mod N, going from N to N+1 shards moves about N/(N+1) of all keys, as part 2 shows. The " +
        "Consistent Hashing lesson covers the technique that cuts that to about 1/(N+1).\n\n" +
        "In an interview, start without either: one database handles more than people expect. Add read replicas " +
        "when reads are the bottleneck, and shard only when writes or data size require it, and then say what the " +
        "shard key is and why.";
}
