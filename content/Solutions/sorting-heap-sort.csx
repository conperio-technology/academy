public class Solution
{
    public static int[] HeapSort(int[] nums)
    {
        var a = nums.ToArray();
        for (var i = a.Length / 2 - 1; i >= 0; i--) SiftDown(a, i, a.Length);
        for (var end = a.Length - 1; end > 0; end--)
        {
            (a[0], a[end]) = (a[end], a[0]); // the max goes to its final place
            SiftDown(a, 0, end);
        }
        return a;
    }

    private static void SiftDown(int[] a, int i, int size)
    {
        while (true)
        {
            int left = 2 * i + 1, right = left + 1, big = i;
            if (left < size && a[left] > a[big]) big = left;
            if (right < size && a[right] > a[big]) big = right;
            if (big == i) return;
            (a[i], a[big]) = (a[big], a[i]);
            i = big;
        }
    }
}
