public class Solution
{
    public static int[] SelectionSort(int[] nums)
    {
        for (var i = 0; i < nums.Length; i++)
        {
            var min = i;
            for (var j = i + 1; j < nums.Length; j++)
                if (nums[j] < nums[min]) min = j;
            (nums[i], nums[min]) = (nums[min], nums[i]);
        }
        return nums;
    }
}
