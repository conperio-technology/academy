namespace DsaAcademy.Content.Concepts;

public class AdvParseResult : IConcept
{
    public string Id => "adv-parse-result";
    public string Section => Basics.Section;
    public string Track => Adv.Track;
    public int Order => 2802;
    public string Title => "Validate Endpoints with a Result Type";
    public string OneLiner => "Parse host:port settings into a Result that is either an endpoint or a clear error message, then validate a whole list and report every bad line at once instead of stopping at the first.";
    public string KeyTakeaway =>
        "When bad input is expected, return a result instead of throwing: the caller sees success or a specific " +
        "reason, and nothing is thrown in the loop. Results also make it natural to collect every error in one pass, " +
        "which is what users of a config file or form want.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write two functions. ParseEndpoint(text) turns \"host:port\" into an Endpoint(Host, Port), splitting at the " +
        "last colon, and returns a Result: Ok with the endpoint, or an error with one of these messages, checked in " +
        "this order: \"missing port\" when there's no colon; \"empty host\" when nothing comes before it; \"port is not a " +
        "number\" when the part after it is empty or contains anything but the digits 0 to 9; \"port out of range\" when " +
        "the number isn't between 1 and 65535. So \"plc-1:502\" is fine, \"hmi:http\" isn't a number and \"c:-1\" isn't a " +
        "number either (the minus sign isn't a digit).\n\n" +
        "ParseAll(lines) parses every line and returns Ok with the list of all endpoints if every line is fine, or an " +
        "error listing every bad line, numbered from 1, joined by \"; \": \"line 2: missing port; line 4: port out of " +
        "range\". The checker reports each line's result (\"host:port\" or \"error: message\") and then ParseAll's verdict " +
        "(\"ok: N\" or \"errors: ...\").\n\n" +
        "The Result and Endpoint types are provided. In C#: Result<T>.Ok(value) and Result<T>.Fail(error), with IsOk, " +
        "Value and Error properties, and record Endpoint(string Host, int Port). In Python: Ok(value) and Err(error) " +
        "dataclasses, and Endpoint(host, port); match result: case Ok(value): ... case Err(error): ... tells them apart. " +
        "Watch for numbers too big for an int in C#: check the length or use long, or int.TryParse failing will look " +
        "like \"not a number\".";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static Result<Endpoint> ParseEndpoint(string text)\n" +
            "    {\n" +
            "        int colon = text.LastIndexOf(':');\n" +
            "        if (colon < 0) return Result<Endpoint>.Fail(\"missing port\");\n" +
            "        // TODO: empty host, port is not a number, port out of range\n" +
            "        return Result<Endpoint>.Ok(new Endpoint(text[..colon], int.Parse(text[(colon + 1)..])));\n" +
            "    }\n" +
            "\n" +
            "    public static Result<List<Endpoint>> ParseAll(string[] lines)\n" +
            "    {\n" +
            "        // TODO: collect every endpoint, or every error as \"line N: message\".\n" +
            "        return Result<List<Endpoint>>.Ok([]);\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def parse_endpoint(text):\n" +
            "    host, colon, port = text.rpartition(\":\")\n" +
            "    if not colon:\n" +
            "        return Err(\"missing port\")\n" +
            "    # TODO: empty host, port is not a number, port out of range\n" +
            "    return Ok(Endpoint(host, int(port)))\n" +
            "\n" +
            "\n" +
            "def parse_all(lines):\n" +
            "    # TODO: collect every endpoint, or every error as \"line N: message\".\n" +
            "    return Ok([])\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.ParseEndpoint",
        ["python"] = "parse_endpoint",
    };

    public string? CSharpHarnessPreamble =>
        "public record Endpoint(string Host, int Port);\n" +
        "\n" +
        "public record Result<T>(bool IsOk, T? Value, string? Error)\n" +
        "{\n" +
        "    public static Result<T> Ok(T value) => new(true, value, null);\n" +
        "    public static Result<T> Fail(string error) => new(false, default, error);\n" +
        "}\n" +
        "\n" +
        "public static class EndpointCheck\n" +
        "{\n" +
        "    public static List<object> Check(string[] lines)\n" +
        "    {\n" +
        "        var each = lines.Select(Solution.ParseEndpoint)\n" +
        "            .Select(r => r.IsOk ? $\"{r.Value!.Host}:{r.Value.Port}\" : $\"error: {r.Error}\")\n" +
        "            .ToList();\n" +
        "        var all = Solution.ParseAll(lines);\n" +
        "        return [each, all.IsOk ? $\"ok: {all.Value!.Count}\" : $\"errors: {all.Error}\"];\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "from dataclasses import dataclass\n" +
        "\n" +
        "\n" +
        "@dataclass(frozen=True)\n" +
        "class Endpoint:\n" +
        "    host: str\n" +
        "    port: int\n" +
        "\n" +
        "\n" +
        "@dataclass(frozen=True)\n" +
        "class Ok:\n" +
        "    value: object\n" +
        "\n" +
        "\n" +
        "@dataclass(frozen=True)\n" +
        "class Err:\n" +
        "    error: str\n" +
        "\n" +
        "\n" +
        "def check_endpoints(lines):\n" +
        "    each = []\n" +
        "    for line in lines:\n" +
        "        match parse_endpoint(line):\n" +
        "            case Ok(Endpoint(host, port)):\n" +
        "                each.append(f\"{host}:{port}\")\n" +
        "            case Err(error):\n" +
        "                each.append(f\"error: {error}\")\n" +
        "    match parse_all(lines):\n" +
        "        case Ok(endpoints):\n" +
        "            verdict = f\"ok: {len(endpoints)}\"\n" +
        "        case Err(error):\n" +
        "            verdict = f\"errors: {error}\"\n" +
        "    return [each, verdict]\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Basics.StrArray("plc-1:502", "10.0.0.5:44818"), "[[\"plc-1:502\", \"10.0.0.5:44818\"], \"ok: 2\"]"),
        new TestCase(Basics.StrArray("plc-1", ":502", "hmi:http", "scada:70000"),
            "[[\"error: missing port\", \"error: empty host\", \"error: port is not a number\", \"error: port out of range\"], " +
            "\"errors: line 1: missing port; line 2: empty host; line 3: port is not a number; line 4: port out of range\"]"),
        new TestCase(Basics.StrArray(), "[[], \"ok: 0\"]"),
        new TestCase(Basics.StrArray("a:0", "b:65535", "c:-1"),
            "[[\"error: port out of range\", \"b:65535\", \"error: port is not a number\"], \"errors: line 1: port out of range; line 3: port is not a number\"]"),
        new TestCase(Basics.StrArray("opc:4840:x", "opc.tcp:4840", "db:", "big:99999999999"),
            "[[\"error: port is not a number\", \"opc.tcp:4840\", \"error: port is not a number\", \"error: port out of range\"], " +
            "\"errors: line 1: port is not a number; line 3: port is not a number; line 4: port out of range\"]"),
        new TestCase(Basics.StrArray("hist:8080", "hist:08080", "hist: 80", "hist:000080"),
            "[[\"hist:8080\", \"hist:8080\", \"error: port is not a number\", \"hist:80\"], \"errors: line 3: port is not a number\"]"),
    ];

    public string CSharpCallTemplate => "EndpointCheck.Check({input})";
    public string PythonCallTemplate => "check_endpoints({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        object[] lines = ["plc-1", ":502", "hmi:http", "scada:70000"];
        return
        [
            Basics.Step(lines, [0], "line 1: missing port", "errors", "No colon at all: a Fail result, not an exception. Keep going."),
            Basics.Step(lines, [1], "+ line 2: empty host", "errors", "Nothing before the colon."),
            Basics.Step(lines, [2], "+ line 3: port is not a number", "errors", "\"http\" contains characters other than digits."),
            Basics.Step(lines, [3], "+ line 4: port out of range", "errors", "70000 is a number, but ports go up to 65535."),
            Basics.Step(lines, [], "4 errors, reported together", "errors", "Because each line returned a result, ParseAll could check them all and report every problem at once."),
        ];
    }
}
