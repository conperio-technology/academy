public class Solution
{
    public static DoublyListNode? ReverseList(DoublyListNode? head)
    {
        DoublyListNode? newHead = null;
        var node = head;
        while (node != null)
        {
            var next = node.Next;          // save it before overwriting
            node.Next = node.Prev;
            node.Prev = next;
            newHead = node;                // the last node visited ends up first
            node = next;
        }
        return newHead;
    }
}
