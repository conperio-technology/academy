public class MinStack
{
    // Each entry remembers the smallest value at or below it.
    private readonly Stack<(int Value, int Min)> stack = new();

    public void Push(int val)
    {
        var min = stack.Count == 0 ? val : Math.Min(val, stack.Peek().Min);
        stack.Push((val, min));
    }

    public void Pop() => stack.Pop();

    public int Top() => stack.Peek().Value;

    public int GetMin() => stack.Peek().Min;
}
