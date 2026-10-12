namespace DsaAcademy.Content.Tools;

// Micro850 labs track: a hands-on lab on a real Micro850 in Connected Components
// Workbench. The steps, wiring and checklist are in client/src/plc/micro850Labs.ts,
// keyed by this Id.
public class M850SealInLadderTool : ITool
{
    public string Id => "m850-seal-in-ladder";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "micro850 labs";
    public int Order => 315;
    public string Title => "Lab 3: Start/Stop Seal-In in Ladder";
    public string OneLiner => "Build the start/stop seal-in rung in CCW's ladder editor and test it on the bench with the same sequence the simulator grader used, including a broken stop wire.";
    public string KeyTakeaway =>
        "The same rung as the simulator: Start and the Motor contact in parallel, in series with a normally open contact for the normally closed Stop button. Unplug the stop wire and the motor can't start: that is fail-safe wiring working.";

    public ToolKind ToolKind => ToolKind.PlcMicro850Lab;

    public string Explanation =>
        "You have built the start/stop seal-in in the simulator. Now you build it in CCW's ladder diagram (LD) editor, download it and test it with real pushbuttons." +
        "\n\n" +
        "The test sequence is the one the simulator grader runs: start, release, stop, release, both together, and a broken stop wire. On the bench you break the wire for real (with the supply off), which shows why stop buttons are wired normally closed: an open circuit looks exactly like a pressed Stop.";
}
