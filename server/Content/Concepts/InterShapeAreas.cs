namespace DsaAcademy.Content.Concepts;

public class InterShapeAreas : IConcept
{
    public string Id => "inter-shape-areas";
    public string Section => Basics.Section;
    public string Track => Inter.Track;
    public int Order => 1201;
    public string Title => "Shapes with an Abstract Base Class";
    public string OneLiner => "Fill in Circle, Rectangle and Square classes that inherit from an abstract Shape, each with its own name and area.";
    public string KeyTakeaway =>
        "An abstract base class fixes what every subclass must provide (here a name and an area) and lets code work " +
        "with a list of Shape without caring which kind each one is. Reuse by inheritance where it's a real \"is a\": a " +
        "Square is a Rectangle whose sides are equal.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "The starter code has an abstract class Shape with an abstract Name and an abstract Area. Complete three " +
        "subclasses: Circle(radius) with name \"circle\" and area π × radius²; Rectangle(width, height) with name " +
        "\"rectangle\" and area width × height; and Square(side) with name \"square\" and area side². Use Math.PI in C# and " +
        "math.pi in Python.\n\n" +
        "Each test is a list of shape descriptions such as \"circle 2\" or \"rect 2 3\". The checker builds one of your " +
        "shapes for each, then reports every shape's name and its area rounded to 2 decimal places, so [\"circle 1\", " +
        "\"rect 2 3\"] expects [[\"circle\", 3.14], [\"rectangle\", 6]].\n\n" +
        "In C#, override the abstract members with override, and pass Square's side to Rectangle's constructor with : " +
        "base(side, side), then override Name. In Python, inherit from Shape, write name() and area() methods, and call " +
        "super().__init__(side, side) in Square. The checker in Python also refuses any shape that doesn't inherit from " +
        "Shape, and Python itself refuses to create a subclass that leaves an abstract method unwritten.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public abstract class Shape\n" +
            "{\n" +
            "    public abstract string Name { get; }\n" +
            "    public abstract double Area();\n" +
            "}\n" +
            "\n" +
            "public class Rectangle : Shape\n" +
            "{\n" +
            "    public Rectangle(double width, double height)\n" +
            "    {\n" +
            "        // TODO: store the sides.\n" +
            "    }\n" +
            "\n" +
            "    public override string Name => \"rectangle\";\n" +
            "    public override double Area() => 0;   // TODO\n" +
            "}\n" +
            "\n" +
            "public class Square : Shape   // TODO: a square is a rectangle with equal sides\n" +
            "{\n" +
            "    public Square(double side) { }\n" +
            "    public override string Name => \"square\";\n" +
            "    public override double Area() => 0;   // TODO\n" +
            "}\n" +
            "\n" +
            "public class Circle : Shape\n" +
            "{\n" +
            "    public Circle(double radius) { }\n" +
            "    public override string Name => \"circle\";\n" +
            "    public override double Area() => 0;   // TODO: Math.PI * r * r\n" +
            "}\n",
        ["python"] =
            "import math\n" +
            "from abc import ABC, abstractmethod\n" +
            "\n" +
            "\n" +
            "class Shape(ABC):\n" +
            "    @abstractmethod\n" +
            "    def name(self): ...\n" +
            "\n" +
            "    @abstractmethod\n" +
            "    def area(self): ...\n" +
            "\n" +
            "\n" +
            "class Rectangle(Shape):\n" +
            "    def __init__(self, width, height):\n" +
            "        pass  # TODO: store the sides\n" +
            "\n" +
            "    def name(self):\n" +
            "        return \"rectangle\"\n" +
            "\n" +
            "    def area(self):\n" +
            "        return 0  # TODO\n" +
            "\n" +
            "\n" +
            "class Square(Shape):  # TODO: a square is a rectangle with equal sides\n" +
            "    def __init__(self, side):\n" +
            "        pass\n" +
            "\n" +
            "    def name(self):\n" +
            "        return \"square\"\n" +
            "\n" +
            "    def area(self):\n" +
            "        return 0  # TODO\n" +
            "\n" +
            "\n" +
            "class Circle(Shape):\n" +
            "    def __init__(self, radius):\n" +
            "        pass\n" +
            "\n" +
            "    def name(self):\n" +
            "        return \"circle\"\n" +
            "\n" +
            "    def area(self):\n" +
            "        return 0  # TODO: math.pi * r * r\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Shape",
        ["python"] = "Shape",
    };

    // Each test builds shapes from "kind size..." descriptions and reports [name, area rounded to 2 places].
    public string? CSharpHarnessPreamble =>
        "public static class ShapeCheck\n" +
        "{\n" +
        "    public static List<object[]> Check(string[] specs)\n" +
        "    {\n" +
        "        var result = new List<object[]>();\n" +
        "        foreach (var spec in specs)\n" +
        "        {\n" +
        "            var p = spec.Split(' ');\n" +
        "            Shape shape = p[0] switch\n" +
        "            {\n" +
        "                \"circle\" => new Circle(int.Parse(p[1])),\n" +
        "                \"rect\" => new Rectangle(int.Parse(p[1]), int.Parse(p[2])),\n" +
        "                _ => new Square(int.Parse(p[1])),\n" +
        "            };\n" +
        "            result.Add([shape.Name, Math.Round(shape.Area(), 2)]);\n" +
        "        }\n" +
        "        return result;\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "def check_shapes(specs):\n" +
        "    result = []\n" +
        "    for spec in specs:\n" +
        "        p = spec.split(\" \")\n" +
        "        if p[0] == \"circle\":\n" +
        "            shape = Circle(int(p[1]))\n" +
        "        elif p[0] == \"rect\":\n" +
        "            shape = Rectangle(int(p[1]), int(p[2]))\n" +
        "        else:\n" +
        "            shape = Square(int(p[1]))\n" +
        "        if not isinstance(shape, Shape):\n" +
        "            raise TypeError(f\"{type(shape).__name__} must inherit from Shape\")\n" +
        "        result.append([shape.name(), round(shape.area(), 2)])\n" +
        "    return result\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Basics.StrArray("circle 1"), "[[\"circle\", 3.14]]"),
        new TestCase(Basics.StrArray("rect 2 3"), "[[\"rectangle\", 6]]"),
        new TestCase(Basics.StrArray("square 4"), "[[\"square\", 16]]"),
        new TestCase(Basics.StrArray("circle 2", "rect 1 1", "square 3"), "[[\"circle\", 12.57], [\"rectangle\", 1], [\"square\", 9]]"),
        new TestCase(Basics.StrArray("square 1", "rect 1 2", "circle 3"), "[[\"square\", 1], [\"rectangle\", 2], [\"circle\", 28.27]]"),
    ];

    public string CSharpCallTemplate => "ShapeCheck.Check({input})";
    public string PythonCallTemplate => "check_shapes({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        object[] shapes = ["circle 2", "rect 1 1", "square 3"];
        return
        [
            Basics.Step(shapes, [], "List<Shape>", "held as", "Three different classes, all held as Shape. The checker only calls Name and Area."),
            Basics.Step(shapes, [0], "12.57", "Area()", "Circle's Area: π × 2 × 2 = 12.566..., rounded to 12.57."),
            Basics.Step(shapes, [1], "1", "Area()", "Rectangle's Area: 1 × 1 = 1."),
            Basics.Step(shapes, [2], "9", "Area()", "Square is a Rectangle with both sides 3, so it can reuse Rectangle's Area: 3 × 3 = 9. Only its Name differs."),
            Basics.Step(shapes, [], "[circle 12.57, rectangle 1, square 9]", "result", "One loop, three behaviours: that's polymorphism."),
        ];
    }
}
