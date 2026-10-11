namespace DsaAcademy.Content.Tools;

public class LangPackagingTool : ITool
{
    public string Id => "lang-packaging";
    public string Section => "Programming in C# & Python";
    public string Track => "advanced";
    public int Order => 2950;
    public string Title => "Packaging and Project Structure";
    public string OneLiner => "The .csproj and pyproject.toml files, repository layouts with separate library, app and test projects, NuGet and pip dependencies, virtual environments, semantic versioning, lock files, and building and publishing packages.";
    public string KeyTakeaway =>
        "A .csproj or pyproject.toml declares what a project is and what it depends on. Keep logic in a library with tests beside it, isolate Python projects in virtual environments, pin exact versions with a lock file for applications, and compare versions as numbers, never as strings.";

    public ToolKind ToolKind => ToolKind.LangPackaging;

    public string Explanation =>
        "Real projects are more than one file. This lesson walks through how .NET and Python projects are described, laid out, versioned and shared: the project file, a sensible repository layout, dependency ranges and lock files, and the commands that build and publish packages.\n\n" +
        "It's mostly reference material with project files and commands to adapt. The exercise after it compares semantic version strings, including pre-releases, a small task that's easy to get wrong.";
}
