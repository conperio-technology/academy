public class CacheNode
{
    public int Key;
    public int Value;
    public CacheNode? Prev;
    public CacheNode? Next;
    public CacheNode(int key, int value) { Key = key; Value = value; }
}

public class LRUCache
{
    private readonly int capacity;
    private readonly Dictionary<int, CacheNode> map = new();
    private readonly CacheNode head = new(0, 0); // sentinel: head.Next is the most recent
    private readonly CacheNode tail = new(0, 0); // sentinel: tail.Prev is the least recent

    public LRUCache(int capacity)
    {
        this.capacity = capacity;
        head.Next = tail;
        tail.Prev = head;
    }

    public int Get(int key)
    {
        if (!map.TryGetValue(key, out var node)) return -1;
        Remove(node);
        AddFront(node);
        return node.Value;
    }

    public void Put(int key, int value)
    {
        if (map.TryGetValue(key, out var existing))
        {
            existing.Value = value;
            Remove(existing);
            AddFront(existing);
            return;
        }
        if (map.Count == capacity)
        {
            var lru = tail.Prev!;
            Remove(lru);
            map.Remove(lru.Key); // the node carries its key so we can do this
        }
        var node = new CacheNode(key, value);
        map[key] = node;
        AddFront(node);
    }

    private static void Remove(CacheNode node)
    {
        node.Prev!.Next = node.Next;
        node.Next!.Prev = node.Prev;
    }

    private void AddFront(CacheNode node)
    {
        node.Prev = head;
        node.Next = head.Next;
        head.Next!.Prev = node;
        head.Next = node;
    }
}
