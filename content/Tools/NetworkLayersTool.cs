namespace DsaAcademy.Content.Tools;

public class NetworkLayersTool : ITool
{
    public string Id => "network-layers";
    public string Section => "Networking";
    public string Track => "layers";
    public string Title => "The OSI & TCP/IP Models: How Network Layers Stack";
    public string OneLiner => "Every network request is really several layers wrapping each other's output -- each one only has to understand its own layer, not the whole stack.";
    public string KeyTakeaway =>
        "Data goes DOWN the stack on the sender (each layer wraps the previous layer's output in its " +
        "own header -- encapsulation) and back UP the stack on the receiver (each layer strips its own " +
        "header off -- decapsulation). The 7-layer OSI model is the textbook reference; the 4-layer " +
        "TCP/IP model is what real stacks (and tools like Wireshark) actually implement -- OSI's " +
        "Application/Presentation/Session collapse into one TCP/IP Application layer, and Physical/Data " +
        "Link collapse into one Link layer.";

    public ToolKind ToolKind => ToolKind.NetworkLayers;

    public string Explanation =>
        "\"Layers\" here means each piece of the stack only has to understand its OWN job and talk to " +
        "its direct counterpart on the other end -- the Transport layer on your laptop doesn't know or " +
        "care whether the Wi-Fi or the Ethernet cable underneath it is doing the actual carrying, and " +
        "the Application layer doesn't know or care whether TCP is retransmitting a lost segment " +
        "underneath it. That separation is the same idea as this app's own IConcept/ITool interfaces " +
        "(see Interfaces & Abstraction): program to a boundary, not the details behind " +
        "it. OSI's 7-layer version is the textbook teaching model; real network stacks (and what a " +
        "packet-capture tool like Wireshark actually shows you) implement the simpler 4-layer TCP/IP " +
        "model instead, which folds OSI's top three layers into one \"Application\" layer and its bottom " +
        "two into one \"Link\" layer.\n\n" +
        "A protocol is an agreed set of rules for a conversation between machines, and each layer has its own; HTTP is the protocol browsers and web servers use. Walk one HTTP request down and back up to see why the layering matters: your browser (Application) " +
        "builds an HTTP request and hands it down. TCP (Transport) wraps it in a segment, adding a header (a " +
        "small block of addressing and control information) with the port numbers that say which PROGRAM on each machine this is for. IP (Internet) wraps that in a packet, " +
        "adding the source/destination IP addresses that say which MACHINE it's for (see IP Addressing & " +
        "Subnetting for how an address itself is structured). Ethernet or Wi-Fi (Link) wraps that in a " +
        "frame, adding the MAC addresses (the hardware addresses built into each network card) for the physical hop to the next device, then the Physical layer " +
        "turns it into an actual electrical, radio, or light signal on the wire or over the air. The " +
        "receiving machine does every one of those steps in reverse, one layer unwrapping the next, until " +
        "the original HTTP request lands back at an application layer on the other end.\n\n" +
        "Click through the layers below -- IP Addressing & Subnetting already covers the Internet layer " +
        "in depth, and TCP vs UDP / DNS & HTTP (elsewhere in this track) cover Transport and Application " +
        "the same way.";
}
