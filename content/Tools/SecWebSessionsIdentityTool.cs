namespace DsaAcademy.Content.Tools;

public class SecWebSessionsIdentityTool : ITool
{
    public string Id => "sec-web-sessions-identity";
    public string Section => "Security";
    public string Track => "identity & secrets";
    public int Order => 100;
    public string Title => "Web Sessions and Identity: Cookies, JWT, OAuth, SAML and CORS";
    public string OneLiner => "Session cookies versus tokens, cookie flags, JWT anatomy, the OAuth 2.0 code flow with PKCE, OpenID Connect, SAML single sign-on, and the same-origin policy and CORS.";
    public string KeyTakeaway => "A session cookie points at state on the server; a JWT carries signed, readable claims. OAuth 2.0 grants an app access to an API, OpenID Connect and SAML tell an app who the user is. Use the authorization code flow with PKCE through a library, verify every token's signature and claims, and remember CORS only limits what browser pages can read.";

    public ToolKind ToolKind => ToolKind.SecWebSessionsIdentity;

    public string Explanation =>
        "HTTP doesn't remember anyone between requests, so every web app needs a way to know who sent each one. This lesson covers the answers in use today, from a plain session cookie to single sign-on through an identity provider, and the browser rules (cookie attributes, the same-origin policy and CORS) that decide what gets sent and what a page may read." +
        "\n\n" +
        "You can sign and tamper with a real JWT, step through an OAuth login, and try CORS settings to see what the browser allows.";
}
