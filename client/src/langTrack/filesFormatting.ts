import { src, type LangLessonData } from "./types.ts";

export const filesFormatting: LangLessonData = {
  parts: [
    {
      kind: "text",
      title: "A note on the exercises",
      paragraphs: [
        "The samples on this page read and write real files, and were run that way to get their output. The graded exercises can't: the C# runner only allows plain computation, with no file system, and the browser's Python has only a pretend in-memory one. So the exercises after this lesson hand you the text directly as a string. That's no loss, because the parsing and formatting code is the same whether the text came from a file, a network message or a test.",
      ],
    },
    {
      kind: "code",
      title: "Reading and writing a whole file",
      csharp: src`
string path = "readings.txt";
File.WriteAllLines(path, ["PT-101,4.2", "TT-7,21.5"]);   // creates or replaces the file
File.AppendAllText(path, "FT-3,0.8\n");                 // adds to the end

foreach (string line in File.ReadLines(path))           // one line at a time
    Console.WriteLine(line);
// PT-101,4.2 / TT-7,21.5 / FT-3,0.8

Console.WriteLine(File.ReadAllLines(path).Length);      // 3
Console.WriteLine(File.Exists(path));                   // True
File.Delete(path);
`,
      python: src`
from pathlib import Path

path = Path("readings.txt")
path.write_text("PT-101,4.2\nTT-7,21.5\n", encoding="utf-8")   # creates or replaces
with open(path, "a", encoding="utf-8") as f:                   # "a": append
    f.write("FT-3,0.8\n")

with open(path, encoding="utf-8") as f:     # "r" (read) is the default mode
    for line in f:                          # one line at a time
        print(line.rstrip("\n"))
# PT-101,4.2 / TT-7,21.5 / FT-3,0.8

print(len(path.read_text(encoding="utf-8").splitlines()))   # 3
print(path.exists())                                        # True
path.unlink()                                               # delete it
`,
      notes: [
        "Both languages have one-call helpers for small files: `File.ReadAllText` / `WriteAllText` / `ReadAllLines` / `WriteAllLines` in C#, and `Path.read_text` / `write_text` from Python's `pathlib`. For big files, read line by line (`File.ReadLines`, or looping over an open Python file), which keeps only one line in memory at a time: the iterator idea from the Iterators lesson.",
        "A relative path like `readings.txt` is relative to the current working directory, the folder the program was started from, which isn't always the folder the code is in. Say the encoding when you open text in Python (`encoding=\"utf-8\"`); otherwise it depends on the computer's settings, and Windows may not use UTF-8. C#'s file helpers default to UTF-8. Python's `print(line)` would add a second line break, because each line read from a file still ends with its `\\n`.",
      ],
    },
    {
      kind: "code",
      title: "Opening a file and making sure it's closed: using and with",
      csharp: src`
using (var writer = new StreamWriter("log.txt"))
{
    writer.WriteLine("start");
    writer.WriteLine("stop");
}                                   // Dispose() runs here: flushed and closed

using var reader = new StreamReader("log.txt");   // closed at the end of the scope
string? line;
while ((line = reader.ReadLine()) is not null)
    Console.WriteLine($"> {line}");
// > start / > stop
`,
      python: src`
with open("log.txt", "w", encoding="utf-8") as writer:
    writer.write("start\n")
    writer.write("stop\n")
# closed here, even if an exception happened inside the block

with open("log.txt", encoding="utf-8") as reader:
    for line in reader:
        print(">", line.strip())
# > start / > stop
print(reader.closed)     # True
`,
      notes: [
        "An open file holds a resource from the operating system, and written text may sit in a buffer until the file is flushed or closed. Forget to close it and data can go missing or other programs can't open the file. `using` (C#) and `with` (Python) guarantee the clean-up happens when the block ends, however it ends, including by an exception. In C# that works for anything that implements `IDisposable` (has a `Dispose` clean-up method); in Python for anything that's a context manager (an object written to work with `with`). Both are covered in depth in stage 3.",
        "`using var x = ...;` (without braces) disposes at the end of the enclosing block, which for top-level code is the end of the program.",
      ],
    },
    {
      kind: "code",
      title: "Format strings: width, alignment and decimals",
      csharp: src`
var rows = new[] { ("Pump", 3, 1249.5), ("Valve", 12, 89.99) };

Console.WriteLine($"{"Item",-8}|{"Qty",5}|{"Price",10}");
foreach (var (name, qty, price) in rows)
    Console.WriteLine($"{name,-8}|{qty,5}|{price,10:F2}");
// Item    |  Qty|     Price
// Pump    |    3|   1249.50
// Valve   |   12|     89.99

Console.WriteLine($"{1234567:N0}|{42:D5}|{255:X}|{3.14159:F3}|{0.5:0.0}");
// 1,234,567|00042|FF|3.142|0.5
`,
      python: src`
rows = [("Pump", 3, 1249.5), ("Valve", 12, 89.99)]

print(f"{'Item':<8}|{'Qty':>5}|{'Price':>10}")
for name, qty, price in rows:
    print(f"{name:<8}|{qty:>5}|{price:>10.2f}")
# Item    |  Qty|     Price
# Pump    |    3|   1249.50
# Valve   |   12|     89.99

print(f"{1234567:,}|{42:05}|{255:X}|{3.14159:.3f}|{0.256:.1%}")
# 1,234,567|00042|FF|3.142|25.6%
`,
      notes: [
        "In a C# interpolated string, `{value,width:format}` sets the width (negative means left-aligned) and the format: `F2` is two decimals, `N0` adds thousands separators, `D5` pads an integer with zeros, `X` is hexadecimal. In a Python f-string it's `{value:[align][width][.decimals][type]}` with `<` left, `>` right and `^` centre; numbers are right-aligned by default and text left-aligned.",
        "Rounding when formatting can surprise you: values like 2.675 aren't stored exactly in binary, so `2.675` formats to two decimals as `2.67`, in both languages. Use `decimal` (C#) or `Decimal` (Python) for money.",
        "C# formatting follows the computer's culture (language and region settings): with German settings `F2` writes `1249,50` and `N0` writes `1.234.567`. That's right for showing numbers to people, wrong for files other programs read. For machine-readable text pass `CultureInfo.InvariantCulture`, as in the next sample. Python's f-strings always use `.` and `,`.",
      ],
    },
    {
      kind: "code",
      title: "Parsing text safely",
      csharp: src`
using System.Globalization;

string[] inputs = ["42", " 17 ", "4.5", "abc", ""];
foreach (var s in inputs)
{
    if (int.TryParse(s, out int n))
        Console.WriteLine($"'{s}' -> {n}");
    else
        Console.WriteLine($"'{s}' is not a whole number");
}
// '42' -> 42 / ' 17 ' -> 17 / '4.5' is not ... / 'abc' is not ... / '' is not ...

double d = double.Parse("4.5", CultureInfo.InvariantCulture);   // "." always means decimal point
Console.WriteLine(d * 2);                                        // 9
Console.WriteLine(d.ToString(CultureInfo.InvariantCulture));     // 4.5 on any computer
`,
      python: src`
inputs = ["42", " 17 ", "4.5", "abc", ""]
for s in inputs:
    try:
        n = int(s)
        print(f"'{s}' -> {n}")
    except ValueError:
        print(f"'{s}' is not a whole number")
# '42' -> 42 / ' 17 ' -> 17 / '4.5' is not ... / 'abc' is not ... / '' is not ...

d = float("4.5")
print(d * 2)          # 9.0
`,
      notes: [
        "Text from files and users is often wrong. C#'s `TryParse` returns false instead of throwing, and puts the result in the `out` variable when it succeeds; use it in a loop over messy input. Python has no TryParse: wrap `int(...)` or `float(...)` in `try` / `except ValueError`. Both accept surrounding spaces and reject \"4.5\" as an int.",
        "`double.Parse` and `ToString` use the computer's culture too, so code that reads \"4.5\" fine on one machine reads it as 45 or fails on another. For data, always pass `CultureInfo.InvariantCulture`.",
      ],
    },
    {
      kind: "code",
      title: "Splitting lines into fields: CSV",
      csharp: src`
string text = """
    tag,value,unit
    PT-101,4.2,bar
    TT-7,21.5,C
    """;

var lines = text.Split('\n');
var header = lines[0].Split(',');
foreach (var line in lines.Skip(1))
{
    var fields = line.Split(',');
    var row = header.Zip(fields).ToDictionary(p => p.First, p => p.Second);
    Console.WriteLine($"{row["tag"]} = {row["value"]} {row["unit"]}");
}
// PT-101 = 4.2 bar / TT-7 = 21.5 C
`,
      python: src`
import csv
import io

text = """tag,value,unit
PT-101,4.2,bar
TT-7,21.5,C"""

for row in csv.DictReader(io.StringIO(text)):   # each row is a dict keyed by the header
    print(f"{row['tag']} = {row['value']} {row['unit']}")
# PT-101 = 4.2 bar / TT-7 = 21.5 C
`,
      notes: [
        "CSV (comma-separated values) is the most common plain-text data format: one record per line, fields split by commas, often with a header line naming the fields. Splitting on commas works for simple data like this. Real CSV can have quoted fields containing commas or line breaks, so for files from other systems use a proper parser: Python's built-in `csv` module, or a library such as CsvHelper in C#.",
        "The C# sample uses a raw string literal (`\"\"\"` ... `\"\"\"`): text across several lines, with the indentation of the closing quotes removed from every line. `io.StringIO` makes a string behave like an open file, handy for tests.",
      ],
    },
    {
      kind: "code",
      title: "JSON: objects to text and back",
      csharp: src`
#:property PublishAot=false
// (dotnet run file.cs defaults to AOT, which blocks reflection-based JSON; the line above turns AOT off)
using System.Text.Json;

var r = new Reading("PT-101", 4.2, ["ok", "calibrated"]);
string json = JsonSerializer.Serialize(r);
Console.WriteLine(json);         // {"Tag":"PT-101","Value":4.2,"Flags":["ok","calibrated"]}

var back = JsonSerializer.Deserialize<Reading>(json)!;
Console.WriteLine(back.Flags[1]);    // calibrated

record Reading(string Tag, double Value, string[] Flags);
`,
      python: src`
import json

r = {"tag": "PT-101", "value": 4.2, "flags": ["ok", "calibrated"]}
text = json.dumps(r)
print(text)          # {"tag": "PT-101", "value": 4.2, "flags": ["ok", "calibrated"]}

back = json.loads(text)
print(back["flags"][1])     # calibrated
print(back == r)            # True
`,
      notes: [
        "Serialization means turning objects into text (or bytes) that can be saved or sent, and deserialization turns it back. JSON is the usual format for web APIs and settings files: objects in braces, lists in square brackets, strings in double quotes, plus numbers, `true`, `false` and `null`. C#'s `System.Text.Json` maps JSON onto your classes and records; Python's `json` module maps it onto dicts, lists, strings and numbers.",
      ],
    },
  ],
  predict: [
    {
      lang: "csharp",
      code: src`
Console.WriteLine($"[{"ab",4}][{"ab",-4}][{7,3:D2}]");
`,
      output: "[  ab][ab  ][ 07]",
      distractors: ["[ab  ][  ab][07 ]", "[  ab][ab  ][007]", "[ab][ab][07]"],
      why: "A positive width right-aligns and a negative one left-aligns. `D2` pads 7 to \"07\", and then the width of 3 adds one space in front.",
    },
    {
      lang: "python",
      code: src`
print(f"[{'ab':>4}][{'ab':<4}][{'ab':^6}][{7:03}]")
`,
      output: "[  ab][ab  ][  ab  ][007]",
      distractors: ["[ab  ][  ab][  ab  ][007]", "[  ab][ab  ][ ab   ][  7]", "[  ab][ab  ][  ab  ][7  ]"],
      why: "`>` right-aligns, `<` left-aligns and `^` centres in the given width. `03` means width 3, padded with zeros.",
    },
    {
      lang: "python",
      code: src`
print(f"[{5:4}][{'x':4}]")
`,
      output: "[   5][x   ]",
      distractors: ["[5   ][x   ]", "[   5][   x]", "[5   ][   x]"],
      why: "With only a width, numbers are right-aligned and text is left-aligned.",
    },
    {
      lang: "csharp",
      code: src`
Console.WriteLine($"{2.5:F0} {3.5:F0} {2.5m:F0} {Math.Round(2.5)} {Math.Round(2.5, MidpointRounding.AwayFromZero)}");
`,
      output: "2 4 3 2 3",
      distractors: ["3 4 3 3 3", "3 4 3 2 3", "2 4 2 2 3"],
      why: "In .NET (Core 3.0 and later), a `double` exactly halfway rounds to the nearest even number, both when formatted with `F` and in `Math.Round`: 2.5 gives 2, 3.5 gives 4. That's banker's rounding, which avoids always pushing halves upwards. A `decimal` formats halves away from zero, and `MidpointRounding.AwayFromZero` asks `Math.Round` for the school-book rule.",
    },
    {
      lang: "python",
      code: src`
print(f"{2.5:.0f} {3.5:.0f} {round(2.5)} {2.675:.2f}")
`,
      output: "2 4 2 2.67",
      distractors: ["3 4 3 2.68", "3 4 2 2.67", "2 4 2 2.68"],
      why: "Python rounds exact halves to the nearest even number (banker's rounding), both when formatting and in `round`, so 2.5 gives 2 and 3.5 gives 4. 2.675 isn't a half at all: it's stored as 2.67499999..., so it rounds down.",
    },
    {
      lang: "python",
      code: src`
values = []
for s in ["10", "x", " 3 ", "2.5"]:
    try:
        values.append(int(s))
    except ValueError:
        values.append(0)
print(values)
`,
      output: "[10, 0, 3, 0]",
      distractors: ["[10, 0, 0, 2]", "[10, 3]", "[10, 0, 3, 2]"],
      why: "`int` ignores surrounding spaces, so \" 3 \" works, but it won't accept \"2.5\": a decimal string isn't a whole number. Use `int(float(s))` if you want to truncate.",
    },
    {
      lang: "csharp",
      code: src`
var parts = "a,,b,".Split(',');
var clean = "a,,b,".Split(',', StringSplitOptions.RemoveEmptyEntries);
Console.WriteLine($"{parts.Length} {clean.Length}");
`,
      output: "4 2",
      distractors: ["2 2", "3 2", "4 4"],
      why: "Splitting on every comma gives \"a\", \"\", \"b\" and \"\": an empty field between the two commas and one after the last. `RemoveEmptyEntries` drops the empty ones.",
    },
    {
      lang: "python",
      code: src`
print("a,,b,".split(","), " a  b ".split(), "k=v=w".split("=", 1))
`,
      output: "['a', '', 'b', ''] ['a', 'b'] ['k', 'v=w']",
      distractors: ["['a', 'b'] ['a', 'b'] ['k', 'v', 'w']", "['a', '', 'b', ''] ['', 'a', '', 'b', ''] ['k', 'v=w']", "['a', '', 'b'] ['a', 'b'] ['k', 'v=w']"],
      why: "With a separator, `split` keeps empty fields. With no argument it splits on any run of whitespace and drops empties. The second argument limits the number of splits, so only the first `=` counts, which is how you parse key=value lines whose values may contain `=`.",
    },
    {
      lang: "csharp",
      code: src`
#:property PublishAot=false
// (dotnet run file.cs defaults to AOT, which blocks reflection-based JSON; the line above turns AOT off)
using System.Text.Json;

var json = JsonSerializer.Serialize(new { Name = "P-1", Ok = true, Codes = new[] { 1, 2 }, Note = (string?)null });
Console.WriteLine(json);
`,
      output: "{\"Name\":\"P-1\",\"Ok\":true,\"Codes\":[1,2],\"Note\":null}",
      distractors: [
        "{\"name\":\"P-1\",\"ok\":true,\"codes\":[1,2],\"note\":null}",
        "{\"Name\":\"P-1\",\"Ok\":\"True\",\"Codes\":[1,2],\"Note\":null}",
        "{\"Name\":\"P-1\",\"Ok\":true,\"Codes\":[1,2]}",
      ],
      why: "By default property names are kept exactly as written (ASP.NET web APIs switch them to camelCase), booleans become `true` / `false`, and null is written as `null` rather than left out.",
    },
    {
      lang: "python",
      code: src`
import json

print(json.dumps({"b": 1, "a": [True, None]}))
`,
      output: "{\"b\": 1, \"a\": [true, null]}",
      distractors: ["{'b': 1, 'a': [True, None]}", "{\"a\": [true, null], \"b\": 1}", "{\"b\": 1, \"a\": [True, None]}"],
      why: "JSON spells them `true` and `null`, and needs double quotes. Keys keep the dictionary's order unless you pass `sort_keys=True`.",
    },
  ],
  pitfalls: [
    "Opening files without `using` / `with`, so they stay open or lose buffered writes when something throws.",
    "Leaving out `encoding=\"utf-8\"` in Python, so the code works on your machine and garbles text on another.",
    "Parsing or formatting numbers for files with the current culture in C#. Use `CultureInfo.InvariantCulture` for data.",
    "Splitting real-world CSV on commas. Quoted fields break it; use a CSV parser.",
    "Relative paths that depend on where the program was started from. Build paths from a known folder.",
  ],
  next: [
    { id: "inter-format-row", label: "Exercise: Format a Report Line" },
    { id: "inter-parse-settings", label: "Exercise: Parse key=value Settings" },
    { id: "lang-async", label: "Async and Await Basics" },
    { id: "text-encoding", label: "Text Encoding: ASCII, Unicode, UTF-8 and UTF-16" },
  ],
};
