namespace DsaAcademy.Content.Tools;

public class RoutingGatewaysTool : ITool
{
    public string Id => "net-routing-gateways";
    public string Section => "Networking";
    public string Track => "routing";
    public string Title => "Routing and Default Gateways";
    public string OneLiner =>
        "How a PC decides whether a destination is local or must go to the router, and how a router picks the" +
        " next hop: masks, the default gateway, routing tables and longest prefix match.";
    public string KeyTakeaway =>
        "A host compares the destination with its own network using its mask: same network, deliver directly;" +
        " different network, hand the packet to the default gateway. Routers then choose the most specific " +
        "matching route (longest prefix wins), with the default route 0.0.0.0/0 catching everything else, one" +
        " hop at a time.";

    public ToolKind ToolKind => ToolKind.RoutingGateways;

    public string Explanation =>
        "Routing is how packets find their way between networks. It starts on your own PC, which makes one " +
        "decision for every packet: is the destination on my network? It ANDs its own address and the " +
        "destination with its subnet mask; if the two network addresses match, the destination is local and " +
        "the PC delivers the packet itself through the switch. If not, it sends the packet to its default " +
        "gateway, the router interface on its own subnet whose address was set by hand or by DHCP.\n\nA router " +
        "keeps a routing table: a list of destination networks, each with the next hop to send matching " +
        "packets to and the interface to use. Directly connected networks need no next hop. Other entries are" +
        " typed in (static routes) or learned from neighbouring routers through routing protocols such as " +
        "OSPF inside a company and BGP between internet providers. When several routes match, the most " +
        "specific one wins: a /24 beats a /16, which beats the default route 0.0.0.0/0. This rule is called " +
        "longest prefix match. Every router lowers the packet's TTL (time to live) by one, so a packet caught" +
        " in a routing loop dies instead of circling forever; traceroute uses this to reveal each router on " +
        "the path.\n\nMost \"I can reach local things but not the internet\" problems are here: a wrong mask " +
        "makes a remote host look local, so the PC tries ARP for it and gets no answer; a missing or mistyped" +
        " gateway leaves no way off the subnet; and a gateway that isn't in the PC's own subnet can't be " +
        "reached at all. Try the presets below, edit the mask and gateway, and watch the router's table pick " +
        "routes.";
}
