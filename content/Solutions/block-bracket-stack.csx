public class Solution
{
    public static bool IsBalanced(string s)
    {
        var openerFor = new Dictionary<char, char> { [')'] = '(', [']'] = '[', ['}'] = '{' };
        var stack = new Stack<char>();
        foreach (var c in s)
        {
            if (c == '(' || c == '[' || c == '{')
                stack.Push(c);
            else if (openerFor.TryGetValue(c, out var opener))
            {
                if (stack.Count == 0 || stack.Peek() != opener)
                    return false;
                stack.Pop();
            }
        }
        return stack.Count == 0;
    }
}
