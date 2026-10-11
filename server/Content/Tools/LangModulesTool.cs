namespace DsaAcademy.Content.Tools;

public class LangModulesTool : ITool
{
    public string Id => "lang-modules";
    public string Section => "Programming in C# & Python";
    public string Track => "intermediate";
    public int Order => 1950;
    public string Title => "Modules, Namespaces and Packages";
    public string OneLiner => "Organising code across files: C# namespaces, using and assemblies, Python modules, packages and imports, the entry point and if __name__ == \"__main__\", and installing packages with NuGet and pip in a virtual environment.";
    public string KeyTakeaway =>
        "C# namespaces are names only; every file in a project compiles together and using shortens names. A Python " +
        "module is a file and a package is a folder; import runs a module once and caches it. Guard script code with " +
        "if __name__ == \"__main__\", and give each Python project its own virtual environment.";

    public ToolKind ToolKind => ToolKind.LangModules;

    public string Explanation =>
        "Real programs don't fit in one file. This lesson covers how each language splits code into named pieces and " +
        "brings them back together, and how to use other people's code.\n\n" +
        "In C#, types are grouped into namespaces such as System.Text, which become part of each type's full name, and a " +
        "using line lets you leave the namespace off. Namespaces don't care which file or folder code is in: all the " +
        "files of a project compile together into one assembly, a .dll or .exe, and projects reference each other's " +
        "assemblies.\n\n" +
        "In Python the file is the unit: a module is a .py file, a package is a folder of them, and import finds a module " +
        "by name, runs it once and caches it. Because importing runs the file, scripts guard their start-up code with " +
        "if __name__ == \"__main__\": so the same file can also be imported by other code and by tests.\n\n" +
        "Finally, packages from the internet: NuGet for .NET and pip with PyPI for Python, and why every Python project " +
        "should have its own virtual environment so different projects' packages don't clash.";
}
