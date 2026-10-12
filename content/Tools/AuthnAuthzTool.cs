namespace DsaAcademy.Content.Tools;

public class AuthnAuthzTool : ITool
{
    public string Id => "security-authn-authz";
    public string Section => "Security";
    public string Track => "identity & secrets";
    public string Title => "Authentication vs. Authorization";
    public string OneLiner => "Two different questions every request has to answer: who are you, and are you allowed to do this?";
    public string KeyTakeaway =>
        "Authentication proves identity (401 when it fails); authorization decides what that identity " +
        "may do (403 when it fails). Whatever does the authenticating, the app must only trust identity " +
        "that arrived through it -- if a caller can skip the login and claim to be someone, nothing " +
        "after that matters.";

    public ToolKind ToolKind => ToolKind.AuthnAuthz;

    public string Explanation =>
        "The two words sound alike and get mixed up constantly, including in HTTP itself. " +
        "Authentication (\"authn\") is proving who you are: a password, a Microsoft sign-in, a " +
        "certificate, a code from your phone. Authorization (\"authz\") is deciding what a known " +
        "person is allowed to do: everyone can read lessons, only Ava can erase Ava's progress. A " +
        "failed authentication is a 401 (the status is named \"Unauthorized\", which is misleading -- it " +
        "means \"I don't know who you are\"). A failed authorization is a 403 Forbidden: \"I know " +
        "exactly who you are, and no.\"\n\n" +
        "This app is a live example. It never sees a password. When deployed, it sits behind the company's " +
        "ingress (the entry point that routes outside traffic into the Kubernetes cluster), whose login middleware does the Microsoft Entra ID sign-in and then " +
        "forwards each request with a header naming the user (x-ms-client-principal-name). The app " +
        "reads that header and decides what you can see -- authentication outsourced, authorization " +
        "kept. Most companies' internal apps work this way, so one team gets single sign-on right " +
        "instead of every app writing its own login.\n\n" +
        "That design has one sharp edge, shown by the last caller in the demo. The app trusts the " +
        "header blindly, so if anyone can reach the app without going through the ingress, they can " +
        "send the header themselves and become anyone. The fix isn't in the app's code; it's making " +
        "sure the ingress is the only way in -- which is why this app's Kubernetes setup includes a " +
        "network policy that refuses connections from anywhere else.\n\n" +
        "Rules of thumb: check authorization on the server for every request (hiding a button in the " +
        "UI is not access control); deny by default and allow specific cases; and give each person " +
        "and service the least access that lets them do their job.";
}
