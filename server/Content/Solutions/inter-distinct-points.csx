// A record: Equals and GetHashCode compare X and Y.
public record Point(int X, int Y);

public class Solution
{
    public static List<Point> Distinct(List<Point> points)
    {
        var seen = new HashSet<Point>();
        var result = new List<Point>();
        foreach (var p in points)
        {
            if (seen.Add(p))   // Add returns false when it was already there
                result.Add(p);
        }
        return result;
    }
}
