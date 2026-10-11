def process_heap_ops(ops):
    heap = []
    popped = []
    for op in ops:
        if op > 0:
            push(heap, op)
        else:
            popped.append(pop(heap))
    return popped

def push(heap, value):
    heap.append(value)
    i = len(heap) - 1
    while i > 0:
        parent = (i - 1) // 2
        if heap[parent] <= heap[i]:
            break
        heap[parent], heap[i] = heap[i], heap[parent]
        i = parent

def pop(heap):
    smallest_value = heap[0]
    heap[0] = heap[-1]
    heap.pop()
    i = 0
    while True:
        left, right, smallest = 2 * i + 1, 2 * i + 2, i
        if left < len(heap) and heap[left] < heap[smallest]:
            smallest = left
        if right < len(heap) and heap[right] < heap[smallest]:
            smallest = right
        if smallest == i:
            break
        heap[smallest], heap[i] = heap[i], heap[smallest]
        i = smallest
    return smallest_value
