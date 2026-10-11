def gcd_and_lcm(nums):
    def gcd(a, b):
        while b:
            a, b = b, a % b
        return a

    g = l = nums[0]
    for x in nums[1:]:
        g = gcd(g, x)
        l = l // gcd(l, x) * x  # Python can't overflow, but dividing first keeps numbers small
    return [g, l]
