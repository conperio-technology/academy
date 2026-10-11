public class Solution
{
    public static int SumFields(ReadOnlySpan<char> line)
    {
        int total = 0;
        while (!line.IsEmpty)
        {
            int end = line.IndexOf(';');
            ReadOnlySpan<char> field = end < 0 ? line : line[..end];
            if (!field.IsWhiteSpace()) total += int.Parse(field);
            line = end < 0 ? ReadOnlySpan<char>.Empty : line[(end + 1)..];
        }
        return total;
    }
}
