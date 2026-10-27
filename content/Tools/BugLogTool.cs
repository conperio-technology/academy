using DsaAcademy.Content.Concepts;

namespace DsaAcademy.Content.Tools;

public class BugLogTool : ITool
{
    public string Id => "bug-log";
    public string Section => "Data Structures & Algorithms";
    public string Track => BuildingBlock.TrackName;
    public int Order => 98; // next to Today's reps, before the blocks at 99
    public string Title => "Your Bug Log: The Mistakes You Actually Make";
    public string OneLiner => "Every bug you noted after a failed run, grouped so the ones that keep coming back are on top.";
    public string KeyTakeaway =>
        "After a couple of weeks the same few bugs repeat: off-by-one on a window shrink, forgetting to mark visited when you " +
        "push. Knowing your own top five tells you exactly what to check before you press Run.";

    public ToolKind ToolKind => ToolKind.BugLog;

    public string Explanation =>
        "When a run fails and a later run passes, the lesson asks what the bug was: one tap on a category, an optional note, or " +
        "skip. That works on every graded exercise, and in Today's reps. You can add categories of your own, and add entries " +
        "here by hand for bugs from a real interview or a whiteboard.\n\n" +
        "The top of this page counts the last two weeks by category, with the lessons each bug happened in. Click a category to " +
        "list just those entries. Before you start a lesson where you logged a bug, it shows under \"Your past bugs here\", so " +
        "the reminder turns up exactly when it is useful.\n\n" +
        "The log is kept in this browser and included in the progress export on the dashboard.";
}
