namespace DsaAcademy.Content.Tools;

// Micro850 labs track: a hands-on lab on a real Micro850 in Connected Components
// Workbench. The steps, wiring and checklist are in client/src/plc/micro850Labs.ts,
// keyed by this Id.
public class M850StateMachineTool : ITool
{
    public string Id => "m850-state-machine";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "micro850 labs";
    public int Order => 330;
    public string Title => "Lab 6: A Traffic Light State Machine in ST";
    public string OneLiner => "Run the simulator's traffic light state machine on three real lamps, watch the state and timers online, then add a red and yellow phase.";
    public string KeyTakeaway =>
        "A state variable, one timer per timed state, CASE for the transitions and all outputs written from the state in one place: the same structure works unchanged on the Micro850, and it is what makes the sequence easy to change.";

    public ToolKind ToolKind => ToolKind.PlcMicro850Lab;

    public string Explanation =>
        "A state machine describes a sequence as a set of states (red, green, yellow) and the conditions that move it from one to the next. In Structured Text it is an integer state variable and a CASE statement, as in the simulator lesson." +
        "\n\n" +
        "Here you put the simulator's traffic light solution on the bench's red, yellow and green lamps, check the timing with a stopwatch, and then change the sequence, which is where the structure pays off.";
}
