def reverse_list(head):
    prev = None
    curr = head
    while curr is not None:
        nxt = curr.next  # save it before the next line overwrites it
        curr.next = prev  # flip this node to point backward
        prev = curr
        curr = nxt
    return prev  # the old tail
