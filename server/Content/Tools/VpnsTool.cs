namespace DsaAcademy.Content.Tools;

public class VpnsTool : ITool
{
    public string Id => "net-vpns";
    public string Section => "Networking";
    public string Track => "firewalls & VPNs";
    public string Title => "VPNs and Tunnels";
    public string OneLiner =>
        "What a VPN actually does to your packets, what someone on café Wi-Fi can still see, full versus " +
        "split tunnel, and site-to-site versus remote access.";
    public string KeyTakeaway =>
        "A VPN wraps your packets inside encrypted packets addressed to a VPN server, which unwraps them and " +
        "sends them on. The local network sees only the tunnel. It joins you to a private network and " +
        "protects data in transit, but it doesn't make an infected device safe.";

    public ToolKind ToolKind => ToolKind.Vpns;

    public string Explanation =>
        "A VPN (virtual private network) builds a tunnel: each packet you send is encrypted and wrapped " +
        "inside a new outer packet addressed to a VPN server. Anyone on the network in between, such as café " +
        "Wi-Fi or a hotel, sees only encrypted packets going to that one server. The server decrypts them and" +
        " forwards the original packets as if your device were plugged in on its side. That's how a laptop at" +
        " home reaches private addresses like 10.10.5.20 that aren't routed on the internet at all.\n\nA " +
        "remote-access VPN connects one device (with a client such as WireGuard, an IPsec client built into " +
        "the operating system, or a vendor's SSL VPN client) to a company network. A site-to-site VPN " +
        "permanently joins two networks through their firewalls, for example two plants, so devices on either" +
        " side need no VPN software. With a full tunnel all of the laptop's traffic goes through the company;" +
        " with split tunnel only company addresses do and everything else goes straight out, which saves " +
        "bandwidth but skips the company's web filtering.\n\nTwo common misunderstandings. Without a VPN, HTTPS" +
        " already protects the content of web traffic, but the destination address and usually the hostname " +
        "are still visible to the local network. And a VPN protects the path, not the endpoint: an infected " +
        "laptop on a VPN carries the malware straight into the network. That's why VPNs are paired with " +
        "multi-factor authentication (MFA), device checks and rules limiting what VPN users can reach, and " +
        "why zero trust network access (ZTNA), which grants access per application rather than per network, " +
        "is replacing them in many companies. Pick destinations below and switch the VPN and full tunnel on " +
        "and off.";
}
