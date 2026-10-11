namespace DsaAcademy.Content.Tools;

public class MixedSetTool : ITool
{
    public string Id => "mixed-interview-set";
    public string Section => "Data Structures & Algorithms";
    public string Track => "drills";
    public int Order => 200; // after the greedy, math and bits tracks (110 to 131)
    public string Title => "Mixed Interview Set: Unlabeled Problems Against the Clock";
    public string OneLiner => "Random problems from the graded lessons with the titles and hints stripped off, on an interview timer.";
    public string KeyTakeaway =>
        "Every lesson tells you its pattern in the title before you start, which is exactly the part an interview " +
        "doesn't give you. Practising on unlabeled problems against a clock is the closest thing to the real round: " +
        "read, name the approach out loud, code it, test it, and keep an eye on the time.";

    public ToolKind ToolKind => ToolKind.MixedSet;

    public string Explanation =>
        "Pick a format and the set draws problems at random from the Patterns, Graphs and Dynamic Programming " +
        "lessons. You see a plain problem statement and a couple of examples, nothing else: no title, no " +
        "explanation, no visualizer, no TODO hints in the starter code and no reference solution.\n\n" +
        "Before the editor opens you commit to a technique, the same way an interviewer expects you to explain " +
        "your approach before writing code. Then solve it against the lesson's real tests. A pass counts toward " +
        "that lesson's progress like any other. When you pass, or give up, the set tells you which lesson it was " +
        "and whether your call matched, and the summary at the end links to each lesson so you can study the " +
        "ones that got away.\n\n" +
        "The clock keeps running past zero, because finishing slowly still teaches you more than stopping, but the " +
        "summary records how far over you went. Problems you drew recently are less likely to come up again.";
}
