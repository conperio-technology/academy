namespace DsaAcademy.Content.Tools;

public class NatPortForwardingTool : ITool
{
    public string Id => "net-nat-port-forwarding";
    public string Section => "Networking";
    public string Track => "routing";
    public string Title => "NAT and Port Forwarding";
    public string OneLiner =>
        "How a whole office shares one public IP address, why the internet can't reach your devices unless " +
        "you forward a port, and why port forwarding often fails behind carrier-grade NAT.";
    public string KeyTakeaway =>
        "NAT rewrites addresses at the edge of a network. Port address translation lets many private devices " +
        "share one public address by giving each outbound connection its own public port in a NAT table. " +
        "Inbound connections that nobody inside started have no table row, so they're dropped unless a port " +
        "forwarding rule says where they go.";

    public ToolKind ToolKind => ToolKind.NatPortForwarding;

    public string Explanation =>
        "There aren't enough IPv4 addresses for every device, so homes and companies use private addresses " +
        "inside (10.x, 172.16 to 172.31, 192.168.x) and share a few public ones at the edge. NAT (Network " +
        "Address Translation) is the router rewriting addresses as packets cross it. The common form, PAT " +
        "(Port Address Translation, also called NAT overload or masquerading), rewrites the source address " +
        "and, when necessary, the source port of every outbound connection, and records the mapping in a NAT " +
        "table. When a reply comes back to the public address and port, the table says which inside device " +
        "and port it belongs to.\n\nA side effect is that nothing on the internet can start a connection to an " +
        "inside device: an unsolicited packet matches no table row and is dropped. Port forwarding (sometimes" +
        " called a destination NAT rule) is a manual exception: \"anything arriving on public port 8443 goes " +
        "to 192.168.1.50 port 443\". It's how a camera or a server is published, and it's also how many " +
        "networks get breached, because that device is now reachable by every scanner on the internet. Remote" +
        " Desktop and industrial protocols should never be forwarded; use a VPN instead.\n\nTwo details explain" +
        " a lot of confusing support calls. Many internet providers now put customers behind carrier-grade " +
        "NAT (CGNAT, the 100.64.0.0/10 range), a second NAT you can't configure, so your port forwards never " +
        "see the traffic. And NAT is not a firewall: it blocks unsolicited inbound traffic by accident, but " +
        "it doesn't filter outbound traffic or inspect anything. Try outbound and inbound connections below, " +
        "add a forward, then switch on CGNAT.";
}
