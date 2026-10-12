namespace DsaAcademy.Content.Tools;

// Micro850 labs track: a hands-on lab on a real Micro850 in Connected Components
// Workbench. The steps, wiring and checklist are in client/src/plc/micro850Labs.ts,
// keyed by this Id.
public class M850IoVariablesTool : ITool
{
    public string Id => "m850-io-variables";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "micro850 labs";
    public int Order => 310;
    public string Title => "Lab 2: Embedded I/O, Variables and Forcing";
    public string OneLiner => "The Micro850's predefined I/O variables such as _IO_EM_DI_00, global and local user variables, mapping I/O to meaningful names, monitoring live values, and forcing inputs and outputs safely.";
    public string KeyTakeaway =>
        "Map each I/O variable to a named variable once, at the start and end of the scan. Forcing overrides the program on that point: say what you force, watch the force LED, and remove every force before you leave.";

    public ToolKind ToolKind => ToolKind.PlcMicro850Lab;

    public string Explanation =>
        "The Micro850's embedded I/O, the inputs and outputs built into the controller itself, comes with predefined variable names: _IO_EM_DI_00 is embedded digital input 0, wired to terminal I-00, and _IO_EM_DO_00 is embedded digital output 0. You can't rename them, so good practice is to copy each one into your own variable with a meaningful name, like the Start and Motor of the simulator exercises." +
        "\n\n" +
        "CCW keeps variables in tables rather than in VAR blocks. Global variables are visible to every program in the project; each program also has local variables that only it can see." +
        "\n\n" +
        "This lab also covers forcing: overriding an I/O point from CCW regardless of what the program says. It is a powerful troubleshooting tool and a dangerous one, because a forced output switches whatever is wired to it. You will force an input and an output on the bench, where only lamps are connected, see how the controller's force indicator shows it, and remove every force.";
}
