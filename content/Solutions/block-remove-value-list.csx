public class Solution
{
    public static ListNode? RemoveValue(ListNode? head, int val)
    {
        var dummy = new ListNode(0, head);
        var current = dummy;
        while (current.Next != null)
        {
            if (current.Next.Val == val)
                current.Next = current.Next.Next;
            else
                current = current.Next;
        }
        return dummy.Next;
    }
}
