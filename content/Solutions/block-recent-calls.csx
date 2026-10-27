public class Solution
{
    public static List<int> RecentCounts(int[] times)
    {
        var window = new Queue<int>();
        var result = new List<int>();
        foreach (var t in times)
        {
            window.Enqueue(t);
            while (window.Peek() < t - 3000)
                window.Dequeue();
            result.Add(window.Count);
        }
        return result;
    }
}
