public class Solution
{
    public static int[] CountingSort(int[] nums)
    {
        if (nums.Length == 0) return [];
        int min = nums.Min(), max = nums.Max();
        var counts = new int[max - min + 1]; // index x - min holds how many times x appears
        foreach (var x in nums) counts[x - min]++;
        var result = new int[nums.Length];
        var k = 0;
        for (var i = 0; i < counts.Length; i++)
            for (var c = 0; c < counts[i]; c++) result[k++] = i + min;
        return result;
    }
}
