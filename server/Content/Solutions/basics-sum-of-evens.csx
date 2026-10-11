public class Solution
{
    public static int SumOfEvens(int[] nums)
    {
        int total = 0;
        foreach (int n in nums)
        {
            if (n % 2 == 0)  // == 0 works for negatives too; -3 % 2 is -1 in C#
                total += n;
        }
        return total;
    }
}
