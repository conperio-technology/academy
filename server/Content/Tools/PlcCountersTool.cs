namespace DsaAcademy.Content.Tools;

// PLC programming track (lesson). The interactive part is
// client/src/plc/lessons.ts, keyed by this Id.
public class PlcCountersTool : ITool
{
    public string Id => "plc-counters";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "plc programming";
    public int Order => 250;
    public string Title => "Counters: CTU, CTD and CTUD";
    public string OneLiner => "Up, down and up/down counters: they count rising edges, not scans; reset and load take priority; and the outputs flag when a preset is reached.";
    public string KeyTakeaway =>
        "CTU counts CU edges up from 0 (R clears it, Q = CV >= PV); CTD counts CD edges down from PV (LD loads it, Q = CV <= 0); CTUD does both. Decide deliberately whether a count must survive a power cut.";

    public ToolKind ToolKind => ToolKind.PlcStLesson;

    public string Explanation =>
        "Counters are function blocks that count rising edges, so a part sitting in front of a sensor counts " +
        "once, not once per scan. The up counter CTU adds one to its current value CV on each rising edge of " +
        "its CU input, is cleared by its reset input R, and sets its output Q once CV reaches the preset " +
        "value PV. The down counter CTD loads PV when its LD input is TRUE and counts down on CD edges, " +
        "setting Q when it reaches zero. The up/down counter CTUD combines both, which suits anything that " +
        "goes in and comes out again, such as parts in a buffer zone." +
        "\n\n" +
        "Typical uses are batch counts (a box every 10 parts), production totals, cycle counts for " +
        "maintenance, and tracking how many items are between two sensors. The details worth knowing are " +
        "which input wins when several are active at once, what happens at the limits of the count, and " +
        "whether the count survives a power cut.";
}
