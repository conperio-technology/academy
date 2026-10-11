public class Solution
{
    public static ListNode? ReverseList(ListNode? head)
    {
        ListNode? prev = null;
        var curr = head;
        while (curr != null)
        {
            var next = curr.Next; // save it before the next line overwrites it
            curr.Next = prev;     // flip this node to point backward
            prev = curr;
            curr = next;
        }
        return prev; // the old tail
    }
}
