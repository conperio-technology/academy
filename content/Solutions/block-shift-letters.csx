using System.Text;

public class Solution
{
    public static string ShiftLetters(string s, int k)
    {
        var shift = ((k % 26) + 26) % 26;
        var sb = new StringBuilder();
        foreach (var c in s)
        {
            if (c >= 'a' && c <= 'z')
                sb.Append((char)('a' + (c - 'a' + shift) % 26));
            else
                sb.Append(c);
        }
        return sb.ToString();
    }
}
