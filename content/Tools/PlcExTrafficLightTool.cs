namespace DsaAcademy.Content.Tools;

// PLC programming track (graded exercise). The interactive part is
// client/src/plc/exercises.ts, keyed by this Id.
public class PlcExTrafficLightTool : ITool
{
    public string Id => "plc-ex-traffic-light";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "plc programming";
    public int Order => 263;
    public string Title => "Exercise: Traffic Light State Machine";
    public string OneLiner => "Cycle red, green and yellow with the right timings using a state variable, a CASE and one timer per state, going straight to red when Run turns off.";
    public string KeyTakeaway =>
        "One INT for the state, a TON per state with IN := State = n, transitions in a CASE, and the three lamps written from the state after it.";

    public ToolKind ToolKind => ToolKind.PlcStExercise;

    public string Explanation =>
        "A traffic light is the classic state machine: three states, a timed transition out of each, and " +
        "outputs that depend only on the current state. Real traffic signal controllers are certified " +
        "equipment with independent conflict monitoring; this is a model for practising sequencing." +
        "\n\n" +
        "The grader runs two full cycles and checks every phase's length and order, that exactly one lamp is " +
        "ever on, and what happens when Run is switched off and on again mid-cycle.";
}
