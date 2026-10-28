public class Solution
{
    public static int[] Shuffle(int[] nums, int[] picks)
    {
        var a = nums.ToArray();
        for (var i = a.Length - 1; i >= 1; i--)
        {
            var j = picks[a.Length - 1 - i]; // real code: rng.Next(i + 1), a slot from 0 to i
            (a[i], a[j]) = (a[j], a[i]); // position i is now final
        }
        return a;
    }
}
