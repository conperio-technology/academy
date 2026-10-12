namespace DsaAcademy.Content.Tools;

// PLC programming track (graded exercise). The interactive part is
// client/src/plc/exercises.ts, keyed by this Id.
public class PlcExSealInTool : ITool
{
    public string Id => "plc-ex-seal-in";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "plc programming";
    public int Order => 225;
    public string Title => "Exercise: Start/Stop Motor Seal-In";
    public string OneLiner => "Your first graded Structured Text program: start a motor with a momentary button, keep it running, and stop it with a normally closed stop button, including when the stop wire breaks.";
    public string KeyTakeaway =>
        "Motor := (Start OR Motor) AND Stop_NC; is the whole answer, and every part of it matters: the OR is the seal, and Stop_NC is used without NOT because the button is wired normally closed.";

    public ToolKind ToolKind => ToolKind.PlcStExercise;

    public string Explanation =>
        "The start/stop circuit from the lesson, graded. A motor starter is the contactor (a heavy-duty " +
        "relay) and overload relay that switch a motor's power; the PLC output drives the contactor's coil. " +
        "Write the Structured Text so the motor starts on Start, keeps running when Start is released, and " +
        "stops on Stop, including when the stop circuit's wire breaks." +
        "\n\n" +
        "The grader runs your program on a 10 ms scan, presses and releases buttons over a few seconds of " +
        "simulated time, and checks Motor on every scan. Use Try it in the simulator to drive the inputs " +
        "yourself, and the timing chart after a run to see exactly where it went wrong.";
}
