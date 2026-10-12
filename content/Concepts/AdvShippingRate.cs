namespace DsaAcademy.Content.Concepts;

public class AdvShippingRate : IConcept
{
    public string Id => "adv-shipping-rate";
    public string Section => Basics.Section;
    public string Track => Adv.Track;
    public int Order => 2602;
    public string Title => "Shipping Rates with Patterns";
    public string OneLiner => "Price a parcel from its weight band, zone and service using property and relational patterns in C# or class patterns with guards in Python, instead of nested ifs.";
    public string KeyTakeaway =>
        "A rate table maps naturally onto a switch expression: one arm per row, with property patterns for the zone and " +
        "relational patterns (< 1000, < 5000) for the weight bands, checked top to bottom. Python writes the same table " +
        "with class patterns and guards. Handle invalid input first, and let a final catch-all reject anything unknown.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write ShippingCents(parcel), which returns the price in cents for a Parcel with Grams (an int), Zone and Service " +
        "(strings), or -1 when the parcel can't be shipped. The Parcel type is provided: a record Parcel(int Grams, " +
        "string Zone, string Service) in C# and a dataclass Parcel(grams, zone, service) in Python.\n\n" +
        "The table: a weight of 0 grams or less is invalid. Zone \"local\": under 1000 g costs 500, under 5000 g 900, " +
        "anything heavier 1500. Zone \"national\": under 1000 g 800, under 5000 g 1400, under 20000 g 2500, heavier " +
        "can't be shipped. Zone \"international\": under 2000 g 2000, under 10000 g 4500, heavier can't be shipped. Any " +
        "other zone can't be shipped. Service \"standard\" pays the table price; \"express\" pays double, but isn't " +
        "available for international parcels (-1); any other service is -1. Each test passes several parcels as " +
        "\"grams zone service\" text, which the checker turns into Parcels.\n\n" +
        "In C#, a switch expression with property and relational patterns reads like the table: { Grams: <= 0 } => -1, " +
        "{ Zone: \"local\", Grams: < 1000 } => 500, ... and so on. Compute the base price in one switch, then apply the " +
        "service in a second small switch over (service, zone) or (service, base price). In Python, match on " +
        "Parcel(grams=g, zone=\"local\") with guards such as if g < 1000.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int ShippingCents(Parcel parcel)\n" +
            "    {\n" +
            "        int basePrice = parcel switch\n" +
            "        {\n" +
            "            { Grams: <= 0 } => -1,\n" +
            "            { Zone: \"local\", Grams: < 1000 } => 500,\n" +
            "            // TODO: the rest of the table\n" +
            "            _ => -1,\n" +
            "        };\n" +
            "        // TODO: apply the service.\n" +
            "        return basePrice;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def shipping_cents(parcel):\n" +
            "    match parcel:\n" +
            "        case Parcel(grams=g) if g <= 0:\n" +
            "            base = -1\n" +
            "        case Parcel(grams=g, zone=\"local\") if g < 1000:\n" +
            "            base = 500\n" +
            "        # TODO: the rest of the table\n" +
            "        case _:\n" +
            "            base = -1\n" +
            "    # TODO: apply the service.\n" +
            "    return base\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.ShippingCents",
        ["python"] = "shipping_cents",
    };

    public string? CSharpHarnessPreamble =>
        "public record Parcel(int Grams, string Zone, string Service);\n" +
        "\n" +
        "public static class ShippingCheck\n" +
        "{\n" +
        "    public static List<int> Check(string[] parcels) => parcels\n" +
        "        .Select(p => p.Split(' '))\n" +
        "        .Select(f => Solution.ShippingCents(new Parcel(int.Parse(f[0]), f[1], f[2])))\n" +
        "        .ToList();\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "from dataclasses import dataclass\n" +
        "\n" +
        "\n" +
        "@dataclass(frozen=True)\n" +
        "class Parcel:\n" +
        "    grams: int\n" +
        "    zone: str\n" +
        "    service: str\n" +
        "\n" +
        "\n" +
        "def check_shipping(parcels):\n" +
        "    results = []\n" +
        "    for p in parcels:\n" +
        "        grams, zone, service = p.split(\" \")\n" +
        "        results.append(shipping_cents(Parcel(int(grams), zone, service)))\n" +
        "    return results\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Basics.StrArray("500 local standard", "999 local standard", "1000 local standard", "4999 local express", "5000 local standard", "80000 local express"),
            "[500, 500, 900, 1800, 1500, 3000]"),
        new TestCase(Basics.StrArray("10 national standard", "1000 national express", "19999 national standard", "20000 national standard", "20000 national express"),
            "[800, 2800, 2500, -1, -1]"),
        new TestCase(Basics.StrArray("1999 international standard", "2000 international standard", "9999 international standard", "10000 international standard", "500 international express"),
            "[2000, 4500, 4500, -1, -1]"),
        new TestCase(Basics.StrArray("0 local standard", "-5 national express", "100 moon standard", "100 local overnight", "100 Local standard"),
            "[-1, -1, -1, -1, -1]"),
        new TestCase(Basics.StrArray("1 local express", "4999 national express", "1 international standard"),
            "[1000, 2800, 2000]"),
    ];

    public string CSharpCallTemplate => "ShippingCheck.Check({input})";
    public string PythonCallTemplate => "check_shipping({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        object[] arms = ["<= 0", "local < 1000", "local < 5000", "local", "national < 1000", "..."];
        return
        [
            Basics.Step(arms, [], "?", "price", "Parcel(4999, \"local\", \"express\"). The arms are tried top to bottom, like reading down a rate table."),
            Basics.Step(arms, [0], "?", "price", "{ Grams: <= 0 }: 4999 isn't, move on."),
            Basics.Step(arms, [1], "?", "price", "{ Zone: \"local\", Grams: < 1000 }: the zone matches, the weight doesn't."),
            Basics.Step(arms, [2], "900", "price", "{ Zone: \"local\", Grams: < 5000 }: both match, so the base price is 900."),
            Basics.Step(arms, [2], "1800", "price", "Express doubles a valid domestic price: 1800. For an international parcel, express would give -1."),
        ];
    }
}
