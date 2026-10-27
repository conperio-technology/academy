public class Solution
{
    public static List<List<int>> Combinations(int n, int k)
    {
        var result = new List<List<int>>();
        var path = new List<int>();

        void Backtrack(int start)
        {
            if (path.Count == k)
            {
                result.Add(new List<int>(path));
                return;
            }
            for (var number = start; number <= n; number++)
            {
                path.Add(number);
                Backtrack(number + 1);
                path.RemoveAt(path.Count - 1);
            }
        }

        Backtrack(1);
        return result;
    }
}
