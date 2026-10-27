def rotate_right(nums, k):
    if not nums:
        return nums

    def reverse(lo, hi):
        while lo < hi:
            nums[lo], nums[hi] = nums[hi], nums[lo]
            lo += 1
            hi -= 1

    k %= len(nums)
    reverse(0, len(nums) - 1)
    reverse(0, k - 1)
    reverse(k, len(nums) - 1)
    return nums
