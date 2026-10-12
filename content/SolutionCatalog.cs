using System.Reflection;

namespace DsaAcademy.Content;

// One reference solution per (concept, language), revealed under the editor once you've
// passed the lesson or tried it a few times (see the client's ReferenceSolution.tsx).
// Each lives as a real source file in Solutions/ -- {id}.csx for C#, {id}.py
// for Python -- embedded into the assembly, rather than as a string property on each
// concept: multi-line solutions read and edit far better as files with syntax
// highlighting than as escaped "...\n" + chains. (.csx so MSBuild doesn't try to compile
// them into the exporter itself.) Every solution should pass its own concept's tests.
public static class SolutionCatalog
{
    private static readonly Dictionary<string, string> Extensions = new()
    {
        ["csharp"] = ".csx",
        ["python"] = ".py",
    };

    private static readonly Dictionary<(string ConceptId, string Language), string> Table = Load();

    public static Dictionary<string, string> For(string conceptId) =>
        Extensions.Keys
            .Where(lang => Table.ContainsKey((conceptId, lang)))
            .ToDictionary(lang => lang, lang => Table[(conceptId, lang)]);

    private static Dictionary<(string, string), string> Load()
    {
        var assembly = Assembly.GetExecutingAssembly();
        var table = new Dictionary<(string, string), string>();
        foreach (var name in assembly.GetManifestResourceNames())
        {
            const string prefix = "Solutions/";
            if (!name.StartsWith(prefix)) continue;
            var file = name[prefix.Length..];
            foreach (var (lang, ext) in Extensions)
            {
                if (!file.EndsWith(ext)) continue;
                using var reader = new StreamReader(assembly.GetManifestResourceStream(name)!);
                table[(file[..^ext.Length], lang)] = reader.ReadToEnd();
            }
        }
        return table;
    }
}
