namespace DsaAcademy.Content.Tools;

public class GitBasicsTool : ITool
{
    public string Id => "git-basics";
    public string Section => "Professional Dev Skills";
    public string Track => "git";
    public string Title => "Git Basics: Working Directory, Staging, and Commits";
    public string OneLiner => "The three-area mental model behind every `git add` / `git commit` -- and why they're separate steps at all.";
    public string KeyTakeaway =>
        "A file change passes through three distinct areas -- Working Directory (what's on disk right " +
        "now), Staging Area (what `git add` has marked as \"include in the next commit\"), and Repository " +
        "(permanent history) -- and `git add` / `git commit` are two separate steps specifically so you " +
        "can build up exactly the commit you want, file by file, instead of every edit on disk " +
        "automatically becoming part of history.";

    public ToolKind ToolKind => ToolKind.GitBasics;

    public string Explanation =>
        "Git is a version control system: it records the history of a project's files so you can see who changed what, go back to any earlier version, and work in parallel without overwriting each other. Every file Git tracks sits in one of three places at any moment. The Working Directory is just " +
        "the files on your disk, exactly like any other folder -- editing a file only changes what's " +
        "here. The Staging Area (also called the \"index\") is the snapshot your NEXT commit will " +
        "record: it starts out matching the last commit, and `git add` updates it with the current version of a file. The " +
        "Repository is the permanent history -- a sequence of commits, each a frozen snapshot, that only " +
        "grows when you run `git commit`.\n\n" +
        "Having a Staging Area as a separate step from committing is the part that surprises people " +
        "coming from simpler \"save\" models -- but it's what lets you edit three files, then `git add` " +
        "only one of them, and commit just that one change as its own clean, reviewable unit, instead of " +
        "every unrelated edit on disk getting bundled into the same commit whether it belongs there or " +
        "not.\n\n" +
        "`git status` is how you ask Git what's in each area right now -- which files are modified but " +
        "not yet staged, which are staged and ready to commit, which aren't tracked by Git at all yet. " +
        "`git add <file>` moves a file's current version into the Staging Area; `git commit -m \"message\"` " +
        "takes the Staging Area's snapshot and seals it into a new permanent commit. Afterwards the Staging " +
        "Area matches that new commit, so `git status` shows nothing staged, ready for the next round.\n\n" +
        "Try it below -- edit files, stage some of them, and commit, watching each file move between the " +
        "three areas exactly like it would on a real repo.";
}
