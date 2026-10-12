def traverse_to_array(head):
    result = []
    node = head
    while node is not None:
        result.append(node.val)
        node = node.next
    return result
