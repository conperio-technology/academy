namespace DsaAcademy.Content.Tools;

public class FirewallsPortsTool : ITool
{
    public string Id => "net-firewalls-ports";
    public string Section => "Networking";
    public string Track => "firewalls & VPNs";
    public string Title => "Firewalls and Ports";
    public string OneLiner =>
        "An ordered rule list in front of a production network: first match wins, default deny, and why " +
        "stateful firewalls let replies back. Plus drop versus reject, what's listening, and the port numbers" +
        " worth knowing.";
    public string KeyTakeaway =>
        "A firewall checks each packet against an ordered list of rules (protocol, source, destination, port)" +
        " and the first match decides. Good rule sets allow the specific flows that are needed and deny " +
        "everything else by default. Stateful firewalls remember allowed connections, so replies get back " +
        "without rules of their own.";

    public ToolKind ToolKind => ToolKind.FirewallsPorts;

    public string Explanation =>
        "A port is a number from 0 to 65535 that tells the receiving machine which program a TCP or UDP " +
        "packet is for: 443 for HTTPS, 22 for SSH, 502 for Modbus TCP. Servers listen on well-known ports; " +
        "the client's end of each connection uses a temporary ephemeral port. A firewall is a device or piece" +
        " of software that decides which packets may pass, mostly by looking at protocol, source and " +
        "destination addresses, and destination port.\n\nRules are checked in order and the first one that " +
        "matches wins, so order matters: a broad deny placed above a narrow allow silently cancels it. " +
        "Whatever matches no rule falls to the default policy. Default deny (an allowlist: only what's listed" +
        " gets through) is the safe choice; default allow means every forgotten service is exposed. Each " +
        "allow rule should be as narrow as possible and say why it exists.\n\nA stateless filter judges each " +
        "packet on its own, so replies need rules too, which in practice means opening wide ranges of ports. " +
        "A stateful firewall keeps a connection table: once an outbound connection is allowed, the packets " +
        "belonging to it are allowed back automatically. Almost every firewall today is stateful, from the " +
        "Windows Defender Firewall and Linux's nftables to the appliance at the edge of a plant. " +
        "Next-generation firewalls add application awareness and intrusion prevention on top.\n\nHow a firewall" +
        " blocks matters for troubleshooting. DROP throws the packet away silently, so the client waits and " +
        "times out. REJECT answers with a refusal, so the client fails at once, exactly like connecting to a " +
        "port where nothing is listening. Below, edit the rule list and see which test packets get through, " +
        "then compare real drop and reject output and learn the common ports.";
}
