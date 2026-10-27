def remove_value(head, val):
    dummy = ListNode(0, head)
    current = dummy
    while current.next is not None:
        if current.next.val == val:
            current.next = current.next.next
        else:
            current = current.next
    return dummy.next
