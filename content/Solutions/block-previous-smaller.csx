public class Solution
{
    public static int[] PreviousSmaller(int[] nums)
    {
        var result = new int[nums.Length];
        var stack = new Stack<int>();
        for (var i = 0; i < nums.Length; i++)
        {
            while (stack.Count > 0 && nums[stack.Peek()] >= nums[i])
                stack.Pop();
            result[i] = stack.Count > 0 ? stack.Peek() : -1;
            stack.Push(i);
        }
        return result;
    }
}
