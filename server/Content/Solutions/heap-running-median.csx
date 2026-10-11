public class Solution
{
    public static double[] RunningMedian(int[] stream)
    {
        // low: max-heap of the smaller half (reverse comparer); high: min-heap of the larger half
        var low = new PriorityQueue<int, int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));
        var high = new PriorityQueue<int, int>();
        var result = new List<double>();
        foreach (var x in stream)
        {
            low.Enqueue(x, x);
            var top = low.Dequeue();
            high.Enqueue(top, top); // low's largest moves up
            if (high.Count > low.Count)
            {
                var back = high.Dequeue();
                low.Enqueue(back, back); // keep low the same size or one bigger
            }
            result.Add(low.Count > high.Count
                ? low.Peek()
                : ((double)low.Peek() + high.Peek()) / 2);
        }
        return result.ToArray();
    }
}
