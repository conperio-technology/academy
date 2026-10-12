public class Solution
{
    public static int[][] KClosest(int[][] points, int k)
    {
        // Max-heap on (squared distance, x, y): the farthest point kept is on top.
        var farthestFirst = Comparer<(int D, int X, int Y)>.Create((a, b) => b.CompareTo(a));
        var heap = new PriorityQueue<int[], (int D, int X, int Y)>(farthestFirst);
        foreach (var p in points)
        {
            heap.Enqueue(p, (p[0] * p[0] + p[1] * p[1], p[0], p[1]));
            if (heap.Count > k) heap.Dequeue(); // drop the farthest of the k + 1
        }

        var kept = new List<int[]>();
        while (heap.Count > 0) kept.Add(heap.Dequeue());
        return kept
            .OrderBy(p => p[0] * p[0] + p[1] * p[1])
            .ThenBy(p => p[0])
            .ThenBy(p => p[1])
            .ToArray();
    }
}
