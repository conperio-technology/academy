def reverse_between(head, left, right):
    dummy = ListNode(0, head)
    before = dummy
    for _ in range(left - 1):
        before = before.next

    tail = before.next  # first node of the stretch, last after reversing
    prev = None
    curr = tail
    for _ in range(right - left + 1):
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt

    tail.next = curr  # stretch, then the rest of the list
    before.next = prev  # front of the list, then the stretch
    return dummy.next
