public class Rectangle
{
    public int Width { get; }
    public int Height { get; }

    public Rectangle(int width, int height)
    {
        Width = width;
        Height = height;
    }

    public int Area() => Width * Height;
    public int Perimeter() => 2 * (Width + Height);
    public bool IsSquare() => Width == Height;
}
