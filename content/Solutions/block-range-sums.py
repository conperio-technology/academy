def range_sums(nums, queries):
    prefix = [0] * (len(nums) + 1)
    for i, value in enumerate(nums):
        prefix[i + 1] = prefix[i] + value
    return [prefix[right + 1] - prefix[left] for left, right in queries]
