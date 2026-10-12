namespace DsaAcademy.Content.Tools;

public class EndiannessTool : ITool
{
    public string Id => "endianness";
    public string Section => "Computer Fundamentals";
    public string Track => "number-systems";
    public string Title => "Byte Order: Little vs Big Endian";
    public string OneLiner => "The same multi-byte number gets stored in opposite byte order depending on the machine -- and mixing them up is a real, recurring bug.";
    public string KeyTakeaway =>
        "Big-endian stores the most-significant byte (the one holding the largest place values, like the 1 in 1,000) FIRST (left to right, the way you'd write the " +
        "number by hand). Little-endian stores the least-significant byte first. Almost all consumer hardware " +
        "(x86, the processor family in most PCs and servers, and ARM, the family in phones, in the mode they normally run) is little-endian; network protocols " +
        "are traditionally big-endian (\"network byte order\"), which is exactly why translating " +
        "between the two shows up constantly at that boundary.";

    public ToolKind ToolKind => ToolKind.Endianness;

    public string Explanation =>
        "A single byte has no order to worry about -- endianness only matters once a value takes up " +
        "MORE than one byte in memory, like a 32-bit integer or float. Take the number 0x12345678: " +
        "conceptually it's four bytes, 0x12 (most significant) through 0x78 (least significant). " +
        "Memory is a long row of bytes, each with a numbered position called its address. Big-endian memory stores them in that same reading order: address 0 holds 0x12, address 1 " +
        "holds 0x34, and so on -- \"big end first.\" Little-endian memory stores them backwards: " +
        "address 0 holds 0x78 (the LEAST significant byte), address 3 holds 0x12 -- \"little end " +
        "first.\" Neither is \"more correct\"; it's a hardware/format convention, and the two are only " +
        "compatible if whoever reads the bytes back knows which order they were written in. This is " +
        "the exact bug that broke this app's Floating Point calculator during development: the code " +
        "wrote a float32's bytes in the browser's native order (little-endian) but read them back " +
        "assuming big-endian, silently scrambling every value -- a positive number came out reading " +
        "as negative. Toggle the value below and watch the same four bytes land in opposite memory " +
        "positions depending on which ordering you pick.";
}
