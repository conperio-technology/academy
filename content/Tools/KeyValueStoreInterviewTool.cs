namespace DsaAcademy.Content.Tools;

public class KeyValueStoreInterviewTool : ITool
{
    public string Id => "sd-interview-key-value-store";
    public string Section => "System Design";
    public string Track => "interview walk-throughs";
    public int Order => 24;
    public string Title => "Design a Distributed Key-Value Store";
    public string OneLiner => "Dynamo or Cassandra as a 45-minute design round: consistent hashing, quorums, conflict resolution, repair and LSM storage.";
    public string KeyTakeaway =>
        "A Dynamo-style store spreads keys over a ring with virtual nodes, keeps N copies in different zones, and lets " +
        "each request choose its consistency with R and W quorums. Choosing availability means replicas will diverge, " +
        "so the design needs ways to resolve conflicts (last-write-wins or vector clocks) and to repair replicas " +
        "(hinted handoff, read repair, Merkle-tree anti-entropy), on top of a write-optimised LSM storage engine.";

    public ToolKind ToolKind => ToolKind.DesignKeyValueStore;

    public string Explanation =>
        "Same format as the other walk-throughs: write your answer for each stage first, then compare it with the " +
        "model answer and tick what you covered.\n\n" +
        "This one is different from the product designs. There's no feed or redirect to optimise; you are building " +
        "the database the other designs used. The API is three operations, so almost all the time goes on how the " +
        "data is placed, copied and kept correct. The decision that shapes everything comes in the requirements " +
        "stage: when some replicas are unreachable, does the store reject the write or accept it and reconcile " +
        "later? Dynamo chose to accept it, and every later stage follows from that: sloppy quorums, conflicting " +
        "versions, and background repair. Say the choice out loud and connect it to CAP and PACELC.\n\n" +
        "In the estimation stage, notice that disk space, not request rate, sets the node count, and that rebuilding " +
        "a failed node is a number worth computing because it's the argument for virtual nodes. The deep dive is a " +
        "menu of techniques (consistent hashing, R + W > N, last-write-wins versus vector clocks, hinted handoff, " +
        "Merkle trees, gossip with phi accrual failure detection, LSM trees and compaction), and you won't cover all " +
        "of them in 15 minutes. Interviewers usually pick two or three; explain the mechanism and what it costs, for " +
        "example that last-write-wins silently drops one of two concurrent writes, or that skipping repair for longer " +
        "than the tombstone grace period brings deleted data back. Expect follow-ups such as \"a whole zone just went " +
        "down: which reads and writes still succeed?\"";
}
