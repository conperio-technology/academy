namespace DsaAcademy.Content.Concepts;

// Shared by the beginner exercises in the "Programming in C# & Python" section (ids
// starting "basics-"): the section name, extra literal builders, and a one-line way to
// make an array visualizer frame.
internal static class Basics
{
    public const string Section = "Programming in C# & Python";

    // ["a", "b"]: valid C# (collection expression), Python and JSON.
    public static string StrArray(params string[] values) => "[" + string.Join(", ", values.Select(Lit.Str)) + "]";

    public static VisualizationStep Step(object[] array, int[] highlight, object tracker, string trackerLabel, string message) =>
        new(new Dictionary<string, object> { ["array"] = array, ["tracker"] = tracker, ["trackerLabel"] = trackerLabel }, highlight, message);

    public static object[] Chars(string s) => s.Select(c => (object)(c == ' ' ? "␣" : c.ToString())).ToArray();

    public static object[] Boxed(IEnumerable<int> values) => values.Select(v => (object)v).ToArray();
}
