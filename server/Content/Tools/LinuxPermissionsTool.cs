namespace DsaAcademy.Content.Tools;

public class LinuxPermissionsTool : ITool
{
    public string Id => "linux-permissions";
    public string Section => "Linux & the Command Line";
    public string Track => "terminal";
    public int Order => 2;
    public string Title => "Users and Permissions";
    public string OneLiner => "Who can read, change and run each file, and how to change that with chmod and chgrp.";
    public string KeyTakeaway =>
        "Every file has an owner, a group, and three sets of rwx permissions: owner, group, everyone else. " +
        "chmod changes them (chmod 600 = only the owner can read and write), chgrp changes the group. " +
        "Secrets should be readable by as few people as possible, and scripts need x to run.";

    public ToolKind ToolKind => ToolKind.LinuxPermissions;

    public string Explanation =>
        "Run ls -l and the first column of each line looks like -rw-r--r--. The first character is the type " +
        "(- for a file, d for a folder). The other nine are three groups of three: what the owner can do, " +
        "what members of the file's group can do, and what everyone else can do. r is read, w is write, x is " +
        "execute (for a folder, x means you can enter it). The next two columns name the owner and the " +
        "group.\n\n" +
        "chmod changes permissions. The letter form is readable: chmod u+x deploy.sh adds execute for the " +
        "user who owns it, chmod o-w removes write for others, chmod g+w adds write for the group. The " +
        "number form sets all nine at once, one digit per group, adding read = 4, write = 2, execute = 1. " +
        "So 644 is rw-r--r-- (the usual for files), 755 is rwxr-xr-x (scripts and folders), and 600 is " +
        "rw------- (private: SSH keys, passwords, .env files).\n\n" +
        "Groups are how teams share. id shows which groups you belong to; chgrp devs folder hands a folder " +
        "to the devs group, and then group permissions decide what the team can do with it. Only the owner " +
        "(or root, the administrator) can change a file's permissions. On real servers you'll meet sudo, " +
        "which runs a single command as root -- it's powerful precisely because it skips all of these " +
        "checks, so use it only when you mean it.\n\n" +
        "Why it matters: a web server that can write to its own code can be made to rewrite it, and an " +
        "API key in a world-readable file is readable by every process on the machine. Least privilege " +
        "starts here.";
}
