public class RandomizedSet
{
    private readonly List<int> values = new();
    private readonly Dictionary<int, int> indexOf = new(); // value -> its index in values
    private readonly Random rng = new();

    public bool Insert(int val)
    {
        if (indexOf.ContainsKey(val)) return false;
        indexOf[val] = values.Count;
        values.Add(val);
        return true;
    }

    public bool Remove(int val)
    {
        if (!indexOf.TryGetValue(val, out var i)) return false;
        var last = values[^1];
        values[i] = last; // fill the hole with the last value instead of shifting
        indexOf[last] = i;
        values.RemoveAt(values.Count - 1);
        indexOf.Remove(val); // after updating last, so removing the last value itself works
        return true;
    }

    public int GetRandom() => values[rng.Next(values.Count)];
}
