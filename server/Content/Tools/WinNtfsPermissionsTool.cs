namespace DsaAcademy.Content.Tools;

public class WinNtfsPermissionsTool : ITool
{
    public string Id => "win-ntfs-permissions";
    public string Section => "Windows & PowerShell";
    public string Track => "windows";
    public int Order => 3;
    public string Title => "NTFS Permissions, Inheritance and Shares";
    public string OneLiner => "Work out who can really open, change or delete a file on a Windows file share, and why.";
    public string KeyTakeaway => "Every NTFS file and folder has an ACL of allow and deny entries for users and groups (stored by SID). Entries inherit down the tree; explicit entries are checked before inherited ones, and denies before allows at the same level. Over the network the share permission also applies and the more restrictive one wins.";

    public ToolKind ToolKind => ToolKind.WinNtfsPermissions;

    public string Explanation =>
        "File shares are where most Windows permission questions come from: \"why can't I save here?\", \"how did that contractor see this folder?\". The answers come from two lists, the NTFS permissions on the files and the permissions on the share, and a handful of rules about inheritance and order." +
        "\n\n" +
        "The calculator lets you switch individual access control entries on and off for three users and change the share permission, and shows effective access at the server and over the network. Then icacls and Get-Acl for reading and changing permissions from the command line.";
}
