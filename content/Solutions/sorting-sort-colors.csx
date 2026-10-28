public class Solution
{
    public static int[] SortColors(int[] nums)
    {
        int low = 0, mid = 0, high = nums.Length - 1;
        while (mid <= high)
        {
            if (nums[mid] == 0)
            {
                (nums[low], nums[mid]) = (nums[mid], nums[low]);
                low++;
                mid++;
            }
            else if (nums[mid] == 1)
            {
                mid++;
            }
            else
            {
                (nums[mid], nums[high]) = (nums[high], nums[mid]);
                high--; // the value swapped in is unexamined, so mid stays
            }
        }
        return nums;
    }
}
