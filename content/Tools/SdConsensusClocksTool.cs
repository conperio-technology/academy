namespace DsaAcademy.Content.Tools;

public class SdConsensusClocksTool : ITool
{
    public string Id => "sd-consensus-clocks";
    public string Section => "System Design";
    public string Track => "building blocks";
    public int Order => 10;
    public string Title => "Consensus and Logical Clocks: Raft, Quorums, Lamport and Vector Clocks";
    public string OneLiner => "How a cluster agrees despite crashes and partitions: Raft elections and log replication, majority quorums and split brain, Paxos and ZAB, and ordering events with Lamport and vector clocks.";
    public string KeyTakeaway => "Consensus lets 2f + 1 nodes agree on a log while up to f fail, by requiring a majority for every election and commit, so only one side of a partition can make progress. Systems use it for small critical data through etcd, ZooKeeper or Consul. Without a shared clock, order events by causality: Lamport clocks give a consistent order, vector clocks also detect concurrency.";

    public ToolKind ToolKind => ToolKind.SdConsensusClocks;

    public string Explanation =>
        "Leader election, distributed locks, cluster membership and replicated logs all need machines to agree while some crash or get cut off. This lesson explains how Raft does it, why it takes a majority, and what the systems you already use (Kubernetes' etcd, ZooKeeper, Kafka) rely on." +
        "\n\n" +
        "It ends with time: why wall clocks can't order events across machines, and how Lamport and vector clocks track what could have caused what. Both parts have a simulator you drive by hand.";
}
