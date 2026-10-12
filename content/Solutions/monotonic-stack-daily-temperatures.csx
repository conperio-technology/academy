public class Solution
{
    public static int[] DailyTemperatures(int[] temperatures)
    {
        var answer = new int[temperatures.Length];
        var stack = new Stack<int>(); // indices of days still waiting for a warmer day
        for (var i = 0; i < temperatures.Length; i++)
        {
            while (stack.Count > 0 && temperatures[stack.Peek()] < temperatures[i])
            {
                var j = stack.Pop();
                answer[j] = i - j;
            }
            stack.Push(i);
        }
        return answer;
    }
}
