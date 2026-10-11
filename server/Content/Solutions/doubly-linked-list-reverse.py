def reverse_list(head):
    new_head = None
    node = head
    while node is not None:
        nxt = node.next          # save it before overwriting
        node.next = node.prev
        node.prev = nxt
        new_head = node          # the last node visited ends up first
        node = nxt
    return new_head
