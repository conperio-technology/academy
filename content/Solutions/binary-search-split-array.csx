public class Solution
{
    public static int SplitArray(int[] nums, int k)
    {
        int lo = nums.Max(), hi = nums.Sum();
        while (lo < hi)
        {
            var mid = lo + (hi - lo) / 2;
            if (PartsNeeded(nums, mid) <= k) hi = mid; // cap is big enough, try a smaller one
            else lo = mid + 1;                         // needs too many parts, the cap must grow
        }
        return lo;
    }

    // Greedy: keep adding to the current part until the next number would push it over cap.
    private static int PartsNeeded(int[] nums, int cap)
    {
        int parts = 1, current = 0;
        foreach (var x in nums)
        {
            if (current + x > cap)
            {
                parts++;
                current = 0;
            }
            current += x;
        }
        return parts;
    }
}
