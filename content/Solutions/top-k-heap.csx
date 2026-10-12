public class Solution
{
    public static int[] TopKLargest(int[] nums, int k)
    {
        var heap = new PriorityQueue<int, int>(); // min-heap: smallest value on top
        foreach (var n in nums)
        {
            heap.Enqueue(n, n);
            if (heap.Count > k) heap.Dequeue(); // drop the smallest -- it can't be top-k
        }
        var result = new List<int>();
        while (heap.Count > 0) result.Add(heap.Dequeue()); // pops come out ascending
        return result.ToArray();
    }
}
