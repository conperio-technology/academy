namespace DsaAcademy.Content.Tools;

// Micro850 labs track: a hands-on lab on a real Micro850 in Connected Components
// Workbench. The steps, wiring and checklist are in client/src/plc/micro850Labs.ts,
// keyed by this Id.
public class M850SealInStTool : ITool
{
    public string Id => "m850-seal-in-st";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "micro850 labs";
    public int Order => 320;
    public string Title => "Lab 4: The Seal-In in Structured Text";
    public string OneLiner => "Run the simulator's one-line seal-in in a CCW Structured Text program, and learn how CCW's Structured Text differs from the simulator's subset.";
    public string KeyTakeaway =>
        "The logic line is unchanged. What changes is around it: variables live in CCW's tables, I/O is mapped from _IO_EM_ variables, conversions use the ANY_TO_ family, and the Micro800 counters use RESET and LOAD pins with DINT values.";

    public ToolKind ToolKind => ToolKind.PlcMicro850Lab;

    public string Explanation =>
        "Structured Text (ST) is standard across vendors, but every vendor adds its own details. The one-line seal-in from the simulator runs on the Micro850 unchanged; this lab puts it in a CCW ST program with I/O mapping and then shows you the differences you will meet when you move more simulator code across." +
        "\n\n" +
        "The main ones: no VAR blocks (variables are declared in CCW's variable tables), conversion functions named ANY_TO_REAL, ANY_TO_INT and so on instead of INT_TO_REAL, more data types, and slightly different pin names on the counter function blocks.";
}
