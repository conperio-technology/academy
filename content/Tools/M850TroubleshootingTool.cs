namespace DsaAcademy.Content.Tools;

// Micro850 labs track: a hands-on lab on a real Micro850 in Connected Components
// Workbench. The steps, wiring and checklist are in client/src/plc/micro850Labs.ts,
// keyed by this Id.
public class M850TroubleshootingTool : ITool
{
    public string Id => "m850-troubleshooting";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "micro850 labs";
    public int Order => 350;
    public string Title => "Lab 10: Troubleshooting, Faults and Uploading";
    public string OneLiner => "Read the status LEDs, cause and clear a fault, look up its code, upload a program and compare it with your project, and find a planted fault by checking in order.";
    public string KeyTakeaway =>
        "Read the fault code before clearing anything, upload before changing a controller you didn't program, and troubleshoot in order from the terminal to the program, one change at a time.";

    public ToolKind ToolKind => ToolKind.PlcMicro850Lab;

    public string Explanation =>
        "Most of a controls engineer's time on site is troubleshooting. This lab practises it on the bench: reading the status LEDs, causing a fault on purpose and finding its code in CCW, clearing it and recovering." +
        "\n\n" +
        "It also covers uploading, copying the program from the controller back into a CCW project. The program in the controller is the truth; the file on someone's laptop may be older. Finally, your instructor plants a fault on your bench and you find it with a fixed checking order.";
}
