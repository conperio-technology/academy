namespace DsaAcademy.Content.Tools;

// Micro850 labs track: a hands-on lab on a real Micro850 in Connected Components
// Workbench. The steps, wiring and checklist are in client/src/plc/micro850Labs.ts,
// keyed by this Id.
public class M850FirstConnectionTool : ITool
{
    public string Id => "m850-first-connection";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "micro850 labs";
    public int Order => 305;
    public string Title => "Lab 1: First Connection in CCW";
    public string OneLiner => "Install CCW, create a project for your exact controller, connect over USB, download, go online, use the RUN, REM and PROG modes, and then reach the controller over Ethernet.";
    public string KeyTakeaway =>
        "A download replaces the program in the controller; going online (debug mode) lets you watch it run. Leave the mode switch in REM so CCW can switch between program and run, and put the PC on the same subnet as the controller before trying Ethernet.";

    public ToolKind ToolKind => ToolKind.PlcMicro850Lab;

    public string Explanation =>
        "In the simulator, what you type runs immediately. A real controller needs a few steps first. You create a project in CCW that names the exact controller (its catalog number), write a program, build it (compile it and check for errors), and download it: copy it from the PC into the controller's memory. Once downloaded, the controller runs it on its own, with or without the PC." +
        "\n\n" +
        "Going online, which CCW calls debugging, connects CCW to the running controller so you can watch values change live, much like the simulator's live ladder view. The controller has a mode switch with three positions: RUN, PROG (program mode, where the program doesn't execute) and REM (remote, where CCW is allowed to change the mode)." +
        "\n\n" +
        "The first connection is over USB. Then you set a fixed IP address on the PC and reach the controller over Ethernet, which is how controllers are normally reached on a real site.";
}
