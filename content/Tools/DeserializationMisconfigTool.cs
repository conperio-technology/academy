namespace DsaAcademy.Content.Tools;

public class DeserializationMisconfigTool : ITool
{
    public string Id => "sec-deserialization-misconfig";
    public string Section => "Security";
    public string Track => "web attacks";
    public string Title => "Insecure Deserialization and Security Misconfiguration";
    public string OneLiner =>
        "Why letting incoming data pick its own type can run an attacker's choice of code, and a pre-go-live " +
        "review where you hunt for the settings that leave an app exposed.";
    public string KeyTakeaway =>
        "Never let untrusted data decide which types get created: deserialize into fixed, expected types " +
        "(JSON into a plain class), and never use pickle or BinaryFormatter on outside input. Most breaches " +
        "need no clever exploit at all, just a default password, an open bucket or debug mode left on, so " +
        "harden configuration deliberately and check it automatically.";

    public ToolKind ToolKind => ToolKind.DeserializationMisconfig;

    public string Explanation =>
        "Serialization turns objects into text or bytes to store or send them; deserialization turns them " +
        "back into objects. That second step creates objects and runs their code: constructors, property " +
        "setters, and special hooks such as Python's __reduce__. If the incoming data is allowed to say which" +
        " class to create, as with Newtonsoft.Json's TypeNameHandling set to All or Auto, Java's native " +
        "serialization, .NET's BinaryFormatter or Python's pickle, an attacker who controls that data chooses" +
        " which code runs. Real exploits chain together classes that already exist in common libraries, " +
        "called gadget chains, so \"we have no dangerous classes\" is no defence.\n\nThe safe pattern is simple: " +
        "data formats that carry only data (JSON, XML without type information), deserialized into one fixed " +
        "type the code chooses, then validated. If you must hand data to a client and get it back unchanged, " +
        "sign it so tampering is detected. BinaryFormatter was considered so dangerous that .NET 9 removed " +
        "its implementation altogether.\n\nSecurity misconfiguration is the other half of this lesson, and " +
        "number two in the 2025 OWASP Top 10. It covers insecure settings rather than insecure code: debug or" +
        " development mode in production (detailed error pages with stack traces), default accounts and " +
        "passwords, directory listings, cloud storage left public, database ports open to the internet, " +
        "permissive CORS (cross-origin resource sharing, the rules for which other websites may call your API" +
        " from a browser), and sample apps nobody removed. The defence is boring and effective: build " +
        "environments from version-controlled configuration (infrastructure as code), install only what you " +
        "need, and scan configurations automatically. Try the deserializer below, then review the deployment " +
        "and find every problem.";
}
