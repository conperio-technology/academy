public class Solution
{
    public static int[] InsertionSort(int[] nums)
    {
        for (var i = 1; i < nums.Length; i++)
        {
            var value = nums[i];
            var j = i - 1;
            while (j >= 0 && nums[j] > value)
            {
                nums[j + 1] = nums[j]; // shift bigger elements right
                j--;
            }
            nums[j + 1] = value;
        }
        return nums;
    }
}
