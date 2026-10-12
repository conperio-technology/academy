namespace DsaAcademy.Content.Tools;

// Micro850 labs track: a hands-on lab on a real Micro850 in Connected Components
// Workbench. The steps, wiring and checklist are in client/src/plc/micro850Labs.ts,
// keyed by this Id.
public class M850ModbusTcpTool : ITool
{
    public string Id => "m850-modbus-tcp";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "micro850 labs";
    public int Order => 345;
    public string Title => "Lab 9: Reading the Micro850 over Modbus TCP";
    public string OneLiner => "Use the Micro850 as a Modbus TCP server: map variables to Modbus addresses in CCW and read a coil, a register and a REAL from a PC with a short pymodbus script.";
    public string KeyTakeaway =>
        "Modbus addresses in CCW start at 000001 and 400001, but on the wire the first one is address 0. A REAL takes two registers. Modbus has no authentication, so expose only what you mean to, and keep the bench network separate.";

    public ToolKind ToolKind => ToolKind.PlcMicro850Lab;

    public string Explanation =>
        "Modbus TCP is the simple, widely supported protocol from the industrial networking lesson, carried over Ethernet on TCP port 502. A client (here, your PC) reads and writes numbered coils and registers on a server (here, the Micro850)." +
        "\n\n" +
        "A Micro850 has no fixed memory addresses, only named variables, so CCW has a Modbus mapping table where you assign each variable a Modbus address. You will map a BOOL, an INT and a REAL, read them with a short Python script using the pymodbus library, and meet the two classic traps: off-by-one addresses and word order.";
}
