namespace DsaAcademy.Content.Tools;

public class ArpSwitchingTool : ITool
{
    public string Id => "net-arp-switching";
    public string Section => "Networking";
    public string Track => "local networks";
    public string Title => "MAC Addresses, ARP and Switches";
    public string OneLiner =>
        "How a frame actually reaches the device next to you: MAC addresses, the ARP question \"who has this " +
        "IP?\", and a switch learning which port each device is on.";
    public string KeyTakeaway =>
        "IP addresses say where a packet is going overall; MAC addresses say which device on this local " +
        "network gets the frame next. ARP finds the MAC address for an IP on the same network by broadcasting" +
        " a question, and a switch learns which port each MAC lives on from the frames it sees, so after the " +
        "first exchange it sends frames only where they need to go.";

    public ToolKind ToolKind => ToolKind.ArpSwitching;

    public string Explanation =>
        "Every network card has a MAC address (Media Access Control address), 48 bits written as six hex " +
        "pairs like 02:00:00:00:00:0b. It's the address Ethernet and Wi-Fi use for delivery within one local " +
        "network. IP addresses are for getting across networks; MAC addresses are for the last step on each " +
        "one. A packet keeps the same source and destination IP addresses all the way, but it is wrapped in a" +
        " new Ethernet frame, with new MAC addresses, at every hop.\n\nSo before a PC can send anything to " +
        "10.1.1.20 on its own subnet, it needs that device's MAC address. ARP (the Address Resolution " +
        "Protocol) gets it: the PC broadcasts \"who has 10.1.1.20? Tell 10.1.1.10\" to every device on the " +
        "network, and only the owner replies with its MAC address. The answer goes in the ARP cache for a few" +
        " minutes so the question isn't asked for every packet. For destinations on other networks the PC " +
        "asks for its default gateway's MAC instead, as covered in Routing and Default Gateways.\n\nA switch " +
        "connects the devices on a network. It reads the source MAC address of every frame that arrives and " +
        "records which port it came in on, building a MAC address table. When a frame arrives for a MAC it " +
        "knows, it sends it only out of that port; for a broadcast, or a MAC it hasn't learned yet, it floods" +
        " the frame out of every other port. An old hub flooded everything, always; a switch quickly learns " +
        "not to, which is why other devices don't see your traffic.\n\nARP has no authentication: a device " +
        "believes whatever reply it gets. ARP spoofing abuses that by sending fake replies (\"the gateway is " +
        "at my MAC\") to sit in the middle of other people's traffic. Managed switches can block it with " +
        "Dynamic ARP Inspection, and encryption such as TLS makes the intercepted traffic useless. Ping " +
        "between the four hosts below, watch the tables fill, then try the spoof.";
}
