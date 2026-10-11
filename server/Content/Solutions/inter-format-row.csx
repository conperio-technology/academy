public class Solution
{
    public static string FormatRow(string name, int qty, double price)
    {
        return $"{name,-10}|{qty,5}|{price,10:F2}|{qty * price,12:N2}";
    }
}
