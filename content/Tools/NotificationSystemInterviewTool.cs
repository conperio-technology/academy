namespace DsaAcademy.Content.Tools;

public class NotificationSystemInterviewTool : ITool
{
    public string Id => "sd-interview-notification-system";
    public string Section => "System Design";
    public string Track => "interview walk-throughs";
    public int Order => 26;
    public string Title => "Design a Notification System";
    public string OneLiner => "Push, SMS and email for many product teams as a 45-minute design round: priority, provider limits, retries and duplicates.";
    public string KeyTakeaway =>
        "A notification platform is a set of queues in front of third-party providers you don't control. Keep " +
        "urgent and bulk traffic in separate queues with reserved provider capacity, retry only errors that can " +
        "succeed, and deduplicate at every at-least-once step, because exactly-once delivery through an external " +
        "provider isn't possible.";

    public ToolKind ToolKind => ToolKind.DesignNotificationSystem;

    public string Explanation =>
        "Same format as the other walk-throughs: write your answer for each stage first, then compare it with the " +
        "model answer and tick what you covered. The 45-minute flow is the same; what changes is where the " +
        "difficulty sits.\n\n" +
        "Here the limits come from outside. Our own servers barely notice a billion notifications a day, but APNs, " +
        "FCM, SMS gateways and email services each cap how fast we may send, fail in their own ways, and report " +
        "delivery late or not at all. SMS also costs real money per message, so a duplicate is a bill as well as an " +
        "annoyance. The design question is how to share that limited, unreliable capacity between a login code that " +
        "must arrive in seconds and a campaign to 100 million users that can take hours, across many teams who all " +
        "think their messages are urgent.\n\n" +
        "Interviewers usually steer the deep dive towards priority and campaigns, retries and provider failures, " +
        "and idempotency, then ask about user preferences, quiet hours, templating or delivery tracking. A strong " +
        "answer separates transactional from marketing traffic early (in the requirements and the API, through " +
        "registered categories) and keeps that distinction all the way to the providers. Expect follow-ups such as " +
        "\"the worker crashed right after calling the SMS provider: does the user get two codes?\" or \"marketing " +
        "launched a campaign and password resets are slow: why, and what stops it?\"";
}
