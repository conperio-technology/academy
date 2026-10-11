public class Solution
{
    public static int CanCompleteCircuit(int[] gas, int[] cost)
    {
        int total = 0, tank = 0, start = 0;
        for (var i = 0; i < gas.Length; i++)
        {
            var diff = gas[i] - cost[i];
            total += diff;
            tank += diff;
            if (tank < 0)
            {
                // Ran dry after station i: no station from start to i can work.
                start = i + 1;
                tank = 0;
            }
        }
        return total >= 0 ? start : -1;
    }
}
