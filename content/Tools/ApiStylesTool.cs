namespace DsaAcademy.Content.Tools;

public class ApiStylesTool : ITool
{
    public string Id => "sd-api-styles";
    public string Section => "System Design";
    public string Track => "api design";
    public int Order => 16;
    public string Title => "REST vs gRPC vs GraphQL";
    public string OneLiner => "Three ways to shape the same API, compared on round trips, bytes on the wire and who carries the complexity.";
    public string KeyTakeaway =>
        "REST is the default for public APIs: every language and tool speaks it, and HTTP caching works for free. gRPC is the " +
        "usual choice between internal services: a typed contract in a .proto file, generated clients, compact binary messages " +
        "over HTTP/2 and streaming in both directions, at the cost of browser support and human-readable traffic. GraphQL lets " +
        "each client ask for exactly the fields it needs in one round trip, which suits apps with many different screens, but " +
        "moves the cost to the server (N+1 queries, expensive queries, harder caching). Many companies use all three: GraphQL " +
        "or a backend for frontend at the edge, gRPC inside, REST for partners.";

    public ToolKind ToolKind => ToolKind.ApiStyles;

    public string Explanation =>
        "The same functionality can be exposed in several API styles, and interviewers like to ask why you picked one. The three " +
        "you need to know are REST, gRPC and GraphQL; webhooks and streaming connections fill gaps none of them cover.\n\n" +
        "REST, covered in the previous lesson, maps resources to URLs and actions to HTTP methods, usually with JSON bodies. Its " +
        "strengths are reach and simplicity: anything that can make an HTTP request can call it, you can try it with curl, and " +
        "the web's caching layers (browsers, CDNs, reverse proxies) understand GET and Cache-Control without any extra work. " +
        "OpenAPI (formerly Swagger) describes a REST API in a YAML or JSON file from which documentation and client libraries " +
        "are generated. The weaknesses show up when a client needs data from several resources: a profile screen might call " +
        "/users/7, then /users/7/posts, then /posts/{id}/comments for each post. That is several round trips, which is painful " +
        "on a mobile network where each one costs 100 ms or more, and each response carries every field of the resource " +
        "whether the screen uses it or not (overfetching). Teams fix this with query parameters that select fields or embed " +
        "related resources (?fields=name,avatar&include=posts), or with a backend for frontend (BFF): a thin server per client " +
        "type that makes the many calls inside the datacenter and returns one shaped response.\n\n" +
        "RPC (remote procedure call) is the older idea of making a call to another machine look like a local function call: " +
        "GetUser(id) rather than GET /users/{id}. gRPC is Google's open-source RPC framework and the common choice between " +
        "internal services. You write the contract in a .proto file using Protocol Buffers: messages with numbered, typed " +
        "fields and services with methods. A compiler generates client and server code for each language, so a renamed field " +
        "or a wrong type is a build error rather than a production incident. Messages are encoded in a compact binary format " +
        "(field numbers and values, no field names), typically several times smaller and faster to parse than the same JSON. " +
        "gRPC runs on HTTP/2, which multiplexes many calls over one long-lived connection, and it supports four call shapes: " +
        "unary (one request, one response), server streaming, client streaming and bidirectional streaming. Deadlines travel " +
        "with each call. The costs: browsers can't speak native gRPC (gRPC-Web and a proxy are needed), binary traffic is " +
        "harder to inspect and debug, HTTP caches don't understand it, and long-lived HTTP/2 connections need load balancing " +
        "per request rather than per connection (an L7 proxy such as Envoy), or one backend gets all the traffic.\n\n" +
        "GraphQL, released by Facebook in 2015, exposes a single endpoint and a typed schema of objects and the relations " +
        "between them. The client sends a query naming exactly the fields it wants, nested as deep as the screen needs: the " +
        "user's name and avatar, their last three posts, and each post's comment count, in one request whose response has " +
        "the same shape as the query. That removes both the round trips and the overfetching, and lets mobile and web teams " +
        "build new screens without waiting for a new endpoint. Writes are mutations, and subscriptions push updates. The cost " +
        "moves to the server. Each field is filled by a resolver function, and a naive resolver for \"comment count of each " +
        "post\" runs one database query per post: the N+1 query problem. The standard fix is a DataLoader, which collects " +
        "the ids requested in one tick and fetches them in one batched query. A client can also write a query that is very " +
        "expensive (deeply nested friends of friends), so servers limit query depth and assign each query a cost, and many " +
        "only accept persisted queries (pre-registered query ids) from their own apps. Because every request is a POST to one " +
        "URL, CDN caching and per-endpoint metrics and rate limits need extra work.\n\n" +
        "Two more tools complete the picture. A webhook reverses the direction: instead of a client polling \"has the payment " +
        "settled yet?\", the provider sends an HTTP POST to a URL the client registered when something happens. Webhooks must " +
        "be signed (an HMAC of the body with a shared secret, so the receiver can verify the sender) and are delivered at least " +
        "once, so the receiver deduplicates by event id. For pushing a live stream to a browser, use server-sent events (SSE, " +
        "one-way over plain HTTP) or WebSockets (two-way); long polling is the fallback when neither is available.\n\n" +
        "How to choose in an interview: say who the clients are. Unknown third-party developers, many languages, cacheable " +
        "reads: REST. Internal services you control, high call volume, low latency, streaming: gRPC. Your own apps, many " +
        "screens with different data needs, a team willing to run the server-side machinery: GraphQL, or a REST BFF. Then name " +
        "what you give up. The widget fetches the same profile screen in each style, so you can see the round trips and bytes " +
        "change, and then asks you to pick a style for six situations.";
}
