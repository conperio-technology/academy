namespace DsaAcademy.Content.Tools;

public class ApiPhotoSharingInterviewTool : ITool
{
    public string Id => "sd-interview-api-photo-sharing";
    public string Section => "System Design";
    public string Track => "api design";
    public int Order => 19;
    public string Title => "Design the API for a Photo-Sharing App";
    public string OneLiner => "An API design round, stage by stage: resources, endpoints, uploads, feeds, retries, errors and limits, then compare with a strong answer.";
    public string KeyTakeaway =>
        "An API design round is graded on the contract, not the boxes behind it: clear resources and methods, the right status " +
        "codes, cursor pagination for anything that scrolls, idempotent writes for anything a mobile client will retry, uploads " +
        "that go straight to object storage, one error format, and a versioning and auth story. Say the trade-off behind each " +
        "choice and the failure each one prevents.";

    public ToolKind ToolKind => ToolKind.DesignApiPhotoSharing;

    public string Explanation =>
        "Some interviews (and many system design rounds at the 4-minute API stage) ask you to design an API rather than a " +
        "whole system: \"Design the public API for an Instagram-like app\", \"Design the API for a food delivery service\", " +
        "\"What would the endpoints for Google Calendar look like?\". The interviewer wants to see you think as the owner of a " +
        "contract that other teams and companies will build against for years. This walk-through practises that with a " +
        "photo-sharing app used by a mobile client and by third-party developers.\n\n" +
        "It uses the same format as the system design walk-throughs: the widget gives the prompt and then one stage at a " +
        "time. Write your own answer in the box first, the way you would say it out loud, and only then compare it with the " +
        "model answer and tick the points you covered. Your notes stay in this browser.\n\n" +
        "A good order for an API round: clarify who the clients are and what they need (about 5 minutes); name the resources " +
        "and their relationships (5); list the endpoints with methods, key fields and status codes (8); handle the hard reads, " +
        "meaning the feed and pagination (6); handle the hard writes, meaning uploads, likes and retries (8); then errors, " +
        "versioning and evolution (5); and finally authentication, scopes and rate limits (5). Each stage draws on one lesson " +
        "in this track, so if a stage goes badly, that lesson is the one to reread.\n\n" +
        "Habits that score well: write endpoints in a consistent notation (METHOD /path, body, response, status codes), " +
        "state what is idempotent and how, show a response body for the most important call, and keep asking \"what happens " +
        "when the client retries this?\" and \"what happens when we need to change this next year?\".";
}
