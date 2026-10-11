public class TypedStack<T>
{
    private readonly List<T> _items = new();

    public void Push(T item) => _items.Add(item);

    public T Pop()
    {
        var top = Peek();
        _items.RemoveAt(_items.Count - 1);
        return top;
    }

    public T Peek()
    {
        if (_items.Count == 0) throw new InvalidOperationException("Stack is empty");
        return _items[^1];
    }

    public int Count => _items.Count;
    public bool IsEmpty => _items.Count == 0;
}
