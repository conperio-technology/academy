public class Solution
{
    public static int CompareVersions(string a, string b)
    {
        var (coreA, preA) = Parse(a);
        var (coreB, preB) = Parse(b);
        for (int i = 0; i < 3; i++)
            if (coreA[i] != coreB[i]) return coreA[i] < coreB[i] ? -1 : 1;

        if (preA.Length == 0 || preB.Length == 0)                // a pre-release comes before the release
            return (preB.Length > 0 ? 1 : 0) - (preA.Length > 0 ? 1 : 0);

        for (int i = 0; i < Math.Min(preA.Length, preB.Length); i++)
        {
            int c = CompareIdentifiers(preA[i], preB[i]);
            if (c != 0) return c;
        }
        return preA.Length.CompareTo(preB.Length);
    }

    private static (int[] Core, string[] Pre) Parse(string version)
    {
        int plus = version.IndexOf('+');
        if (plus >= 0) version = version[..plus];                // build metadata is ignored
        int dash = version.IndexOf('-');
        string core = dash < 0 ? version : version[..dash];
        string[] pre = dash < 0 ? [] : version[(dash + 1)..].Split('.');
        return (core.Split('.').Select(int.Parse).ToArray(), pre);
    }

    private static int CompareIdentifiers(string x, string y)
    {
        bool xNum = x.All(char.IsAsciiDigit), yNum = y.All(char.IsAsciiDigit);
        if (xNum && yNum) return Math.Sign(long.Parse(x).CompareTo(long.Parse(y)));
        if (xNum != yNum) return xNum ? -1 : 1;                 // numeric < alphanumeric
        return Math.Sign(string.CompareOrdinal(x, y));
    }
}
