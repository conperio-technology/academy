public class Solution
{
    public static int[] TwoSum(int[] nums, int target)
    {
        var seen = new Dictionary<int, int>(); // value -> index
        for (var i = 0; i < nums.Length; i++)
        {
            if (seen.TryGetValue(target - nums[i], out var j)) return new[] { j, i };
            seen[nums[i]] = i; // added AFTER the check, so an element never pairs with itself
        }
        return new int[0];
    }
}
