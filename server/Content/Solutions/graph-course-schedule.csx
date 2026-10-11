public class Solution
{
    public static bool CanFinish(int numCourses, int[][] prerequisites)
    {
        // Edge b -> a for each pair [a, b]: taking b unlocks a.
        var next = Enumerable.Range(0, numCourses).Select(_ => new List<int>()).ToArray();
        foreach (var p in prerequisites) next[p[1]].Add(p[0]);

        var state = new int[numCourses]; // 0 = unvisited, 1 = on the current path, 2 = done

        bool HasCycle(int u)
        {
            state[u] = 1;
            foreach (var v in next[u])
            {
                if (state[v] == 1) return true; // back to a node on the path: a loop
                if (state[v] == 0 && HasCycle(v)) return true;
            }
            state[u] = 2;
            return false;
        }

        for (var course = 0; course < numCourses; course++)
            if (state[course] == 0 && HasCycle(course)) return false;
        return true;
    }
}
