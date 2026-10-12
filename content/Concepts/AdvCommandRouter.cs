namespace DsaAcademy.Content.Concepts;

public class AdvCommandRouter : IConcept
{
    public string Id => "adv-command-router";
    public string Section => Basics.Section;
    public string Track => Adv.Track;
    public int Order => 2601;
    public string Title => "Route Commands with List Patterns";
    public string OneLiner => "Turn operator commands such as start P1, set FT-1 42 and alarm ack 3 7 into responses with one switch expression or match statement over the list of words.";
    public string KeyTakeaway =>
        "List patterns match a command's words and their count in one step: [\"stop\"], [\"stop\", var tag], [\"alarm\", " +
        "\"ack\", .. var ids] / [\"alarm\", \"ack\", *ids]. Order the arms from specific to general, use a guard for " +
        "conditions a pattern can't express, and finish with a catch-all.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write Route(words), which takes one command already split into words and returns the response:\n\n" +
        "[\"start\", tag] gives \"starting tag\". [\"stop\"] gives \"stopping all\" and [\"stop\", tag] gives \"stopping tag\". " +
        "[\"set\", tag, value] gives \"set tag to value\" when value is a whole number (digits with an optional leading " +
        "minus sign), and \"bad value: value\" otherwise. [\"alarm\", \"ack\"] followed by one or more alarm ids gives " +
        "\"acknowledged N alarms\" (N is how many ids), and with no ids \"nothing to acknowledge\". An empty command gives " +
        "\"empty\". Anything else, including the right word with the wrong number of arguments, gives \"unknown: \" and " +
        "the words joined by single spaces.\n\n" +
        "Each test passes several command lines; the checker splits each on spaces and reports your responses in " +
        "order. Write it as one C# switch expression with list patterns (words switch { [\"stop\"] => ..., [\"start\", " +
        "var tag] => ..., [\"alarm\", \"ack\", .. var ids] => ..., ... }) or one Python match statement with sequence " +
        "patterns (case [\"alarm\", \"ack\", *ids]:). For set, a when clause (C#) or an if guard (Python) can test the " +
        "value with int.TryParse or a small helper; in Python, int(value) inside try / except ValueError works too.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static string Route(string[] words) => words switch\n" +
            "    {\n" +
            "        [\"stop\"] => \"stopping all\",\n" +
            "        // TODO: start, stop with a tag, set, alarm ack, empty\n" +
            "        _ => $\"unknown: {string.Join(\" \", words)}\",\n" +
            "    };\n" +
            "}\n",
        ["python"] =
            "def route(words):\n" +
            "    match words:\n" +
            "        case [\"stop\"]:\n" +
            "            return \"stopping all\"\n" +
            "        # TODO: start, stop with a tag, set, alarm ack, empty\n" +
            "        case _:\n" +
            "            return \"unknown: \" + \" \".join(words)\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Route",
        ["python"] = "route",
    };

    public string? CSharpHarnessPreamble =>
        "public static class RouteCheck\n" +
        "{\n" +
        "    public static List<string> Check(string[] lines) =>\n" +
        "        lines.Select(line => Solution.Route(line.Split(' ', StringSplitOptions.RemoveEmptyEntries))).ToList();\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "def check_route(lines):\n" +
        "    return [route(line.split()) for line in lines]\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Basics.StrArray("start P1", "stop P1", "stop"),
            "[\"starting P1\", \"stopping P1\", \"stopping all\"]"),
        new TestCase(Basics.StrArray("set FT-1 42", "set FT-1 -3", "set FT-1 abc", "set FT-1 4.5"),
            "[\"set FT-1 to 42\", \"set FT-1 to -3\", \"bad value: abc\", \"bad value: 4.5\"]"),
        new TestCase(Basics.StrArray("alarm ack 3 7 12", "alarm ack 9", "alarm ack"),
            "[\"acknowledged 3 alarms\", \"acknowledged 1 alarms\", \"nothing to acknowledge\"]"),
        new TestCase(Basics.StrArray("", "start", "start P1 P2", "reboot now", "set FT-1"),
            "[\"empty\", \"unknown: start\", \"unknown: start P1 P2\", \"unknown: reboot now\", \"unknown: set FT-1\"]"),
        new TestCase(Basics.StrArray("stop P1 P2", "alarm", "STOP", "alarm clear 3"),
            "[\"unknown: stop P1 P2\", \"unknown: alarm\", \"unknown: STOP\", \"unknown: alarm clear 3\"]"),
    ];

    public string CSharpCallTemplate => "RouteCheck.Check({input})";
    public string PythonCallTemplate => "check_route({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        object[] words = ["alarm", "ack", "3", "7", "12"];
        return
        [
            Basics.Step(words, [], "?", "response", "The command \"alarm ack 3 7 12\" as a list of five words."),
            Basics.Step(words, [0], "?", "response", "[\"stop\"] needs exactly one word, \"stop\": no match. [\"start\", var tag] needs two words starting with \"start\": no match."),
            Basics.Step(words, [0, 1], "?", "response", "[\"alarm\", \"ack\", .. var ids]: the first two words match the literals..."),
            Basics.Step(words, [2, 3, 4], "acknowledged 3 alarms", "response", "...and .. var ids (or *ids) captures the remaining three words, so the answer counts them."),
        ];
    }
}
