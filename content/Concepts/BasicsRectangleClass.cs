namespace DsaAcademy.Content.Concepts;

public class BasicsRectangleClass : IConcept
{
    public string Id => "basics-rectangle-class";
    public string Section => Basics.Section;
    public string Track => "basics";
    public int Order => 81;
    public string Title => "A Rectangle Class";
    public string OneLiner => "Write your first class: a constructor that stores width and height, and three methods that use them.";
    public string KeyTakeaway =>
        "The constructor stores the object's data (properties in C#, attributes on self in Python), and methods read it " +
        "back from the object instead of taking it as parameters again. That's the whole point of a class: data and the " +
        "code that uses it, travelling together.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write a class Rectangle whose constructor takes a width and a height (whole numbers, 0 or more) and stores them. " +
        "Give it three methods: Area() returning width × height, Perimeter() returning 2 × (width + height), and " +
        "IsSquare() returning true when width equals height. In Python the names are area, perimeter and " +
        "is_square, and the constructor is __init__(self, width, height).\n\n" +
        "Each test creates a rectangle and calls all three methods: Rectangle(3, 4) should give area 12, perimeter 14 " +
        "and not square, shown as [12, 14, false].\n\n" +
        "In C#, store the values in properties (public int Width { get; }) assigned in the constructor, and read them in " +
        "the methods. In Python, assign self.width = width in __init__ and read self.width in the methods. Forgetting " +
        "self (as the first parameter, or in front of width inside a method) is the classic first-class mistake.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Rectangle\n" +
            "{\n" +
            "    public Rectangle(int width, int height)\n" +
            "    {\n" +
            "        // TODO: store width and height.\n" +
            "    }\n" +
            "\n" +
            "    public int Area() => 0;          // TODO\n" +
            "    public int Perimeter() => 0;     // TODO\n" +
            "    public bool IsSquare() => false; // TODO\n" +
            "}\n",
        ["python"] =
            "class Rectangle:\n" +
            "    def __init__(self, width, height):\n" +
            "        pass  # TODO: store width and height on self\n" +
            "\n" +
            "    def area(self):\n" +
            "        return 0  # TODO\n" +
            "\n" +
            "    def perimeter(self):\n" +
            "        return 0  # TODO\n" +
            "\n" +
            "    def is_square(self):\n" +
            "        return False  # TODO\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Rectangle",
        ["python"] = "Rectangle",
    };

    // Each test builds one Rectangle and reports [area, perimeter, is square].
    public string? CSharpHarnessPreamble =>
        "public static class RectangleCheck\n" +
        "{\n" +
        "    public static object[] Check(int width, int height)\n" +
        "    {\n" +
        "        var r = new Rectangle(width, height);\n" +
        "        return [r.Area(), r.Perimeter(), r.IsSquare()];\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "def check_rectangle(width, height):\n" +
        "    r = Rectangle(width, height)\n" +
        "    return [r.area(), r.perimeter(), r.is_square()]\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.Int(3), Lit.Int(4)), "[12, 14, false]"),
        new TestCase(Lit.Args(Lit.Int(5), Lit.Int(5)), "[25, 20, true]"),
        new TestCase(Lit.Args(Lit.Int(1), Lit.Int(10)), "[10, 22, false]"),
        new TestCase(Lit.Args(Lit.Int(0), Lit.Int(0)), "[0, 0, true]"),
        new TestCase(Lit.Args(Lit.Int(7), Lit.Int(2)), "[14, 18, false]"),
    ];

    public string CSharpCallTemplate => "RectangleCheck.Check({input})";
    public string PythonCallTemplate => "check_rectangle({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        object[] members = ["w=3", "h=4", "Area()", "Perimeter()", "IsSquare()"];
        return
        [
            Basics.Step(members, [0, 1], "new Rectangle(3, 4)", "object", "The constructor runs once and stores width 3 and height 4 inside the new object."),
            Basics.Step(members, [2], 12, "Area()", "Area reads the object's own width and height: 3 × 4 = 12. No parameters needed."),
            Basics.Step(members, [3], 14, "Perimeter()", "2 × (3 + 4) = 14."),
            Basics.Step(members, [4], "false", "IsSquare()", "3 == 4 is false. A Rectangle(5, 5) would say true."),
        ];
    }
}
