namespace DsaAcademy.Content.Tools;

// Micro850 labs track: a hands-on lab on a real Micro850 in Connected Components
// Workbench. The steps, wiring and checklist are in client/src/plc/micro850Labs.ts,
// keyed by this Id.
public class M850FunctionBlocksTool : ITool
{
    public string Id => "m850-function-blocks";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "micro850 labs";
    public int Order => 335;
    public string Title => "Lab 7: Your Own Function Block";
    public string OneLiner => "Create a user-defined function block in CCW from the simulator's debounce logic, then use two instances with different settings.";
    public string KeyTakeaway =>
        "A user-defined function block packages logic and its memory together. Its timers are internal variables of the block, so every instance gets its own; that is what makes one tested block safe to reuse many times.";

    public ToolKind ToolKind => ToolKind.PlcMicro850Lab;

    public string Explanation =>
        "The simulator only lets you use the standard function blocks. CCW lets you write your own: a user-defined function block (UDFB) with its own inputs, outputs and internal variables, which you then use exactly like TON or CTU." +
        "\n\n" +
        "You will turn the debounce exercise into a block called FB_Debounce, use one instance for the Start button and another for the Count button, and see that each instance keeps its own timers.";
}
