public class Solution
{
    public static T Total<T>(IEnumerable<T> items) where T : INumber<T>
    {
        T sum = T.Zero;
        foreach (T item in items) sum += item;
        return sum;
    }
}
