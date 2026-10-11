import { src, type LangLessonData } from "./types.ts";

// Part 2 is several files, so it's marked as a fragment for the snippet checker; it was
// checked by building those files as a real project and package instead.
export const modules: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "Using code from elsewhere: using and import",
      csharp: src`
#:property PublishAot=false
// (dotnet run file.cs defaults to AOT, which blocks reflection-based JSON; the line above turns AOT off)
using System.Text;                    // bring a namespace's names into scope
using static System.Math;             // use Math's members without "Math."
using Json = System.Text.Json.JsonSerializer;   // a short name for one type

var sb = new StringBuilder();         // System.Text.StringBuilder
sb.Append(Sqrt(16));
Console.WriteLine(sb);                          // 4
Console.WriteLine(Json.Serialize(new[] { 1, 2 }));   // [1,2]
Console.WriteLine(new Plant.Drives.Motor().GetType().FullName);   // Plant.Drives.Motor

namespace Plant.Drives
{
    public class Motor { }
}
`,
      python: src`
import math                           # the whole module: use it as math.sqrt
from statistics import mean, median   # just these names
import datetime as dt                 # a module under a shorter name

print(math.sqrt(16))                  # 4.0
print(mean([2, 4, 9]), median([2, 4, 9]))    # 5 4
print(dt.date(2026, 1, 15).isoformat())      # 2026-01-15
print(__name__)                       # __main__: this file was run directly
`,
      notes: [
        "Big programs are split into named groups so that names don't clash and related code sits together. In C# the group is a namespace, such as `System.Text` or `Plant.Drives`: a type's full name is the namespace plus the type name, `Plant.Drives.Motor`, and `using System.Text;` lets you write just `StringBuilder`. A namespace is only a naming scheme; the compiled code lives in an assembly (a .dll or .exe), usually one per project.",
        "In Python the group is a module, which is simply a .py file, and a package is a folder of modules. `import math` runs the module once, caches it, and gives you the name `math` to reach everything inside; `from statistics import mean` brings in just one name. The standard library, the modules that ship with Python (`math`, `json`, `csv`, `datetime`, `collections`, `itertools`, `pathlib` and many more), covers a remarkable amount before you need to install anything.",
        "Modern C# projects get the common namespaces (`System`, `System.Collections.Generic`, `System.Linq` and a few more) through implicit global usings, which is why the samples in this section rarely start with `using` lines.",
      ],
    },
    {
      kind: "code",
      title: "Your own namespaces, modules and packages",
      csharp: src`
// ---- Plant.csproj ----
// <Project Sdk="Microsoft.NET.Sdk">
//   <PropertyGroup>
//     <OutputType>Exe</OutputType>
//     <TargetFramework>net10.0</TargetFramework>
//     <ImplicitUsings>enable</ImplicitUsings>
//   </PropertyGroup>
// </Project>

// ---- Sensors/Thermometer.cs ----
namespace Plant.Sensors;              // file-scoped: everything below is in it

public class Thermometer
{
    public string Tag { get; }
    public Thermometer(string tag) => Tag = tag;
    public string Describe() => $"{Tag} ({nameof(Thermometer)})";
    internal const string Unit = "C"; // internal: visible in this project only
}

// ---- Program.cs ----
using Plant.Sensors;

var t = new Thermometer("TT-7");
Console.WriteLine(t.Describe());      // TT-7 (Thermometer)
`,
      python: src`
# ---- plant/__init__.py ----
# Marks plant/ as a package. Can be empty; whatever it defines is
# importable as plant.<name>.
from plant.sensors import Thermometer

# ---- plant/sensors.py ----
class Thermometer:
    def __init__(self, tag):
        self.tag = tag

    def describe(self):
        return f"{self.tag} ({type(self).__name__})"


def _helper():           # leading underscore: "internal to this module"
    return 42

# ---- main.py (next to the plant folder) ----
from plant.sensors import Thermometer
import plant

t = Thermometer("TT-7")
print(t.describe())                       # TT-7 (Thermometer)
print(plant.Thermometer is Thermometer)   # True: one class, two ways to reach it
`,
      captions: { csharp: "C#: three files in one project", python: "Python: three files" },
      fragment: { csharp: true, python: true },
      notes: [
        "In C#, the folder a file sits in doesn't matter to the compiler: every .cs file in the project is compiled together, and the `namespace` line decides the full names. By convention the namespace follows the folders. `public` types can be used from other projects that reference this one; `internal` ones only inside this project.",
        "In Python, the file and folder names are the module and package names: `plant/sensors.py` is the module `plant.sensors`. Python finds modules by searching a list of folders (`sys.path`) that starts with the folder of the script you ran, which is why `main.py` sits next to the `plant` folder. Python has no `internal` keyword; a leading underscore means \"not part of the public interface\".",
      ],
    },
    {
      kind: "code",
      title: "Where a program starts",
      csharp: src`
// A program has exactly one entry point. With top-level statements it's the file
// that has them; without, it's a static Main method:
public static class Program
{
    public static void Main()
    {
        Console.WriteLine(Converter.CToF(100));    // 212
    }
}

public static class Converter
{
    public static double CToF(double c) => c * 9 / 5 + 32;
}
`,
      python: src`
# converter.py
def c_to_f(c):
    return c * 9 / 5 + 32


def main():
    print(c_to_f(100))       # 212.0


if __name__ == "__main__":   # True when run as a script, False when imported
    main()
`,
      notes: [
        "Importing a Python module runs it from top to bottom, so code at the top level of a file would also run whenever someone imports it. Every module has a `__name__`: the string `\"__main__\"` when the file is the one being run, and the module's own name when it's imported. Putting the program's start under `if __name__ == \"__main__\":` lets the same file be a script and a library, and lets tests import its functions without running it.",
        "C# has no such issue, because only the entry point runs on its own; everything else runs when it's called.",
      ],
    },
    {
      kind: "table",
      title: "Packages from the internet: NuGet and pip",
      head: ["", "C# (.NET)", "Python"],
      rows: [
        ["Package site", "nuget.org", "pypi.org (the Python Package Index)"],
        ["Add a package", "`dotnet add package Serilog`", "`pip install requests`"],
        ["Where it's recorded", "`<PackageReference>` in the .csproj", "`requirements.txt` or `pyproject.toml` (you add it)"],
        ["Install everything listed", "`dotnet restore` (runs automatically on build)", "`pip install -r requirements.txt`"],
        ["Kept separate per project", "Automatically", "With a virtual environment: `python -m venv .venv`"],
        ["Use it", "`using Serilog;`", "`import requests`"],
        ["Pin a version", "`Version=\"4.2.0\"` in the reference", "`requests==2.32.3`"],
      ],
      notes: [
        "A virtual environment is a folder holding its own copy of Python's package directory, so each project can have its own packages and versions without clashing. Create it once, activate it (`source .venv/bin/activate`, or `.venv\\Scripts\\activate` on Windows), then `pip install` into it. Add `.venv` to `.gitignore`; commit `requirements.txt` instead.",
        "Only install packages you trust from the official sites, and check the spelling: typo-named look-alike packages are a real way attackers get code onto developers' machines.",
      ],
    },
    {
      kind: "terms",
      title: "Words from this lesson",
      terms: [
        { term: "Namespace (C#)", meaning: "A named group of types, like `System.Text`. Part of each type's full name; `using` lets you leave it off." },
        { term: "Assembly", meaning: "A compiled .NET file (.dll or .exe), usually one per project. Projects reference other projects' assemblies." },
        { term: "Module (Python)", meaning: "One .py file. Importing it runs it once and gives you its names." },
        { term: "Package", meaning: "In Python, a folder of modules (usually with an `__init__.py`). In both languages, also a bundle you install from NuGet or PyPI." },
        { term: "Standard library", meaning: "Everything that ships with the language: the .NET base class library, or Python's built-in modules." },
        { term: "Virtual environment", meaning: "A per-project folder of installed Python packages, so projects don't clash." },
        { term: "Entry point", meaning: "Where a program starts: top-level statements or `Main` in C#, the script you run in Python." },
      ],
    },
  ],
  predict: [
    {
      lang: "python",
      code: src`
print(__name__)
`,
      output: "__main__",
      distractors: ["main", "None", "__init__"],
      why: "The file you run is always named `__main__` while it runs; imported modules get their own names.",
    },
    {
      lang: "python",
      code: src`
import math as m
from math import pi

print(round(m.pi, 2) == round(pi, 2), m.floor(-2.5))
`,
      output: "True -3",
      distractors: ["True -2", "NameError", "False -3"],
      why: "`m` and the imported `pi` reach the same module and value. `floor` rounds down, towards minus infinity, so -2.5 becomes -3.",
    },
    {
      lang: "python",
      code: src`
from math import *

def sqrt(x):
    return "mine"

print(sqrt(9), floor(2.7))
`,
      output: "mine 2",
      distractors: ["3.0 2", "mine 3", "NameError"],
      why: "`import *` copies all of math's public names in, and the later `def sqrt` replaces one of them. This silent shadowing is why `import *` is discouraged outside quick experiments.",
    },
    {
      lang: "csharp",
      code: src`
Console.WriteLine(new A.Item().Name + " " + new B.Item().Name);

namespace A { class Item { public string Name => "A.Item"; } }
namespace B { class Item { public string Name => "B.Item"; } }
`,
      output: "A.Item B.Item",
      distractors: ["Compile error", "A.Item A.Item", "Item Item"],
      why: "Two classes may share a name in different namespaces; the full name says which one you mean.",
    },
    {
      lang: "csharp",
      code: src`
using static System.Math;

Console.WriteLine(Max(3, 7) + Abs(-2));
`,
      output: "9",
      distractors: ["72", "5", "Compile error"],
      why: "`using static` brings a class's static members into scope, so `Max` and `Abs` mean `Math.Max` and `Math.Abs`. 7 + 2 = 9.",
    },
    {
      lang: "python",
      code: src`
import sys
import json

first = sys.modules["json"]
import json as again
print("json" in sys.modules, first is again)
`,
      output: "True True",
      distractors: ["True False", "False False", "False True"],
      why: "Python runs a module once and caches it in `sys.modules`; every later import, under any alias, gets the same module object.",
    },
    {
      lang: "csharp",
      code: src`
using System.Text;

Console.WriteLine(typeof(List<int>).Namespace);
Console.WriteLine(typeof(StringBuilder).FullName);
`,
      output: "System.Collections.Generic\nSystem.Text.StringBuilder",
      distractors: ["System\nStringBuilder", "System.Collections\nSystem.StringBuilder", "List\nSystem.Text"],
      why: "`Namespace` gives just the namespace; `FullName` is the namespace plus the type name.",
    },
    {
      lang: "python",
      code: src`
import statistics

print(hasattr(statistics, "mean"), hasattr(statistics, "average"))
`,
      output: "True False",
      distractors: ["True True", "False False", "AttributeError"],
      why: "A module is an object whose attributes are the names it defines. `statistics` has `mean` but nothing called `average`.",
    },
  ],
  pitfalls: [
    "Naming your own file after a standard module (`random.py`, `json.py`, `csv.py`): your file is found first and `import random` imports it instead.",
    "Top-level code in a Python module that should only run as a script. Put it under `if __name__ == \"__main__\":`.",
    "`from module import *`, which hides where names came from and can silently replace your own.",
    "Installing Python packages globally for every project. Use a virtual environment per project.",
    "Circular imports (a imports b, b imports a), which in Python fail with confusing errors about partly initialised modules. Move the shared code into a third module.",
  ],
  next: [
    { id: "linkers-libraries", label: "Linkers, Libraries and Loading" },
    { id: "lang-cheat-python", label: "Cheat sheets: files, async, tests and modules" },
    { id: "lang-start-here", label: "Back to Start Here" },
  ],
};
