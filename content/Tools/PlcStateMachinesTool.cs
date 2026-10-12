namespace DsaAcademy.Content.Tools;

// PLC programming track (lesson). The interactive part is
// client/src/plc/lessons.ts, keyed by this Id.
public class PlcStateMachinesTool : ITool
{
    public string Id => "plc-state-machines";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "plc programming";
    public int Order => 260;
    public string Title => "Sequences as State Machines with CASE";
    public string OneLiner => "How PLC programs run step-by-step processes: one state variable, a CASE that moves between states, timers per state, outputs derived from the state, with a simulated tank and a conveyor sorter.";
    public string KeyTakeaway =>
        "Keep the current step in one INT, let a CASE decide each step's transitions, handle stop and faults above it, give timed steps their own timers, and write the outputs from the state in one place afterwards.";

    public ToolKind ToolKind => ToolKind.PlcStLesson;

    public string Explanation =>
        "Most machines do things in order: fill, then heat, then drain; clamp, then drill, then release. " +
        "Writing a sequence as a pile of separate latched bits works for three steps and becomes unreadable " +
        "at ten. The standard approach is a state machine: one variable holds which step the machine is in, " +
        "and a CASE statement says, for each step, which conditions move it on to the next." +
        "\n\n" +
        "A state machine, also called a sequencer, has a fixed set of states, exactly one of which is active " +
        "at a time, and transitions between them triggered by conditions such as a sensor, a timer or a " +
        "button. In ST it is an INT variable and a CASE on it. The outputs are then worked out from the " +
        "state, each in one place, so a step can't forget to switch something off. Stop and fault handling " +
        "sit above the CASE so they apply in every state." +
        "\n\n" +
        "IEC 61131-3's Sequential Function Chart language draws exactly this structure as boxes and lines, " +
        "and some teams use it for sequences. Writing it in ST teaches the same thinking and works in any " +
        "tool. Below are a tank sequence (fill, mix, drain) running against a simulated tank and a conveyor " +
        "that sorts metal parts; the exercises are a traffic light and a conveyor jam detector.";
}
