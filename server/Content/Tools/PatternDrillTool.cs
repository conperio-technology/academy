namespace DsaAcademy.Content.Tools;

public class PatternDrillTool : ITool
{
    public string Id => "pattern-recognition-drill";
    public string Section => "Data Structures & Algorithms";
    public string Track => "drills";
    public int Order => 200; // after the greedy, math and bits tracks (110 to 131)
    public string Title => "Pattern Recognition Drill: Which Technique Is This?";
    public string OneLiner => "Read a problem in plain English and name the technique -- no code, just the reflex that decides whether you freeze in an interview.";
    public string KeyTakeaway =>
        "Most of the difficulty in an unfamiliar problem is choosing the approach, not writing it. Problems announce " +
        "their technique through small phrases -- \"sorted\", \"contiguous\", \"in O(1) per query\", \"minimum value that " +
        "still works\", \"all possible\" -- and this drill trains you to spot those phrases without writing a line of code.";

    public ToolKind ToolKind => ToolKind.PatternDrill;

    public string Explanation =>
        "Every Patterns lesson ends with you writing the solution -- but in a real interview, nobody tells you which " +
        "pattern the problem is. Recognizing it is its own skill, and it's much faster to practice on its own than " +
        "by fully solving problems. This drill gives you a problem statement and asks which technique fits; no editor, " +
        "no test cases.\n\n" +
        "After each answer you see the signal phrases that gave it away and the technique it's most often confused " +
        "with. Skim those as carefully as the answer -- they're the portable part. The same trigger words show up " +
        "again in problems you've never seen.\n\n" +
        "Your score and the techniques you keep missing are tracked for this session, so a second run can focus on " +
        "the weak spots.";
}
