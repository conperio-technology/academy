public class Solution
{
    public static int[] ProductExceptSelf(int[] nums)
    {
        var answer = new int[nums.Length];
        var prefix = 1;
        for (var i = 0; i < nums.Length; i++)
        {
            answer[i] = prefix; // product of everything left of i
            prefix *= nums[i];
        }
        var suffix = 1;
        for (var i = nums.Length - 1; i >= 0; i--)
        {
            answer[i] *= suffix; // times the product of everything right of i
            suffix *= nums[i];
        }
        return answer;
    }
}
