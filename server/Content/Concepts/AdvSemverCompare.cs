namespace DsaAcademy.Content.Concepts;

public class AdvSemverCompare : IConcept
{
    public string Id => "adv-semver-compare";
    public string Section => Basics.Section;
    public string Track => Adv.Track;
    public int Order => 2951;
    public string Title => "Compare Semantic Versions";
    public string OneLiner => "Write a comparison function for semantic versions such as 1.10.0, 2.0.0-rc.1 and 1.0.0+build.5, following the SemVer rules for numbers, pre-releases and build metadata, and use it to sort.";
    public string KeyTakeaway =>
        "Never compare versions as text. Compare MAJOR, MINOR and PATCH as numbers; a pre-release (after -) sorts " +
        "before the release itself; pre-release parts compare numerically when both are numbers, as text otherwise, " +
        "with numbers first; and build metadata (after +) is ignored. A comparison function returning -1, 0 or 1 then " +
        "plugs into any sort.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write CompareVersions(a, b), which returns -1 if version a comes before b, 0 if they have the same precedence, " +
        "and 1 if a comes after b. Versions look like MAJOR.MINOR.PATCH, optionally followed by -PRERELEASE and then " +
        "+BUILD, for example 1.10.0, 2.0.0-rc.1 and 1.0.0-beta.11+exp.sha.5114f85. All inputs are valid.\n\n" +
        "The rules, from the Semantic Versioning specification: first compare MAJOR, then MINOR, then PATCH, as numbers " +
        "(so 1.10.0 is after 1.9.3). If those are equal, a version with a pre-release comes before one without " +
        "(1.0.0-rc.1 is before 1.0.0). If both have pre-releases, split them at the dots and compare part by part: two " +
        "numeric parts compare as numbers (beta.2 before beta.11), two text parts compare by character codes (so \"B\" " +
        "comes before \"a\"), and a numeric part comes before a text part. If every compared part is equal, the one with " +
        "fewer parts comes first (alpha before alpha.1). Build metadata after + is ignored completely, so 2.1.0+build.5 " +
        "and 2.1.0 compare as 0.\n\n" +
        "Each test reports [CompareVersions(first, second), the whole list sorted with your function]. The sort is " +
        "stable, so versions that compare as 0 keep their original order. Use string.CompareOrdinal for text parts in " +
        "C# (culture-aware comparison would sort \"a\" before \"B\"); Python's < on strings already compares code points. " +
        "In Python the checker sorts with functools.cmp_to_key(compare_versions).";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int CompareVersions(string a, string b)\n" +
            "    {\n" +
            "        // TODO: numbers first, then pre-release rules, ignoring +build.\n" +
            "        return Math.Sign(string.CompareOrdinal(a, b));\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def compare_versions(a, b):\n" +
            "    # TODO: numbers first, then pre-release rules, ignoring +build.\n" +
            "    return (a > b) - (a < b)\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CompareVersions",
        ["python"] = "compare_versions",
    };

    public string? CSharpHarnessPreamble =>
        "public static class SemverCheck\n" +
        "{\n" +
        "    public static List<object> Check(string[] versions) =>\n" +
        "    [\n" +
        "        Solution.CompareVersions(versions[0], versions[1]),\n" +
        "        versions.Order(Comparer<string>.Create(Solution.CompareVersions)).ToList(),\n" +
        "    ];\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "import functools\n" +
        "\n" +
        "\n" +
        "def check_semver(versions):\n" +
        "    return [\n" +
        "        compare_versions(versions[0], versions[1]),\n" +
        "        sorted(versions, key=functools.cmp_to_key(compare_versions)),\n" +
        "    ]\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Basics.StrArray("1.10.0", "1.9.3", "2.0.0", "1.2.11"),
            "[1, [\"1.2.11\", \"1.9.3\", \"1.10.0\", \"2.0.0\"]]"),
        new TestCase(Basics.StrArray("1.0.0", "1.0.0-rc.1", "1.0.0-alpha", "1.0.0-beta.11", "1.0.0-beta.2", "1.0.0-alpha.1", "1.0.0-beta", "1.0.0-alpha.beta"),
            "[1, [\"1.0.0-alpha\", \"1.0.0-alpha.1\", \"1.0.0-alpha.beta\", \"1.0.0-beta\", \"1.0.0-beta.2\", \"1.0.0-beta.11\", \"1.0.0-rc.1\", \"1.0.0\"]]"),
        new TestCase(Basics.StrArray("2.1.0+build.5", "2.1.0", "2.1.0-rc.1+exp"),
            "[0, [\"2.1.0-rc.1+exp\", \"2.1.0+build.5\", \"2.1.0\"]]"),
        new TestCase(Basics.StrArray("0.9.9", "0.10.0"), "[-1, [\"0.9.9\", \"0.10.0\"]]"),
        new TestCase(Basics.StrArray("3.0.0-rc.1", "3.0.0-rc.1"), "[0, [\"3.0.0-rc.1\", \"3.0.0-rc.1\"]]"),
        new TestCase(Basics.StrArray("1.0.0-2", "1.0.0-10", "1.0.0-a", "1.0.0-B", "1.0.0-1.a"),
            "[-1, [\"1.0.0-1.a\", \"1.0.0-2\", \"1.0.0-10\", \"1.0.0-B\", \"1.0.0-a\"]]"),
    ];

    public string CSharpCallTemplate => "SemverCheck.Check({input})";
    public string PythonCallTemplate => "check_semver({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        object[] parts = ["1", "0", "0", "beta", "11"];
        return
        [
            Basics.Step(parts, [0, 1, 2], "same", "1.0.0-beta.11 vs 1.0.0-beta.2", "MAJOR, MINOR and PATCH are equal as numbers: go on to the pre-release."),
            Basics.Step(parts, [3], "same", "1.0.0-beta.11 vs 1.0.0-beta.2", "\"beta\" and \"beta\" are text parts and equal."),
            Basics.Step(parts, [4], "after", "1.0.0-beta.11 vs 1.0.0-beta.2", "11 and 2 are both numeric, so compare them as numbers: 11 > 2. As text, \"11\" would wrongly come first."),
            Basics.Step(parts, [], "1", "result", "So CompareVersions returns 1: beta.11 comes after beta.2. And 1.0.0 itself comes after every 1.0.0 pre-release."),
        ];
    }
}
