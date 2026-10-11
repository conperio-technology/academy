namespace DsaAcademy.Content.Tools;

public class NetTroubleshootingTool : ITool
{
    public string Id => "net-troubleshooting";
    public string Section => "Networking";
    public string Track => "troubleshooting";
    public string Title => "Network Troubleshooting Toolkit";
    public string OneLiner =>
        "Six support tickets, each a different fault in a real lab network. Run ip, ping, traceroute, " +
        "nslookup, curl and ss, read the real output, and name the cause.";
    public string KeyTakeaway =>
        "Troubleshoot bottom up: is the link up and is there an address, can I reach my gateway, can I reach " +
        "the server's IP, does the name resolve, is the port open, does the application answer? The first " +
        "layer that fails is where the problem is, and the exact error (timeout or refused, unreachable or no" +
        " reply) narrows it further.";

    public ToolKind ToolKind => ToolKind.NetTroubleshooting;

    public string Explanation =>
        "\"The network is down\" can mean a dozen different things. A fixed order of checks turns guessing into" +
        " a short process, and it follows the layers from The OSI & TCP/IP Models upward. First the link and " +
        "address: is the interface up, does it have a sensible address and a default gateway (ip addr and ip " +
        "route on Linux, ipconfig /all on Windows)? Then the local network: does the gateway answer a ping, " +
        "and does ip neigh show its MAC address? Then routing: does the server's IP answer, and what path " +
        "does traceroute show? Then names: does nslookup or dig turn the name into the right address? Finally" +
        " the service: does curl get a response from the port, and on the server, does ss show something " +
        "listening?\n\nThe wording of each failure is evidence. A timeout means packets vanished: dropped by a " +
        "firewall, or sent to a route that goes nowhere. \"Connection refused\" arrives instantly and means the" +
        " server's machine answered, but nothing listens on that port or a firewall rejected it. \"Destination" +
        " Host Unreachable\" reported by your own PC means it couldn't even get an ARP reply from the next " +
        "hop. \"Could not resolve host\" or NXDOMAIN (non-existent domain) is DNS. And ping isn't the last " +
        "word: many firewalls block ICMP, the protocol ping uses, on purpose, so always test the real port " +
        "too.\n\nEvery output below is real, captured from a small lab network built with Linux network " +
        "namespaces (isolated network stacks on one machine): a PC, a router and a server running a web " +
        "server and a DNS server. Each ticket broke one thing. Run the tools in whatever order you like, but " +
        "bottom up is the habit worth building, then name the cause.";
}
