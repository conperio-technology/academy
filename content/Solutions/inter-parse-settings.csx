public class Solution
{
    public static Dictionary<string, string> ParseSettings(string text)
    {
        var settings = new Dictionary<string, string>();
        foreach (var rawLine in text.Split('\n'))
        {
            var line = rawLine.Trim();                 // also removes a Windows \r
            if (line.Length == 0 || line.StartsWith('#')) continue;
            var parts = line.Split('=', 2);            // at most 2 parts: split at the first '='
            if (parts.Length < 2) continue;
            var key = parts[0].Trim();
            if (key.Length == 0) continue;
            settings[key] = parts[1].Trim();           // a later line wins
        }
        return settings;
    }
}
