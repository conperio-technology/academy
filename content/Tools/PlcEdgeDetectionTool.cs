namespace DsaAcademy.Content.Tools;

// PLC programming track (lesson). The interactive part is
// client/src/plc/lessons.ts, keyed by this Id.
public class PlcEdgeDetectionTool : ITool
{
    public string Id => "plc-edge-detection";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "plc programming";
    public int Order => 240;
    public string Title => "Edge Detection: R_TRIG, F_TRIG and One-Scan Pulses";
    public string OneLiner => "Levels vs edges: why a held button is TRUE for hundreds of scans, how R_TRIG and F_TRIG turn a change into a pulse that lasts exactly one scan, and the ladder and hand-written equivalents.";
    public string KeyTakeaway =>
        "Act on levels for things that should last as long as a signal does, and on edges for things that should happen once per event. R_TRIG gives one scan of TRUE when its input rises; give each signal its own instance and call it every scan.";

    public ToolKind ToolKind => ToolKind.PlcStLesson;

    public string Explanation =>
        "Most PLC inputs are levels: a button is TRUE for as long as it's held, which at a 10 ms scan is " +
        "dozens or hundreds of scans. Some actions should happen once per event instead: count a part, toggle " +
        "a light, add one to a total, start a sequence. For those the program needs the edge, the moment the " +
        "signal changes, not its level." +
        "\n\n" +
        "A rising edge is a change from FALSE to TRUE, and a falling edge a change from TRUE to FALSE. IEC " +
        "61131-3 provides two function blocks for detecting them: R_TRIG, whose output Q is TRUE for exactly " +
        "one scan after its input CLK rises, and F_TRIG, which does the same when CLK falls. Inside, each " +
        "just remembers last scan's value of CLK and compares. A signal that is TRUE for exactly one scan " +
        "like this is called a one-shot or one-scan pulse." +
        "\n\n" +
        "Ladder has the same thing as transition contacts that pass power for one scan, and you can write it " +
        "by hand in two lines of ST. Hold the button down in the simulator below to see the difference " +
        "between counting a level and counting edges.";
}
