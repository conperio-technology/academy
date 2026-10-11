from collections import deque

def process_queue_ops(ops):
    queue = deque()
    dequeued = []
    for op in ops:
        if op > 0:
            queue.append(op)
        else:
            dequeued.append(queue.popleft())  # O(1), unlike list.pop(0)
    return dequeued
