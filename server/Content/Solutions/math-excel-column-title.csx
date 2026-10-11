using System.Text;

public class Solution
{
    public static string ConvertToTitle(int columnNumber)
    {
        var letters = new StringBuilder();
        while (columnNumber > 0)
        {
            columnNumber--; // letters are 1..26, so shift to 0..25 before % and /
            letters.Append((char)('A' + columnNumber % 26));
            columnNumber /= 26;
        }
        var chars = letters.ToString().ToCharArray();
        Array.Reverse(chars); // built right to left
        return new string(chars);
    }
}
