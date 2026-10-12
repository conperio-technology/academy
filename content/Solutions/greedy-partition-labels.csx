using System.Collections.Generic;

public class Solution
{
    public static List<int> PartitionLabels(string s)
    {
        var last = new int[26];
        for (var i = 0; i < s.Length; i++) last[s[i] - 'a'] = i;

        var parts = new List<int>();
        int start = 0, end = 0;
        for (var i = 0; i < s.Length; i++)
        {
            end = Math.Max(end, last[s[i] - 'a']); // this part must reach every letter's last copy
            if (i == end)
            {
                parts.Add(end - start + 1); // nothing in this part appears later: cut
                start = i + 1;
            }
        }
        return parts;
    }
}
