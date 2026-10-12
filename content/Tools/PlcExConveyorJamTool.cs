namespace DsaAcademy.Content.Tools;

// PLC programming track (graded exercise). The interactive part is
// client/src/plc/exercises.ts, keyed by this Id.
public class PlcExConveyorJamTool : ITool
{
    public string Id => "plc-ex-conveyor-jam";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "plc programming";
    public int Order => 266;
    public string Title => "Exercise: Conveyor Jam Detection";
    public string OneLiner => "Stop a conveyor and latch a jam alarm when a photo-eye stays blocked too long while the belt runs, with a reset that only works once the jam is cleared and no automatic restart.";
    public string KeyTakeaway =>
        "Time Motor AND PhotoEye with a TON, latch the jam, clear it only when the eye is clear and Reset is pressed, and put NOT Jam into the seal-in so the motor needs a fresh Start.";

    public ToolKind ToolKind => ToolKind.PlcStExercise;

    public string Explanation =>
        "On a conveyor, a part that stops moving piles up the parts behind it. A common, cheap way to detect " +
        "that is a timeout: if the photo-eye stays blocked much longer than a part normally takes to pass, " +
        "assume a jam, stop the belt and tell the operator." +
        "\n\n" +
        "This exercise adds that to the start/stop seal-in, with a reset that only works once the jam has " +
        "been cleared, and without restarting the belt by itself afterwards.";
}
