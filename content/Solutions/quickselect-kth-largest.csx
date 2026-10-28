public class Solution
{
    public static int FindKthLargest(int[] nums, int k)
    {
        var a = nums.ToArray();
        int target = a.Length - k, lo = 0, hi = a.Length - 1; // k-th largest sits at n - k when sorted
        while (true)
        {
            var mid = lo + (hi - lo) / 2;
            (a[mid], a[hi]) = (a[hi], a[mid]);
            var pivot = a[hi];
            var i = lo;
            for (var j = lo; j < hi; j++)
            {
                if (a[j] < pivot)
                {
                    (a[i], a[j]) = (a[j], a[i]);
                    i++;
                }
            }
            (a[i], a[hi]) = (a[hi], a[i]);
            if (i == target) return a[i];
            if (i < target) lo = i + 1;
            else hi = i - 1;
        }
    }
}
