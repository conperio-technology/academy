namespace DsaAcademy.Content.Concepts;

public class BasicsCelsiusToFahrenheit : IConcept
{
    public string Id => "basics-celsius-to-fahrenheit";
    public string Section => Basics.Section;
    public string Track => "basics";
    public int Order => 15;
    public string Title => "Temperature Conversion with Rounding";
    public string OneLiner => "Convert Celsius to Fahrenheit and round to one decimal place, without falling into integer division.";
    public string KeyTakeaway =>
        "Do the arithmetic in floating point (9.0 / 5, or 1.8), and round only once, at the end, with an explicit number of " +
        "decimal places: Math.Round(f, 1) in C#, round(f, 1) in Python. Both round an exact half to the even neighbour.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write a function that takes a temperature in degrees Celsius and returns it in degrees Fahrenheit, rounded to one " +
        "decimal place. The formula is F = C × 9 / 5 + 32, so 100 °C is 212 °F and 37 °C is 98.6 °F.\n\n" +
        "Two traps. First, in C# 9 / 5 on its own is integer division and equals 1, so celsius * (9 / 5) + 32 gives the " +
        "wrong answer for every input except -40. Multiplying first (celsius * 9 / 5) works because celsius is a double, " +
        "or write the constant as 1.8 or 9.0 / 5. Python's / always divides exactly, so it doesn't have this trap.\n\n" +
        "Second, floating point arithmetic is slightly inexact: 37 × 9 / 5 + 32 comes out as 98.60000000000001 in both " +
        "languages. Rounding fixes that, but round once, at the end, to the precision you want: Math.Round(f, 1) in C#, " +
        "round(f, 1) in Python. Both use banker's rounding for exact halves (2.25 rounds to 2.2), and you can ask C# for " +
        "MidpointRounding.AwayFromZero if a spec says otherwise. The tests here avoid exact halves.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static double CelsiusToFahrenheit(double celsius)\n" +
            "    {\n" +
            "        // TODO: F = C * 9 / 5 + 32, then round to 1 decimal place.\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def celsius_to_fahrenheit(celsius):\n" +
            "    # TODO: F = C * 9 / 5 + 32, then round to 1 decimal place.\n" +
            "    return 0\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CelsiusToFahrenheit",
        ["python"] = "celsius_to_fahrenheit",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("0", "32.0"),
        new TestCase("100", "212.0"),
        new TestCase("-40", "-40.0"),
        new TestCase("37", "98.6"),
        new TestCase("21.5", "70.7"),
        new TestCase("36.6", "97.9"),
        new TestCase("-3.3", "26.1"),
    ];

    public string CSharpCallTemplate => "Solution.CelsiusToFahrenheit({input})";
    public string PythonCallTemplate => "celsius_to_fahrenheit({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        object[] stages = ["37", "× 9", "÷ 5", "+ 32", "round"];
        return
        [
            Basics.Step(stages, [0], 37, "value", "Start with 37 °C."),
            Basics.Step(stages, [1], 333, "value", "Multiply by 9: 333. Because 37 came in as a double, this stays a double."),
            Basics.Step(stages, [2], 66.6, "value", "Divide by 5: 66.6 (stored in binary as a value a hair away from 66.6)."),
            Basics.Step(stages, [3], 98.60000000000001, "value", "Add 32: 98.60000000000001. The tiny error is floating point, not a bug in your formula."),
            Basics.Step(stages, [4], 98.6, "value", "Round once, at the end, to one decimal place: 98.6."),
        ];
    }
}
