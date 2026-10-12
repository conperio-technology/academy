public class Solution
{
    public static string Greet(string name, string greeting = "Hello")
    {
        string trimmed = name.Trim();
        if (trimmed.Length == 0) trimmed = "stranger";
        return $"{greeting}, {trimmed}!";
    }
}
