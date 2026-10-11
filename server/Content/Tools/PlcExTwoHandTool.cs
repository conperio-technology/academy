namespace DsaAcademy.Content.Tools;

// PLC programming track (graded exercise). The interactive part is
// client/src/plc/exercises.ts, keyed by this Id.
public class PlcExTwoHandTool : ITool
{
    public string Id => "plc-ex-two-hand";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "plc programming";
    public int Order => 285;
    public string Title => "Exercise: Two-Hand Start";
    public string OneLiner => "Run a press only while two buttons are held, pressed within half a second of each other, and refuse to restart until both are released.";
    public string KeyTakeaway =>
        "A TON on LeftBtn OR RightBtn times the window from the first press and only resets when both are released; Press may start inside the window and then seals in while both are held.";

    public ToolKind ToolKind => ToolKind.PlcStExercise;

    public string Explanation =>
        "Presses and similar machines often use two-hand control: the operator must press two buttons, far " +
        "enough apart to need both hands, at nearly the same time, and keep both pressed. That keeps the " +
        "operator's hands out of the danger zone while the machine moves." +
        "\n\n" +
        "The logic is a good timing puzzle. It is also a good example of something a standard PLC program " +
        "must not be trusted with on a real machine, as the good practice lesson explains: here it is " +
        "practice only.";
}
