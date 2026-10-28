import { type OpsLessonData } from "../types.ts";

export const sdConsensus: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Many systems need a group of machines to agree on one thing even while some of them crash or the network splits: who the leader is, whether a lock is held, which configuration is current, the order of writes to a replicated log. That is the consensus problem. Get it wrong and you get split brain: two nodes that each believe they are the leader, both accepting writes, and data that can't be reconciled.",
        "You will rarely implement consensus, but you use it all the time: etcd under Kubernetes, ZooKeeper, Consul, Kafka's KRaft controllers, CockroachDB and many cloud databases. This lesson explains how Raft works, with a cluster you can break by hand, why it takes a majority, and how systems order events when there is no shared clock.",
      ],
    },
    {
      kind: "terms",
      title: "The vocabulary",
      terms: [
        { term: "Replicated state machine", meaning: "every node applies the same commands in the same order, so they all end in the same state. Consensus is agreeing on that order: a replicated log." },
        { term: "Quorum", meaning: "the number of nodes that must agree for a decision to count; for consensus, a majority (more than half). Any two majorities share at least one node, which is what stops two conflicting decisions." },
        { term: "Leader", meaning: "the one node that accepts writes and decides the log order. Followers copy it. A cluster without a leader can't make progress until it elects one." },
        { term: "Term (epoch)", meaning: "a number that goes up with every election. Each term has at most one leader, and a node that sees a higher term than its own knows it is out of date." },
        { term: "Split brain", meaning: "two parts of a cluster both acting as leader after a partition. Majority quorums prevent it: only one side of any split can hold a majority." },
        { term: "Fencing token", meaning: "the term or a counter sent with every write, so storage can reject an old leader that hasn't noticed it was replaced." },
        { term: "Crash fault versus Byzantine fault", meaning: "Raft and Paxos tolerate nodes that stop or lose messages. Nodes that lie or act maliciously need Byzantine fault tolerant protocols (as in some blockchains), which cost far more." },
      ],
    },
    {
      kind: "table",
      title: "How many failures a cluster survives",
      head: ["Nodes", "Majority", "Can lose", "Notes"],
      rows: [
        ["1", "1", "0", "no fault tolerance"],
        ["2", "2", "0", "worse than 1: either failure stops it"],
        ["3", "2", "1", "the usual minimum"],
        ["4", "3", "1", "no better than 3, and one more machine to fail"],
        ["5", "3", "2", "common for important control planes"],
        ["7", "4", "3", "rarely worth it: every write waits for 4 nodes"],
      ],
      notes: ["A cluster of 2f + 1 nodes survives f failures, which is why clusters have odd sizes. More nodes add fault tolerance but make every write slower, since each one waits for a majority to store it."],
    },
    {
      kind: "steps",
      title: "Raft in four rules",
      steps: [
        "Election: each follower waits a random timeout (say 150 to 300 ms) for a heartbeat from the leader. If none comes, it becomes a candidate, adds one to its term, votes for itself and asks the others for votes. Random timeouts make it unlikely two nodes stand at once.",
        "Voting: a node grants at most one vote per term, and only to a candidate whose log is at least as up to date as its own (a later last term, or the same last term and at least as long). That keeps any node missing committed entries from winning.",
        "Replication: the leader appends each client write to its log and sends it to the followers with its heartbeats (AppendEntries). Followers that don't match are brought in line with the leader's log.",
        "Commit: once an entry from the current term is stored on a majority, the leader marks it committed, applies it and answers the client. Followers apply it when the next heartbeat tells them the commit point moved. A committed entry is never lost, because every future leader must win votes from a majority that includes a node holding it.",
      ],
    },
    {
      kind: "widget",
      widget: "raftSim",
      title: "Try it: run a Raft cluster",
      intro: "Make a node's election timer run out to elect a leader, then send client writes and heartbeats. Crash the leader and elect another; partition nodes 1 and 2 away from the rest and watch which side can still commit.",
    },
    {
      kind: "text",
      title: "What to notice in the simulator",
      paragraphs: [
        "Elect node 1, partition, and send writes: node 1 still thinks it is leader, but with only node 2 reachable it can't reach a majority, so its entries stay uncommitted. Now time out a node on the other side: it wins with three votes in a higher term and commits writes. Heal the partition and send a heartbeat: node 1 sees the higher term, steps down, and its uncommitted entries are replaced by the new leader's log. Nothing that a client was told was committed is lost.",
        "Crash a follower, send a write, restart it and time it out before any heartbeat: its log is behind, and the up-to-date check means nodes with newer logs refuse their votes. And crash two of the five nodes: the remaining three still form a majority and keep working, but crash a third and the cluster stops accepting writes rather than risk disagreeing.",
      ],
    },
    {
      kind: "table",
      title: "Consensus protocols and where they run",
      head: ["Protocol", "Idea", "Used by"],
      rows: [
        ["Paxos (Lamport, 1998) and Multi-Paxos", "proposers and acceptors agree on one value per slot through prepare and accept phases with numbered ballots", "Google Chubby and Spanner, many internal systems"],
        ["Raft (2014)", "the same guarantees as Multi-Paxos, designed to be easy to understand: a strong leader, terms and a log", "etcd (so Kubernetes), Consul, CockroachDB, TiKV, Kafka KRaft, RabbitMQ quorum queues"],
        ["ZAB", "ZooKeeper's atomic broadcast: an elected leader orders all updates", "ZooKeeper, which older Kafka, Hadoop and HBase depend on"],
        ["Byzantine protocols (PBFT and successors)", "tolerate nodes that lie, using 3f + 1 nodes to survive f traitors", "permissioned blockchains"],
      ],
    },
    {
      kind: "text",
      title: "Consensus versus plain replication",
      paragraphs: [
        "Not every replicated database runs consensus on every write. A classic PostgreSQL or MySQL primary with replicas uses one primary and asynchronous or synchronous copying; electing a new primary is done by a separate tool, which itself often uses etcd, Consul or ZooKeeper to make sure only one primary exists. Leaderless stores such as Cassandra and DynamoDB use read and write quorums (W + R > N) per request instead, and resolve conflicts afterwards (see CAP and Consistency).",
        "Consensus gives linearizable writes: once a write is acknowledged, every later read sees it, even across leader changes. The price is a round trip to a majority on every write and no progress without a majority, which is the CP choice in CAP terms. That is why consensus usually holds the small, critical data (membership, leases, configuration, metadata) rather than every byte.",
      ],
    },
    {
      kind: "text",
      title: "Time without a shared clock",
      paragraphs: [
        "Machines' wall clocks drift and can jump backwards when NTP corrects them, so \"the write with the later timestamp wins\" can silently lose data. Distributed systems instead reason about causality: event a happened before event b if a came earlier on the same process, or a was sending a message that b received, or there is a chain of those between them. Events with no such chain are concurrent: neither could have influenced the other.",
        "A Lamport clock is one counter per process: add one for each event, attach the counter to every message, and on receiving take max(own, received) + 1. If a happened before b then L(a) < L(b), so sorting by Lamport time (with process id to break ties) gives a total order that respects causality. The converse doesn't hold: a smaller Lamport time doesn't prove a came first.",
        "A vector clock keeps one counter per process. Each process increments its own entry, sends the whole vector, and on receiving takes the entry-wise maximum and then increments its own. Now a happened before b exactly when every entry of V(a) is <= V(b) and they differ; if each vector is bigger somewhere, the events are concurrent. That is how Dynamo-style stores detect conflicting writes that need merging, and the idea behind version vectors and CRDTs.",
      ],
    },
    {
      kind: "widget",
      widget: "logicalClocks",
      title: "Try it: Lamport and vector clocks",
      intro: "Add local events and send messages between three processes. Each event shows its Lamport time and vector. Click two events to see whether one happened before the other or they are concurrent.",
    },
    {
      kind: "text",
      title: "Physical clocks still matter",
      paragraphs: [
        "Leases (\"I am leader for the next 10 seconds\") depend on clocks running at roughly the same rate, which is why they include safety margins. Google Spanner uses GPS and atomic clocks with a known error bound (TrueTime) and waits out that uncertainty before committing, which lets it order transactions globally by time. CockroachDB and others use hybrid logical clocks: wall-clock time plus a logical counter, so timestamps stay close to real time but still respect causality.",
      ],
    },
  ],
  quiz: [
    {
      question: "Why do consensus clusters have an odd number of nodes?",
      answer: "Adding a fourth node to three raises the majority to three but still survives only one failure",
      distractors: ["Raft can't elect a leader with an even number of nodes", "Votes would always tie with an even number", "Odd numbers hash more evenly"],
      why: "A cluster of 2f + 1 tolerates f failures. 4 nodes tolerate 1, the same as 3, with one more machine that can fail and one more vote to wait for.",
    },
    {
      question: "A 5-node Raft cluster is split into a side of 2 and a side of 3, and the old leader is on the side of 2. What happens to writes sent to it?",
      answer: "They can't commit; the side of 3 elects a new leader and keeps working",
      distractors: ["Both sides commit writes and merge when healed", "The whole cluster stops until the partition heals", "The old leader commits them and the side of 3 waits"],
      why: "Committing needs a majority of 3. Only the larger side has one, so only one leader can make progress: no split brain.",
    },
    {
      question: "Why does a Raft node refuse to vote for a candidate whose log is behind its own?",
      answer: "So a node missing committed entries can never become leader and overwrite them",
      distractors: ["To make elections finish faster", "Because the candidate's term must be lower", "To balance load across nodes"],
      why: "Committed entries are on a majority. A candidate needs a majority of votes, so at least one voter has every committed entry and will refuse a candidate that lacks them.",
    },
    {
      question: "Two events have vector clocks [2, 0, 1] and [1, 1, 1]. How are they related?",
      answer: "They are concurrent",
      distractors: ["The first happened before the second", "The second happened before the first", "They are the same event"],
      why: "The first is bigger in entry 1, the second is bigger in entry 2. Neither vector is <= the other everywhere, so neither event could have caused the other.",
    },
    {
      question: "Lamport time L(a) = 3 and L(b) = 7. What can you conclude?",
      answer: "b did not happen before a, but a may or may not have happened before b",
      distractors: ["a happened before b", "a and b are concurrent", "b happened before a"],
      why: "If b happened before a, L(b) would be smaller. A smaller Lamport time is consistent with both causality and concurrency; you need vector clocks to tell which.",
    },
  ],
  pitfalls: [
    "Running consensus across two data centers: if either goes down, the other may not have a majority. Use three sites, or put the tie-breaking node in a third.",
    "Using last-write-wins with wall-clock timestamps and losing updates when a clock is behind.",
    "Building a leader election from a database row or a cache key without fencing tokens, so a paused old leader keeps writing.",
    "Putting bulk data through etcd or ZooKeeper; they are for small, critical coordination data.",
    "Assuming a 2-node cluster is fault tolerant. It isn't: losing either node loses the majority.",
  ],
  next: [
    { id: "sd-cap", label: "CAP and Consistency" },
    { id: "sd-replication-sharding", label: "Replication and Sharding" },
    { id: "sd-interview-key-value-store", label: "Design a Distributed Key-Value Store" },
  ],
};
