namespace DsaAcademy.Content.Tools;

// Micro850 labs track: a hands-on lab on a real Micro850 in Connected Components
// Workbench. The steps, wiring and checklist are in client/src/plc/micro850Labs.ts,
// keyed by this Id.
public class M850TimersCountersTool : ITool
{
    public string Id => "m850-timers-counters";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "micro850 labs";
    public int Order => 325;
    public string Title => "Lab 5: Timers and Counters";
    public string OneLiner => "Declare TON and CTU instances as variables in CCW, build the simulator's flasher and part counter on the bench, and watch elapsed times and counts live.";
    public string KeyTakeaway =>
        "A timer or counter instance is a variable whose data type is the block; each instance has its own memory. Call each instance exactly once per scan, and on a Micro800 write RESET, not R, on CTU.";

    public ToolKind ToolKind => ToolKind.PlcMicro850Lab;

    public string Explanation =>
        "Timers and counters are function blocks: code with memory. In CCW you declare an instance, a variable whose data type is TON or CTU, and call it from your program every scan; each instance keeps its own elapsed time or count." +
        "\n\n" +
        "This lab rebuilds two simulator exercises on the bench: the two-timer flasher on the yellow lamp and the part counter on the green lamp, and has you watch the instances' members (ET, CV, Q) change online.";
}
