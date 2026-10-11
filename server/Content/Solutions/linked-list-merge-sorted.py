def merge_two_lists(a, b):
    dummy = ListNode(0)
    tail = dummy
    while a is not None and b is not None:
        if a.val <= b.val:  # ties take from a, which keeps the merge stable
            tail.next = a
            a = a.next
        else:
            tail.next = b
            b = b.next
        tail = tail.next
    tail.next = a if a is not None else b  # the leftover list is already sorted
    return dummy.next
