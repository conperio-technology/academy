public class Solution
{
    public static int[] MergeSorted(int[] a, int[] b)
    {
        var result = new List<int>(a.Length + b.Length);
        int i = 0, j = 0;
        while (i < a.Length && j < b.Length)
            result.Add(a[i] <= b[j] ? a[i++] : b[j++]);
        while (i < a.Length) result.Add(a[i++]);
        while (j < b.Length) result.Add(b[j++]);
        return result.ToArray();
    }
}
