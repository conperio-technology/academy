namespace DsaAcademy.Content.Tools;

// Micro850 labs track: a hands-on lab on a real Micro850 in Connected Components
// Workbench. The steps, wiring and checklist are in client/src/plc/micro850Labs.ts,
// keyed by this Id.
public class M850AnalogScalingTool : ITool
{
    public string Id => "m850-analog-scaling";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "micro850 labs";
    public int Order => 340;
    public string Title => "Lab 8 (Optional): Analog Input Scaling";
    public string OneLiner => "Optional, for units fitted with an analog plug-in module: configure a 0 to 10 V input, measure the raw counts at both ends, scale to percent, and reuse the simulator's hysteresis and deadband logic.";
    public string KeyTakeaway =>
        "Scale from end points you measured, not from a datasheet, and do the maths in REAL. The simulator's clamp, hysteresis and deadband code works unchanged once the signal is in engineering units.";

    public ToolKind ToolKind => ToolKind.PlcMicro850Lab;

    public string Explanation =>
        "This lab is optional. It assumes an analog input plug-in module (a 2080-IF2 or 2080-IF4) is fitted to the controller, because the Micro850's embedded I/O is digital only. If your unit has none, do the matching simulator exercises instead." +
        "\n\n" +
        "An analog input card converts a voltage or current into a number called raw counts. You configure the module in CCW, read the raw value for 0 V and 10 V, and turn it into a level in percent, then drive the lamps with the hysteresis and deadband logic from the tank level exercise.";
}
