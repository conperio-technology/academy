namespace DsaAcademy.Content.Tools;

public class OwaspTop10Tool : ITool
{
    public string Id => "sec-owasp-top-10";
    public string Section => "Security";
    public string Track => "web attacks";
    public string Title => "The OWASP Top 10, in Plain English";
    public string OneLiner =>
        "The ten most important web application security risks, in both the 2021 and 2025 editions, each with" +
        " an everyday example, the fix, and where this academy covers it.";
    public string KeyTakeaway =>
        "The OWASP Top 10 is a ranked list of the risks that cause the most real-world breaches, not a " +
        "complete checklist. Broken access control tops both recent editions. Most entries come down to a " +
        "handful of habits: check authorization on the server, keep data apart from code, configure securely " +
        "by default, know your dependencies, and log and watch what matters.";

    public ToolKind ToolKind => ToolKind.OwaspTop10;

    public string Explanation =>
        "OWASP (the Open Worldwide Application Security Project) is a non-profit community that publishes " +
        "free security guidance. Its best-known document, the Top 10, ranks the most critical categories of " +
        "web application risk, built from data on vulnerabilities found in hundreds of thousands of real " +
        "applications plus a survey of practitioners. Auditors, customers' security questionnaires, scanning " +
        "tools and job interviews all refer to it, so it's the shared vocabulary of application " +
        "security.\n\nThe list is revised every few years. The 2021 edition, still the one most training and " +
        "tools cite, put Broken Access Control first, followed by Cryptographic Failures and Injection. The " +
        "2025 update kept access control at the top, raised Security Misconfiguration to second, broadened " +
        "\"Vulnerable and Outdated Components\" into Software Supply Chain Failures, merged Server-Side Request" +
        " Forgery (SSRF) into Broken Access Control, and added Mishandling of Exceptional Conditions, such as" +
        " code that allows access when a check throws an error (failing open).\n\nSeveral entries already have " +
        "their own lessons in this section: SQL injection and XSS (Injection), authentication versus " +
        "authorization, hashing and TLS (Cryptographic Failures). The new lessons alongside this one cover " +
        "broken access control with CSRF and SSRF, insecure deserialization and misconfiguration, secrets and" +
        " least privilege, threat modeling (for Insecure Design), passwords and MFA, and logging and incident" +
        " response. Browse the list below in either edition, then try to name the category for each scenario.";
}
