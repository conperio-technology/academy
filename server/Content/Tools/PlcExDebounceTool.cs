namespace DsaAcademy.Content.Tools;

// PLC programming track (graded exercise). The interactive part is
// client/src/plc/exercises.ts, keyed by this Id.
public class PlcExDebounceTool : ITool
{
    public string Id => "plc-ex-debounce";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "plc programming";
    public int Order => 236;
    public string Title => "Exercise: Debounce a Bouncy Contact";
    public string OneLiner => "Filter contact bounce out of a switch signal: only accept a change once the input has been steady for 50 ms, in both directions.";
    public string KeyTakeaway =>
        "A TON resets whenever its input drops, so a TON on the signal and another on its inverse only finish when the signal has been steady for the whole time.";

    public ToolKind ToolKind => ToolKind.PlcStExercise;

    public string Explanation =>
        "Mechanical contacts bounce: when a switch closes, its contacts touch, spring apart and touch again " +
        "several times before settling, and a fast input can see that as a burst of on/off changes. " +
        "Debouncing means ignoring changes until the signal has been steady for a while." +
        "\n\n" +
        "Here the bounce is exaggerated to tens of milliseconds so that it shows up at a 10 ms scan; the same " +
        "filter is used for chattering level switches and flickering photo-eyes.";
}
