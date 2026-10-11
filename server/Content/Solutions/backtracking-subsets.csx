public class Solution
{
    public static List<List<int>> Subsets(int[] nums)
    {
        var result = new List<List<int>>();
        var current = new List<int>();
        Backtrack(0, nums, current, result);
        return result;
    }

    private static void Backtrack(int start, int[] nums, List<int> current, List<List<int>> result)
    {
        result.Add(new List<int>(current)); // a COPY -- current keeps changing
        for (var i = start; i < nums.Length; i++)
        {
            current.Add(nums[i]);
            Backtrack(i + 1, nums, current, result);
            current.RemoveAt(current.Count - 1); // undo the choice
        }
    }
}
