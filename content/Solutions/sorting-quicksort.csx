public class Solution
{
    public static int[] QuickSort(int[] nums)
    {
        var a = nums.ToArray();
        Sort(a, 0, a.Length - 1);
        return a;
    }

    private static void Sort(int[] a, int lo, int hi)
    {
        if (lo >= hi) return;
        var mid = lo + (hi - lo) / 2;
        (a[mid], a[hi]) = (a[hi], a[mid]); // middle pivot: sorted input still splits evenly
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
        Sort(a, lo, i - 1);
        Sort(a, i + 1, hi);
    }
}
