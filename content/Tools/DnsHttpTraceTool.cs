namespace DsaAcademy.Content.Tools;

public class DnsHttpTraceTool : ITool
{
    public string Id => "dns-and-http";
    public string Section => "Networking";
    public string Track => "application";
    public string Title => "DNS & HTTP: From a URL to a Web Page";
    public string OneLiner => "Typing a URL and seeing a page triggers a whole chain of lookups and handshakes underneath -- this is that chain, one step at a time.";
    public string KeyTakeaway =>
        "DNS turns a name into an address (Application layer asking the Internet layer's addressing " +
        "system a question); the TCP handshake and, for HTTPS, the TLS handshake happen BEFORE any " +
        "actual HTTP request goes out; and the whole sequence repeats for every extra resource a page " +
        "needs, often reusing the same already-open connection instead of paying for a new handshake " +
        "each time.";

    public ToolKind ToolKind => ToolKind.DnsHttpTrace;

    public string Explanation =>
        "Typing a URL and pressing enter looks instant, but it's really a chain of separate steps " +
        "across several layers (see The OSI & TCP/IP Models). First, DNS: the browser needs an IP " +
        "address to actually connect to (see IP Addressing & Subnetting), so it asks a DNS resolver " +
        "\"what's the IP for this hostname?\" -- checking its own cache first, since re-asking for a " +
        "name it already resolved recently would be wasted round-trips. Once it has an IP, it opens a " +
        "TCP connection to it (see TCP vs UDP) via the three-way handshake, and for HTTPS, layers a TLS (Transport " +
        "Layer Security, the encryption behind HTTPS) handshake on top of that to agree on encryption BEFORE any real HTTP data is exchanged -- " +
        "that's why HTTPS's first request has more round-trip overhead than plain HTTP, encryption " +
        "isn't free at connection-open time.\n\n" +
        "Only after both handshakes complete does the browser send the actual HTTP request -- a method " +
        "and path (GET /path HTTP/1.1) plus headers like Host and User-Agent -- and the server sends " +
        "back a response: a status code (200 OK, 404 Not Found, 301 Redirect, ...), response headers, " +
        "and the actual content. If that content is an HTML page, the browser then parses it, finds " +
        "every additional resource it references (images, stylesheets, scripts), and repeats the DNS-" +
        "then-connect-then-request sequence for each one -- though modern HTTP reuses an already-open " +
        "TCP connection for multiple requests to the same server rather than paying for a fresh " +
        "handshake every single time, which is a large part of why sites with many small resources on " +
        "the same domain load faster than the same total data spread across many different domains.\n\n" +
        "Step through the full sequence below, one request's worth, start to finish.";
}
