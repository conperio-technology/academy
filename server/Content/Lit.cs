using System.Text.Json;

namespace DsaAcademy.Content;

// Builds test-case argument literals that are simultaneously valid C#, valid Python,
// and valid JSON, so one literal can be substituted into a concept's CSharpCallTemplate
// (compiled server-side) and PythonCallTemplate (run client-side via Pyodide) alike.
//
// This works because:
// - `[1, 2, 3]` is a C# 12+ target-typed collection expression (valid wherever an
//   int[] parameter is expected) AND a Python list literal AND a JSON array.
// - `"abc"` (JSON-escaped) is a valid string literal in all three for ordinary text.
public static class Lit
{
    public static string IntArray(IEnumerable<int> values) => "[" + string.Join(", ", values) + "]";

    public static string Str(string value) => JsonSerializer.Serialize(value);

    public static string Int(int value) => value.ToString();

    // Joins several literals into one multi-argument call, e.g.
    // Args(IntArray([2, 7, 11, 15]), Int(9)) -> "[2, 7, 11, 15], 9", substituted
    // wholesale into a concept's "{input}" call template.
    public static string Args(params string[] parts) => string.Join(", ", parts);
}
