namespace DsaAcademy.Content.Tools;

public class ApiAuthLimitsTool : ITool
{
    public string Id => "sd-api-auth-limits";
    public string Section => "System Design";
    public string Track => "api design";
    public int Order => 19;
    public string Title => "API Keys, OAuth Scopes, Rate Limits and Quotas";
    public string OneLiner => "The checks every request passes before your handler runs: who is calling, what they may do, to which object, and how often.";
    public string KeyTakeaway =>
        "Each API request goes through the same gates, in order: authenticate the caller (an API key for server-to-server " +
        "calls, an OAuth access token when acting for a user), check its rate limits and quotas, check the token's scopes " +
        "allow this kind of action, and check this caller may touch this particular object. Each failure has its own answer: 401 for " +
        "no or bad credentials, 403 for a missing scope or permission (or 404 to hide that the object exists), 429 with " +
        "Retry-After for limits. Rate limits protect the service over seconds; quotas enforce a plan over days or months; " +
        "both should be visible to clients in response headers.";

    public ToolKind ToolKind => ToolKind.ApiAuthLimits;

    public string Explanation =>
        "This lesson is an overview of the parts of an API that aren't about any one endpoint. The Security section covers " +
        "authentication and OAuth in depth, and the Rate Limiting lesson and the Design a Rate Limiter walk-through cover the " +
        "algorithms; here the question is how they fit into an API design.\n\n" +
        "Authentication answers \"who is calling?\". An API key is a long random secret issued to a developer or a service, " +
        "sent in a header (Authorization: Bearer sk_live_... or X-API-Key) on every request. Keys are simple and suit " +
        "server-to-server calls, but they identify an application, not a user, and anyone who copies one can use it until it " +
        "is revoked. Treat them like passwords: store only a hash, show the full key once, use a recognisable prefix (sk_live_, " +
        "ghp_) so leaked keys can be found by secret scanners, let customers create several keys and rotate them, and never " +
        "put one in a mobile app or web page, where anyone can extract it.\n\n" +
        "When a third-party app acts for a user (a scheduling tool reading your calendar), the user should never hand over " +
        "their password. OAuth 2.0 solves this: the app sends the user to the provider, the user logs in there and approves a " +
        "list of permissions, and the app receives an access token, a short-lived credential (minutes to an hour) that it " +
        "sends as Authorization: Bearer <token>, plus a refresh token to get new ones. The " +
        "authorization code flow with PKCE (now recommended for every app, and essential for mobile and browser apps that can't keep a secret) protects the exchange; for one service calling another with no user, the client " +
        "credentials grant issues a token to the service itself. Access tokens are often JWTs (signed JSON) that a gateway " +
        "can verify without calling the auth server, which is fast but means a token can't easily be revoked before it " +
        "expires, which is one reason they are short-lived.\n\n" +
        "Authorization answers \"may this caller do this?\", at two levels. Scopes are the coarse level: the permissions the " +
        "token was granted, such as photos:read or calendar.events.write. Design them around what users understand when they " +
        "approve (read versus write, per area of the product), not one per endpoint, and give each token the fewest it needs. " +
        "A valid token without the needed scope gets 403 with error=\"insufficient_scope\" in the WWW-Authenticate header. " +
        "The fine level is per object: a token with photos:write may edit the user's own photos, not someone else's. Checking " +
        "that on every request, in the handler or a shared policy, is the single most important security check in an API: " +
        "OWASP's API Security Top 10 puts broken object level authorization (BOLA), changing /photos/123 to /photos/124 and " +
        "getting someone else's photo, at number one. Return 404 rather than 403 when the caller shouldn't learn that the " +
        "object exists.\n\n" +
        "Rate limits and quotas answer \"how much?\". A rate limit caps short-term speed (100 requests per second per key, " +
        "with bursts allowed by a token bucket) to protect the service from overload and from one customer using up shared " +
        "capacity. A quota caps total use over a billing period (10,000 calls a day on the free plan, a million on the paid " +
        "one) and is a product and pricing decision. Limits can be per key, per user, per IP address for anonymous traffic, " +
        "per endpoint (search and login are usually stricter), and per tenant. Tell clients where they stand: the IETF " +
        "RateLimit header fields (RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, or the older X-RateLimit-* " +
        "versions GitHub uses) on every response, and 429 Too Many Requests with Retry-After when they are over. A good client " +
        "waits that long instead of retrying immediately, which only makes things worse.\n\n" +
        "Where these checks run: usually in an API gateway, the front-door service every request passes through, which " +
        "terminates TLS, validates keys and tokens, enforces rate limits and quotas, and records usage for billing before " +
        "forwarding the request. Object-level authorization can't live there, because only the service knows who owns " +
        "photo 124, so it stays in the service. Order matters: authenticate first, so an attacker without a key can't use up a " +
        "real customer's quota, and run the cheap checks before the expensive ones.\n\n" +
        "The widget sends requests through those gates. Part 1 lets you choose the caller and the request and shows which gate " +
        "stops it and with what status. Part 2 runs a client against a rate limit with the headers it returns, and compares a " +
        "client that retries immediately with one that honours Retry-After.";
}
