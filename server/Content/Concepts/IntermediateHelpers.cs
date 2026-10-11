namespace DsaAcademy.Content.Concepts;

// Shared by the intermediate exercises in the "Programming in C# & Python" section (ids
// starting "inter-"). They use the same section and visualizer helpers as the basics
// exercises (Basics in BasicsHelpers.cs); this adds the track name and a grid literal.
internal static class Inter
{
    public const string Track = "intermediate";

    // [[1, 2], [3, 4]]: valid C# (a collection expression for int[][]), Python and JSON.
    public static string Grid(params int[][] rows) => "[" + string.Join(", ", rows.Select(Lit.IntArray)) + "]";
}
