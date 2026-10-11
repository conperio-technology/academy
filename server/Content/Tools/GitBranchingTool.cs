namespace DsaAcademy.Content.Tools;

public class GitBranchingTool : ITool
{
    public string Id => "git-branching";
    public string Section => "Professional Dev Skills";
    public string Track => "git";
    public string Title => "Git Branching & Merging";
    public string OneLiner => "A branch is just a movable label on a commit -- creating one is nearly free, which is exactly why Git wants you to make them constantly.";
    public string KeyTakeaway =>
        "A branch isn't a copy of your code -- it's a lightweight, movable pointer to one specific " +
        "commit, which is why creating one is instant regardless of how large the project is. Commits " +
        "form a chain back through history via each commit's parent link. When both branches have new " +
        "commits, merging brings the two chains back together by creating a new commit with TWO parents, " +
        "one from each branch, instead of picking a winner and discarding the other line of history; " +
        "if main hasn't moved since the branch was made, git simply fast-forwards main's label instead.";

    public ToolKind ToolKind => ToolKind.GitBranching;

    public string Explanation =>
        "Every commit points at its parent -- the commit that came right before it -- which is what " +
        "makes the whole history a chain (or, once branches diverge, a tree) rather than a flat list. A " +
        "branch name like `main` or `feature` is nothing more than a label that points at one commit in " +
        "that chain and automatically moves forward to whatever new commit gets added next while that " +
        "branch is checked out.\n\n" +
        "`git branch feature` creates a new label pointing at the SAME commit `main` currently points " +
        "at -- no files are copied, nothing is duplicated, it's just a second name for the same starting " +
        "point. `git checkout feature` (or `git switch feature`) changes which branch new commits attach " +
        "to; commit on `feature` now and `main` doesn't move at all -- the two labels point at different " +
        "commits from that moment on, and the history has diverged into two lines.\n\n" +
        "`git merge feature` (run while on `main`) does one of three things. If `main` hasn't moved since " +
        "`feature` was created, there's nothing to join: git does a fast-forward, sliding the `main` label " +
        "up to feature's tip without making any new commit. If both branches have new commits, git creates " +
        "a merge commit with two parents at once -- main's previous tip AND feature's tip -- so the " +
        "resulting history honestly records that two lines of work happened in parallel and were joined, " +
        "rather than rewriting either line's history to make it look linear. And if `feature` has nothing " +
        "main doesn't already have, git just prints \"Already up to date.\" (`git merge --no-ff` forces a " +
        "merge commit even when a fast-forward was possible, which some teams use to keep each feature " +
        "visible as a unit.)\n\n" +
        "Try it below -- create a branch, commit on it, switch back to main, and merge: main fast-forwards. " +
        "Then commit on feature again, also commit on main, and merge: watch the commit graph actually " +
        "fork and rejoin with a merge commit.";
}
