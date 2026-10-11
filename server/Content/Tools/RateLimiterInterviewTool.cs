namespace DsaAcademy.Content.Tools;

public class RateLimiterInterviewTool : ITool
{
    public string Id => "sd-interview-rate-limiter";
    public string Section => "System Design";
    public string Track => "interview walk-throughs";
    public int Order => 23;
    public string Title => "Design a Rate Limiter";
    public string OneLiner => "A distributed API rate limiter as a 45-minute design round: algorithms, atomic counters in Redis, and what happens when the limiter fails.";
    public string KeyTakeaway =>
        "A rate limiter sits on every request, so it has to be cheap, shared and harmless when broken. Keep counters " +
        "in a sharded Redis close to the gateways and update them with one atomic Lua script, pick the algorithm per " +
        "limit (token bucket for API keys, sliding window counter for long windows), and fail open to a local fallback " +
        "rather than turning a cache outage into an API outage.";

    public ToolKind ToolKind => ToolKind.DesignRateLimiter;

    public string Explanation =>
        "Same format as the other walk-throughs: write your answer for each stage first, then compare it with the " +
        "model answer and tick what you covered. If you haven't done the Rate Limiting building-block lesson, do it " +
        "first: it compares the algorithms on the same traffic, and this round assumes you know how each one works.\n\n" +
        "What makes this problem different is that the limiter is not the product; it's a component on the hot path " +
        "of every other product. That puts the difficulty in three places. First, the budget: the check gets about a " +
        "millisecond, so it can afford one round trip to an in-memory store and nothing more, and the estimation stage " +
        "should show that counter operations (several per request), not API requests, size that store. Second, " +
        "correctness under concurrency: a hundred gateways updating the same counter will break a read-then-write " +
        "implementation, and even INCR followed by EXPIRE has a gap that can block a client forever. Third, failure: " +
        "the interviewer will ask what happens when Redis is down, and \"the API goes down too\" is the wrong answer.\n\n" +
        "Expect the deep dive to start with algorithms and move quickly to the distributed parts: atomicity, local " +
        "versus global counting (accuracy against latency), multi-region limits, and fail open versus fail closed. " +
        "Name the trade-off each time, for example how much overshoot local token leases allow and why that's " +
        "acceptable for a 10,000-per-second limit but not for 5 login attempts a minute. Good follow-ups to prepare " +
        "for: \"one customer sends half our traffic: what breaks?\" and \"someone pushed a rule that limits everyone " +
        "to one request a minute: how would you have caught it?\"";
}
