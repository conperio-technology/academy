public abstract class Shape
{
    public abstract string Name { get; }
    public abstract double Area();
}

public class Rectangle : Shape
{
    public double Width { get; }
    public double Height { get; }

    public Rectangle(double width, double height)
    {
        Width = width;
        Height = height;
    }

    public override string Name => "rectangle";
    public override double Area() => Width * Height;
}

// A square is a rectangle with equal sides: reuse its storage and Area, change the name.
public class Square : Rectangle
{
    public Square(double side) : base(side, side) { }
    public override string Name => "square";
}

public class Circle : Shape
{
    public double Radius { get; }
    public Circle(double radius) => Radius = radius;
    public override string Name => "circle";
    public override double Area() => Math.PI * Radius * Radius;
}
