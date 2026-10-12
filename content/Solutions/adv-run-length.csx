public class Solution
{
    public static List<string> RunLength(IEnumerable<string> statuses)
    {
        var runs = new List<string>();
        string? current = null;
        int count = 0;
        foreach (var status in statuses)
        {
            if (count > 0 && status == current)
            {
                count++;
                continue;
            }
            if (count > 0) runs.Add($"{current} x{count}");
            current = status;
            count = 1;
        }
        if (count > 0) runs.Add($"{current} x{count}");
        return runs;
    }
}
