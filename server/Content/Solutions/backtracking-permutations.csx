public class Solution
{
    public static List<List<int>> Permute(int[] nums)
    {
        var result = new List<List<int>>();
        var current = new List<int>();
        var used = new bool[nums.Length];
        Backtrack(nums, used, current, result);
        return result;
    }

    private static void Backtrack(int[] nums, bool[] used, List<int> current, List<List<int>> result)
    {
        if (current.Count == nums.Length)
        {
            result.Add(new List<int>(current)); // a COPY -- current keeps changing
            return;
        }
        for (var i = 0; i < nums.Length; i++) // index order keeps the output lexicographic
        {
            if (used[i]) continue;
            used[i] = true;
            current.Add(nums[i]);
            Backtrack(nums, used, current, result);
            current.RemoveAt(current.Count - 1); // undo the choice
            used[i] = false;
        }
    }
}
