public class Solution
{
    public static List<int[]> ThreeSum(int[] nums)
    {
        var sorted = nums.OrderBy(x => x).ToArray();
        var result = new List<int[]>();
        for (var i = 0; i < sorted.Length - 2; i++)
        {
            if (sorted[i] > 0) break; // everything to the right is positive too
            if (i > 0 && sorted[i] == sorted[i - 1]) continue; // same first value, same triplets

            // Sorted Two Sum on the rest, looking for -sorted[i], collecting every pair.
            int left = i + 1, right = sorted.Length - 1;
            while (left < right)
            {
                var sum = sorted[i] + sorted[left] + sorted[right];
                if (sum < 0) left++;
                else if (sum > 0) right--;
                else
                {
                    result.Add([sorted[i], sorted[left], sorted[right]]);
                    var lv = sorted[left];
                    var rv = sorted[right];
                    while (left < right && sorted[left] == lv) left++;
                    while (left < right && sorted[right] == rv) right--;
                }
            }
        }
        return result;
    }
}
