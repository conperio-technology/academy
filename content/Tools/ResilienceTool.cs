namespace DsaAcademy.Content.Tools;

public class ResilienceTool : ITool
{
    public string Id => "sd-resilience";
    public string Section => "System Design";
    public string Track => "scaling and reliability";
    public int Order => 12;
    public string Title => "Timeouts, Retries, Circuit Breakers and Load Shedding";
    public string OneLiner => "How a five-second slowdown becomes an outage that outlives it when every client retries at once, and the patterns that stop it.";
    public string KeyTakeaway =>
        "Every remote call needs a timeout, and retries need limits: a few attempts, exponential backoff with random jitter so " +
        "clients don't retry in lockstep, and a retry budget so retries can never multiply the load. A circuit breaker stops " +
        "calling a dependency that is failing, bulkheads keep one slow dependency from using up every thread, and load shedding " +
        "rejects excess work early and cheaply. Without them, retries can keep a system overloaded long after the original " +
        "problem is gone.";

    public ToolKind ToolKind => ToolKind.Resilience;

    public string Explanation =>
        "Start with timeouts. A call with no timeout can wait forever, holding a thread, a connection and memory the whole time, " +
        "and many defaults are far too long (.NET's HttpClient waits 100 seconds). Pick a timeout from the callee's normal latency, " +
        "a little above its p99 or p999, and from the caller's own budget: if the user gives up after 2 seconds, a 30-second " +
        "timeout three calls down is wasted work. Better still, propagate a deadline: each request carries the time remaining, " +
        "every service passes the rest of it downstream, and work whose deadline has passed is dropped instead of done. gRPC " +
        "does this with its grpc-timeout header.\n\n" +
        "Retries rescue transient failures: a timeout, a 503 Service Unavailable, a reset connection, a server that was being " +
        "replaced. They are only safe when repeating the request is harmless, which means reads, idempotent writes (setting a " +
        "value rather than adding to it) or requests carrying an idempotency key. Never retry errors that will fail the same way " +
        "again, such as 400 Bad Request or a validation error. Retry at one layer only: if three layers each make up to 3 " +
        "attempts, one user request can become 27 calls at the bottom of the stack.\n\n" +
        "Exponential backoff waits longer after each failure, for example 100 ms, 200 ms, 400 ms, up to a cap. On its own it " +
        "isn't enough. Clients that failed at the same moment, because the same outage hit them all, back off by the same amounts " +
        "and come back at the same moment, in waves. Jitter adds randomness: with \"full jitter\" each wait is a random time " +
        "between zero and the backoff value, which spreads the retries evenly (Marc Brooker's 2015 AWS Architecture Blog post " +
        "on backoff and jitter is the classic write-up). A retry budget caps retries at a fraction of normal traffic, for example " +
        "10%: when most calls are failing the budget runs out, and the client stops adding load to a service that is already " +
        "drowning. The Google SRE book recommends both a per-request limit of three attempts and a per-client budget of about " +
        "10%.\n\n" +
        "A circuit breaker, popularised by Michael Nygard's book Release It!, wraps calls to one dependency. While calls succeed " +
        "it is closed and lets everything through. When the failure rate over a recent window crosses a threshold it opens: calls " +
        "fail immediately or use a fallback (a cached value, a default, a reduced page) without touching the dependency. After a " +
        "cool-down it goes half-open and lets a few trial calls through; if they succeed it closes, if not it opens again. Failing " +
        "fast frees the caller's threads and gives the dependency room to recover. Polly (Microsoft.Extensions.Http.Resilience in " +
        "modern .NET) and resilience4j in Java implement timeouts, retries and breakers.\n\n" +
        "Bulkheads are named after the walls that stop one flooded compartment sinking a ship. Give each dependency its own " +
        "limited pool of threads or connections, so when one gets slow it fills only its own pool. Little's law tells you how big " +
        "a pool needs to be: the number of requests in progress equals the arrival rate times the time each one takes. At 20 " +
        "calls a second and 50 ms each, a dependency keeps 1 call busy on average; at 2 seconds each it needs 40. In a shared " +
        "pool of 20, that one slow dependency takes every thread and every other request waits too.\n\n" +
        "Load shedding is the server's side of the same problem. An overloaded server that accepts everything serves everyone " +
        "slowly, and if the queue grows past the clients' timeouts, it spends all its capacity on requests nobody is waiting for " +
        "any more. Instead, keep queues short, reject excess work early and cheaply with a 503 and a Retry-After header, drop " +
        "requests whose deadline has passed, and shed low-priority work (batch jobs, prefetches) before user-facing requests. " +
        "Backpressure is the gentler cousin: a full bounded queue makes the producer slow down instead of piling up more work.\n\n" +
        "The worst outcome is a metastable failure (the term is from a 2021 paper by Bronson and others): a short trigger, such as " +
        "a few seconds of reduced capacity, pushes the system into overload, and the retries then keep it there even after the " +
        "trigger is gone. Restarting servers doesn't help, because the retry traffic is still coming. The simulator shows exactly " +
        "that.\n\n" +
        "How the simulator works. Clients send 80 requests a second to a service that can finish 100 a second, processed in order " +
        "from a queue. Each attempt times out after 1 second; a logical request gets up to 4 attempts. For 5 seconds starting at " +
        "t = 5 s the service can only finish 30 a second. Successes count only when the client was still waiting; work done for " +
        "an attempt that already timed out is wasted. Time moves in 100 ms steps and jitter comes from a seeded generator, so " +
        "every run of the same settings is identical. Part 2 is a bulkhead calculator using Little's law.";
}
