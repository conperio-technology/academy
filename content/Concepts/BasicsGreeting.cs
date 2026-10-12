namespace DsaAcademy.Content.Concepts;

public class BasicsGreeting : IConcept
{
    public string Id => "basics-greeting";
    public string Section => Basics.Section;
    public string Track => "basics";
    public int Order => 51;
    public string Title => "Greeting with a Default";
    public string OneLiner => "Write a function with an optional parameter, clean up its input, and build the result with string interpolation.";
    public string KeyTakeaway =>
        "A default value makes a parameter optional: string greeting = \"Hello\" in C#, greeting=\"Hello\" in Python. Clean " +
        "inputs (trim, check for empty) at the top of a function so the rest of it can trust them.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write Greet(name, greeting) returning \"<greeting>, <name>!\". The greeting is optional and defaults to " +
        "\"Hello\", so Greet(\"Ada\") gives \"Hello, Ada!\" and Greet(\"Ada\", \"Welcome back\") gives \"Welcome back, " +
        "Ada!\". Trim spaces from the start and end of the name, and if nothing is left, use \"stranger\" instead.\n\n" +
        "Give the second parameter a default value in the function's definition: string greeting = \"Hello\" in C#, " +
        "greeting=\"Hello\" in Python. Then clean the name first: name.Trim() / name.strip(), and check whether the " +
        "result is empty (string.IsNullOrEmpty(trimmed) or trimmed.Length == 0 in C#; if not trimmed: in Python, since " +
        "an empty string is falsy). Finally build the result with interpolation: $\"{greeting}, {trimmed}!\" or " +
        "f\"{greeting}, {trimmed}!\".\n\n" +
        "The tests call the function both with and without the second argument, so the default really has to be there. " +
        "Until you add it, running the starter code fails before any test runs: C# reports error CS7036 (no argument given " +
        "for the required parameter 'greeting') and Python raises a TypeError about a missing argument. That message is " +
        "the language telling you exactly what this exercise is about.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    // TODO: make greeting optional, defaulting to \"Hello\".\n" +
            "    public static string Greet(string name, string greeting)\n" +
            "    {\n" +
            "        // TODO: trim the name; use \"stranger\" if it's empty.\n" +
            "        return \"\";\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "# TODO: make greeting optional, defaulting to \"Hello\".\n" +
            "def greet(name, greeting):\n" +
            "    # TODO: trim the name; use \"stranger\" if it's empty.\n" +
            "    return \"\"\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Greet",
        ["python"] = "greet",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Str("Ada"), Lit.Str("Hello, Ada!")),
        new TestCase(Lit.Args(Lit.Str("Ada"), Lit.Str("Welcome back")), Lit.Str("Welcome back, Ada!")),
        new TestCase(Lit.Str("  Linus "), Lit.Str("Hello, Linus!")),
        new TestCase(Lit.Str(""), Lit.Str("Hello, stranger!")),
        new TestCase(Lit.Args(Lit.Str("   "), Lit.Str("Hi")), Lit.Str("Hi, stranger!")),
    ];

    public string CSharpCallTemplate => "Solution.Greet({input})";
    public string PythonCallTemplate => "greet({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        object[] parts = ["name", "trim", "empty?", "build"];
        return
        [
            Basics.Step(parts, [0], "\"  Linus \"", "name", "Called as Greet(\"  Linus \") with no greeting, so greeting takes its default, \"Hello\"."),
            Basics.Step(parts, [1], "\"Linus\"", "name", "Trim the spaces from both ends."),
            Basics.Step(parts, [2], "\"Linus\"", "name", "Not empty, so keep it. (\"   \" would trim to \"\" and become \"stranger\".)"),
            Basics.Step(parts, [3], "\"Hello, Linus!\"", "result", "Interpolate: greeting, a comma and space, the name, an exclamation mark."),
        ];
    }
}
