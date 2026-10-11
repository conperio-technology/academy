namespace DsaAcademy.Content.Tools;

public class HowTheInternetWorksTool : ITool
{
    public string Id => "how-the-internet-works";
    public string Section => "Networking";
    public string Track => "start here";
    public int Order => 0;

    public string Title => "How the Internet Works, End to End";
    public string OneLiner => "Follow one web request from your laptop to a server and back: addresses, routers, packets, DNS and the protocols that make it work.";
    public string KeyTakeaway =>
        "The internet is many separate networks joined by routers that pass packets toward their destination " +
        "one hop at a time. Every device has an IP address, DNS turns names like example.com into those " +
        "addresses, data travels in small numbered packets that may take different routes, and TCP puts them " +
        "back in order at the other end. The rest of this section zooms into each piece.";

    public ToolKind ToolKind => ToolKind.HowTheInternetWorks;

    public string Explanation =>
        "The internet isn't one network. It's tens of thousands of separate networks (your home Wi-Fi, your " +
        "company's network, each internet service provider, each cloud data center) that have agreed to pass " +
        "each other's traffic along. What makes that possible is a small set of shared protocols: agreed rules " +
        "for how messages are formatted and exchanged, the way everyone agreeing on how to address an envelope " +
        "makes the postal system work.\n\n" +
        "Every device on a network gets an IP address, a number that says where to deliver data, such as " +
        "192.168.1.20 at home or 203.0.113.10 for a web server. People prefer names, so DNS (the Domain Name " +
        "System) acts as the internet's phone book: before your browser can contact example.com it asks a DNS " +
        "server which IP address that name belongs to.\n\n" +
        "Data doesn't travel as one big piece. It's cut into packets, chunks of up to about 1,500 bytes, each " +
        "with a header saying where it came from, where it's going and which piece of the message it is. A router " +
        "is a device that connects networks and forwards each packet one hop closer to its destination, the way " +
        "a sorting office forwards a letter to the next sorting office. Your home router hands packets to your " +
        "ISP (internet service provider), whose routers pass them to other networks across the backbone, the " +
        "high-capacity links between big networks and continents, until they reach the network that owns the " +
        "destination address. A typical request crosses 10 to 20 routers in a few tens of milliseconds, and " +
        "packets from the same message can take different routes and arrive out of order.\n\n" +
        "Programs on the two ends talk through ports, numbered doors on each machine (443 for HTTPS), so the " +
        "server knows which program a packet is for. TCP, the Transmission Control Protocol, numbers every " +
        "packet, resends any that get lost and reassembles them in order, so the browser receives the exact " +
        "bytes the server sent. On top of all that, HTTP is the protocol for the conversation itself: \"GET me " +
        "this page\", \"here it is, status 200 OK\". Step through the trip below, then try the packet demo. The " +
        "next lessons in this section cover the layers, IP addressing, TCP vs UDP, and DNS & HTTP in depth.";
}
