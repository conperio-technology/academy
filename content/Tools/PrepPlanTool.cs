namespace DsaAcademy.Content.Tools;

public class PrepPlanTool : ITool
{
    public string Id => "interview-prep-plan";
    public string Section => "Interview Prep";
    public string Track => "plan";
    public string Title => "Study Plan and Readiness";
    public string OneLiner => "A plan through what a big-tech loop covers, shaped by your level, target role and weekly hours, and a view of the evidence for each area.";
    public string KeyTakeaway =>
        "Interview prep goes wrong in two ways: spending weeks on the topics you already like, and leaving system " +
        "design and behavioral stories to the last few days. A plan that interleaves all four areas, and a regular " +
        "look at where you're weakest, fixes both.";

    public ToolKind ToolKind => ToolKind.PrepPlan;

    public string Explanation =>
        "A typical big-tech loop has two or three coding rounds, one or two system design rounds (one for junior " +
        "roles, sometimes swapped for an object-oriented design round), and a behavioral round, which at Amazon is " +
        "woven into every interview. The plan covers all of them in five phases: foundations, core data " +
        "structures, graphs and heaps, dynamic programming with design depth, and a final phase of timed mock " +
        "interviews. System design starts in phase two and behavioral stories in week one, so neither is crammed at " +
        "the end. Concurrency, memory, design patterns, operating systems, testing and AI lessons run alongside, with short pattern quiz and " +
        "glossary flash card sessions recurring through the weeks.\n\n" +
        "Not everyone needs the same plan, so it asks three things. Where you start: someone new to programming " +
        "gets a prerequisites block first and the hardest topics marked optional, while an experienced engineer " +
        "gets the easy warm-ups turned into optional checks. What the interviews are for: a backend target adds " +
        "databases and more design walk-throughs and trims niche algorithms, and a senior, design heavy target " +
        "moves system design earlier and adds repeat walk-throughs and extra behavioral rounds. And how many hours " +
        "a week you really have, which decides how many weeks the core material takes. Optional material is " +
        "listed with a reason but not scheduled, each phase says what it needs before you start it, and a slack " +
        "week after every four weeks (plus one at the end) is kept free for failed attempts, revision and repeat " +
        "mocks. Lessons tick themselves off when you pass them, design walk-throughs when you've compared every " +
        "stage, story-bank goals when you have enough stories, and pattern quiz runs when you finish them. Tick " +
        "everything else yourself.\n\n" +
        "The readiness tab keeps four kinds of evidence apart instead of blending them into one percentage. " +
        "Coverage: lessons you have opened or run, walk-throughs started, story themes covered. Assisted practice: " +
        "coding lessons passed from the guided starter or soon after opening the reference solution, and the " +
        "points you ticked yourself against a model answer. Independent: coding lessons passed from the bare " +
        "starter with no reference in the week before, and quiz and flash card results where the answer was " +
        "hidden. Timed: problems solved in the mixed interview set and behavioral mock rounds. Each figure names " +
        "what produced it, and where nothing measures a kind (nothing here can judge a design you produced alone) " +
        "it says so. It's a guide to what to practise next, not a prediction of the outcome. The \"Focus next\" " +
        "list links straight to the most useful next step, such as redoing an assisted pass from the bare starter.\n\n" +
        "Your plan, practice history and lesson progress are kept in this browser; the dashboard's Export progress button saves them all to a file.\n\n" +
        "Not preparing for a big-tech interview? Switch to the second path at the top, Well-rounded IT & CS: the same " +
        "plan and progress views over a broad route through hardware, programming, operating systems, networking, " +
        "security, Linux, databases, Git, system design basics and AI. Each path keeps its own plan.";
}
