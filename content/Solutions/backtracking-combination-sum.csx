public class Solution
{
    public static List<List<int>> CombinationSum(int[] candidates, int target)
    {
        var sorted = candidates.OrderBy(x => x).ToArray(); // sorted, so a too-big candidate ends the loop
        var result = new List<List<int>>();
        var path = new List<int>();

        void Backtrack(int start, int remaining)
        {
            if (remaining == 0)
            {
                result.Add(new List<int>(path));
                return;
            }
            for (var i = start; i < sorted.Length; i++) // never an earlier index: no duplicate orders
            {
                if (sorted[i] > remaining) break;
                path.Add(sorted[i]);
                Backtrack(i, remaining - sorted[i]); // i, not i + 1: reuse allowed
                path.RemoveAt(path.Count - 1);
            }
        }

        Backtrack(0, target);
        return result;
    }
}
