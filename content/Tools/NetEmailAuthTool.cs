namespace DsaAcademy.Content.Tools;

public class NetEmailAuthTool : ITool
{
    public string Id => "net-email-spf-dkim-dmarc";
    public string Section => "Networking";
    public string Track => "application";
    public int Order => 100;
    public string Title => "Email Delivery and Authentication: SMTP, MX, SPF, DKIM and DMARC";
    public string OneLiner => "How a message travels by SMTP and MX records, the envelope sender versus the From: header, what SPF, DKIM and DMARC each check, alignment, and rolling out DMARC without losing mail.";
    public string KeyTakeaway => "SMTP lets anyone write any From: address. SPF authorizes sending servers for the envelope domain, DKIM signs the message for a domain, and DMARC requires one of them to pass for a domain aligned with the visible From:, then says what to do if not. Start DMARC at p=none, fix every sender the reports show, then move to reject.";

    public ToolKind ToolKind => ToolKind.NetEmailAuth;

    public string Explanation =>
        "Email spoofing works because SMTP never checks the sender. This lesson follows a message from one server to another, then explains the three DNS records that let a receiver check a message's origin, and the alignment rule that ties them to the address the user actually sees." +
        "\n\n" +
        "A checker lets you send spoofed and legitimate mail through SPF, DKIM and DMARC and see what the receiving server decides.";
}
