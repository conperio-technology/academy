namespace DsaAcademy.Content.Tools;

public class ApiIdempotencyTool : ITool
{
    public string Id => "sd-api-idempotency";
    public string Section => "System Design";
    public string Track => "api design";
    public int Order => 18;
    public string Title => "Idempotency Keys and Safe Retries";
    public string OneLiner => "A timeout doesn't tell the client whether the charge happened. An idempotency key lets it retry anyway without charging twice.";
    public string KeyTakeaway =>
        "When a request times out, the client can't tell whether the server never got it, is still working on it, or finished " +
        "and the response was lost. Retrying a POST blindly can then charge a card twice. The fix is an idempotency key: the " +
        "client generates a unique id for each logical operation, sends it with every attempt, and the server records the key " +
        "with the result, atomically with the work, and answers repeats with the stored result. Claim the key with a unique " +
        "insert before doing the work so two concurrent attempts can't both run, reject a reused key with a different body, " +
        "and keep keys for at least as long as clients may retry.";

    public ToolKind ToolKind => ToolKind.ApiIdempotency;

    public string Explanation =>
        "Networks fail in an unhelpful way: a client that sends a request and gets no answer can't tell which of three things " +
        "happened. The request may never have reached the server. The server may still be working on it. Or the server may " +
        "have finished, charged the card, and lost the response on the way back (a dropped connection, a load balancer " +
        "timeout, a phone going into a tunnel). For a GET none of this matters, because reading twice is harmless. For POST " +
        "/charges it matters a great deal: not retrying risks losing a real payment, and retrying risks charging the customer " +
        "twice. Mobile apps, SDKs and service meshes retry automatically, and users press the button again, so an API that " +
        "moves money or sends messages has to handle repeats deliberately.\n\n" +
        "An idempotency key turns a non-idempotent operation into an idempotent one. The client creates a unique value, " +
        "usually a random UUID (a 128-bit identifier that is practically never generated twice), for each logical operation, " +
        "such as \"pay for basket 881\", and sends it in a header on the first attempt and on every retry of that same " +
        "operation: Idempotency-Key: 5f1c.... The server keeps a table of keys it has seen. On a new key it does the work and " +
        "stores the key together with the response. On a key it has already completed it does nothing and returns the stored " +
        "response, the same status code and body as the first time, so the client can't tell a replay from the original. Stripe " +
        "popularised this pattern, and an IETF draft standardises the Idempotency-Key header. A key is scoped to one account " +
        "(so two customers can't collide) and has a lifetime: Stripe keeps keys for 24 hours, which must be longer than any " +
        "client's retry window.\n\n" +
        "The details are where implementations go wrong. First, concurrency. A client that times out after 2 seconds and " +
        "retries may send its second attempt while the first is still running. If the server checks \"have I seen this key?\" " +
        "and only records it after finishing, both attempts see nothing and both charge. The fix is to claim the key first, " +
        "with an atomic insert into a table with a unique constraint (INSERT ... ON CONFLICT DO NOTHING, or a conditional put " +
        "in DynamoDB) and status \"in progress\". Whoever inserts it does the work; any other attempt finds an in-progress row " +
        "and gets 409 Conflict (\"still processing, retry shortly\") rather than a second charge. Second, atomicity. Saving " +
        "the result and the key's completion must happen in the same database transaction as the work itself, or a crash " +
        "between them leaves a charge with no record of it. When the work calls an external system (a card network, an email " +
        "provider), pass the key, or one derived from it, downstream, so that system deduplicates too. Third, misuse. If a " +
        "client reuses a key with a different body (another amount), that is a bug, not a retry: store a hash of the request " +
        "with the key and reject a mismatch with 422 rather than silently replaying the wrong result. Fourth, failures. If " +
        "the attempt failed with a validation error, the stored 4xx response is replayed; if it failed with a transient " +
        "server error before doing anything, release the key so a retry can try again. If the worker crashed mid-attempt, " +
        "its in-progress row would block every retry with 409 until the key expires, so store a lease time (locked_at) " +
        "with the claim: a retry that finds an expired lease reclaims the row, asks the downstream system about the " +
        "forwarded key, and only re-runs the work if that system never saw it.\n\n" +
        "The key belongs to the operation, not the attempt. Generate it when the user starts the action (when the checkout page " +
        "loads, or when the job is created) and keep it across retries and even app restarts; generating a fresh key per HTTP " +
        "attempt defeats the whole mechanism.\n\n" +
        "Sometimes the API can be made naturally idempotent instead. A client-chosen id turns create into PUT: PUT " +
        "/orders/{client_order_id} creates the order the first time and is a no-op after that. Setting state (\"status\": " +
        "\"shipped\") rather than applying a change repeats safely. Conditional requests (If-Match with an ETag) make an update " +
        "apply only to the version it was based on. Message consumers do the same with an event id, as in the Message " +
        "Queues lesson: at-least-once delivery plus an idempotent consumer gives effectively-once processing.\n\n" +
        "Retries still need the discipline from the Resilience lesson: a few attempts, exponential backoff with jitter, and " +
        "no retries on 4xx errors other than 409, 429 and 408. Idempotency makes a retry safe; backoff makes it polite.\n\n" +
        "How the simulator works. A client pays $40 with POST /charges. Pick what goes wrong on the first attempt, whether the " +
        "client sends an idempotency key, and how the server stores keys. The client times out after 2 seconds and retries up " +
        "to three times (after a timeout or a 409), with backoff. The log shows each attempt, the server's key table and how many times the card was charged.";
}
