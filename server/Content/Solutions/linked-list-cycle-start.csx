public class Solution
{
    public static ListNode? DetectCycleStart(ListNode? head)
    {
        var slow = head;
        var fast = head;
        while (fast != null && fast.Next != null)
        {
            slow = slow!.Next;
            fast = fast.Next.Next;
            if (slow == fast)
            {
                // Phase 2: head and the meeting point are the same distance from the cycle start.
                var finder = head;
                while (finder != slow)
                {
                    finder = finder!.Next;
                    slow = slow!.Next;
                }
                return finder;
            }
        }
        return null; // fast reached the end, so there's no cycle
    }
}
