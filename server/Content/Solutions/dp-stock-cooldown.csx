public class Solution
{
    public static int MaxProfit(int[] prices)
    {
        const int NegInf = int.MinValue / 2; // halved so adding a price can't overflow
        int hold = NegInf, sold = NegInf, rest = 0;
        foreach (var p in prices)
        {
            var newHold = Math.Max(hold, rest - p); // buy only from rest: that's the cooldown
            var newSold = hold + p;
            var newRest = Math.Max(rest, sold);
            hold = newHold;
            sold = newSold;
            rest = newRest;
        }
        return Math.Max(sold, rest);
    }
}
