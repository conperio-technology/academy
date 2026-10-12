namespace DsaAcademy.Content.Tools;

public class CapConsistencyTool : ITool
{
    public string Id => "sd-cap";
    public string Section => "System Design";
    public string Track => "building blocks";
    public int Order => 10;
    public string Title => "CAP and Consistency";
    public string OneLiner => "When the network between your copies breaks, you choose between refusing requests and serving answers that may be wrong.";
    public string KeyTakeaway =>
        "During a network partition a replicated system must either reject some requests to stay consistent (CP) " +
        "or keep answering and reconcile conflicting copies later (AP). Pick per piece of data: a bank balance or " +
        "ticket inventory needs consistency, a like counter or a shopping cart can merge later.";

    public ToolKind ToolKind => ToolKind.CapConsistency;

    public string Explanation =>
        "The CAP theorem talks about three properties of a system that keeps copies of data on several machines: " +
        "consistency (every read sees the latest write, as if there were one copy), availability (every request to " +
        "a working node gets an answer) and partition tolerance (the system keeps running when the network between " +
        "nodes drops messages). It's often summarized as \"pick two\", but that's misleading. Networks do fail, so " +
        "partition tolerance isn't optional. The real statement is narrower: during a partition, you must choose " +
        "between consistency and availability.\n\n" +
        "Part 1 makes that choice concrete with two datacenters selling the same 5 tickets. In CP mode, the side " +
        "that can't reach the leader refuses sales and even reads, because it can't be sure its copy is current. " +
        "Customers there see errors, but nothing is ever sold twice. In AP mode both sides keep selling. Nobody " +
        "sees an error, but the copies drift apart, and when the link comes back they have to be reconciled. Last " +
        "write wins keeps the most recent copy and silently drops the other side's sales. Merging the sales keeps " +
        "every one, which is right for a counter, but here both sides may have sold the last tickets: oversold.\n\n" +
        "PACELC adds the part CAP leaves out. If there is a Partition, choose Availability or Consistency; Else, " +
        "when everything is healthy, choose Latency or Consistency. Even without failures, a strongly consistent " +
        "write has to wait for other replicas (maybe in another region, 80 ms away), while an eventually consistent " +
        "one can return immediately. That everyday latency cost is usually what drives the design, since partitions " +
        "are rare.\n\n" +
        "Consistency is a spectrum, not a switch. Strong consistency (linearizability) means every read sees the " +
        "latest completed write. Eventual consistency means replicas converge if writes stop, but a read may be " +
        "stale for a while. In between are useful guarantees like read-your-writes: you always see your own " +
        "updates, even if other people see them a moment later. Leaderless stores let you tune this per request " +
        "with N replicas, W acknowledgements per write and R replies per read. If R + W > N, every read set " +
        "overlaps every write set: with a fixed set of N replicas and a write that completed on W of them, at least " +
        "one replica the read asks holds that write.\n\n" +
        "That overlap is not the same as linearizable reads, for several reasons. A write still in progress, or one " +
        "that failed after reaching only some replicas, can be seen by one read and missed by the next, so an old " +
        "value can come back. The read must pick the newest of the versions it gets, and last-write-wins on " +
        "wall-clock timestamps can drop the real latest write when clocks are skewed. Read repair copies the chosen " +
        "value back to stale replicas, but unless the read waits for that write-back to reach a quorum before " +
        "answering, a later read can still see the older value. Sloppy quorums with hinted handoff accept writes " +
        "on stand-in nodes outside the usual N, so the overlap itself is no longer guaranteed. Linearizability " +
        "needs extra coordination on top, such as Cassandra's lightweight transactions, which run Paxos. Part 2 " +
        "shows the price of the quorum itself: bigger W and R mean waiting for slower replicas and failing when " +
        "fewer are down.\n\n" +
        "Choose per feature. A bank ledger or inventory must not double-spend, so it's CP: better an error than a " +
        "wrong balance. A like counter can be AP: being off by a few for a second is fine, and increments merge " +
        "cleanly. A shopping cart is the classic Dynamo example of AP: always let people add items, and on conflict " +
        "merge the carts (the worst case is a removed item reappearing, which is cheaper than a lost sale). In an " +
        "interview, say which parts of the design need which guarantee and why.";
}
