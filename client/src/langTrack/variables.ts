import { src, type LangLessonData } from "./types.ts";

export const variables: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "Declaring variables",
      csharp: src`
int age = 42;            // whole number
double price = 19.99;    // number with a fractional part
bool isOn = true;        // true or false
string name = "Ada";     // text
char grade = 'A';        // exactly one character, single quotes
var count = 10;          // var: the compiler works out the type (int)
const double Pi = 3.14159;  // a constant can never be reassigned

Console.WriteLine($"{name} is {age}, grade {grade}, on: {isOn}");
Console.WriteLine(count.GetType());
`,
      python: src`
age = 42            # int
price = 19.99       # float
is_on = True        # bool: capital T and F
name = "Ada"        # str
grade = "A"         # no separate char type: a 1-letter str
count = 10
PI = 3.14159        # a constant by convention only (capitals)

print(f"{name} is {age}, grade {grade}, on: {is_on}")
print(type(count))
`,
      notes: [
        "A variable is a name for a value. Declaring it means introducing the name. In C# you declare it with its type (`int age`), and from then on `age` can only hold whole numbers. `var` doesn't change that: it asks the compiler to work out the type from the value, and the type is still fixed. In Python there's no declaration at all: assigning a value creates the name.",
        "C# prints `Ada is 42, grade A, on: True` and `System.Int32` (int is a short name for the .NET type `System.Int32`). Python prints the same first line and `<class 'int'>`. Notice C# prints the bool as `True` with a capital letter even though you write `true` in code.",
        "Naming: C# uses camelCase for local variables (`isOn`) and PascalCase for types, methods and constants (`Pi`). Python uses snake_case (`is_on`) and CAPITALS for constants. Python has no real constants: `PI` can be reassigned; the capitals just say \"please don't\".",
      ],
    },
    {
      kind: "table",
      title: "The basic types side by side",
      head: ["Holds", "C#", "Python", "Notes"],
      rows: [
        ["Whole numbers", "`int` (32 bits), `long` (64 bits)", "`int`", "C# `int` is about plus or minus 2.1 billion and wraps around when it overflows; `long` is about 9.2 quintillion. A Python int has no size limit."],
        ["Fractional numbers (binary)", "`double` (64 bits), `float` (32 bits)", "`float`", "Python's float is the same as C#'s double: about 15 to 17 significant digits, stored in binary, so 0.1 is not exact. C# float has about 7 digits and needs an `f` suffix: `1.5f`."],
        ["Exact decimal numbers", "`decimal` (128 bits)", "`decimal.Decimal`", "Stores base 10 digits exactly: use it for money. C# literals take an `m` suffix: `19.99m`. In Python import it and build from a string: `Decimal(\"19.99\")`."],
        ["True or false", "`bool`: `true`, `false`", "`bool`: `True`, `False`", "Python bools are a kind of int (`True + True` is 2); C# keeps bool separate from numbers."],
        ["Text", "`string`", "`str`", "Both are immutable: you can't change a string in place, only build a new one."],
        ["One character", "`char`: `'A'`", "(none)", "Python uses a string of length 1. A C# char is a number underneath, a UTF-16 code unit."],
        ["No value", "`null`", "`None`", "See \"null and None\" below."],
      ],
    },
    {
      kind: "code",
      title: "Integer division and modulo: the classic surprise",
      csharp: src`
Console.WriteLine(7 / 2);     // 3: int / int is int, the fraction is dropped
Console.WriteLine(7 / 2.0);   // 3.5: one double makes it double division
Console.WriteLine(7 % 3);     // 1: remainder
Console.WriteLine(-7 / 2);    // -3: rounds toward zero
Console.WriteLine(-7 % 3);    // -1: takes the sign of the left side
`,
      python: src`
print(7 / 2)     # 3.5: / is always true division
print(7 // 2)    # 3: // is floor division
print(7 % 3)     # 1
print(-7 // 2)   # -4: floors, toward minus infinity
print(-7 % 3)    # 2: takes the sign of the right side
`,
      notes: [
        "In C#, dividing two ints gives an int and throws away the fractional part. To get 3.5 at least one side must be a double: `7 / 2.0` or `(double)a / b`. Python's `/` always gives a float (3.5); use `//` when you want whole-number division.",
        "Negative numbers differ. C# truncates toward zero, so `-7 / 2` is -3 and `-7 % 3` is -1. Python floors (rounds down), so `-7 // 2` is -4 and `-7 % 3` is 2. Python's rule means `n % k` is never negative when k is positive, which is handy for wrapping an index around a circular buffer; in C# write `((n % k) + k) % k` to get the same.",
        "`%` is the modulo operator: the remainder after division. `n % 2 == 0` is the standard test for an even number in both languages.",
      ],
    },
    {
      kind: "code",
      title: "Overflow and floating point",
      csharp: src`
int big = int.MaxValue;               // 2147483647
big = big + 1;
Console.WriteLine(big);               // -2147483648: wrapped around
long safe = (long)int.MaxValue + 1;
Console.WriteLine(safe);              // 2147483648

Console.WriteLine(0.1 + 0.2);         // 0.30000000000000004
Console.WriteLine(0.1m + 0.2m);       // 0.3 (decimal is exact)
Console.WriteLine(6.0 / 2);           // 3: C# prints a whole double without ".0"
`,
      python: src`
big = 2_147_483_647
big = big + 1
print(big)              # 2147483648: Python ints never overflow
print(2 ** 100)         # 1267650600228229401496703205376

print(0.1 + 0.2)        # 0.30000000000000004
from decimal import Decimal
print(Decimal("0.1") + Decimal("0.2"))   # 0.3
print(6 / 2)            # 3.0
`,
      notes: [
        "A C# int has 32 bits, so the largest value is 2,147,483,647. Adding 1 wraps around to the most negative value without any error, unless you write `checked(big + 1)` or turn on checked arithmetic, which throws an `OverflowException` instead. Use `long` when values can pass two billion. Python ints grow as large as memory allows, so `**` (power) can produce huge numbers; C# uses `Math.Pow`, which returns a double.",
        "`0.1 + 0.2` is not exactly 0.3 in either language because double and float store numbers in binary, and 0.1 has no exact binary form, the way 1/3 has no exact decimal form. Never compare floating point results with `==`; check that the difference is tiny instead. For money use decimal, which stores base 10 digits exactly. The Floating Point lesson in Computer Fundamentals shows the bits.",
        "Underscores in number literals are just for readability: `2_147_483_647` works in both languages.",
      ],
    },
    {
      kind: "code",
      title: "Converting between types",
      csharp: src`
int n = int.Parse("42");              // text to int
double d = double.Parse("3.5");       // text to double
string s = n.ToString();              // anything to text
Console.WriteLine(n + 1);             // 43
Console.WriteLine(s + 1);             // 421: string + number joins

Console.WriteLine((int)3.99);         // 3: a cast truncates
Console.WriteLine(Math.Round(2.5));   // 2: rounds half to even
Console.WriteLine(Math.Round(2.5, MidpointRounding.AwayFromZero));  // 3

bool ok = int.TryParse("abc", out int value);
Console.WriteLine($"{ok} {value}");   // False 0: no exception
`,
      python: src`
n = int("42")            # text to int
d = float("3.5")         # text to float
s = str(n)               # anything to text
print(n + 1)             # 43
print(s + "1")           # 421: str + int is an error, so join two strings

print(int(3.99))         # 3: truncates toward zero
print(round(2.5))        # 2: rounds half to even
print(round(3.5))        # 4

try:
    int("abc")
except ValueError as e:
    print("ValueError:", e)
`,
      notes: [
        "Converting text to a number is called parsing. `int.Parse` and Python's `int()` both fail loudly on bad text: C# throws a `FormatException`, Python raises a `ValueError`. C#'s `int.TryParse` returns false instead of failing, which is the usual choice for user input.",
        "A cast, `(int)3.99`, forces a value into another type; for double to int it chops off the fraction. Python's `int(3.99)` does the same. Both languages' default rounding sends a value exactly halfway (2.5) to the nearest even number, called banker's rounding, so 2.5 becomes 2 and 3.5 becomes 4. Ask for `MidpointRounding.AwayFromZero` in C# if you want school rounding.",
        "`double.Parse` follows the computer's regional settings: on a machine set to German, \"3.5\" fails because the decimal mark is a comma. Code that reads files or network data should pass `CultureInfo.InvariantCulture`. Python's `float()` always uses a dot.",
        "C# joins a string and a number with `+` (turning the number into text). Python refuses with a `TypeError`; convert first with `str(n)`, or use an f-string.",
      ],
    },
    {
      kind: "code",
      title: "null and None: the absence of a value",
      csharp: src`
string? nickname = null;              // ? = this may be null
Console.WriteLine(nickname == null);  // True
Console.WriteLine(nickname?.Length);  // prints an empty line: ?. gives null
Console.WriteLine(nickname ?? "none");// none: ?? supplies a fallback

int? reading = null;                  // value types need ? to allow null
Console.WriteLine(reading.HasValue);  // False
Console.WriteLine(reading ?? -1);     // -1
`,
      python: src`
nickname = None
print(nickname is None)           # True: compare with "is", not ==
print(nickname or "none")         # none: "or" falls back on a falsy value

reading = None
print(reading is not None)        # False
print(-1 if reading is None else reading)   # -1
`,
      notes: [
        "`null` (C#) and `None` (Python) mean \"no value here\". Using one as if it were a value, for example asking for its length, is the most common crash in both languages: a `NullReferenceException` in C#, an `AttributeError` or `TypeError` in Python.",
        "In C#, a value type such as `int`, `double` or `bool` can't be null at all unless you add `?`: `int?` means \"an int or nothing\". Reference types such as `string` can be null; with nullable checking on (the default in new projects), writing `string?` says null is expected, and the compiler warns when you might use a null by mistake.",
        "`?.` (null-conditional) stops and gives null instead of crashing, and `??` (null-coalescing) picks the right side when the left is null. Python's closest tools are `x if x is not None else fallback`, and `x or fallback`; be careful, `or` also replaces 0, an empty string and other falsy values, which the Conditionals lesson explains.",
      ],
    },
    {
      kind: "code",
      title: "Operators and shortcuts",
      csharp: src`
int x = 10;
x += 5;         // x = x + 5 -> 15
x *= 2;         // 30
x++;            // add 1 -> 31 (C# only)
x--;            // subtract 1 -> 30
Console.WriteLine(x);
Console.WriteLine(2 + 3 * 4);         // 14: * before +
Console.WriteLine((2 + 3) * 4);       // 20
Console.WriteLine(Math.Pow(2, 10));   // 1024 (a double)
Console.WriteLine(Math.Abs(-5) + Math.Max(3, 9));  // 14
`,
      python: src`
x = 10
x += 5          # 15
x *= 2          # 30
x += 1          # Python has no ++ or --
x -= 1
print(x)
print(2 + 3 * 4)         # 14
print((2 + 3) * 4)       # 20
print(2 ** 10)           # 1024 (an int)
print(abs(-5) + max(3, 9))   # 14
`,
      notes: [
        "An expression is any piece of code that produces a value: `2 + 3 * 4`, `x`, `Math.Max(3, 9)`. Operator precedence is the rule for which part is worked out first; it follows school maths (multiply and divide before add and subtract), and parentheses override it. When in doubt, add parentheses.",
        "`x += 5` is shorthand for `x = x + 5`, and works for `-=`, `*=`, `/=` and `%=` in both languages. C#'s `x++` and `x--` add or subtract 1; Python leaves them out on purpose (`++x` is legal Python but just means plus plus x, which is x).",
      ],
    },
  ],
  predict: [
    {
      lang: "csharp",
      code: src`
Console.WriteLine(7 / 2);
Console.WriteLine(7 / 2.0);
`,
      output: "3\n3.5",
      distractors: ["3.5\n3.5", "3\n3", "4\n3.5"],
      why: "Both 7 and 2 are ints, so `7 / 2` is integer division and the .5 is dropped. Making either side a double (`2.0`) switches to ordinary division.",
    },
    {
      lang: "python",
      code: src`
print(7 / 2)
print(7 // 2)
`,
      output: "3.5\n3",
      distractors: ["3\n3", "3.5\n3.5", "3\n3.5"],
      why: "In Python `/` always divides exactly and gives a float. `//` is floor division, the one that drops the fraction.",
    },
    {
      lang: "python",
      code: src`
print(-7 // 2)
print(-7 % 3)
`,
      output: "-4\n2",
      distractors: ["-3\n-1", "-4\n-1", "-3\n2"],
      why: "Python's `//` floors: -3.5 rounds down to -4. Its `%` matches, so the remainder takes the sign of the divisor: -7 = 3 * (-3) + 2. C# would print -3 and -1.",
    },
    {
      lang: "csharp",
      code: src`
Console.WriteLine(-7 / 2);
Console.WriteLine(-7 % 3);
`,
      output: "-3\n-1",
      distractors: ["-4\n2", "-4\n-1", "-3\n2"],
      why: "C# integer division truncates toward zero, so -3.5 becomes -3, and the remainder takes the sign of the left side: -7 = 3 * (-2) + (-1).",
    },
    {
      lang: "csharp",
      code: src`
int x = int.MaxValue;
x++;
Console.WriteLine(x);
`,
      output: "-2147483648",
      distractors: ["2147483648", "OverflowException", "2147483647"],
      why: "C# arithmetic is unchecked by default: going past the largest int wraps around to the smallest. Wrap it in `checked(...)` to get an `OverflowException` instead, or use a `long`.",
    },
    {
      lang: "csharp",
      code: src`
char c = 'A';
Console.WriteLine(c + 1);
Console.WriteLine((char)(c + 1));
`,
      output: "66\nB",
      distractors: ["B\nB", "A1\nB", "66\n66"],
      why: "A char is a number underneath ('A' is 65). Adding an int gives an int, 66. Casting back with `(char)` turns 66 into 'B'.",
    },
    {
      lang: "csharp",
      code: src`
double half = 6 / 4;
Console.WriteLine(half);
Console.WriteLine(6.0 / 4);
`,
      output: "1\n1.5",
      distractors: ["1.5\n1.5", "1.0\n1.5", "1\n1"],
      why: "`6 / 4` is worked out first, as int division (1), and only then stored in a double, as 1. Storing the result in a double doesn't make the division a double division. C# also prints a whole double as `1`, not `1.0`.",
    },
    {
      lang: "python",
      code: src`
print(0.1 + 0.2 == 0.3)
print(round(2.5), round(3.5))
`,
      output: "False\n2 4",
      distractors: ["True\n3 4", "False\n3 4", "True\n2 4"],
      why: "0.1 and 0.2 aren't exact in binary, so the sum is 0.30000000000000004. `round` sends exact halves to the even neighbour (banker's rounding): 2.5 to 2, 3.5 to 4.",
    },
    {
      lang: "python",
      code: src`
print(int("7") + 1, "7" * 2)
print(True + True)
`,
      output: "8 77\n2",
      distractors: ["8 14\n2", "71 77\nTrue", "8 77\nTrue"],
      why: "`int(\"7\")` is the number 7, so adding 1 gives 8. Multiplying a string by an int repeats it: \"77\". Python bools are a kind of int, True is 1, so `True + True` is 2.",
    },
    {
      lang: "csharp",
      code: src`
Console.WriteLine(0.1m + 0.2m == 0.3m);
Console.WriteLine((int)-3.7);
`,
      output: "True\n-3",
      distractors: ["False\n-4", "True\n-4", "False\n-3"],
      why: "decimal stores base 10 digits exactly, so 0.1 + 0.2 is exactly 0.3. A cast to int truncates toward zero, so -3.7 becomes -3, not -4.",
    },
  ],
  pitfalls: [
    "Integer division when you meant real division: `average = sum / count` with two ints in C# drops the fraction. Write `(double)sum / count`.",
    "Comparing floating point values with `==`. Check `Math.Abs(a - b) < 1e-9` (C#) or use `math.isclose(a, b)` (Python).",
    "Using double for money. Use `decimal` in C# and `Decimal` in Python.",
    "C# int overflow is silent. If a count or a sum can pass two billion (milliseconds in a month, bytes in a file), use `long`.",
    "Python's `True`, `False` and `None` are capitalised; C#'s `true`, `false` and `null` are not.",
  ],
  next: [
    { id: "floating-point-representation", label: "Floating Point: why 0.1 + 0.2 isn't 0.3 (Computer Fundamentals)" },
    { id: "number-bases-bits", label: "Number Bases and Bits: what 32 bits can hold" },
    { id: "basics-celsius-to-fahrenheit", label: "Exercise: Temperature Conversion with Rounding" },
    { id: "lang-strings", label: "Next: Strings" },
  ],
};
