using System.Text.Json;
using System.Text.Json.Serialization;
using DsaAcademy.Data;

namespace DsaAcademy.Content;

// The lesson content as static JSON files, for the static site (docs/adr/0010): the exact
// bodies GET /api/lessons, /api/lessons/{id} and /api/tools/{id} return for a user with no
// progress. The static client reads these and fills in the per-user fields (completed,
// attempts, evidence) from progress kept in the browser.
//
//   dotnet run --project server/server.csproj --no-launch-profile -- --export-content <dir>
//
// writes <dir>/lessons.json, <dir>/lessons/<id>.json and <dir>/tools/<id>.json.
public static class ContentExport
{
    // The same output as the API: web defaults (camelCase) and enums as camelCase strings
    // (see ConfigureHttpJsonOptions in Program.cs).
    public static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };

    // The sidebar listing, shared with GET /api/lessons. Stable OrderBy: ties (most items, at
    // the default Order = 100) keep their registry position.
    public static List<NavItem> NavItems(Func<string, bool> completed)
    {
        var practiceItems = ConceptRegistry.GetAll()
            .Select(c => (c.Order, Item: new NavItem(c.Id, "practice", c.Section, c.Track, c.Title, c.OneLiner, completed(c.Id))));
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

        Save("lessons.json", NavItems(_ => false));
        var concepts = ConceptRegistry.GetAll();
        foreach (var c in concepts)
            Save(Path.Combine("lessons", $"{c.Id}.json"), c.ToDetail(false, 0, ProgressService.Evidence(c.Id, [])));
        var tools = ToolRegistry.GetAll();
        foreach (var t in tools)
            Save(Path.Combine("tools", $"{t.Id}.json"), t.ToDetail());

        Console.WriteLine($"Exported {concepts.Count} graded lessons and {tools.Count} tool lessons to {root}");
    }
}
