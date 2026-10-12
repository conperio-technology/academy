def rob_circle(nums):
    if not nums:
        return 0
    if len(nums) == 1:
        return nums[0]
    # House 0 and house n - 1 can't both be robbed, so one of them is skipped.
    return max(_rob_line(nums, 0, len(nums) - 2), _rob_line(nums, 1, len(nums) - 1))


def _rob_line(nums, lo, hi):
    # The linear House Robber on nums[lo..hi], both ends included.
    prev2 = prev1 = 0
    for i in range(lo, hi + 1):
        prev2, prev1 = prev1, max(prev1, prev2 + nums[i])
    return prev1
