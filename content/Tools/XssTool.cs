namespace DsaAcademy.Content.Tools;

public class XssTool : ITool
{
    public string Id => "security-xss";
    public string Section => "Security";
    public string Track => "web attacks";
    public string Title => "Cross-Site Scripting (XSS)";
    public string OneLiner => "SQL injection's cousin in the browser: user input that ends up running as code in someone else's page.";
    public string KeyTakeaway =>
        "Treat everything users submit as text, never as HTML. Encode it for the place it's going " +
        "(React does this automatically for anything in {curly braces}); be very suspicious of " +
        "dangerouslySetInnerHTML, innerHTML and anything else that turns a string into markup; and add a " +
        "Content Security Policy as a second line of defense.";

    public ToolKind ToolKind => ToolKind.Xss;

    public string Explanation =>
        "A comment box saves what you type and shows it to everyone who opens the page. If the page " +
        "builds its HTML by pasting the saved comment straight in, then a comment containing HTML " +
        "becomes part of the page -- including tags that run JavaScript, like an image with a broken " +
        "src and an onerror handler. That script runs in every reader's browser, on your site, as them. " +
        "It can read what the page shows, act with their session, or replace the page with a fake " +
        "login form. That's stored cross-site scripting.\n\n" +
        "The fix is the same idea as parameterized SQL: keep data and code apart. When user text goes " +
        "into HTML, encode it so `<` becomes `&lt;` and so on; the browser then displays the " +
        "characters instead of interpreting them. Toggle escaping in the demo and replay the attacks. " +
        "Modern frameworks do this by default: React escapes any value you render with {curly braces}, " +
        "and Razor in ASP.NET encodes @values. You only get XSS when you go around them -- " +
        "dangerouslySetInnerHTML in React, @Html.Raw in Razor, element.innerHTML in plain JavaScript -- " +
        "or when user input lands in a URL attribute: React still renders href={userUrl} with a " +
        "javascript: URL, so allow only http and https links. " +
        "If you truly need user-supplied formatting, run it through a sanitizer library that keeps a " +
        "small allowlist of tags.\n\n" +
        "A Content Security Policy (CSP) header is the backstop: it tells the browser which scripts " +
        "the page is allowed to run (for example, only files from your own domain, never inline " +
        "handlers like onerror). Even if an injection slips through, the browser refuses to run it.\n\n" +
        "About the demo: the \"victim's page\" is a sandboxed frame, so the injected script really runs, " +
        "but it is cut off from this app and its session token is fake.";
}
