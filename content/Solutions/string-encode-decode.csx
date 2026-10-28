public class Codec
{
    public static string Encode(string[] strs)
    {
        var sb = new System.Text.StringBuilder();
        foreach (var s in strs) sb.Append(s.Length).Append('#').Append(s); // length first: no escaping needed
        return sb.ToString();
    }

    public static List<string> Decode(string s)
    {
        var result = new List<string>();
        var i = 0;
        while (i < s.Length)
        {
            var j = s.IndexOf('#', i); // the first # after i always ends a length
            var length = int.Parse(s[i..j]);
            result.Add(s.Substring(j + 1, length)); // copy, never search, the content
            i = j + 1 + length;
        }
        return result;
    }
}
