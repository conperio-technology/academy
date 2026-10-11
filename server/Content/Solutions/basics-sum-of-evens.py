def sum_of_evens(nums):
    total = 0
    for n in nums:
        if n % 2 == 0:
            total += n
    return total
