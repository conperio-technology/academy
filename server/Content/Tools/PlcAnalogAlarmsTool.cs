namespace DsaAcademy.Content.Tools;

// PLC programming track (lesson). The interactive part is
// client/src/plc/lessons.ts, keyed by this Id.
public class PlcAnalogAlarmsTool : ITool
{
    public string Id => "plc-analog-alarms";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "plc programming";
    public int Order => 270;
    public string Title => "Analog Scaling and Alarms with Deadband";
    public string OneLiner => "Turning raw analog counts into engineering units without integer-division bugs, catching a broken 4 to 20 mA loop, and alarms and pump control that don't chatter, using deadband, hysteresis and on-delays.";
    public string KeyTakeaway =>
        "Scale with REAL arithmetic (convert first), clamp slightly out-of-range values, and treat a signal far below 4 mA as a fault, not a reading. Give alarms a deadband or an on-delay, and on/off control two switching points, so a noisy signal can't make them chatter.";

    public ToolKind ToolKind => ToolKind.PlcStLesson;

    public string Explanation =>
        "An analog input card turns a continuous signal, most often a 4 to 20 mA current loop or a 0 to 10 V " +
        "voltage, into an integer called raw counts. The Digital vs. Analog I/O lesson explained the signal; " +
        "this lesson is about turning counts into something useful in the program: engineering units, such as " +
        "bar or degrees, and alarms." +
        "\n\n" +
        "Scaling is a straight-line conversion between two ranges. The two details that cause most bugs are " +
        "integer division (in ST, 13824 / 27648 is 0, so convert to REAL before dividing) and what to do when " +
        "the signal is outside its range. Slightly under or over range is usually clamped, while far below 4 " +
        "mA means a broken wire or a failed transmitter, which should raise a fault rather than pass a " +
        "meaningless number on." +
        "\n\n" +
        "Alarms compare a value against a limit. A plain comparison chatters, switching on and off many times " +
        "a second when the value hovers near the limit. A deadband fixes that: the alarm turns on at one " +
        "level and turns off only after the value has moved back past a second level. The same idea in " +
        "control is called hysteresis, as in a pump that starts at 20 % and stops at 80 %. An on-delay timer " +
        "is the other common cure: alarm only if the condition lasts.";
}
