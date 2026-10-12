public class Solution
{
    public static int FindMiddle(ListNode? head)
    {
        var slow = head;
        var fast = head;
        while (fast != null && fast.Next != null)
        {
            slow = slow!.Next;
            fast = fast.Next.Next;
        }
        return slow!.Val;
    }
}
