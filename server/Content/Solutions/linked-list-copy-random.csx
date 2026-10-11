public class Solution
{
    public static Node? CopyRandomList(Node? head)
    {
        // Pass 1: one copy per original node, found again through the map.
        var copies = new Dictionary<Node, Node>();
        for (var n = head; n != null; n = n.Next)
            copies[n] = new Node(n.Val);

        // Pass 2: every copy exists now, so each pointer is one lookup.
        for (var n = head; n != null; n = n.Next)
        {
            copies[n].Next = n.Next == null ? null : copies[n.Next];
            copies[n].Random = n.Random == null ? null : copies[n.Random];
        }
        return head == null ? null : copies[head];
    }
}
