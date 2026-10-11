namespace DsaAcademy.Content.Tools;

public class AdGpoKerberosTool : ITool
{
    public string Id => "ad-gpo-kerberos";
    public string Section => "Windows & PowerShell";
    public string Track => "active directory";
    public int Order => 9;
    public string Title => "Group Policy, Kerberos, NTLM and DNS";
    public string OneLiner => "How settings reach every PC, how signing in works without sending passwords, and why AD stops when DNS does.";
    public string KeyTakeaway => "GPOs apply in the order Local, Site, Domain, OU, and the last one wins, unless a link is Enforced or an OU blocks inheritance. Kerberos signs you in with tickets from the domain controller (needing correct names and clocks); NTLM is the older challenge-response fallback. Clients find domain controllers through DNS SRV records.";

    public ToolKind ToolKind => ToolKind.AdGpoKerberos;

    public string Explanation =>
        "Three pieces of Active Directory explain most of the strange problems you'll meet in a Windows network: Group Policy, which pushes settings to machines and users; Kerberos and NTLM, the two ways Windows proves who you are; and DNS, which everything else depends on." +
        "\n\n" +
        "The simulator lets you work out which of five GPOs wins a setting as you enforce, unlink and block. Two step-throughs follow a Kerberos sign-in ticket by ticket and an NTLM challenge and response, and the lesson ends with the DNS records that let a PC find its domain controllers.";
}
