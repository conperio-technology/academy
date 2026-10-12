namespace DsaAcademy.Content.Tools;

public class AdDomainsOusTool : ITool
{
    public string Id => "ad-domains-ous";
    public string Section => "Windows & PowerShell";
    public string Track => "active directory";
    public int Order => 8;
    public string Title => "Active Directory: Domains, OUs, Users and Groups";
    public string OneLiner => "How a company's Windows accounts, computers and groups are organised, and the group pattern that keeps access manageable.";
    public string KeyTakeaway => "A domain is one directory of users, computers and groups, served by at least two domain controllers. OUs organise objects for delegation and Group Policy; groups grant access. Follow AGDLP: accounts into global role groups, those into domain local permission groups, and permissions only to the domain local groups.";

    public ToolKind ToolKind => ToolKind.AdDomainsOus;

    public string Explanation =>
        "Active Directory is the backbone of most corporate Windows networks: one account per person that works everywhere, and central control of thousands of machines. Most day-to-day IT work touches it, from creating a new starter's account to working out why someone can't open a share." +
        "\n\n" +
        "You'll explore a small domain object by object, learn to read distinguished names and the different logon names, see the group scopes and the AGDLP pattern, and follow the chain of group memberships that gives one user access to a share. Then the PowerShell commands for everyday account work.";
}
