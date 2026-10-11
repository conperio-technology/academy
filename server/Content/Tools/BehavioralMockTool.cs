namespace DsaAcademy.Content.Tools;

public class BehavioralMockTool : ITool
{
    public string Id => "behavioral-mock-round";
    public string Section => "Behavioral Interviews";
    public string Track => "behavioral";
    public int Order => 3;
    public string Title => "Behavioral Mock Round";
    public string OneLiner => "Random questions in Amazon, Google, Meta or general style, a timer, likely follow-ups, and a checklist to grade yourself.";
    public string KeyTakeaway =>
        "Practise out loud with a timer. Answers that read well in your head run long and lose their structure when " +
        "spoken, and the follow-up questions (\"what would you do differently?\", \"what did your manager think?\") " +
        "are where interviewers find out whether the story holds up.";

    public ToolKind ToolKind => ToolKind.BehavioralMock;

    public string Explanation =>
        "Pick a company style and a round length. You get questions one at a time, chosen to cover different " +
        "competencies the way a real loop spreads them across interviewers. For each one, choose which of your " +
        "stories you'd tell, start the timer, and answer out loud. Recording yourself on your phone helps a lot; " +
        "you'll hear every \"um\" and every minute spent on background.\n\n" +
        "When you've finished, the round shows what the interviewer is listening for and the follow-ups they'd " +
        "probably ask. Answer those too, then tick the checklist honestly. At the end you'll see your times, which " +
        "checklist items you missed most, and which competencies your story bank doesn't cover yet.\n\n" +
        "Company styles differ. Amazon ties every question to a Leadership Principle, each interviewer owns a few " +
        "principles, and the follow-ups dig hard into data and your personal role. Google's \"Googleyness and " +
        "leadership\" round mixes past-behaviour questions with hypotheticals about ambiguity and teamwork. Meta's " +
        "behavioral round focuses on impact, conflict and growth, and the scope of your stories helps decide the " +
        "level you're hired at. The \"Any company\" set covers what nearly everyone asks.";
}
