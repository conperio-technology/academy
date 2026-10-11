namespace DsaAcademy.Content.Tools;

public class FloatingPointTool : ITool
{
    public string Id => "floating-point-representation";
    public string Section => "Computer Fundamentals";
    public string Track => "number-systems";
    public string Title => "Floating Point: IEEE-754";
    public string OneLiner => "A number like 3.5 is stored as three fields of bits, a sign, an exponent and a mantissa, which is exactly why 0.1 + 0.2 isn't 0.3.";
    public string KeyTakeaway =>
        "Floats trade exactness for range. The mantissa (the stored significant digits) has a fixed number " +
        "of bits, so most decimal fractions, 0.1 included, can't be represented exactly in binary. They're " +
        "stored as the closest value that fits, the same way 1/3 can't be written exactly in decimal.";

    public ToolKind ToolKind => ToolKind.FloatCalculator;

    public string Explanation =>
        "Floating point is scientific notation in base 2. In decimal you can write 6,020 as 6.02 x 10^3: a " +
        "sign (+ or -), the significant digits (6.02, called the significand or mantissa) and an exponent (3) " +
        "that says how far to slide the decimal point. Sliding the point is what lets the same few digits " +
        "describe both tiny and huge numbers, and it's where the name \"floating point\" comes from. A computer " +
        "does the same with binary digits and powers of 2: 6.5 is 110.1 in binary, which is 1.101 x 2^2 " +
        "(binary 1.101 is 1 + 1/2 + 1/8 = 1.625, and 1.625 x 4 = 6.5).\n\n" +
        "A 32-bit float (C#'s `float`) splits its 32 bits into three fields. The sign is 1 bit: 0 means " +
        "positive, 1 means negative. The exponent is 8 bits, stored with a bias of 127: instead of using a " +
        "separate sign for negative exponents, the format adds 127 before storing, so a stored 127 means 2^0, " +
        "130 means 2^3 and 120 means 2^-7. That keeps the stored exponent a plain non-negative number, which " +
        "also makes floats quick to compare. The mantissa is the remaining 23 bits and holds the digits after " +
        "the binary point. Every nonzero binary number can be shifted until it starts with 1 (the way 0.00602 " +
        "becomes 6.02 x 10^-3), so that leading 1 is always there and isn't stored at all. This implicit leading " +
        "1 gives 24 bits of precision for the price of 23.\n\n" +
        "Put together, value = (-1)^sign x 1.mantissa x 2^(stored exponent - 127). For 6.5 that's sign 0, " +
        "stored exponent 2 + 127 = 129 (10000001), and mantissa 101 followed by twenty 0s. Two stored exponents " +
        "are reserved: all 0s means zero, or a tiny \"subnormal\" number that has no implicit 1, and all 1s " +
        "means infinity or NaN (\"not a number\", the result of something like 0/0). C#'s `double` and Python's " +
        "`float` use the same layout in 64 bits: 1 sign bit, 11 exponent bits (bias 1023) and 52 mantissa bits.\n\n" +
        "The practical consequence: 24 bits of significand give roughly 7 decimal digits of precision (a " +
        "double's 53 give about 15 to 16), and numbers that look simple in decimal are usually NOT exact in " +
        "binary. 0.1 is 1/10, and because 10 isn't a power of 2 its binary expansion repeats forever " +
        "(0.000110011001100...), the way 1/3 is 0.333... in decimal. The stored value is the nearest one that " +
        "fits. That's why floating point equality checks (`a == b`) are a classic bug source, why 0.1 + 0.2 " +
        "prints 0.30000000000000004 with doubles in both C# and Python, and why money is usually stored as " +
        "whole cents or in C#'s `decimal` type. Type a number below to see its three fields and the value that " +
        "actually gets stored.";
}
