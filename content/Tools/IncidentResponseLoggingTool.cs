namespace DsaAcademy.Content.Tools;

public class IncidentResponseLoggingTool : ITool
{
    public string Id => "sec-incident-response-logging";
    public string Section => "Security";
    public string Track => "people & response";
    public string Title => "Incident Response, Logging and Monitoring";
    public string OneLiner =>
        "Tune a detection rule on a real-format SSH log to catch a brute force and a password spray without " +
        "drowning in false alarms, then walk a ransomware incident through every response phase.";
    public string KeyTakeaway =>
        "You can't respond to what you can't see: log security events with who, what, where and when, ship " +
        "them somewhere central, and alert on the signals that matter (like a success after many failures). " +
        "When an incident happens, follow a rehearsed plan: prepare, detect and analyse, contain, eradicate " +
        "and recover, then learn from it.";

    public ToolKind ToolKind => ToolKind.IncidentResponseLogging;

    public string Explanation =>
        "Logging and monitoring are how attacks get noticed. Many breaches are discovered weeks or months " +
        "late, and often by someone outside the company, because the evidence was logged but nobody was " +
        "watching. Useful security logs record sign-ins and failures, permission changes, admin actions and " +
        "connections between network zones, each with the user, source address and an accurate timestamp; " +
        "they never contain passwords or tokens. Logs are shipped off each machine to a central system, often" +
        " a SIEM (security information and event management), which correlates events and raises alerts that " +
        "a security operations centre (SOC) or on-call engineer acts on.\n\nWriting detection rules is a " +
        "balance. Too sensitive, and alerts fire for every mistyped password until people ignore them (alert " +
        "fatigue). Too lax, and a slow attack slips under the threshold. Password spraying is designed " +
        "exactly for that: one attempt per account, spread out over time. The detection exercise below uses " +
        "log lines in the real OpenSSH format. Try to catch the brute force and the spray while keeping the " +
        "two innocent users quiet.\n\nAn incident is an event that actually harms or threatens the " +
        "confidentiality, integrity or availability of systems or data. Incident response follows a " +
        "lifecycle, best known from NIST SP 800-61 (guidance from the US National Institute of Standards and " +
        "Technology): preparation (plans, contacts, tested backups), detection and analysis (confirm what's " +
        "happening, start a timeline), containment (stop the spread, such as isolating machines and cutting " +
        "links between the office and the plant), eradication and recovery (remove the attacker, rebuild from" +
        " known-good images, reset credentials), and post-incident activity (a blameless review with owned " +
        "actions). Rehearsing it in a tabletop exercise, as below, is how teams find the gaps before a real " +
        "incident does.";
}
