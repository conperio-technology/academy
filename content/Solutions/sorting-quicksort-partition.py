def partition(nums):
    last = len(nums) - 1
    pivot = nums[last]
    i = -1
    for j in range(last):
        if nums[j] <= pivot:
            i += 1
            nums[i], nums[j] = nums[j], nums[i]
    nums[i + 1], nums[last] = nums[last], nums[i + 1]
    return nums
