public class Solution
{
    public static int CountVowels(string text)
    {
        int count = 0;
        foreach (char c in text)
        {
            if ("aeiou".Contains(char.ToLower(c)))
                count++;
        }
        return count;
    }
}
