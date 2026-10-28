public class Solution
{
    public static int[] ReservoirSample(int[] stream, int k, int[] draws)
    {
        var reservoir = stream.Take(k).ToArray();
        for (var i = k; i < stream.Length; i++)
        {
            var j = draws[i]; // real code: rng.Next(i + 1), uniform from 0 to i
            if (j < k) reservoir[j] = stream[i]; // item i gets in with probability k / (i + 1)
        }
        return reservoir;
    }
}
