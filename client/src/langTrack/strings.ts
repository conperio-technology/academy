import { src, type LangLessonData } from "./types.ts";

export const strings: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "Length and indexing",
      csharp: src`
string s = "Hello, world";
Console.WriteLine(s.Length);            // 12
Console.WriteLine(s[0]);                // H: positions start at 0
Console.WriteLine(s[s.Length - 1]);     // d: the last character
Console.WriteLine(s[^1]);               // d: ^1 means "1 from the end"
`,
      python: src`
s = "Hello, world"
print(len(s))           # 12
print(s[0])             # H: positions start at 0
print(s[len(s) - 1])    # d: the last character
print(s[-1])            # d: negative positions count from the end
`,
      notes: [
        "A string is a sequence of characters, and each character has a position called its index. Indexes start at 0, so the last one is the length minus 1. Asking for a position that doesn't exist fails: `IndexOutOfRangeException` in C#, `IndexError` in Python.",
        "Counting from the end: C# writes `s[^1]` (the hat means \"from the end\"), Python writes `s[-1]`. In C#, `s[0]` gives a `char`; in Python it gives a string of length 1.",
      ],
    },
    {
      kind: "code",
      title: "Slicing: taking part of a string",
      csharp: src`
string s = "Hello, world";
Console.WriteLine(s.Substring(0, 5));   // Hello: start 0, LENGTH 5
Console.WriteLine(s.Substring(7));      // world: from 7 to the end
Console.WriteLine(s[0..5]);             // Hello: range, end not included
Console.WriteLine(s[7..]);              // world
Console.WriteLine(s[^5..]);             // world: the last 5
Console.WriteLine(new string(s.Reverse().ToArray()));  // dlrow ,olleH
`,
      python: src`
s = "Hello, world"
print(s[0:5])           # Hello: start 0, end 5 (not included)
print(s[7:])            # world: from 7 to the end
print(s[:5])            # Hello: from the start
print(s[-5:])           # world: the last 5
print(s[::2])           # Hlo ol: every second character
print(s[::-1])          # dlrow ,olleH: step -1 reverses
`,
      notes: [
        "Python slices are `s[start:end:step]`: start is included, end is not, any part can be left out, and the step can be negative. C# has two tools. `Substring(start, length)` takes a length, not an end position, which is a classic source of off-by-one bugs. Ranges, `s[start..end]`, work like Python's (end not included) and can count from the end with `^`.",
        "Out-of-range slices behave differently. Python quietly clamps them: `\"Hello\"[2:100]` is \"llo\" and `\"Hello\"[10:]` is an empty string. C#'s `Substring` and ranges throw `ArgumentOutOfRangeException` if you go past the end.",
        "Reversing: Python's `s[::-1]` is the idiom. C# has no string reverse method; `new string(s.Reverse().ToArray())` uses LINQ, or put the characters in an array and call `Array.Reverse`.",
      ],
    },
    {
      kind: "code",
      title: "Strings are immutable",
      csharp: src`
string s = "hello";
s[0] = 'H';   // error CS0200: string.this[int] is read only
`,
      python: src`
s = "hello"
s[0] = "H"    # TypeError: 'str' object does not support item assignment
`,
      notes: [
        "Immutable means it can't be changed after it's created. Neither language lets you change a character inside a string. Methods that seem to change a string, such as `ToUpper()` or `.upper()`, `Trim()` or `.strip()`, `Replace` or `.replace`, return a new string and leave the original alone. To keep the result, assign it: `s = s.ToUpper();` or `s = s.upper()`.",
        "To edit characters one by one, copy the string into something mutable (changeable), edit that, and turn it back: a `char[]` or a `StringBuilder` in C#, a list of characters in Python, then `\"\".join(chars)`.",
      ],
      expectError: { csharp: "CS0200", python: "TypeError" },
    },
    {
      kind: "code",
      title: "Building strings with values in them",
      csharp: src`
string name = "Ada";
int items = 3;
double price = 4.5;
Console.WriteLine($"{name} bought {items} items for {price * items:F2}");
Console.WriteLine("Total: " + (price * items));   // + also joins
Console.WriteLine($"[{items,4}] [{items,-4}] [{1234567:N0}]");
Console.WriteLine($"{{braces}} and a tab:\tdone");
Console.WriteLine(@"C:\temp\new");   // @ = verbatim: backslashes are literal
`,
      python: src`
name = "Ada"
items = 3
price = 4.5
print(f"{name} bought {items} items for {price * items:.2f}")
print("Total: " + str(price * items))   # + needs two strings
print(f"[{items:>4}] [{items:<4}] [{1234567:,}]")
print(f"{{braces}} and a tab:\tdone")
print(r"C:\temp\new")   # r = raw: backslashes are literal
`,
      notes: [
        "String interpolation means writing values straight into a string: `$\"...{expr}...\"` in C#, `f\"...{expr}...\"` in Python (an f-string). After the value you can add a format: `F2` or `.2f` for two decimal places, a width to pad to (`{x,4}` or `{x:>4}` right-aligns in 4 characters; `-4` or `<4` left-aligns), `N0` or `,` for thousands separators. Double the braces to print a literal brace.",
        "Escape sequences start with a backslash: `\\n` is a new line, `\\t` a tab, `\\\\` a backslash, `\\\"` a double quote. To write Windows paths or regular expressions without doubling every backslash, use a verbatim string `@\"...\"` in C# or a raw string `r\"...\"` in Python.",
        "`N0` uses the computer's regional settings (a comma in the US, a dot or a space elsewhere); Python's `,` is always a comma.",
      ],
    },
    {
      kind: "code",
      title: "Everyday methods",
      csharp: src`
string line = "  Pump 3, Pump 7, Valve 2  ";
string t = line.Trim();                       // remove outer spaces
Console.WriteLine(t.ToUpper());               // PUMP 3, PUMP 7, VALVE 2
Console.WriteLine(t.Contains("Valve"));       // True
Console.WriteLine(t.StartsWith("Pump"));      // True
Console.WriteLine(t.IndexOf("Pump 7"));       // 8 (-1 if missing)
Console.WriteLine(t.Replace("Pump", "P"));    // P 3, P 7, Valve 2
string[] parts = t.Split(", ");
Console.WriteLine(parts.Length);              // 3
Console.WriteLine(string.Join(" | ", parts)); // Pump 3 | Pump 7 | Valve 2
Console.WriteLine("a  b c".Split(' ', StringSplitOptions.RemoveEmptyEntries).Length);  // 3
Console.WriteLine(string.Equals("OK", "ok", StringComparison.OrdinalIgnoreCase));      // True
`,
      python: src`
line = "  Pump 3, Pump 7, Valve 2  "
t = line.strip()                     # remove outer spaces
print(t.upper())                     # PUMP 3, PUMP 7, VALVE 2
print("Valve" in t)                  # True
print(t.startswith("Pump"))          # True
print(t.find("Pump 7"))              # 8 (-1 if missing; .index() raises)
print(t.replace("Pump", "P"))        # P 3, P 7, Valve 2
parts = t.split(", ")
print(len(parts))                    # 3
print(" | ".join(parts))             # Pump 3 | Pump 7 | Valve 2
print(len("a  b c".split()))         # 3: no argument splits on runs of spaces
print("OK".lower() == "ok".lower())  # True
`,
      notes: [
        "Splitting turns one string into a list of pieces; joining glues a list back together with a separator between. Note the join is spelled differently: C# calls a static method on the string type, `string.Join(sep, items)`, while Python calls the method on the separator, `sep.join(items)`.",
        "Python's `split()` with no argument splits on any run of whitespace and drops empty pieces, perfect for words. `split(\",\")` with an argument keeps empty pieces, as does C#'s `Split(',')` unless you pass `StringSplitOptions.RemoveEmptyEntries`.",
        "Comparing text: `==` compares the characters in both languages (unlike Java). For case-insensitive comparison C# has `StringComparison.OrdinalIgnoreCase`; Python lowercases both sides, or uses `casefold()` for international text.",
      ],
    },
    {
      kind: "code",
      title: "Characters and building a string piece by piece",
      csharp: src`
using System.Text;

string word = "a1b2c3";
var letters = new StringBuilder();
int digitSum = 0;
foreach (char c in word)
{
    if (char.IsDigit(c)) digitSum += c - '0';   // '7' - '0' is 7
    else letters.Append(char.ToUpper(c));
}
Console.WriteLine(letters.ToString());   // ABC
Console.WriteLine(digitSum);             // 6
Console.WriteLine((int)'A');             // 65: the character's code
Console.WriteLine((char)97);             // a
`,
      python: src`
word = "a1b2c3"
letters = []
digit_sum = 0
for c in word:
    if c.isdigit():
        digit_sum += int(c)
    else:
        letters.append(c.upper())
print("".join(letters))   # ABC
print(digit_sum)          # 6
print(ord("A"))           # 65: the character's code
print(chr(97))            # a
`,
      notes: [
        "Because strings are immutable, `result = result + piece` inside a loop builds a brand new string every time, copying everything so far. For n pieces that's roughly n squared character copies. C#'s fix is `StringBuilder`, a growable buffer you `Append` to and turn into a string once at the end. Python's idiom is to collect pieces in a list and call `\"\".join(pieces)` once.",
        "Each character has a number, its code (65 for 'A', 97 for 'a'). C# converts with a cast, `(int)c` and `(char)n`; Python uses `ord(c)` and `chr(n)`. Subtracting `'0'` from a digit character is the classic C# way to get its value; in Python call `int(c)`. The Text Encoding lesson explains where these numbers come from.",
      ],
    },
  ],
  predict: [
    {
      lang: "python",
      code: src`
s = "hello"
print(s[1:3], s[-1], s[::-1])
`,
      output: "el o olleh",
      distractors: ["ell o olleh", "el h olleh", "ell h hello"],
      why: "`s[1:3]` takes positions 1 and 2 (the end, 3, is not included): \"el\". `s[-1]` is the last character, \"o\". `s[::-1]` steps backwards through the whole string.",
    },
    {
      lang: "csharp",
      code: src`
string s = "hello";
Console.WriteLine(s.Substring(1, 3));
Console.WriteLine(s[1..3]);
`,
      output: "ell\nel",
      distractors: ["el\nel", "ell\nell", "el\nell"],
      why: "`Substring(1, 3)` means start at 1 and take 3 characters: \"ell\". The range `1..3` means positions 1 up to but not including 3: \"el\". Same numbers, different meanings.",
    },
    {
      lang: "csharp",
      code: src`
string s = "  Hi  ";
s.Trim();
Console.WriteLine($"[{s}]");
`,
      output: "[  Hi  ]",
      distractors: ["[Hi]", "[Hi  ]", "[  Hi]"],
      why: "Strings are immutable. `Trim()` returns a new, trimmed string, and this code throws it away. Write `s = s.Trim();` to keep it. The same mistake in Python: calling `s.strip()` without assigning the result.",
    },
    {
      lang: "python",
      code: src`
print("a,b,,c".split(","))
print("a  b c".split())
`,
      output: "['a', 'b', '', 'c']\n['a', 'b', 'c']",
      distractors: ["['a', 'b', 'c']\n['a', 'b', 'c']", "['a', 'b', '', 'c']\n['a', '', 'b', 'c']", "['a', 'b', ',', 'c']\n['a', 'b', 'c']"],
      why: "With a separator, `split` keeps the empty piece between the two commas. With no argument it splits on runs of whitespace and never produces empty pieces.",
    },
    {
      lang: "python",
      code: src`
print(repr("Hello"[10:]))
print("Hello"[1:100])
`,
      output: "''\nello",
      distractors: ["IndexError", "None\nello", "''\nIndexError"],
      why: "Slices never raise an error in Python: a start past the end gives an empty string, and an end past the end is clamped to the length. Indexing a single position, like `\"Hello\"[10]`, would raise `IndexError`.",
    },
    {
      lang: "csharp",
      code: src`
Console.WriteLine('a' + 'b');
Console.WriteLine("" + 'a' + 'b');
`,
      output: "195\nab",
      distractors: ["ab\nab", "195\n195", "a b\nab"],
      why: "Two chars are numbers to C# (97 and 98), so `'a' + 'b'` adds them: 195. Starting with a string makes every `+` a join instead.",
    },
    {
      lang: "python",
      code: src`
print("apple" < "banana", "Zebra" < "apple")
`,
      output: "True True",
      distractors: ["True False", "False False", "TypeError"],
      why: "Strings compare character by character by their codes. 'a' comes before 'b'. Every uppercase letter (65 to 90) comes before every lowercase letter (97 to 122), so \"Zebra\" sorts before \"apple\". C#'s `string.CompareOrdinal` gives the same order; its default `CompareTo` uses culture rules instead.",
    },
    {
      lang: "csharp",
      code: src`
Console.WriteLine($"{3.14159:F2}|{42,5}|{42,-5}|");
`,
      output: "3.14|   42|42   |",
      distractors: ["3.14159|42|42|", "3.14|42   |   42|", "3.1|   42|42   |"],
      why: "`F2` means two decimal places. `,5` pads to 5 characters aligned right; `,-5` aligns left. Python's version is `f\"{3.14159:.2f}|{42:>5}|{42:<5}|\"`.",
    },
    {
      lang: "python",
      code: src`
parts = ["2026", "10", "10"]
print("-".join(parts))
print(len("-".join(parts)))
`,
      output: "2026-10-10\n10",
      distractors: ["2026-10-10-\n11", "['2026', '10', '10']\n3", "2026-10-10\n8"],
      why: "`join` puts the separator only between pieces, never at the end: 4 + 1 + 2 + 1 + 2 = 10 characters.",
    },
  ],
  pitfalls: [
    "Calling a string method and ignoring the result. `s.Trim();` or `s.upper()` on its own line does nothing useful.",
    "Reading C#'s `Substring(start, length)` as if the second number were an end position.",
    "Joining strings with `+` in a loop over many pieces. Use `StringBuilder` (C#) or a list plus `\"\".join` (Python).",
    "Using culture-sensitive operations on data. `ToUpper()`, `double.Parse` and `N0` formatting follow the computer's regional settings; for file formats and IDs use `ToUpperInvariant()`, `CultureInfo.InvariantCulture` and ordinal comparisons.",
    "Assuming one character is one letter on screen. Emoji and some accented letters take two C# chars (or more code points). The Text Encoding lesson covers why.",
  ],
  next: [
    { id: "text-encoding", label: "Text Encoding: ASCII, Unicode and UTF-8 (Computer Fundamentals)" },
    { id: "basics-count-vowels", label: "Exercise: Count the Vowels" },
    { id: "basics-reverse-words", label: "Exercise: Reverse the Words" },
    { id: "lang-conditionals", label: "Next: Conditionals and Boolean Logic" },
  ],
};
