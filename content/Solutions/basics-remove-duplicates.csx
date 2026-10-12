public class Solution
{
    public static List<int> RemoveDuplicates(int[] nums)
    {
        var seen = new HashSet<int>();
        var result = new List<int>();
        foreach (int n in nums)
        {
            if (seen.Add(n))  // Add returns false if n was already in the set
                result.Add(n);
        }
        return result;
    }
}
