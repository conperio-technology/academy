namespace DsaAcademy.Content.Tools;

// PLC programming track (lesson). The interactive part is
// client/src/plc/lessons.ts, keyed by this Id.
public class PlcContactsSealInTool : ITool
{
    public string Id => "plc-contacts-seal-in";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "plc programming";
    public int Order => 220;
    public string Title => "Contacts, Coils and the Start/Stop Seal-In";
    public string OneLiner => "Normally open and normally closed contacts, coils, set and reset, and the most important rung in industrial control: the start/stop seal-in, with the stop button wired normally closed so a broken wire stops the machine.";
    public string KeyTakeaway =>
        "A seal-in puts the motor's own contact in parallel with Start and the Stop contact in series with both. The stop button is wired normally closed, so the input is TRUE when healthy and the program uses a normally open contact for it: a broken wire then looks like a pressed Stop.";

    public ToolKind ToolKind => ToolKind.PlcStLesson;

    public string Explanation =>
        "Ladder logic is built from contacts and coils. A contact is a condition on the rung: a normally open " +
        "contact (also called examine if closed) passes power when its bit is TRUE, and a normally closed " +
        "contact (examine if open) passes power when its bit is FALSE. A coil, at the right-hand end of the " +
        "rung, writes the result to a bit: TRUE if power reached it, FALSE if not. The Ladder Logic lesson " +
        "showed contacts in series acting as AND and in parallel as OR." +
        "\n\n" +
        "The most important rung in industrial control is the start/stop seal-in, also called a latching or " +
        "holding circuit. A Start pushbutton is momentary, but the motor has to keep running after it's " +
        "released. So the motor's own output is used as a contact in parallel with Start: once the motor is " +
        "on, it holds itself on. A Stop contact in series with both breaks the rung and drops the motor out. " +
        "Electricians have wired the same circuit with contactors for a century, where it is called " +
        "three-wire control." +
        "\n\n" +
        "The part that confuses everyone at first is the stop button. Stop buttons are wired normally closed, " +
        "so the input is TRUE while all is well and FALSE when the button is pressed, and the program " +
        "therefore uses a normally open contact for it. That's deliberate fail-safe design: a broken wire " +
        "looks exactly like a pressed stop button, so the failure stops the machine instead of silently " +
        "disabling the stop. This lesson shows both wirings with a cut wire side by side, then the same " +
        "circuit written with set and reset coils, and the trade-offs between the two.";
}
