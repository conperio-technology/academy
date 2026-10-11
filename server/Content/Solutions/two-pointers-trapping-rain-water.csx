public class Solution
{
    public static int Trap(int[] height)
    {
        int left = 0, right = height.Length - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (left < right)
        {
            // The lower side is the bottleneck, so its water level is already known.
            if (height[left] < height[right])
            {
                leftMax = Math.Max(leftMax, height[left]);
                water += leftMax - height[left];
                left++;
            }
            else
            {
                rightMax = Math.Max(rightMax, height[right]);
                water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }
}
