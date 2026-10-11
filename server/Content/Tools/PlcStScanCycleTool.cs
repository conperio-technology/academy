namespace DsaAcademy.Content.Tools;

// PLC programming track (lesson). The interactive part is
// client/src/plc/lessons.ts, keyed by this Id.
public class PlcStScanCycleTool : ITool
{
    public string Id => "plc-st-scan-cycle";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "plc programming";
    public int Order => 210;
    public string Title => "The Scan Cycle in Practice: Order, Pulses and Last Write Wins";
    public string OneLiner => "What the read, execute, write loop means for the code you write: inputs frozen for the whole scan, outputs written once at the end, statement order creating one-scan lags, and pulses too short to see.";
    public string KeyTakeaway =>
        "The program sees a snapshot of the inputs and only its final output values reach the field. So write each output in one place, never wait inside a scan, and remember that anything computed below a statement reaches it one scan late.";

    public ToolKind ToolKind => ToolKind.PlcStLesson;

    public string Explanation =>
        "The earlier lesson PLCs: How They're Different From a Normal Computer introduced the scan cycle: " +
        "read every input into memory, run the whole program top to bottom, write every output, do " +
        "housekeeping, repeat. This lesson is about what that means when you write the program, because many " +
        "surprising PLC bugs come from forgetting it." +
        "\n\n" +
        "Three consequences matter most. First, the program never sees a live input. It sees the input image, " +
        "a snapshot taken at the start of the scan, so an input that changes mid-scan waits for the next " +
        "scan, and a pulse shorter than a scan can be missed entirely. Second, outputs reach the real world " +
        "only at the end of the scan, so if the program writes an output twice, only the last value counts. " +
        "Third, the program runs in order, so a statement that reads a value computed further down sees last " +
        "scan's value: a one-scan lag that is harmless until two pieces of logic depend on each other's " +
        "timing." +
        "\n\n" +
        "That ordering is the PLC's version of a race condition. There are no threads fighting over memory in " +
        "a single-task program like these, but the result can still depend on the order things happen in and " +
        "on which scan a change lands in. A scan typically takes anywhere from under a millisecond to a few " +
        "tens of milliseconds, depending on the controller and the size of the program." +
        "\n\n" +
        "Step through the scan below one phase at a time, then try the statement order, last-write and " +
        "one-scan pulse examples.";
}
