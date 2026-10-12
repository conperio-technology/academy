def rob(nums):
    prev2 = prev1 = 0  # best up to two houses back, best up to the previous house
    for house in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + house)  # skip it, or rob it
    return prev1
