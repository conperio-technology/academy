namespace DsaAcademy.Content.Tools;

// PLC programming track (graded exercise). The interactive part is
// client/src/plc/exercises.ts, keyed by this Id.
public class PlcExToggleTool : ITool
{
    public string Id => "plc-ex-toggle";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "plc programming";
    public int Order => 245;
    public string Title => "Exercise: Push-On, Push-Off Toggle";
    public string OneLiner => "One pushbutton turns a lamp on, the next press turns it off. Easy to describe, and a classic trap for code that acts on the level instead of the edge.";
    public string KeyTakeaway =>
        "Toggle on the rising edge (an R_TRIG's Q, or Button AND NOT ButtonPrev), never on the button's level.";

    public ToolKind ToolKind => ToolKind.PlcStExercise;

    public string Explanation =>
        "One pushbutton that turns a light on with one press and off with the next. It sounds trivial, but a " +
        "program that toggles whenever the button is TRUE flips the light once per scan for as long as the " +
        "button is held, ending up on or off at random." +
        "\n\n" +
        "The fix is to act on the press, the rising edge, rather than on the level. The grader checks that " +
        "each press changes the lamp exactly once, however long the button is held, and that even a one-scan " +
        "tap counts.";
}
