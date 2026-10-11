public class Solution
{
    public static int[] ProcessQueueOps(int[] ops)
    {
        var queue = new Queue<int>();
        var dequeued = new List<int>();
        foreach (var op in ops)
        {
            if (op > 0) queue.Enqueue(op);
            else dequeued.Add(queue.Dequeue());
        }
        return dequeued.ToArray();
    }
}
