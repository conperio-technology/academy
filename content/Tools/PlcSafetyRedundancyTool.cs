namespace DsaAcademy.Content.Tools;

public class PlcSafetyRedundancyTool : ITool
{
    public string Id => "plc-safety-redundancy";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "plc";
    public string Title => "Safety & Redundancy: Designing for What Happens When It Fails";
    public string OneLiner => "Industrial control treats \"what happens when this fails\" as a first-class design question -- not an edge case to handle later, but a property every output and every controller is designed around from the start.";
    public string KeyTakeaway =>
        "\"Fail-safe\" doesn't mean a device's normal state is OFF -- it means the device is " +
        "specifically DESIGNED so that losing power (or losing signal, or losing communication) puts it " +
        "into whichever physical state is actually safe for THAT device, which is sometimes \"stopped\" (a " +
        "conveyor motor needs power to run) and sometimes \"engaged\" (a spring-applied brake clamps on " +
        "when its coil loses power and needs power to release). Both are de-energize-to-safe: power OFF " +
        "is the safe state, even though the safe mechanical state is different.";

    public ToolKind ToolKind => ToolKind.SafetyRedundancy;

    public string Explanation =>
        "A general application crashing usually just means downtime -- annoying, costly, but rarely " +
        "dangerous. A PLC controlling physical machinery losing power, losing its program, or losing " +
        "communication can mean a very different kind of failure: a motor that doesn't stop, a valve " +
        "that doesn't close, a press that doesn't retract. FAIL-SAFE design is the discipline of " +
        "choosing, for every single output, which physical state is actually safe, and then " +
        "wiring/programming that device so power loss (or any other fault) naturally lands it there -- " +
        "not by adding extra code to detect and handle the failure, but because the hardware itself " +
        "defaults there when nothing is driving it.\n\n" +
        "This is why some devices are \"energize to run\" (a conveyor motor -- no power means no " +
        "rotation, which is the safe state) while others are \"energize to RELEASE\" (a fail-safe brake " +
        "-- it's spring-engaged by default and needs power specifically to release, so a power loss " +
        "engages the brake instead of leaving a load free to fall). Same underlying idea -- power loss " +
        "must be safe -- and in both cases power OFF is the safe state; what differs is what \"safe\" " +
        "looks like mechanically: the motor stops, while the brake clamps ON. (The opposite design, " +
        "energize-to-trip, does exist -- some fire-and-gas systems must be powered to act, such as a " +
        "deluge valve driven open on a fire signal -- but because a broken wire or lost supply silently " +
        "disables it, it's chosen deliberately and the circuit is continuously monitored for faults.)\n\n" +
        "REDUNDANCY asks the same question about the controller itself, but for a different goal: " +
        "AVAILABILITY. High-availability systems often run a hot-standby PLC alongside the primary, " +
        "continuously mirroring its state, ready to take over if the primary faults -- because the PLC " +
        "controlling the process is otherwise a single point of failure that stops the whole process. " +
        "The switchover is fast but not instant: it takes a bounded, vendor-specified time (often tens " +
        "of milliseconds, which can be longer than a scan) and is only bumpless within the limits the " +
        "vendor documents. That keeps the process RUNNING; it doesn't make it SAFE. Functions that " +
        "protect people (emergency stops, guard interlocks, overpressure trips) still need an " +
        "independent safety system -- a SIL-rated safety PLC or safety relays -- that works no matter " +
        "what the redundant control PLCs are doing.\n\n" +
        "Toggle system power below to see two differently-wired outputs both land safe despite ending " +
        "up in opposite-looking states (the motor stopped, the brake engaged), then toggle the primary controller's health to see a standby " +
        "take over.";
}
