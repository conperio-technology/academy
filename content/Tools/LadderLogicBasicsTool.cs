namespace DsaAcademy.Content.Tools;

public class LadderLogicBasicsTool : ITool
{
    public string Id => "ladder-logic-basics";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "plc";
    public string Title => "Ladder Logic: Reading Rungs";
    public string OneLiner => "The visual language PLCs run instead of C# or Python -- contacts and coils wired between two rails, read left to right as \"if these conditions are true, energize this output.\"";
    public string KeyTakeaway =>
        "Series contacts = AND, parallel branches = OR, and a normally-closed contact = NOT -- ladder " +
        "logic is the exact same boolean logic as Logic Gates, just drawn as an electrical circuit " +
        "instead of gate symbols, because it replaced literal relay panels wired the same way.";

    public ToolKind ToolKind => ToolKind.LadderLogicBasics;

    public string Explanation =>
        "A ladder diagram is read like an actual electrical circuit: two vertical rails (power on the " +
        "left, return on the right, by convention), and horizontal \"rungs\" between them, each ending " +
        "in a COIL -- an output (a physical relay, an electrically operated switch, an indicator light, a motor starter, or in the " +
        "PLC's internal logic, just a bit). A rung's coil energizes exactly when there's a complete " +
        "conducting path from the left rail to it, through whatever CONTACTS sit in between -- which is " +
        "precisely how the actual relay panels ladder logic replaced worked, wired with real wires and " +
        "real relay contacts. This app's PLC scan cycle's \"Execute Program\" step (see PLCs: How " +
        "They're Different From a Normal Computer) is running the equivalent of a diagram like this, " +
        "top to bottom, rung by rung, every single scan.\n\n" +
        "Two contacts wired in SERIES (one after another on the same path) both have to be closed for " +
        "current to reach the coil -- that's AND. Two contacts wired in PARALLEL (on separate branches " +
        "that reconverge before the coil) only need ONE of them closed -- that's OR. And a contact can " +
        "be drawn two ways: NORMALLY OPEN (conducts when its input is ON -- the usual case) or " +
        "NORMALLY CLOSED (conducts when its input is OFF, and stops conducting the moment it turns ON " +
        "-- inverted, easy to misread at a glance, and worth double-checking every time) -- that's a " +
        "NOT. All three map directly onto Logic Gates' AND/OR/NOT, just drawn as a circuit instead of " +
        "gate symbols.\n\n" +
        "Toggle the inputs below and watch each coil energize (or not) live, exactly the way flipping a " +
        "physical switch would change current flow through a real relay panel -- or, in a real PLC, " +
        "exactly what the scan cycle's Execute Program step recomputes every single scan from that " +
        "scan's input snapshot.";
}
