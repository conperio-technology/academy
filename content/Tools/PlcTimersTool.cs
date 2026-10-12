namespace DsaAcademy.Content.Tools;

// PLC programming track (lesson). The interactive part is
// client/src/plc/lessons.ts, keyed by this Id.
public class PlcTimersTool : ITool
{
    public string Id => "plc-timers";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "plc programming";
    public int Order => 230;
    public string Title => "Timers: TON, TOF and TP";
    public string OneLiner => "The three IEC timers as function blocks: on-delay, off-delay and pulse, their Q and elapsed time outputs, TIME literals, and the two rules that prevent most timer bugs.";
    public string KeyTakeaway =>
        "TON: Q after IN has been TRUE for PT. TOF: Q with IN, held for PT after IN drops. TP: a fixed PT pulse from a rising edge. Call every timer once per scan, unconditionally, and expect the real delay to be PT rounded up to the next scan.";

    public ToolKind ToolKind => ToolKind.PlcStLesson;

    public string Explanation =>
        "Timers are function blocks: you declare an instance (a named copy with its own memory), call it " +
        "every scan with its inputs, and read its outputs. IEC 61131-3 defines three. The on-delay timer TON " +
        "turns its output Q on once its input IN has been TRUE for the preset time PT. The off-delay timer " +
        "TOF turns Q on with IN and keeps it on for PT after IN goes off. The pulse timer TP turns Q on for " +
        "exactly PT when IN rises, however long IN then stays on." +
        "\n\n" +
        "Each also has an elapsed time output, ET, which counts up while it is timing. Durations are TIME " +
        "values, written as literals such as T#500ms, T#2s or T#1m30s." +
        "\n\n" +
        "A PLC timer isn't a separate clock interrupting the program. It checks the controller's clock each " +
        "time the program calls it, so its output can only change when the program runs, once per scan. That " +
        "has two practical effects: the real delay is PT rounded up to the next scan, and a timer the program " +
        "stops calling stops updating. The simulator below runs all three timers from one switch so you can " +
        "compare them on a timing chart.";
}
