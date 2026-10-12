namespace DsaAcademy.Content.Tools;

// Micro850 labs track: a hands-on lab on a real Micro850 in Connected Components
// Workbench. The steps, wiring and checklist are in client/src/plc/micro850Labs.ts,
// keyed by this Id.
public class M850KitSafetyTool : ITool
{
    public string Id => "m850-kit-safety";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "micro850 labs";
    public int Order => 300;
    public string Title => "Lab 0: The Micro850 Kit and Bench Safety";
    public string OneLiner => "What is on the bench, what the catalog number tells you, the rules for working on 24 V DC training boards, lockout basics, and what your PC needs before Lab 1.";
    public string KeyTakeaway =>
        "The labs are 24 V DC only. Mains wiring is out of scope and belongs to qualified people, no real load is energised without a supervisor, and you switch off and tag the bench before touching any wiring.";

    public ToolKind ToolKind => ToolKind.PlcMicro850Lab;

    public string Explanation =>
        "The simulator track taught the ideas; these labs put them on real hardware. Conperio has four Allen-Bradley Micro850 controllers, small PLCs (programmable logic controllers) from Rockwell Automation's Micro800 family, each mounted on a training board with pushbuttons, a selector switch and pilot lamps. You program them with Connected Components Workbench (CCW), Rockwell's free programming software for Micro800 controllers." +
        "\n\n" +
        "Each lab is a step-by-step guide: objectives, the simulator lessons it builds on, a parts list, a wiring table, numbered steps with the result you should see, a checklist you tick as you go (saved in this browser), common mistakes and a stretch task. Every lab also says which simulator exercise to do if no unit is free, and has notes for the instructor running the session." +
        "\n\n" +
        "This first lab is about the kit and the rules. The training boards run on 24 V DC (direct current), a low voltage that is safe to touch, but short circuits still damage things, and the supply that makes the 24 V is fed from mains. Mains wiring is out of scope for these labs: it must be done by qualified people. You will also learn the bench version of lockout/tagout (LOTO), the procedure of isolating, locking and tagging a machine's energy before working on it.";
}
