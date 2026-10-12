namespace DsaAcademy.Content.Tools;

public class IpSubnetTool : ITool
{
    public string Id => "ip-subnetting";
    public string Section => "Networking";
    public string Track => "addressing";
    public string Title => "IP Addressing & Subnetting";
    public string OneLiner => "An IP + a subnet mask splits into a network portion and a host portion -- CIDR (/24) is just how many bits belong to the network.";
    public string KeyTakeaway =>
        "The mask says where the network bits end and host bits begin. Everything in between can be a " +
        "host address, except the all-zeros address (the network's own address) and the all-ones " +
        "address (the broadcast address) -- both reserved, which is why usable hosts = 2^(host bits) - 2 (except /31 and /32).";

    public ToolKind ToolKind => ToolKind.IpSubnetCalculator;

    public string Explanation =>
        "An IPv4 address is just 32 bits, written as 4 decimal bytes (octets) separated by dots -- " +
        "192.168.1.10 is really 11000000.10101000.00000001.00001010. A subnet mask (or its shorthand, " +
        "CIDR notation: /24) marks how many of those 32 bits are the \"network\" portion versus the " +
        "\"host\" portion -- /24 means the first 24 bits (3 full octets) are network, leaving 8 bits " +
        "(256 combinations) for hosts on that network. Two host addresses are reserved (except on /31 " +
        "point-to-point links and /32 single-host routes): all " +
        "host bits set to 0 is the network address itself (identifies the subnet, not a device), and " +
        "all host bits set to 1 is the broadcast address (sends to every device on the subnet) -- " +
        "that's why a /24 (256 addresses) has 254 usable host addresses, not 256. Watch out for the " +
        "off-by-one this causes constantly: usable hosts = 2^(32 - prefix) - 2, not 2^(32 - prefix). " +
        "Enter an IP and a prefix below to see the network address, broadcast address, usable range, " +
        "and host count worked out from the bits directly.\n\n" +
        "The calculator also says what kind of address you typed. Three ranges are private (RFC 1918): " +
        "10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16. They're free to use inside any network and never routed on " +
        "the internet, which is why they need NAT to get out. 127.0.0.0/8 is loopback (this machine), 169.254.0.0/16 " +
        "is what a device gives itself when DHCP fails, and 100.64.0.0/10 is carrier-grade NAT. Below the results, " +
        "split the network into equal smaller subnets, the everyday job of carving one range into VLANs. Then drill " +
        "it by hand in Subnetting Practice.";
}
