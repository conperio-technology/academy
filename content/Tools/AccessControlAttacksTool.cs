namespace DsaAcademy.Content.Tools;

public class AccessControlAttacksTool : ITool
{
    public string Id => "sec-access-control-ssrf-csrf";
    public string Section => "Security";
    public string Track => "web attacks";
    public string Title => "Broken Access Control: IDOR, CSRF and SSRF";
    public string OneLiner =>
        "Three ways an attacker uses access they shouldn't have: changing an ID in a URL, getting your " +
        "browser to send a request for them, and getting the server to fetch internal addresses.";
    public string KeyTakeaway =>
        "Access control has to be enforced on the server, for every request and every object: who is asking, " +
        "and may they do this to this record? CSRF abuses the browser sending your cookies automatically, and" +
        " is stopped by SameSite cookies and anti-CSRF tokens. SSRF abuses the server's network position, and" +
        " is stopped by allowlisting destinations and checking the resolved IP address.";

    public ToolKind ToolKind => ToolKind.AccessControlAttacks;

    public string Explanation =>
        "Broken access control is the number one risk in the OWASP Top 10: the app correctly knows who you " +
        "are (authentication) but doesn't correctly check what you may do (authorization). The simplest form " +
        "is IDOR, an insecure direct object reference: the URL /api/invoices/1043 shows your invoice, and " +
        "changing it to 1044 shows someone else's, because the server only checked that you were logged in. " +
        "Hiding an admin button in the interface is the same mistake: anyone can send the request the button " +
        "would have sent. The fix is a server-side check on every request, ideally in one shared place, that " +
        "denies by default.\n\nCSRF, cross-site request forgery, turns your own browser against you. Browsers " +
        "attach a site's cookies to every request to that site, even when another page started it. A " +
        "malicious page can therefore submit a hidden form to a site you're signed in to, and the request " +
        "arrives with your session. Two defences work together: cookies marked SameSite=Lax or Strict, which " +
        "browsers don't send on cross-site form posts, and an anti-CSRF token, a random value in each form " +
        "that another site can't read. ASP.NET Core's antiforgery support adds the token for you.\n\nSSRF, " +
        "server-side request forgery, abuses features where the server fetches a URL for you: link previews, " +
        "webhooks, \"import from URL\". The server sits inside the network, so an attacker can point it at " +
        "addresses they can't reach themselves: internal admin pages, databases, or the cloud metadata " +
        "service at 169.254.169.254, which can return the server's own cloud credentials. Filtering the URL " +
        "text doesn't work, because the same address can be written many ways or hidden behind a DNS name. " +
        "Resolve the name, check the actual IP against private, loopback and link-local ranges, connect to " +
        "that IP, and best of all allow only known destinations. Try all three attacks below and switch the " +
        "defences on.";
}
