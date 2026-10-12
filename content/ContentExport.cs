using System.Text.Json;
using System.Text.Json.Serialization;

namespace DsaAcademy.Content;

// The lesson content as JSON files, which the site loads (client/src/localBackend.ts):
//
//   dotnet run --project content -- <dir>
//
// writes <dir>/lessons.json (the sidebar listing), <dir>/lessons/<id>.json (one graded
// exercise each) and <dir>/tools/<id>.json (one tool lesson each). The per-learner fields
// (completed, attempts, evidence) are written empty; the client fills them in from the
// progress kept in the browser.
public static class ContentExport
{
    // Web defaults (camelCase) and enums as camelCase strings, as the client's types.ts expects.
    public static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };

    // The sidebar listing. Stable OrderBy: ties (most items, at the default Order = 100) keep
    // their registry position.
    public static List<NavItem> NavItems()
    {
        var practiceItems = ConceptRegistry.GetAll()
            .Select(c => (c.Order, Item: new NavItem(c.Id, "practice", c.Section, c.Track, c.Title, c.OneLiner, false)));
        var toolItems = ToolRegistry.GetAll()
            .Select(t => (t.Order, Item: new NavItem(t.Id, "tool", t.Section, t.Track, t.Title, t.OneLiner, false)));

        return practiceItems.Concat(toolItems)
            .OrderBy(x => SectionOrder.For(x.Item.Section))
            .ThenBy(x => x.Order)
            .Select(x => x.Item)
            .ToList();
    }

    public static void Write(string dir)
    {
        var root = Path.GetFullPath(dir);
        Directory.CreateDirectory(Path.Combine(root, "lessons"));
        Directory.CreateDirectory(Path.Combine(root, "tools"));

        void Save(string relative, object value) =>
            File.WriteAllText(Path.Combine(root, relative), JsonSerializer.Serialize(value, JsonOptions));

        Save("lessons.json", NavItems());
        var concepts = ConceptRegistry.GetAll();
        foreach (var c in concepts)
            Save(Path.Combine("lessons", $"{c.Id}.json"), c.ToDetail(false, 0, LessonEvidence.None(c.Id)));
        var tools = ToolRegistry.GetAll();
        foreach (var t in tools)
            Save(Path.Combine("tools", $"{t.Id}.json"), t.ToDetail());

        Console.WriteLine($"Exported {concepts.Count} graded lessons and {tools.Count} tool lessons to {root}");
    }
}
