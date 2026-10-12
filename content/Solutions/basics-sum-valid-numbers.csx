public class Solution
{
    public static int SumValid(string[] items)
    {
        int total = 0;
        foreach (string item in items)
        {
            // TryParse returns false instead of throwing on bad input.
            if (int.TryParse(item, out int n))
                total += n;
        }
        return total;
    }
}
