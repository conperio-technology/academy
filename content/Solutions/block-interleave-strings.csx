using System.Text;

public class Solution
{
    public static string Interleave(string a, string b)
    {
        var sb = new StringBuilder();
        for (var i = 0; i < Math.Max(a.Length, b.Length); i++)
        {
            if (i < a.Length) sb.Append(a[i]);
            if (i < b.Length) sb.Append(b[i]);
        }
        return sb.ToString();
    }
}
