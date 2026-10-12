def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)  # so removing head isn't a special case
    lead = trail = dummy
    for _ in range(n + 1):  # n + 1 steps ahead
        lead = lead.next
    while lead is not None:
        lead = lead.next
        trail = trail.next
    trail.next = trail.next.next  # trail is just before the n-th node from the end
    return dummy.next
