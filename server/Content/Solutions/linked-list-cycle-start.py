def detect_cycle_start(head):
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            # Phase 2: head and the meeting point are the same distance from the cycle start.
            finder = head
            while finder is not slow:
                finder = finder.next
                slow = slow.next
            return finder
    return None  # fast reached the end, so there's no cycle
