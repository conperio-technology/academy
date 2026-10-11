namespace DsaAcademy.Content.Tools;

public class PlcMemoryAddressingTool : ITool
{
    public string Id => "plc-memory-addressing";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "plc";
    public string Title => "PLC Memory Addressing: I, Q, M and Friends";
    public string OneLiner => "PLC memory isn't a flat address space the way a general computer's RAM is -- it's organized into named REGIONS by what kind of thing each bit represents.";
    public string KeyTakeaway =>
        "I, Q, and M addresses look similar but mean fundamentally different things: I and Q are wired " +
        "to the physical world (inputs and outputs respectively) and get overwritten by the scan " +
        "cycle's Read Inputs/Write Outputs phases, while M is pure internal state the program controls " +
        "entirely itself -- confusing an M bit for a Q bit (or vice versa) is a real, easy-to-make " +
        "mistake with real consequences.";

    public ToolKind ToolKind => ToolKind.PlcMemoryAddressing;

    public string Explanation =>
        "A general-purpose computer's RAM (see Computer Architecture) is a flat address space -- any " +
        "byte can hold anything, and it's up to the program to remember what's stored where. Classic " +
        "PLC memory is organized differently: addresses are grouped into named regions by what kind of " +
        "thing they represent, traditionally prefixed by a letter -- I for Input, Q for Output (some " +
        "platforms use O), M for internal Memory/markers, plus dedicated regions for Timers (T) and " +
        "Counters (C). In Siemens and IEC style an address like I1.3 (IEC writes %IX1.3) means \"input " +
        "byte 1, bit 3\" -- the exact physical wire a sensor is connected to; outputs and markers follow " +
        "the same pattern (Q0.0, M3.2). Allen-Bradley's older SLC and PLC-5 controllers write the same " +
        "idea differently: I:1/3 is \"input module in slot 1, bit 3\", outputs are O:2/0, internal bits " +
        "are B3:0/5 and a timer's done bit is T4:0/DN. The two styles don't mix, so \"Q:1/0\" or " +
        "\"M:3/2\" is valid in neither.\n\n" +
        "The critical distinction is what CONTROLS each region. I addresses are overwritten by the scan " +
        "cycle's Read Inputs phase every single scan -- the program can read an I bit but never usefully " +
        "write to it, since the next scan just overwrites it from the physical input again. Q addresses " +
        "are written by the program during Execute Program and pushed to the physical outputs during " +
        "Write Outputs -- the program controls them, the physical world just receives them. M addresses " +
        "are neither: they're not wired to anything physical at all, purely internal scratch state the " +
        "program uses to remember something between rungs, or between scans (a \"seal-in\" bit keeping " +
        "a motor running after its start button releases, a step counter in a sequence) -- this is the " +
        "region newcomers most often reach for once they need \"memory\" that isn't tied to a real wire.\n\n" +
        "Modern PLC platforms (Studio 5000, TIA Portal) mostly replace this letter-prefix addressing " +
        "with named TAGS (StartButton, ConveyorRunning, instead of I:1/0 or Q0.0, M3.2) -- readable names " +
        "instead of cryptic coordinates -- but the underlying regions (physical input, physical output, " +
        "internal memory) are exactly the same concept underneath, just with better names on top. " +
        "Reading legacy code (and a lot of running industrial equipment still is legacy code) still " +
        "means recognizing I/Q/M (or I/O/B) at a glance.";
}
