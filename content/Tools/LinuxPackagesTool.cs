namespace DsaAcademy.Content.Tools;

public class LinuxPackagesTool : ITool
{
    public string Id => "linux-packages";
    public string Section => "Linux & the Command Line";
    public string Track => "administration";
    public int Order => 10;
    public string Title => "Package Management: apt, dnf and Repositories";
    public string OneLiner => "Install, update and remove software the Linux way, and understand what apt is telling you before you press Y.";
    public string KeyTakeaway => "Software comes from signed repositories through a package manager: apt on Debian and Ubuntu, dnf on RHEL and Fedora. apt update refreshes the lists, apt upgrade installs updates. Dependencies are installed automatically and marked as such, which is how apt autoremove knows what's safe to remove. Read the summary line before saying yes.";

    public ToolKind ToolKind => ToolKind.LinuxPackages;

    public string Explanation =>
        "A package manager installs software and everything it depends on, keeps track of every file it put on disk, and upgrades or removes it all cleanly later. It's also how security fixes reach a server, so patching a Linux machine is mostly package management." +
        "\n\n" +
        "This lesson puts apt (Debian, Ubuntu) and dnf (Red Hat family) side by side, then shows real output from apt's query tools on Ubuntu 24.04: which version is installed and where it came from, which package owns a file, and a dry-run install. The simulator shows how dependencies get marked as automatically installed, what remove does to packages that depend on the one you remove, and what autoremove cleans up.";
}
