namespace DsaAcademy.Content.Tools;

public class PhishingSocialTool : ITool
{
    public string Id => "sec-phishing-social-engineering";
    public string Section => "Security";
    public string Track => "people & response";
    public string Title => "Phishing and Social Engineering";
    public string OneLiner =>
        "Sort a practice inbox into phishing and genuine mail, learn the red flags that give attackers away, " +
        "and how the same tricks arrive by phone, text, USB stick and at the door.";
    public string KeyTakeaway =>
        "Social engineering attacks people instead of systems, using urgency, authority, curiosity and " +
        "helpfulness. Check the real sender and the real link target, be suspicious of any request for " +
        "credentials, payment changes or secrecy, verify through a channel you already trust, and report " +
        "quickly: reporting fast matters more than never being fooled.";

    public ToolKind ToolKind => ToolKind.PhishingSocial;

    public string Explanation =>
        "Phishing is a message pretending to be from someone you trust, designed to make you click a link, " +
        "open an attachment, enter your password or send money. It's the most common first step in breaches, " +
        "ransomware included, because it's cheap and it works: it targets people rather than software. " +
        "Targeted versions aimed at one person or role are called spear phishing, and business email " +
        "compromise (BEC) impersonates executives or suppliers to redirect payments, and is one of the " +
        "costliest kinds of cybercrime.\n\nPhishing messages rely on a few levers: urgency (\"within 24 hours\")," +
        " authority (the CEO, IT, the bank), fear (\"your account will be closed\"), curiosity or greed (\"bonus" +
        " list\") and secrecy (\"keep this between us\"). The tells are usually in the details: a sender domain " +
        "that's almost right (conperio-helpdesk instead of conperio.com, a 1 instead of an l), a link whose " +
        "text differs from where it actually goes, a request to sign in through a link, and any change to " +
        "bank details by email. The safe response is to verify through a separate, known channel: type the " +
        "address yourself, or call the person on the number in the directory.\n\nThe same tricks arrive in " +
        "other forms: vishing (voice calls from \"IT\" asking for an MFA code), smishing (SMS), pretexting (a " +
        "convincing cover story), tailgating through badge doors, and baiting with USB sticks left in the car" +
        " park. At an industrial site removable media deserves extra care; Stuxnet reached its isolated " +
        "target that way. If you do click, report it immediately. Minutes matter, and a fast report lets IT " +
        "reset your password, end the attacker's sessions and warn everyone else who got the same email. Sort" +
        " the inbox below.";
}
