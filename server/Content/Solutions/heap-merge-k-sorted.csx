public class Solution
{
    public static int[] MergeKSorted(int[][] lists)
    {
        // min-heap of (list index, position in that list), keyed by the value there
        var heap = new PriorityQueue<(int List, int Pos), int>();
        for (var li = 0; li < lists.Length; li++)
            if (lists[li].Length > 0) heap.Enqueue((li, 0), lists[li][0]);

        var result = new List<int>();
        while (heap.Count > 0)
        {
            var (li, pos) = heap.Dequeue(); // smallest head across all lists
            result.Add(lists[li][pos]);
            if (pos + 1 < lists[li].Length)
                heap.Enqueue((li, pos + 1), lists[li][pos + 1]); // that list's next value
        }
        return result.ToArray();
    }
}
