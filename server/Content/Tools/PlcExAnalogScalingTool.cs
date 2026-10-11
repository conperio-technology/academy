namespace DsaAcademy.Content.Tools;

// PLC programming track (graded exercise). The interactive part is
// client/src/plc/exercises.ts, keyed by this Id.
public class PlcExAnalogScalingTool : ITool
{
    public string Id => "plc-ex-analog-scaling";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "plc programming";
    public int Order => 273;
    public string Title => "Exercise: Scale a 4 to 20 mA Pressure Signal";
    public string OneLiner => "Convert raw analog counts into bar with REAL arithmetic, clamp the range, and flag a broken wire instead of reporting zero pressure.";
    public string KeyTakeaway =>
        "Convert to REAL, subtract the 4 mA count, multiply by the engineering span and divide by the count span; check for wire break first and clamp the rest.";

    public ToolKind ToolKind => ToolKind.PlcStExercise;

    public string Explanation =>
        "A pressure transmitter sends 4 to 20 mA for 0 to 10 bar, and the analog card turns that current into " +
        "counts. Write the scaling so the rest of the program can work in bar, and make a dead or " +
        "disconnected transmitter raise a fault instead of reading as zero pressure." +
        "\n\n" +
        "The card's numbers in this exercise are made up for the purpose; real cards document their own " +
        "ranges, and many can be configured to scale the value for you.";
}
