namespace DsaAcademy.Content.Tools;

public class LinuxFilesTool : ITool
{
    public string Id => "linux-files";
    public string Section => "Linux & the Command Line";
    public string Track => "terminal";
    public int Order => 1;
    public string Title => "Files and Folders";
    public string OneLiner => "Find your way around a Linux machine and move files with nothing but the keyboard.";
    public string KeyTakeaway =>
        "pwd tells you where you are, ls shows what's here, cd moves you. Paths starting with / begin at the " +
        "top of the whole system; anything else starts from where you are, and ~ means your home folder. " +
        "cp copies, mv moves or renames, rm deletes for good -- there is no recycle bin.";

    public ToolKind ToolKind => ToolKind.LinuxFiles;

    public string Explanation =>
        "The terminal below is a real Linux computer, running inside this page. It's tiny (it boots in a " +
        "couple of seconds), but the commands are the same ones you'd type on a production server over SSH " +
        "(secure remote login), in a Docker container, or in a CI build (the automated build and test run on every change). Nothing you do can affect anything outside it, and " +
        "Restart machine gives you a fresh one. You're already logged in as learner, an ordinary user, so " +
        "there's no password to type and no sudo: you can write in your home folder and in /tmp, and " +
        "anywhere else mkdir says Permission denied, because those folders belong to root, the administrator.\n\n" +
        "Linux keeps everything in one tree of folders that starts at / (the root). Your home folder is " +
        "/home/learner, also written ~. pwd prints the folder you're in, ls lists it (ls -la includes hidden " +
        "files that start with a dot, plus sizes and permissions), and cd changes folder: cd projects goes " +
        "down into a folder, cd .. goes up one, cd on its own goes home. Press Tab to complete a name you've " +
        "started typing, and the up arrow to bring back earlier commands -- both save a lot of typing.\n\n" +
        "mkdir makes a folder, cp copies, mv moves (and renames -- they're the same operation), and rm " +
        "deletes. rm won't touch a folder unless you add -r. Wildcards let one command act on many files: " +
        "*.csv means every name ending in .csv. When you don't know where something is, find searches a " +
        "whole tree: find /srv -name app.yml. To read a file, use cat for short ones and less for long ones " +
        "(q quits).\n\n" +
        "Each task ticks off as soon as you've done it. Use the hint if you're stuck, and the answer if " +
        "you're really stuck.";
}
