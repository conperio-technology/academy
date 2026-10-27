public class Solution
{
    public static int[] RotateRight(int[] nums, int k)
    {
        if (nums.Length == 0) return nums;
        k %= nums.Length;
        Reverse(nums, 0, nums.Length - 1);
        Reverse(nums, 0, k - 1);
        Reverse(nums, k, nums.Length - 1);
        return nums;
    }

    private static void Reverse(int[] a, int lo, int hi)
    {
        while (lo < hi)
        {
            (a[lo], a[hi]) = (a[hi], a[lo]);
            lo++;
            hi--;
        }
    }
}
