def next_greater_elements(nums):
    result = [-1] * len(nums)
    stack = []  # indices still waiting for a bigger value
    for i, n in enumerate(nums):
        while stack and nums[stack[-1]] < n:
            result[stack.pop()] = n
        stack.append(i)
    return result
