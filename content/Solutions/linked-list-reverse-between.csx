public class Solution
{
    public static ListNode? ReverseBetween(ListNode? head, int left, int right)
    {
        var dummy = new ListNode(0, head);
        var before = dummy;
        for (var i = 1; i < left; i++) before = before.Next!;

        var tail = before.Next; // first node of the stretch, last after reversing
        ListNode? prev = null;
        var curr = tail;
        for (var i = 0; i <= right - left; i++)
        {
            var next = curr!.Next;
            curr.Next = prev;
            prev = curr;
            curr = next;
        }

        tail!.Next = curr;  // stretch, then the rest of the list
        before.Next = prev; // front of the list, then the stretch
        return dummy.Next;
    }
}
