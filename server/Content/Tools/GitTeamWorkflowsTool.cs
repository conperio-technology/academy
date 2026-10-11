namespace DsaAcademy.Content.Tools;

public class GitTeamWorkflowsTool : ITool
{
    public string Id => "git-team-workflows";
    public string Section => "Professional Dev Skills";
    public string Track => "git";
    public int Order => 100;
    public string Title => "Git in a Team: Pull Requests, Reviews and Merge Strategies";
    public string OneLiner => "Remotes, pull requests, code review, merge versus squash versus rebase, and what to do when your push is rejected.";
    public string KeyTakeaway => "Branch from the latest main, keep pull requests small, let CI and a reviewer approve them, then merge with the team's strategy: a merge commit keeps everything, squash gives one commit per pull request, rebase gives a straight line with rewritten commits. Integrate others' work with pull --rebase; never force-push shared branches.";

    public ToolKind ToolKind => ToolKind.GitTeamWorkflows;

    public string Explanation =>
        "Git Basics and Git Branching cover Git on your own machine. This lesson is about using it with other people: remotes, fetch versus pull, the life of a pull request, reviewing, branch protection, branching models and keeping secrets out of the history." +
        "\n\n" +
        "All terminal output in this lesson comes from real git 2.43 runs, including the three merge strategies applied to the same branch and a push rejected because a teammate pushed first.";
}
