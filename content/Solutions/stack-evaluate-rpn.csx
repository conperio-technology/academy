public class Solution
{
    public static int EvalRPN(string[] tokens)
    {
        var stack = new Stack<int>();
        foreach (var t in tokens)
        {
            if (t.Length == 1 && "+-*/".Contains(t[0])) // "-3" is a number, "-" is an operator
            {
                var b = stack.Pop(); // the right operand comes off first
                var a = stack.Pop();
                stack.Push(t[0] switch
                {
                    '+' => a + b,
                    '-' => a - b,
                    '*' => a * b,
                    _ => a / b, // C# integer division truncates toward zero
                });
            }
            else
            {
                stack.Push(int.Parse(t));
            }
        }
        return stack.Pop();
    }
}
