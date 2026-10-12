namespace DsaAcademy.Content.Tools;

public class LoadBalancingTool : ITool
{
    public string Id => "sd-load-balancing";
    public string Section => "System Design";
    public string Track => "building blocks";
    public int Order => 2;
    public string Title => "Load Balancing";
    public string OneLiner => "How a load balancer spreads requests across servers, and what goes wrong when requests differ in cost or a server dies.";
    public string KeyTakeaway =>
        "A load balancer lets you add servers to handle more traffic and survive losing one, but only if the servers are stateless (they " +
        "keep no per-user data in their own memory between requests) and the balancer runs health checks. Round robin is fine for uniform requests; least connections or power of two choices " +
        "copes much better when some requests are expensive.";

    public ToolKind ToolKind => ToolKind.LoadBalancing;

    public string Explanation =>
        "A load balancer sits in front of a group of identical servers and gives clients one address. Each incoming request goes to " +
        "one of the servers, so you can handle more traffic by adding servers (horizontal scaling) and keep serving when one of them " +
        "fails. Almost every design in an interview has one in front of the application tier.\n\n" +
        "The choice of server is the algorithm. Round robin takes turns; random picks any server. Both spread requests evenly by " +
        "count, which is fine when every request costs about the same. When some requests are expensive, a server that picked up a " +
        "few slow ones keeps getting its turn and short requests wait behind them. Least connections sends each request to the server " +
        "with the fewest requests in flight, which steers around busy servers. Power of two choices picks two servers at random and " +
        "takes the less busy one; it gets most of the benefit without checking every server, which matters when there are many load " +
        "balancer instances that can't share exact counts. Weighted variants give bigger servers a larger share. Turn on heavy " +
        "requests in the demo and compare the p95 latency (the time 95% of requests finish within) of short requests across algorithms.\n\n" +
        "Health checks are how the balancer learns that a server is gone: it requests something like /health every few seconds and " +
        "removes servers that fail. Kill a server with health checks off and every request sent to it fails. With least connections " +
        "it's worse, because a dead server that refuses connections instantly always looks the least busy, so it attracts nearly all " +
        "the traffic. With health checks on, you still lose the requests sent in the gap before the next check.\n\n" +
        "Layer 4 load balancers route TCP connections by IP address and port, without looking inside; they're fast and simple. Layer 7 " +
        "load balancers understand HTTP, so they can route by path or header (send /api to one pool and /images to another), terminate " +
        "TLS, and retry failed requests, at some extra cost per request.\n\n" +
        "Sticky sessions send the same user to the same server every time, usually by a cookie. They're a workaround for servers that " +
        "keep session state in memory, and they undermine the whole point: that server's users lose their sessions when it dies, and " +
        "load can't be rebalanced. The better answer is stateless application servers that keep sessions in a shared store such as " +
        "Redis or in a signed token, so any server can handle any request.\n\n" +
        "The load balancer itself must not become a single point of failure. The usual setup is an active-passive pair sharing a " +
        "floating IP address: if the active one stops sending heartbeats, the passive one takes over the address. Cloud load " +
        "balancers do this for you. Across regions, DNS-based global load balancing returns the address of the nearest healthy region, " +
        "and each region then has its own load balancers.";
}
