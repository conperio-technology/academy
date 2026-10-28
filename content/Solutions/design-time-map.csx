public class TimeMap
{
    private readonly Dictionary<string, List<(int Time, string Value)>> versions = new();

    public void Set(string key, string value, int timestamp)
    {
        if (!versions.TryGetValue(key, out var list)) versions[key] = list = new();
        list.Add((timestamp, value)); // timestamps only grow, so the list stays sorted
    }

    public string Get(string key, int timestamp)
    {
        if (!versions.TryGetValue(key, out var list)) return "";
        int lo = 0, hi = list.Count; // find the first version newer than timestamp
        while (lo < hi)
        {
            var mid = lo + (hi - lo) / 2;
            if (list[mid].Time <= timestamp) lo = mid + 1;
            else hi = mid;
        }
        return lo == 0 ? "" : list[lo - 1].Value; // the one before it was current then
    }
}
