public class Solution
{
    public static (T Min, T Max) MinMax<T>(List<T> items) where T : IComparable<T>
    {
        T min = items[0];
        T max = items[0];
        foreach (var item in items)
        {
            if (item.CompareTo(min) < 0) min = item;
            if (item.CompareTo(max) > 0) max = item;
        }
        return (min, max);
    }
}
