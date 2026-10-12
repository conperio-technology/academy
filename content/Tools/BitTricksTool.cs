namespace DsaAcademy.Content.Tools;

public class BitTricksTool : ITool
{
    public string Id => "bit-manipulation-toolkit";
    public string Section => "Data Structures & Algorithms";
    public string Track => "bits";
    public int Order => 130;

    public string Title => "Bit Manipulation Toolkit: Two's Complement, Masks, Shifts and XOR";
    public string OneLiner => "How integers really look in binary, the handful of operators that work on those bits, the tricks interviews reuse, and where C# and Python behave differently.";
    public string KeyTakeaway =>
        "Learn six moves and most bit problems become short: test bit k with (x >> k) & 1, set it with x | (1 << " +
        "k), clear it with x & ~(1 << k), toggle it with x ^ (1 << k), clear the lowest set bit with x & (x - 1), " +
        "and isolate it with x & -x. XOR cancels pairs (x ^ x = 0). C# ints are fixed 32-bit two's complement; " +
        "Python ints are unbounded, so mask with & 0xFFFFFFFF whenever a problem means 32 bits.";

    public ToolKind ToolKind => ToolKind.BitTricks;

    public string Explanation =>
        "Bits, Bytes & Number Bases (Computer Fundamentals) shows how a byte holds a number. This lesson is the " +
        "interview version: what the operators do, the tricks built from them, and the language differences that " +
        "cause wrong answers.\n\n" +
        "Two's complement is how signed integers are stored. With 8 bits, the top bit is worth -128 instead of " +
        "+128, so 1111 1111 is -128 + 127 = -1 and 1000 0000 is -128. To negate a number, flip every bit and add " +
        "1: -x = ~x + 1. The point of the scheme is that addition doesn't care about signs, so the CPU needs only " +
        "one adder. A C# int is 32 bits in two's complement (-2^31 to 2^31 - 1); a uint is 32 bits all unsigned " +
        "(0 to 2^32 - 1). Python ints have no fixed width: think of a negative Python int as having infinitely " +
        "many 1 bits on the left.\n\n" +
        "The operators, the same symbols in both languages. AND (&) keeps a bit only where both inputs have it; " +
        "OR (|) where either does; XOR (^, exclusive or) where exactly one does; NOT (~) flips every bit, so ~x " +
        "= -x - 1. Left shift (x << k) moves bits up k places, multiplying by 2^k. Right shift (x >> k) moves them " +
        "down, dividing by 2^k and rounding down. A mask is a number whose 1 bits pick out the positions you care " +
        "about: 1 << k is a mask for bit k alone, (1 << k) - 1 for the lowest k bits, and 0xFF for the lowest " +
        "byte.\n\n" +
        "Shifts are where the languages differ most. In C#, >> on a signed int is an arithmetic shift: it copies " +
        "the sign bit in from the left, so -8 >> 1 is -4 and -1 >> 1 is still -1. On a uint, >> is a logical shift " +
        "that brings in zeros, and C# 11 added >>> to do a logical shift on signed types. C# also masks the shift " +
        "count to the type's width, so for an int, 1 << 32 is 1 and 1 << 33 is 2. Python's >> is always " +
        "arithmetic, there is no >>>, and 1 << 32 is simply 4,294,967,296. To get a 32-bit unsigned view of a " +
        "Python int, use x & 0xFFFFFFFF; to turn a 32-bit pattern back into a signed value, subtract 2^32 when " +
        "bit 31 is set. Also, bin(-5) in Python prints -0b101, the sign and magnitude, not the two's complement " +
        "pattern.\n\n" +
        "The tricks. x & (x - 1) clears the lowest set bit (a set bit is a bit that is 1), so x > 0 && (x & (x - " +
        "1)) == 0 means x is a power of two, and repeating it counts the 1 bits. x & -x keeps only the lowest " +
        "set bit, the basis of Fenwick trees. x ^ x = 0 and x ^ 0 = x, so XOR-ing a list cancels every value that " +
        "appears twice. Popcount, the number of 1 bits, is BitOperations.PopCount in C# (System.Numerics) and " +
        "x.bit_count() in Python 3.10+. And an n-bit number can stand for a subset of n items, one bit each, so " +
        "counting from 0 to 2^n - 1 lists every subset.\n\n" +
        "Watch operator precedence: in C# the comparison in x & 1 == 0 binds first and the code doesn't compile; " +
        "in both languages + binds tighter than << and &. When in doubt, add brackets.\n\n" +
        "Try the widgets: a bit playground, the trick table applied to any number, the XOR cancellation, and " +
        "subsets as bitmasks.";
}
