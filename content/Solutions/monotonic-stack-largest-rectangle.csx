public class Solution
{
    public static int LargestRectangleArea(int[] heights)
    {
        var stack = new Stack<int>(); // indices; their heights increase from bottom to top
        var best = 0;
        for (var i = 0; i <= heights.Length; i++)
        {
            var h = i == heights.Length ? 0 : heights[i]; // a height-0 bar at the end flushes the stack
            while (stack.Count > 0 && heights[stack.Peek()] > h)
            {
                var top = stack.Pop();
                // Bar top spans from just after the new top (its first shorter bar on the left) to i - 1.
                var width = stack.Count == 0 ? i : i - stack.Peek() - 1;
                best = Math.Max(best, heights[top] * width);
            }
            stack.Push(i);
        }
        return best;
    }
}
