public class Solution
{
    public static List<List<int>> SubsetsWithDup(int[] nums)
    {
        var sorted = (int[])nums.Clone();
        Array.Sort(sorted);
        var result = new List<List<int>>();
        Backtrack(0, sorted, new List<int>(), result);
        return result;
    }

    private static void Backtrack(int start, int[] nums, List<int> current, List<List<int>> result)
    {
        result.Add(new List<int>(current));
        for (var i = start; i < nums.Length; i++)
        {
            // An equal value already tried at this level would grow the same subtree.
            if (i > start && nums[i] == nums[i - 1]) continue;
            current.Add(nums[i]);
            Backtrack(i + 1, nums, current, result);
            current.RemoveAt(current.Count - 1);
        }
    }
}
