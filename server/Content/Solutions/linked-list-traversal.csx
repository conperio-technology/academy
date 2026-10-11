public class Solution
{
    public static int[] TraverseToArray(ListNode? head)
    {
        var result = new List<int>();
        for (var node = head; node != null; node = node.Next)
            result.Add(node.Val);
        return result.ToArray();
    }
}
