namespace DsaAcademy.Content.Tools;

public class AsyncSystemsTool : ITool
{
    public string Id => "sd-async-systems";
    public string Section => "System Design";
    public string Track => "building blocks";
    public int Order => 8;
    public string Title => "Distributed Async Systems: Streams, Outbox and Sagas";
    public string OneLiner => "Work queues vs pub/sub vs Kafka-style logs, consumer groups and offsets, idempotency keys, the transactional outbox, sagas and ordering guarantees.";
    public string KeyTakeaway =>
        "Pick the channel by who should get each message: one worker (work queue), every subscriber (pub/sub), or any number of " +
        "independent readers who can replay history (a log such as Kafka). Delivery is at least once, so every consumer must be " +
        "idempotent. Never write to a database and publish an event as two separate steps: write both in one transaction with an " +
        "outbox table. Multi-step business processes become sagas of local transactions with compensating actions, and ordering " +
        "is only ever guaranteed per partition or per key.";

    public ToolKind ToolKind => ToolKind.AsyncSystems;

    public string Explanation =>
        "The Message Queues lesson covered one queue between a producer and its consumers. Real systems connect dozens of services " +
        "this way, and the questions change: who gets each message, can anyone read it again later, what happens to ordering, and " +
        "how do you keep a database and a stream of events in agreement when either side can crash halfway.\n\n" +
        "Three shapes. A work queue (SQS, RabbitMQ, Azure Service Bus queues) hands each message to exactly one of a pool of " +
        "competing workers and deletes it once a worker acknowledges it: use it to spread tasks such as resizing images. Pub/sub " +
        "(publish/subscribe: SNS, RabbitMQ fanout exchanges, Google Pub/Sub topics) gives every subscriber its own copy: the " +
        "checkout service publishes OrderPlaced, and email, analytics and shipping each receive it without the publisher knowing " +
        "they exist. A log (Kafka, Amazon Kinesis, Azure Event Hubs, Redpanda) is an append-only, ordered record that consumers " +
        "read at their own pace; nothing is deleted when it is read.\n\n" +
        "Kafka's model is worth knowing precisely, because interviewers ask. A topic is split into partitions. Each partition is " +
        "an ordered log on disk, and each message in it has an offset, its position in that log. Messages stay for a retention " +
        "period (7 days by default) whether or not anyone has read them, or with log compaction, Kafka keeps at least the latest " +
        "message for each key. The producer picks a partition from the message key: the default partitioner hashes the key and " +
        "takes it modulo the number of partitions, so every message with the same key, such as one customer id, lands in the same " +
        "partition in order. Adding partitions later changes that mapping for existing keys.\n\n" +
        "Consumers read as a consumer group. Within one group each partition is assigned to exactly one consumer at a time, and a " +
        "consumer may own several partitions, so the partition count caps a group's parallelism: 6 partitions and 8 consumers " +
        "leaves 2 consumers idle. Different groups are independent: the billing group and the analytics group each read every " +
        "message and each keep their own position. The position is a committed offset, stored by Kafka in an internal topic. " +
        "Commit after processing and a crash means the next owner re-reads everything since the last commit: at-least-once, with " +
        "duplicates. Commit before processing and a crash loses those messages: at-most-once. When consumers join or leave, the " +
        "group rebalances and partitions move. Because the log is kept, a group can reset its offset and replay history, for " +
        "example to rebuild a search index or recover from a bug.\n\n" +
        "Kafka's exactly-once semantics cover a narrower case than the name suggests: an idempotent producer (the broker drops " +
        "duplicate sends using a producer id and sequence numbers) plus transactions that write output messages and commit input " +
        "offsets atomically. That makes read-process-write pipelines inside Kafka exactly-once. The moment a consumer charges a " +
        "card, sends an email or writes to another database, you are back to at-least-once delivery and need an idempotent " +
        "consumer.\n\n" +
        "Idempotency keys make retries and redeliveries safe. The original caller generates a unique id for the operation (a " +
        "UUID created when the user pressed Pay, or the event id) and every hop passes it along. The consumer records the keys it " +
        "has processed, in the same database transaction as the side effect, behind a unique constraint, and treats a repeat as " +
        "already done, returning the stored result. Keep keys for longer than the longest possible redelivery delay. Messages " +
        "that fail every time go to a dead letter queue after a few attempts (SQS does this with a redrive policy and a maximum " +
        "receive count). Kafka has no built-in dead letter topic for ordinary consumers; frameworks publish failures to a separate " +
        "topic, because one poison message would otherwise block its whole partition.\n\n" +
        "The dual-write problem is the classic bug. A service saves an order and then publishes OrderPlaced. If it crashes between " +
        "the two, the order exists and nobody downstream hears about it; publish first and the event can describe an order that " +
        "was never saved. The transactional outbox fixes it: in the same database transaction as the order, insert a row into an " +
        "outbox table. A separate relay reads the outbox, either by polling or with change data capture (CDC) such as Debezium " +
        "reading the database's log, publishes each row and marks it sent. A crash after publishing but before marking means the " +
        "event goes out twice, which idempotent consumers already handle.\n\n" +
        "A saga replaces a distributed transaction (two-phase commit across services, which is slow and blocks when the " +
        "coordinator fails) with a sequence of local transactions, each with a compensating action that undoes it in business " +
        "terms: release the reserved stock, refund the charge. If step 3 fails, the saga runs the compensations for steps 2 and 1 " +
        "in reverse. In choreography each service reacts to the previous service's event, with no central owner, which is simple " +
        "for three steps and hard to follow for ten. In orchestration a coordinator (your own state machine, or a workflow engine " +
        "such as Temporal or AWS Step Functions) tells each service what to do and records progress, so the whole process is " +
        "visible in one place. Sagas are not isolated: other requests can see the intermediate states, so design for them.\n\n" +
        "Ordering is only guaranteed within a partition (Kafka, Kinesis shards) or a message group (SQS FIFO), never across a " +
        "whole topic, and a retry can still reorder things unless the consumer handles one key at a time. Choose the key so the " +
        "messages whose order matters share it. Standard SQS queues and most pub/sub systems give best-effort ordering only, so " +
        "consumers should carry a version number or timestamp and ignore anything older than what they already applied.\n\n" +
        "Event-driven architecture is the style built from all this: services publish facts in the past tense (OrderPlaced, " +
        "PaymentFailed) and others react, rather than calling each other directly. It decouples teams and absorbs bursts, at the " +
        "cost of eventual consistency, harder debugging (you need correlation ids and traces, see Observability and SLOs) and " +
        "schemas that many consumers depend on: add optional fields, never change what an existing field means, and use a schema " +
        "registry where the platform has one. The number to watch is consumer lag, how far each group is behind the newest " +
        "message.\n\n" +
        "The widgets are teaching models, not real brokers: a Kafka-style topic you can produce to, consume, crash and replay; a " +
        "dual write and an outbox with a crash at the point you choose; and a three-step order saga.";
}
