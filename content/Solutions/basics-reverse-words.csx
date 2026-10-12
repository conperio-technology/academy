public class Solution
{
    public static string ReverseWords(string text)
    {
        // RemoveEmptyEntries drops the empty pieces that extra spaces would create.
        string[] words = text.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        Array.Reverse(words);
        return string.Join(" ", words);
    }
}
