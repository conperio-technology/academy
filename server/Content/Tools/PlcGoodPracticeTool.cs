namespace DsaAcademy.Content.Tools;

// PLC programming track (lesson). The interactive part is
// client/src/plc/lessons.ts, keyed by this Id.
public class PlcGoodPracticeTool : ITool
{
    public string Id => "plc-good-practice";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "plc programming";
    public int Order => 280;
    public string Title => "Good Practice: Naming, Interlocks, Fail-Safe Design and Safety Limits";
    public string OneLiner => "Habits that make PLC programs safe to run and easy to fix: clear names and comments, one place per output, interlocks, fail-safe wiring and defaults, testing, and why safety functions belong in safety-rated hardware, not a standard program.";
    public string KeyTakeaway =>
        "Name signals for what they mean, write each output once, interlock anything that must never happen together, make every failure land safe, and never rely on a standard PLC program for a function that protects people: that needs a safety relay or safety PLC.";

    public ToolKind ToolKind => ToolKind.PlcStLesson;

    public string Explanation =>
        "Code that works is only the start. PLC programs run machines for decades and get read by an " +
        "electrician in the middle of the night with the line stopped, so they need to be obvious. That means " +
        "names that say what a signal is (Tank1_HighLevel, not I_0_3), comments that say why, each output " +
        "written in exactly one place, sequences written as state machines, and the physical I/O mapped to " +
        "named variables in one spot so a rewired sensor touches one line." +
        "\n\n" +
        "Interlocks and fail-safe design come next. An interlock is a condition that must be true before " +
        "something may happen, such as a reverse contactor that can't close while forward is on. Fail-safe " +
        "design means choosing, for every signal and output, what happens when a wire breaks or power is " +
        "lost, and making that outcome safe: stop buttons wired normally closed, motors that stop when their " +
        "output turns off, analog signals checked for wire break, and nothing that restarts by itself when " +
        "power returns or a fault is reset." +
        "\n\n" +
        "Finally, there is a line a standard PLC must not cross. Emergency stops, guard interlocks, light " +
        "curtains and two-hand controls protect people, and those functions are built with safety-rated " +
        "equipment (a safety relay or a safety PLC) designed to the machinery safety standards, so they still " +
        "work when the ordinary control system fails. The Safety & Redundancy lesson covers the fail-safe " +
        "idea in general; this one shows where your program's responsibility ends.";
}
