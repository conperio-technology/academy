using System.Collections.Generic;

public class Solution
{
    public static List<List<int>> SubsetsByMask(int[] nums)
    {
        var n = nums.Length;
        var all = new List<List<int>>();
        for (var mask = 0; mask < 1 << n; mask++) // 1 << n is 2^n (fine while n <= 30)
        {
            var subset = new List<int>();
            for (var i = 0; i < n; i++)
                if (((mask >> i) & 1) == 1) subset.Add(nums[i]); // bit i set: take nums[i]
            all.Add(subset);
        }
        return all;
    }
}
