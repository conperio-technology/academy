def product_except_self(nums):
    answer = [1] * len(nums)
    prefix = 1
    for i in range(len(nums)):
        answer[i] = prefix  # product of everything left of i
        prefix *= nums[i]
    suffix = 1
    for i in range(len(nums) - 1, -1, -1):
        answer[i] *= suffix  # times the product of everything right of i
        suffix *= nums[i]
    return answer
