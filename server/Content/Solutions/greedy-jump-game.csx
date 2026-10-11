public class Solution
{
    public static bool CanJump(int[] nums)
    {
        var farthest = 0; // right edge of the block of reachable indexes
        for (var i = 0; i < nums.Length; i++)
        {
            if (i > farthest) return false; // nothing reaches i, so nothing reaches the end
            farthest = Math.Max(farthest, i + nums[i]);
            if (farthest >= nums.Length - 1) return true;
        }
        return true;
    }
}
