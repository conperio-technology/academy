namespace DsaAcademy.Content.Tools;

// The FAANG interview plan from Interview Prep, listed again in Start Here next to the IT & CS
// path so both paths are where a newcomer looks first. Same tool and saved plan.
public class FaangStudyPathTool : ITool
{
    public string Id => "faang-study-path";
    public string Section => "Start Here";
    public string Track => "your path";
    public int Order => 1;
    public string Title => "Study Path: FAANG Interview Prep";
    public string OneLiner =>
        "A week-by-week plan for big-tech interviews: coding, system design, object-oriented design and " +
        "behavioral rounds, sized to your level, target role and weekly hours.";
    public string KeyTakeaway =>
        "Cover the right things in the right order, drill the small building blocks every week, and keep " +
        "checking where you're weakest. Doing everything once is less use than doing the core well.";

    public ToolKind ToolKind => ToolKind.FaangStudyPath;

    public string Explanation =>
        "This is the same plan as Study Plan and Readiness in the Interview Prep section, opened on the " +
        "interview path. Pick where you start (new to programming, comfortable, or experienced but rusty on " +
        "interviews), what the interviews are for, and how many hours a week you have, and it lays out the " +
        "weeks. Every week starts with a short Today's reps session of building blocks, and slack weeks are " +
        "kept for redoing what didn't stick.\n\nThe readiness tab shows the evidence for each area: what you " +
        "have covered, what you passed with help, what you passed on your own, and what you did against the " +
        "clock. Switch to the Well-rounded IT & CS path at the top if you want broad knowledge rather than " +
        "interview practice. Your plan is saved in this browser.";
}
