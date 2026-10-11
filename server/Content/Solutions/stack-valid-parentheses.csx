public class Solution
{
    public static bool IsValid(string s)
    {
        var pairs = new Dictionary<char, char> { [')'] = '(', [']'] = '[', ['}'] = '{' };
        var stack = new Stack<char>();
        foreach (var c in s)
        {
            if (!pairs.ContainsKey(c))
            {
                stack.Push(c);
                continue;
            }
            if (stack.Count == 0 || stack.Pop() != pairs[c]) return false;
        }
        return stack.Count == 0;
    }
}
