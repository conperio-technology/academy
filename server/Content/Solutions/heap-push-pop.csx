public class Solution
{
    public static int[] ProcessHeapOps(int[] ops)
    {
        var heap = new List<int>();
        var popped = new List<int>();
        foreach (var op in ops)
        {
            if (op > 0) Push(heap, op);
            else popped.Add(Pop(heap));
        }
        return popped.ToArray();
    }

    private static void Push(List<int> heap, int value)
    {
        heap.Add(value);
        var i = heap.Count - 1;
        while (i > 0)
        {
            var parent = (i - 1) / 2;
            if (heap[parent] <= heap[i]) break;
            (heap[parent], heap[i]) = (heap[i], heap[parent]);
            i = parent;
        }
    }

    private static int Pop(List<int> heap)
    {
        var min = heap[0];
        heap[0] = heap[^1];
        heap.RemoveAt(heap.Count - 1);
        var i = 0;
        while (true)
        {
            int left = 2 * i + 1, right = 2 * i + 2, smallest = i;
            if (left < heap.Count && heap[left] < heap[smallest]) smallest = left;
            if (right < heap.Count && heap[right] < heap[smallest]) smallest = right;
            if (smallest == i) break;
            (heap[smallest], heap[i]) = (heap[i], heap[smallest]);
            i = smallest;
        }
        return min;
    }
}
