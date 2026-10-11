namespace DsaAcademy.Content.Tools;

public class SecretsLeastPrivilegeTool : ITool
{
    public string Id => "sec-secrets-least-privilege";
    public string Section => "Security";
    public string Track => "identity & secrets";
    public string Title => "Secrets Management and Least Privilege";
    public string OneLiner =>
        "Find the passwords and keys hiding in a repository, learn where secrets should live instead, then " +
        "cut a service account's database rights down to exactly what its job needs.";
    public string KeyTakeaway =>
        "Secrets never belong in source code, config files in Git, logs or URLs. Keep them in a secrets " +
        "manager or the platform's secret store, or avoid them entirely with managed identities, and rotate " +
        "any secret that leaks. Give every account only the permissions its job needs, so a stolen credential" +
        " opens as little as possible.";

    public ToolKind ToolKind => ToolKind.SecretsLeastPrivilege;

    public string Explanation =>
        "A secret is anything that grants access: passwords, API keys, connection strings, certificates' " +
        "private keys, tokens. The most common way they leak is by being committed to a Git repository. Once " +
        "pushed, a secret is copied to every clone, fork and build server, and it stays in the history even " +
        "after a later commit deletes it. Automated bots scan public repositories for keys within minutes. " +
        "Other leaks come from log lines that print tokens, keys in URLs (which end up in proxy and server " +
        "logs), and passwords pasted into chat or tickets.\n\nSecrets should be stored in a secrets manager, a " +
        "service built to hold them, control and audit who reads them, and rotate them: Azure Key Vault, AWS " +
        "Secrets Manager, HashiCorp Vault, Kubernetes secrets, or the secret store of your CI/CD pipeline. " +
        "For local development, .NET's user-secrets and an untracked .env file keep them out of the " +
        "repository. Better still is no secret at all: managed identities and workload identity let the " +
        "platform vouch for an app so it never holds a password. When a secret does leak, deleting it isn't " +
        "enough; rotate it, meaning issue a new one and revoke the old.\n\nLeast privilege is the matching idea" +
        " for permissions: every user, service and process gets the minimum access its job needs, and no " +
        "more. The service that writes shift reports needs to read two tables and insert into a third, not " +
        "db_owner on the whole database. When something is compromised, and eventually something is, the " +
        "damage is limited to what that account could do. That limit is called the blast radius. The same " +
        "applies to Windows services (a dedicated service account, not LocalSystem), people (separate admin " +
        "accounts used only for admin work) and cloud roles. Find the leaked secrets below, then fix the " +
        "service account.";
}
