using System.Text.RegularExpressions;

public class Solution
{
    public static List<string> ExtractErrorCodes(string log)
    {
        // \b: word boundaries on both sides; [0-9]{4}: exactly four ASCII digits.
        return Regex.Matches(log, @"\bERR-[0-9]{4}\b").Select(m => m.Value).ToList();
    }
}
