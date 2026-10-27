def previous_smaller(nums):
    result = []
    stack = []
    for i, value in enumerate(nums):
        while stack and nums[stack[-1]] >= value:
            stack.pop()
        result.append(stack[-1] if stack else -1)
        stack.append(i)
    return result
