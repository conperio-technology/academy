public class Solution
{
    public static ListNode? MergeTwoLists(ListNode? a, ListNode? b)
    {
        var dummy = new ListNode(0);
        var tail = dummy;
        while (a != null && b != null)
        {
            if (a.Val <= b.Val) // ties take from a, which keeps the merge stable
            {
                tail.Next = a;
                a = a.Next;
            }
            else
            {
                tail.Next = b;
                b = b.Next;
            }
            tail = tail.Next;
        }
        tail.Next = a ?? b; // the leftover list is already sorted
        return dummy.Next;
    }
}
