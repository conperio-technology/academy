namespace DsaAcademy.Content.Tools;

public class NetIpv6Tool : ITool
{
    public string Id => "net-ipv6";
    public string Section => "Networking";
    public string Track => "addressing";
    public int Order => 100;
    public string Title => "IPv6: Addresses, Types, SLAAC and Dual Stack";
    public string OneLiner => "Reading and shortening 128-bit addresses, global, unique local, link-local and multicast types, /64 subnets and /48 plans, no NAT, NDP, SLAAC and DHCPv6, dual stack, and an address drill.";
    public string KeyTakeaway => "Write IPv6 addresses lowercase, drop leading zeros and use :: once for the longest zero run. Subnets are /64, hosts usually configure themselves with SLAAC from router advertisements, and every interface also has a fe80:: link-local address. With no NAT, a stateful firewall is what blocks inbound traffic, and ICMPv6 must not be blocked.";

    public ToolKind ToolKind => ToolKind.NetIpv6;

    public string Explanation =>
        "Most networks now run IPv4 and IPv6 side by side, and many phones and cloud services prefer IPv6. This lesson teaches you to read and write IPv6 addresses, recognise their types, plan subnets, and understand how devices configure themselves." +
        "\n\n" +
        "A drill at the end gives you endless addresses to compress, expand, place in their /64 network and classify. The Python sample was run to get the output shown.";
}
