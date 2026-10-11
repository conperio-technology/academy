def copy_random_list(head):
    # Pass 1: one copy per original node, found again through the dict.
    copies = {}
    n = head
    while n is not None:
        copies[n] = Node(n.val)
        n = n.next

    # Pass 2: every copy exists now, so each pointer is one lookup.
    n = head
    while n is not None:
        copies[n].next = copies[n.next] if n.next is not None else None
        copies[n].random = copies[n.random] if n.random is not None else None
        n = n.next
    return copies[head] if head is not None else None
