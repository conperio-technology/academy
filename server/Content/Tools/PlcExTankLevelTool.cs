namespace DsaAcademy.Content.Tools;

// PLC programming track (graded exercise). The interactive part is
// client/src/plc/exercises.ts, keyed by this Id.
public class PlcExTankLevelTool : ITool
{
    public string Id => "plc-ex-tank-level";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "plc programming";
    public int Order => 276;
    public string Title => "Exercise: Tank Level with Hysteresis and Alarm";
    public string OneLiner => "Run a fill pump between 20 % and 80 % with hysteresis, and raise a high level alarm with a deadband, so neither chatters around a single threshold.";
    public string KeyTakeaway =>
        "Two thresholds and no assignment in between: the output keeps its last value inside the band, which is what stops it chattering.";

    public ToolKind ToolKind => ToolKind.PlcStExercise;

    public string Explanation =>
        "A fill pump keeps a tank between a low and a high level, and an alarm warns when the level gets too " +
        "high. With one threshold the pump would start and stop constantly as the level ripples; two " +
        "thresholds with a gap between them (hysteresis) make it run in long, calm cycles. The alarm gets the " +
        "same treatment, a deadband, so it doesn't flicker." +
        "\n\n" +
        "Try it in the simulator with the simulated tank switched on to watch the pump cycle.";
}
