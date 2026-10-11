public class Solution
{
    public static int[] MaxSlidingWindow(int[] nums, int k)
    {
        var result = new List<int>();
        var dq = new LinkedList<int>(); // indices; their values decrease front to back
        for (var i = 0; i < nums.Length; i++)
        {
            if (dq.Count > 0 && dq.First!.Value <= i - k) dq.RemoveFirst(); // slid out
            while (dq.Count > 0 && nums[dq.Last!.Value] <= nums[i]) dq.RemoveLast(); // can never be max again
            dq.AddLast(i);
            if (i >= k - 1) result.Add(nums[dq.First!.Value]);
        }
        return result.ToArray();
    }
}
