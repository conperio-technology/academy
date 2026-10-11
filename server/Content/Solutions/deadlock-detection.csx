public class Solution
{
    public static int[] FindDeadlocked(int n, int[][] waitsFor)
    {
        // waitingOn[a] = how many threads a still waits for; waiters[b] = who waits for b.
        var waitingOn = new int[n];
        var waiters = Enumerable.Range(0, n).Select(_ => new List<int>()).ToArray();
        foreach (var e in waitsFor)
        {
            waitingOn[e[0]]++;
            waiters[e[1]].Add(e[0]);
        }

        var ready = new Queue<int>();
        for (var i = 0; i < n; i++)
            if (waitingOn[i] == 0) ready.Enqueue(i);

        // Finish every thread that can finish; each one unblocks its waiters.
        var finished = new bool[n];
        while (ready.Count > 0)
        {
            var t = ready.Dequeue();
            finished[t] = true;
            foreach (var w in waiters[t])
                if (--waitingOn[w] == 0) ready.Enqueue(w);
        }

        // Whatever never finished is in a cycle or waiting behind one.
        return Enumerable.Range(0, n).Where(i => !finished[i]).ToArray();
    }
}
