public class Solution
{
    public static int Jump(int[] nums)
    {
        int jumps = 0, currentEnd = 0, farthest = 0;
        // Never jump FROM the last index, so stop at Length - 2.
        for (var i = 0; i < nums.Length - 1; i++)
        {
            farthest = Math.Max(farthest, i + nums[i]); // edge of the next BFS level
            if (i == currentEnd)
            {
                jumps++;              // finished scanning this level: one more jump
                currentEnd = farthest;
            }
        }
        return jumps;
    }
}
