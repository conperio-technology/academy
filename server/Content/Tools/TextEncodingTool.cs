namespace DsaAcademy.Content.Tools;

public class TextEncodingTool : ITool
{
    public string Id => "text-encoding";
    public string Section => "Computer Fundamentals";
    public string Track => "operating systems and runtimes";
    public string Title => "Text Encoding: ASCII, Unicode, UTF-8 and UTF-16";
    public string OneLiner => "Characters are numbers called code points, encodings turn them into bytes, and that is why \"string length\" has three different answers.";
    public string KeyTakeaway =>
        "Unicode assigns every character a code point, a number from U+0000 to U+10FFFF. An encoding turns code points " +
        "into bytes: UTF-8 uses 1 to 4 bytes and keeps ASCII unchanged, UTF-16 uses one or two 16-bit code units. C#, " +
        "Java and JavaScript strings are UTF-16, so Length counts code units: \"👍\".Length is 2. What a user sees as one " +
        "character (a grapheme cluster) can be several code points, so reversing or truncating a string by index can " +
        "split an emoji or detach an accent.";

    public ToolKind ToolKind => ToolKind.TextEncoding;

    public string Explanation =>
        "ASCII (1963) maps 128 characters to the numbers 0 to 127: English letters, digits, punctuation and control " +
        "codes such as newline (10). It fits in 7 bits. Dozens of incompatible 8-bit code pages then used the values 128 " +
        "to 255 for other alphabets, which is where garbled text like \"Ã©\" comes from: bytes written in one encoding " +
        "and read in another.\n\n" +
        "Unicode fixes the numbering for every writing system at once. Each character gets a code point, written " +
        "U+ and at least four hex digits: A is U+0041, é is U+00E9, 日 is U+65E5, 👍 is U+1F44D. The range runs to " +
        "U+10FFFF, about 1.1 million values. The first 65,536 form the Basic Multilingual Plane (BMP), which covers most " +
        "living scripts; emoji and many historic scripts live above it. Unicode alone is just numbering; an encoding " +
        "decides the bytes.\n\n" +
        "UTF-8 is variable length. Code points up to U+007F take one byte, 0xxxxxxx, identical to ASCII. Up to U+07FF " +
        "take two bytes, 110xxxxx 10xxxxxx; up to U+FFFF take three, 1110xxxx then two continuation bytes; the rest take " +
        "four, 11110xxx then three. The leading bits tell a decoder how long each sequence is, and continuation bytes " +
        "always start 10, so a decoder dropped into the middle of a stream can find the next character. ASCII text is " +
        "already valid UTF-8, no byte of a multi-byte character can be mistaken for an ASCII character such as / or a " +
        "NUL, and there's no byte order to worry about. That's why UTF-8 is the encoding of the web, Linux and most " +
        "files and APIs.\n\n" +
        "UTF-16 uses 16-bit code units. A BMP code point is one unit. A code point above U+FFFF becomes a surrogate " +
        "pair: subtract 0x10000, put the top 10 bits in a high surrogate (0xD800 to 0xDBFF) and the low 10 bits in a low " +
        "surrogate (0xDC00 to 0xDFFF). Those values are reserved, so they never stand for characters on their own. As " +
        "bytes, UTF-16 needs a byte order: UTF-16LE writes the low byte first, and a byte order mark (U+FEFF) at the " +
        "start can say which. Windows, Java and JavaScript chose 16-bit characters in the early 1990s, when Unicode " +
        "still fit in 16 bits, and .NET followed Windows; that's why their strings are UTF-16 today.\n\n" +
        "So a string has at least three lengths. In C#, s.Length counts UTF-16 code units. Python 3's len(s) counts code " +
        "points. Users count grapheme clusters, the things they see as one character: e followed by a combining acute " +
        "accent (U+0301) is two code points shown as one é, and a family emoji is several emoji joined by zero-width " +
        "joiners. In C#, StringInfo.LengthInTextElements counts graphemes and the Rune type steps through code points; " +
        "Encoding.UTF8.GetByteCount gives the byte length that a database column or network buffer cares about.\n\n" +
        "Reversal shows why this matters. Reversing a C# char array swaps the two halves of a surrogate pair, leaving " +
        "invalid lone surrogates. Reversing by code points keeps the emoji but moves a combining accent onto the wrong " +
        "letter and pulls apart joined emoji. The correct answer is to reverse grapheme clusters. Also note that é can be " +
        "one code point (U+00E9) or two (e plus U+0301): they look identical but compare unequal ordinally (code point by " +
        "code point) until you normalize both with string.Normalize() (NFC). For how multi-byte numbers are ordered in memory, see Byte Order.";
}
