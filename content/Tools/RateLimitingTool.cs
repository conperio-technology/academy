namespace DsaAcademy.Content.Tools;

public class RateLimitingTool : ITool
{
    public string Id => "sd-rate-limiting";
    public string Section => "System Design";
    public string Track => "building blocks";
    public int Order => 9;
    public string Title => "Rate Limiting";
    public string OneLiner => "Four ways to cap how many requests a client can make, compared on the same traffic.";
    public string KeyTakeaway =>
        "A fixed window counter is the simplest limiter but can let through twice the limit across a window boundary. Sliding " +
        "windows fix that, and a token bucket allows short bursts while enforcing an average rate. In a distributed system, the " +
        "counters usually live in Redis and are updated atomically.";

    public ToolKind ToolKind => ToolKind.RateLimiting;

    public string Explanation =>
        "A rate limiter caps how many requests a client can make in a period of time, for example 10 requests per 10 seconds. It " +
        "protects a service from abuse (scrapers, credential stuffing, a buggy client stuck in a retry loop), keeps one customer from " +
        "using up capacity everyone shares, and controls cost when each request calls something expensive. When a request is over the " +
        "limit, the service answers with HTTP 429 Too Many Requests and a Retry-After header saying how many seconds to wait, so well " +
        "behaved clients can back off.\n\n" +
        "The fixed window counter keeps one counter per client per clock window (0 to 10 seconds, 10 to 20, and so on) and rejects " +
        "requests once it reaches the limit. It's one number per client and easy to reason about, but it has a known flaw: a client " +
        "can send the full limit just before a boundary and the full limit again just after, which is twice the limit in a couple of " +
        "seconds. The burst preset shows it.\n\n" +
        "The sliding window log stores the timestamp of each allowed request and counts how many fall in the last 10 seconds. It's " +
        "exact, but it stores one entry per request. The sliding window counter approximates it with two numbers: the current " +
        "window's count plus the previous window's count weighted by how much of it still overlaps the last 10 seconds. It's nearly " +
        "as accurate and as cheap as a fixed window, which is why it's a common choice.\n\n" +
        "The token bucket gives each client a bucket that holds up to N tokens and refills at a steady rate. Each request takes a " +
        "token; with none left it's rejected. It deliberately allows a burst up to the bucket size and then enforces the refill rate, " +
        "which matches how real clients behave (a page load fires several requests at once). It's the algorithm behind many API " +
        "gateways and cloud limits. A leaky bucket is the mirror image: requests join a queue of fixed size that drains at a steady " +
        "rate, which smooths the output instead of allowing bursts.\n\n" +
        "Rate limiters usually sit at the edge, in the API gateway (the front-door server every API call passes through) or load balancer, so rejected requests cost almost nothing. The key " +
        "you limit by matters: per user or per API key is fair for signed-in traffic, per IP address is all you have for anonymous " +
        "traffic but can punish many users behind one office or mobile carrier address. Many systems apply several limits at once.\n\n" +
        "With many gateway instances, each one can't keep its own counters, or a client could multiply its limit by the number of " +
        "instances. The usual answer is a shared store such as Redis, updated with atomic operations (INCR with an expiry for a fixed " +
        "window, or a small Lua script for a token bucket) so two instances can't both read 9 and both allow the tenth request. That " +
        "adds a network round trip to every request, so some systems keep approximate local counters and sync them periodically, " +
        "accepting that a client may briefly exceed the limit. If the store is unreachable, you also have to decide whether to fail " +
        "open (allow everything) or fail closed (reject everything).";
}
