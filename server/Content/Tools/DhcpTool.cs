namespace DsaAcademy.Content.Tools;

public class DhcpTool : ITool
{
    public string Id => "net-dhcp";
    public string Section => "Networking";
    public string Track => "local networks";
    public string Title => "DHCP: How Devices Get an Address";
    public string OneLiner =>
        "Plug in a laptop and it has an address, mask, gateway and DNS server within a second. Step through " +
        "the four DHCP messages, lease renewal, and the classic failures: an empty pool, a 169.254 address " +
        "and a rogue server.";
    public string KeyTakeaway =>
        "DHCP hands out network settings automatically in four messages: Discover, Offer, Request, " +
        "Acknowledge (DORA). The address is a lease that must be renewed. When nobody answers, Windows and " +
        "macOS fall back to a self-assigned 169.254.x.x address, which is the giveaway that DHCP failed.";

    public ToolKind ToolKind => ToolKind.Dhcp;

    public string Explanation =>
        "Every device needs four settings to use a network: an IP address, a subnet mask, a default gateway " +
        "and a DNS server. Typing them into every laptop and phone would be slow and error prone, so DHCP " +
        "(the Dynamic Host Configuration Protocol) does it. A DHCP server, usually the router, a Windows " +
        "server or the firewall, owns a pool of addresses and leases them out for a set time.\n\nThe exchange " +
        "is four messages over UDP, server port 67 and client port 68. The client has no address yet, so its " +
        "Discover goes from 0.0.0.0 to the broadcast address 255.255.255.255. Servers reply with an Offer. " +
        "The client broadcasts a Request for the offer it accepts, so other servers know they lost, and the " +
        "chosen server confirms with an Acknowledge. The lease then has two timers: at half the lease (T1) " +
        "the client asks its server directly to renew, and at 87.5% (T2) it asks any server. Because " +
        "broadcasts don't cross routers, a DHCP server on another subnet needs a DHCP relay on the router " +
        "(often configured as an \"ip helper\").\n\nThree failures are worth knowing by sight. An exhausted pool " +
        "or an unreachable server leaves the client with a self-assigned link-local address (APIPA, Automatic" +
        " Private IP Addressing) in 169.254.0.0/16, which only works on the local segment. A rogue DHCP " +
        "server, often a home router plugged in by mistake, hands out wrong settings to whoever it answers " +
        "first; switches prevent it with DHCP snooping. And a device given a static address inside the DHCP " +
        "pool will eventually clash with a leased one. For printers, PLCs and servers use a reservation (the " +
        "server always gives that MAC address the same IP) or a documented static range outside the " +
        "pool.\n\nStep through the scenarios below, then look at a real lease captured on Linux.";
}
