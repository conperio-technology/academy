import { src, type LangLessonData } from "./types.ts";

export const packaging: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "The project file: .csproj and pyproject.toml",
      csharp: src`
<!-- PlantMonitor/src/PlantMonitor/PlantMonitor.csproj -->
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>                 <!-- Library projects leave this out -->
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>                  <!-- warn about possible nulls -->
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <Version>1.4.0</Version>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Serilog" Version="4.2.0" />
    <ProjectReference Include="../PlantMonitor.Core/PlantMonitor.Core.csproj" />
  </ItemGroup>

</Project>
`,
      python: src`
# plant-monitor/pyproject.toml
[build-system]
requires = ["hatchling"]                 # the tool that builds the package
build-backend = "hatchling.build"

[project]
name = "plant-monitor"
version = "1.4.0"
requires-python = ">=3.12"
dependencies = [
    "httpx>=0.27,<1",                    # a version range
    "pydantic~=2.7",                     # compatible release: >=2.7, <3
]

[project.optional-dependencies]
dev = ["pytest>=8", "mypy"]              # pip install -e ".[dev]"

[project.scripts]
plant-monitor = "plant_monitor.cli:main" # installs a plant-monitor command

[tool.pytest.ini_options]                # tools keep their settings here too
testpaths = ["tests"]
`,
      fragment: { csharp: true, python: true },
      notes: [
        "Every .NET project is described by an MSBuild project file, the .csproj: which framework it targets (`net10.0`), whether it builds a program (`Exe`) or a library (a .dll other projects use), compiler settings such as nullable warnings, and its dependencies, both NuGet packages (`PackageReference`) and other projects in the same repository (`ProjectReference`). Every .cs file in the folder is included automatically. A solution file (.sln, or the newer .slnx) groups several projects so `dotnet build` and IDEs handle them together.",
        "Modern Python projects describe themselves in `pyproject.toml`: the package name and version, the Python versions it supports, its dependencies with version ranges, optional extras such as `dev`, command-line entry points, and the build backend (hatchling, setuptools, poetry-core or flit) that turns the folder into an installable package. Most tools (pytest, mypy, ruff, black) read their settings from the same file.",
      ],
    },
    {
      kind: "code",
      title: "Laying out a repository",
      csharp: src`
PlantMonitor/
  PlantMonitor.slnx                     the solution: lists the projects
  Directory.Build.props                 settings shared by every project
  Directory.Packages.props              one place for all package versions
  src/
    PlantMonitor/                       the app (Exe)
      PlantMonitor.csproj
      Program.cs
    PlantMonitor.Core/                  the logic, as a library
      PlantMonitor.Core.csproj
      Alarms/AlarmEvaluator.cs          folders usually match namespaces
  tests/
    PlantMonitor.Core.Tests/            xUnit project referencing Core
      PlantMonitor.Core.Tests.csproj
      AlarmEvaluatorTests.cs
`,
      python: src`
plant-monitor/
  pyproject.toml                        name, version, dependencies, tool settings
  README.md
  src/
    plant_monitor/                      the import package: import plant_monitor
      __init__.py
      cli.py                            main() for the plant-monitor command
      alarms.py
  tests/
    test_alarms.py                      pytest finds test_*.py files
  .venv/                                the virtual environment (not committed)
  uv.lock or requirements.txt           exact versions for repeatable installs
`,
      fragment: { csharp: true, python: true },
      notes: [
        "Keep the logic in a library project or package, separate from the thin layer that starts the program (a console app, a web API, a CLI command), so tests and other programs can use the logic directly. Tests live in their own project (C#) or folder (Python) and reference the library.",
        "The Python `src/` layout puts the package one folder down, so tests can't accidentally import your working copy instead of the installed package; install it in editable mode (`pip install -e .`), which links the installed package to your source folder so edits take effect without reinstalling. Distribution names may use dashes (`plant-monitor`); import names use underscores (`plant_monitor`).",
        "`Directory.Build.props` applies MSBuild settings to every project below it (target framework, nullable, warnings as errors), and with Central Package Management, `Directory.Packages.props` holds every package's version once, so all projects agree.",
      ],
    },
    {
      kind: "code",
      title: "Versions: semantic versioning and why strings don't compare",
      csharp: src`
Console.WriteLine(string.CompareOrdinal("1.10.0", "1.9.0") < 0);   // True: as text, 1.10 sorts first
Console.WriteLine(new Version("1.10.0") > new Version("1.9.0"));   // True: System.Version compares numbers
Console.WriteLine(Version.TryParse("2.0.0-rc.1", out _));          // False: no pre-release support

string[] releases = ["1.10.0", "1.9.3", "2.0.0", "1.2.11"];
var newest = releases.MaxBy(r => new Version(r));
Console.WriteLine(newest);                                         // 2.0.0
Console.WriteLine(IsCompatible("1.4.2", "1.9.0"));                 // True: same major version
Console.WriteLine(IsCompatible("1.4.2", "2.0.0"));                 // False: a major bump may break callers

static bool IsCompatible(string current, string candidate)
{
    var (a, b) = (new Version(current), new Version(candidate));
    return a.Major == b.Major && b >= a;
}
`,
      python: src`
print("1.10.0" < "1.9.0")                          # True: as text, 1.10 sorts first


def key(version):
    return tuple(int(part) for part in version.split("."))


print(key("1.10.0") > key("1.9.0"))                # True: (1, 10, 0) > (1, 9, 0)

releases = ["1.10.0", "1.9.3", "2.0.0", "1.2.11"]
print(max(releases, key=key))                      # 2.0.0
print(sorted(releases, key=key))                   # ['1.2.11', '1.9.3', '1.10.0', '2.0.0']


def is_compatible(current, candidate):
    a, b = key(current), key(candidate)
    return a[0] == b[0] and b >= a


print(is_compatible("1.4.2", "1.9.0"), is_compatible("1.4.2", "2.0.0"))   # True False
`,
      notes: [
        "Semantic versioning (SemVer) gives version numbers a meaning: MAJOR.MINOR.PATCH, where a patch release only fixes bugs, a minor release adds features without breaking anything, and a major release may break existing callers. A pre-release such as `2.0.0-rc.1` comes before `2.0.0`. Version ranges in project files rely on this: `>=2.7,<3` or `~=2.7` in Python and `[2.7,3.0)` in NuGet mean \"any 2.x from 2.7 on\".",
        "Versions are not strings. Compared as text, \"1.10.0\" comes before \"1.9.0\" because the character 1 sorts before 9. Compare the numeric parts: `System.Version` in C# (which has no pre-release tags), a tuple of ints in Python, or a SemVer library (NuGet.Versioning, `packaging.version` in Python) when pre-releases matter.",
      ],
    },
    {
      kind: "table",
      title: "Everyday commands side by side",
      head: ["Task", ".NET CLI", "Python"],
      rows: [
        ["New project", "`dotnet new console -n App`, `dotnet new classlib`, `dotnet new xunit`", "create `pyproject.toml` (or `uv init`)"],
        ["Isolated environment", "per project, automatic", "`python -m venv .venv`, then activate it"],
        ["Add a dependency", "`dotnet add package Serilog`", "add it to `pyproject.toml`, then `pip install -e .` (or `uv add httpx`)"],
        ["Restore / install all", "`dotnet restore` (part of build)", "`pip install -e \".[dev]\"`, `pip install -r requirements.txt`, `uv sync`"],
        ["Pin exact versions", "`packages.lock.json` (`RestorePackagesWithLockFile`)", "`requirements.txt` from `pip freeze` or pip-tools, `uv.lock`, `poetry.lock`"],
        ["See what's outdated or vulnerable", "`dotnet list package --outdated`, `--vulnerable`", "`pip list --outdated`, `pip-audit`"],
        ["Build", "`dotnet build -c Release`", "`python -m build` (a wheel and an sdist)"],
        ["Package a library", "`dotnet pack` (a .nupkg)", "`python -m build`"],
        ["Publish a library", "`dotnet nuget push` to nuget.org or a private feed", "`twine upload` to PyPI or a private index"],
        ["Ship an app", "`dotnet publish` (framework-dependent, self-contained, single-file, Native AOT)", "a wheel plus `pip install`, a container image, or PyInstaller"],
      ],
      notes: [
        "A wheel (.whl) is Python's ready-to-install package format; an sdist is the source archive it can be built from. A .nupkg is NuGet's zip of compiled assemblies plus metadata. Both ecosystems support private feeds or indexes for company-internal packages.",
        "A lock file records the exact version of every package, including the dependencies of your dependencies, so every developer machine, CI run and server installs the same thing. Commit lock files for applications; libraries usually declare ranges and leave pinning to the application that uses them.",
      ],
    },
    {
      kind: "terms",
      title: "Words from this lesson",
      terms: [
        { term: ".csproj", meaning: "An MSBuild project file: target framework, settings, package and project references for one .NET project." },
        { term: "Solution", meaning: "A .sln or .slnx file grouping several .NET projects that are built and opened together." },
        { term: "pyproject.toml", meaning: "The standard file describing a Python project: name, version, dependencies, build backend and tool settings." },
        { term: "Wheel", meaning: "Python's built, ready-to-install package format (.whl)." },
        { term: "NuGet package", meaning: "A .nupkg file with compiled .NET assemblies and metadata, installed from nuget.org or a private feed." },
        { term: "Lock file", meaning: "A file pinning the exact versions of all dependencies, direct and indirect, for repeatable installs." },
        { term: "Editable install", meaning: "`pip install -e .`: installs a package as a link to its source folder, so edits take effect immediately." },
        { term: "Transitive dependency", meaning: "A package you depend on indirectly, because one of your dependencies needs it." },
      ],
    },
  ],
  predict: [
    {
      lang: "python",
      code: src`
print("1.10.0" > "1.9.0")
print((1, 10, 0) > (1, 9, 0))
`,
      output: "False\nTrue",
      distractors: ["True\nTrue", "False\nFalse", "True\nFalse"],
      why: "Strings compare character by character, and at the third character \"1\" sorts before \"9\". Tuples compare element by element as numbers, so 10 beats 9.",
    },
    {
      lang: "python",
      code: src`
versions = ["1.10", "1.2", "1.9"]
print(sorted(versions))
print(sorted(versions, key=lambda v: [int(p) for p in v.split(".")]))
`,
      output: "['1.10', '1.2', '1.9']\n['1.2', '1.9', '1.10']",
      distractors: ["['1.2', '1.9', '1.10']\n['1.2', '1.9', '1.10']", "['1.10', '1.2', '1.9']\n['1.10', '1.9', '1.2']", "['1.2', '1.10', '1.9']\n['1.2', '1.9', '1.10']"],
      why: "As text, \"1.1\" sorts before \"1.2\", so \"1.10\" comes first. The key turns each version into a list of ints, which compares numerically.",
    },
    {
      lang: "python",
      code: src`
import json
import json as j
import sys

print(j is json, "json" in sys.modules, j.__name__)
`,
      output: "True True json",
      distractors: ["False True j", "True False json", "False False json"],
      why: "A module is loaded once and cached in `sys.modules`; every import, aliased or not, gets the same module object, whose name is still json.",
    },
    {
      lang: "python",
      code: src`
def bump(version, part):
    major, minor, patch = map(int, version.split("."))
    if part == "major":
        return f"{major + 1}.0.0"
    if part == "minor":
        return f"{major}.{minor + 1}.0"
    return f"{major}.{minor}.{patch + 1}"

print(bump("1.4.9", "patch"), bump("1.4.9", "minor"), bump("1.4.9", "major"))
`,
      output: "1.4.10 1.5.0 2.0.0",
      distractors: ["1.5.0 1.5.0 2.0.0", "1.4.10 1.5.9 2.4.9", "1.4.10 1.5.0 2.4.9"],
      why: "Under SemVer, bumping a part resets the parts to its right to zero; a patch bump of 9 just becomes 10.",
    },
    {
      lang: "csharp",
      code: src`
Console.WriteLine(new Version("1.10.0") > new Version("1.9.3"));
Console.WriteLine(string.CompareOrdinal("1.10.0", "1.9.3") > 0);
`,
      output: "True\nFalse",
      distractors: ["True\nTrue", "False\nFalse", "False\nTrue"],
      why: "`System.Version` compares each part as a number. Ordinal string comparison looks at characters: '1' comes before '9', so the text \"1.10.0\" is smaller.",
    },
    {
      lang: "csharp",
      code: src`
var v = Version.Parse("2.1");
Console.WriteLine($"{v.Major} {v.Minor} {v.Build}");
Console.WriteLine(new Version(2, 1) == new Version(2, 1, 0));
`,
      output: "2 1 -1\nFalse",
      distractors: ["2 1 0\nTrue", "2 1 0\nFalse", "2 1 -1\nTrue"],
      why: "Parts that weren't given are -1, not 0, so 2.1 and 2.1.0 are different versions to `System.Version`, which surprises people comparing NuGet-style versions.",
    },
    {
      lang: "csharp",
      code: src`
string[] input = ["3.0.0-beta", "2.4.1", "2.10.0"];
var parsed = input.Where(s => Version.TryParse(s, out _)).Select(Version.Parse).Max();
Console.WriteLine(parsed);
`,
      output: "2.10.0",
      distractors: ["3.0.0-beta", "2.4.1", "FormatException"],
      why: "`System.Version` can't parse a pre-release suffix, so \"3.0.0-beta\" is filtered out by `TryParse`. Of the rest, 2.10.0 is the highest when compared as numbers.",
    },
  ],
  pitfalls: [
    "Comparing or sorting versions as strings.",
    "Installing packages into the global Python instead of a virtual environment, so projects clash and builds can't be reproduced.",
    "No lock file for an application, so a new install quietly picks up different dependency versions.",
    "Copying the same package version or compiler setting into every .csproj instead of `Directory.Packages.props` and `Directory.Build.props`.",
    "Committing `bin/`, `obj/`, `.venv/` or `__pycache__/`. They're build output; list them in `.gitignore`.",
  ],
  next: [
    { id: "adv-semver-compare", label: "Exercise: Compare Semantic Versions" },
    { id: "lang-modules", label: "Modules, Namespaces and Packages (recap)" },
    { id: "lang-cheat-translate", label: "C# vs Python Translation Table" },
  ],
};
