from collections import deque


def max_sliding_window(nums, k):
    result = []
    dq = deque()  # indices; their values decrease front to back
    for i, x in enumerate(nums):
        if dq and dq[0] <= i - k:  # slid out of the window
            dq.popleft()
        while dq and nums[dq[-1]] <= x:  # can never be the max again
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            result.append(nums[dq[0]])
    return result
