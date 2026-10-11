public class Solution
{
    public static string ActiveOrders(List<string> orders, List<string> cancelled)
    {
        var gone = new HashSet<string>(cancelled);
        return string.Join(",", orders.Where(id => !gone.Contains(id)));
    }
}
