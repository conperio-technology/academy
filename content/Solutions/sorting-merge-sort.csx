public class Solution
{
    public static int[] MergeSort(int[] nums)
    {
        if (nums.Length < 2) return nums.ToArray();
        var mid = nums.Length / 2;
        var left = MergeSort(nums[..mid]);
        var right = MergeSort(nums[mid..]);
        var merged = new int[nums.Length];
        int i = 0, j = 0, k = 0;
        while (i < left.Length && j < right.Length)
            merged[k++] = left[i] <= right[j] ? left[i++] : right[j++]; // <= keeps it stable
        while (i < left.Length) merged[k++] = left[i++];
        while (j < right.Length) merged[k++] = right[j++];
        return merged;
    }
}
