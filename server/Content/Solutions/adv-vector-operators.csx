public readonly record struct Vec(int X, int Y)
{
    public static Vec operator +(Vec p, Vec q) => new(p.X + q.X, p.Y + q.Y);
    public static Vec operator -(Vec p, Vec q) => new(p.X - q.X, p.Y - q.Y);
    public static Vec operator -(Vec p) => new(-p.X, -p.Y);
    public static Vec operator *(Vec p, int k) => new(p.X * k, p.Y * k);
    public static Vec operator *(int k, Vec p) => p * k;
    public override string ToString() => $"({X}, {Y})";
}
