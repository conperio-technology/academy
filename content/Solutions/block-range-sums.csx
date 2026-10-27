public class Solution
{
    public static List<int> RangeSums(int[] nums, int[][] queries)
    {
        var prefix = new int[nums.Length + 1];
        for (var i = 0; i < nums.Length; i++)
            prefix[i + 1] = prefix[i] + nums[i];

        var result = new List<int>();
        foreach (var q in queries)
            result.Add(prefix[q[1] + 1] - prefix[q[0]]);
        return result;
    }
}
