namespace DsaAcademy.Content.Tools;

// PLC programming track (graded exercise). The interactive part is
// client/src/plc/exercises.ts, keyed by this Id.
public class PlcExFlasherTool : ITool
{
    public string Id => "plc-ex-flasher";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "plc programming";
    public int Order => 233;
    public string Title => "Exercise: Flashing Beacon with TON";
    public string OneLiner => "Make a lamp flash half a second on, half a second off, using on-delay timers that restart themselves.";
    public string KeyTakeaway =>
        "A timer whose own output resets its input restarts itself; two timers resetting each other, or one timer with its ET compared to a half period, give a steady flash.";

    public ToolKind ToolKind => ToolKind.PlcStExercise;

    public string Explanation =>
        "A flashing beacon is the hello world of PLC timers: no inputs changing, just time. The program has " +
        "to produce a steady on/off rhythm from on-delay timers, and the trick is making a timer restart " +
        "itself so the pattern repeats for as long as it's enabled." +
        "\n\n" +
        "The grader watches the lamp for four seconds and measures every on and off period, allowing for the " +
        "extra scan each timer restart costs.";
}
