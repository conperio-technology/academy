public class Solution
{
    public static int[] NextGreaterElements(int[] nums)
    {
        var result = Enumerable.Repeat(-1, nums.Length).ToArray();
        var stack = new Stack<int>(); // indices still waiting for a bigger value
        for (var i = 0; i < nums.Length; i++)
        {
            while (stack.Count > 0 && nums[stack.Peek()] < nums[i])
                result[stack.Pop()] = nums[i];
            stack.Push(i);
        }
        return result;
    }
}
