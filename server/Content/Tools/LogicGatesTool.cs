namespace DsaAcademy.Content.Tools;

public class LogicGatesTool : ITool
{
    public string Id => "logic-gates";
    public string Section => "Computer Fundamentals";
    public string Track => "hardware";
    public string Title => "Logic Gates: AND, OR, XOR & Friends";
    public string OneLiner => "Every computation a CPU does eventually reduces to these tiny truth-table circuits, wired together by the billions.";
    public string KeyTakeaway =>
        "A transistor is just an electronic switch; wire a handful of them together in a specific " +
        "pattern and you get a logic gate that implements one rule of Boolean logic (true/false logic, named after the mathematician George Boole) (AND, OR, NOT, " +
        "XOR, ...). Wire enough gates together and you get an adder, then an ALU (the arithmetic logic unit, the part of the CPU that does the math), then a CPU -- there's " +
        "no magic step in between arithmetic and \"a bunch of switches,\" just more of the same pattern.";

    public ToolKind ToolKind => ToolKind.LogicGates;

    public string Explanation =>
        "Zoom all the way into a CPU and every wire is either high voltage or low voltage -- true or " +
        "false, 1 or 0. A logic gate is a tiny circuit (built from a handful of transistors) that " +
        "takes one or two of those true/false inputs and produces a true/false output according to a " +
        "fixed rule: AND is true only if both inputs are true; OR is true if either is; NOT flips a " +
        "single input; XOR (\"exclusive or\") is true only if the inputs DISAGREE, which makes it the " +
        "gate behind binary addition (adding two bits without a carry is exactly XOR) and behind " +
        "detecting \"did this bit flip\" in error-checking and cryptography. NAND and NOR are AND/OR " +
        "with the output flipped -- and NAND in particular is special: every other gate (including " +
        "AND, OR, and NOT) can be built out of nothing but NAND gates, so in principle a whole chip " +
        "could be built from NAND alone, and NAND is one of the cheapest, most common cells in CMOS logic. Chain gates together and you get " +
        "bigger behavior for free: a \"half adder\" (add two bits, produce a sum bit and a carry bit) " +
        "is just one XOR gate and one AND gate; combine two half adders (plus an OR gate) into a " +
        "\"full adder\" that also accepts a carry-in, and chain eight full adders to add two whole bytes. This is the actual bridge between \"physics\" and \"software\": there is no separate " +
        "layer where numbers or logic get invented -- it's gates, all the way up.";
}
