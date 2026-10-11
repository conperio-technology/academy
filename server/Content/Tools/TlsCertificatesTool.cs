namespace DsaAcademy.Content.Tools;

public class TlsCertificatesTool : ITool
{
    public string Id => "security-tls-certificates";
    public string Section => "Security";
    public string Track => "identity & secrets";
    public string Title => "HTTPS, TLS & Certificates";
    public string OneLiner => "Encryption is only half of HTTPS. The certificate is how your browser knows who's on the other end.";
    public string KeyTakeaway =>
        "A certificate binds a site name to a public key (the shareable half of a key pair; only the holder of the matching private key can produce signatures it verifies), vouched for by a chain of signatures ending at " +
        "a root your browser already trusts. The browser checks the chain, the dates and the name; if " +
        "any check fails, the connection may be encrypted but you can't know who you're talking to -- so " +
        "never train people to click through the warning.";

    public ToolKind ToolKind => ToolKind.TlsCertificates;

    public string Explanation =>
        "HTTPS is HTTP inside TLS. TLS does two jobs. It encrypts everything between browser and server " +
        "so nobody in between (the coffee-shop Wi-Fi, a compromised router) can read or change it. And " +
        "it authenticates the server, so you know the encrypted connection goes to the real " +
        "academy.conperio.com and not an impostor. Encryption without that second part is a private " +
        "conversation with a stranger. The DNS & HTTP lesson in Networking shows where the TLS " +
        "handshake fits in loading a page.\n\n" +
        "The server proves its identity with a certificate: a small document saying \"this public key " +
        "belongs to academy.conperio.com, valid from this date to that one\", signed by a certificate " +
        "authority (CA). That CA's own certificate is signed by another, up to a root CA whose " +
        "certificate ships with your operating system or browser. Following those signatures up to a " +
        "trusted root is building the chain. Servers must send the intermediate certificates along with " +
        "their own; forgetting to is a common misconfiguration that some browsers paper over and others " +
        "don't.\n\n" +
        "The browser then checks three things, shown in the demo: the chain reaches a trusted root, every " +
        "certificate is in date, and the certificate actually names the site in the address bar. A " +
        "self-signed certificate fails the first check (anyone can sign their own), which is fine on a " +
        "developer laptop and never fine in production. Companies often run their own internal CA and " +
        "install its root on company machines, which makes internal certificates trusted on those " +
        "machines only.\n\n" +
        "Certificates expire on purpose, now at most 200 days (falling to 47 days by 2029), and 90 days " +
        "with Let's Encrypt, so automate renewal (Let's Encrypt with cert-manager in Kubernetes is the common setup). Expired certificates are one of " +
        "the most common causes of outages that \"nobody changed anything\" before.";
}
