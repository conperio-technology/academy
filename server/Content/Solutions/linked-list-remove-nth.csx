public class Solution
{
    public static ListNode? RemoveNthFromEnd(ListNode? head, int n)
    {
        var dummy = new ListNode(0, head); // so removing head isn't a special case
        ListNode? lead = dummy;
        var trail = dummy;
        for (var i = 0; i <= n; i++) lead = lead!.Next; // n + 1 steps ahead
        while (lead != null)
        {
            lead = lead.Next;
            trail = trail.Next!;
        }
        trail.Next = trail.Next!.Next; // trail is just before the n-th node from the end
        return dummy.Next;
    }
}
