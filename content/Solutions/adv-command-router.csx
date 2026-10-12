public class Solution
{
    public static string Route(string[] words) => words switch
    {
        [] => "empty",
        ["start", var tag] => $"starting {tag}",
        ["stop"] => "stopping all",
        ["stop", var tag] => $"stopping {tag}",
        ["set", var tag, var value] when IsWholeNumber(value) => $"set {tag} to {value}",
        ["set", _, var value] => $"bad value: {value}",
        ["alarm", "ack"] => "nothing to acknowledge",
        ["alarm", "ack", .. var ids] => $"acknowledged {ids.Length} alarms",
        _ => $"unknown: {string.Join(" ", words)}",
    };

    private static bool IsWholeNumber(string text)
    {
        var digits = text.StartsWith('-') ? text[1..] : text;
        return digits.Length > 0 && digits.All(char.IsAsciiDigit);
    }
}
