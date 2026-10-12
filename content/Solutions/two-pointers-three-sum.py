def three_sum(nums):
    s = sorted(nums)
    result = []
    for i in range(len(s) - 2):
        if s[i] > 0:
            break  # everything to the right is positive too
        if i > 0 and s[i] == s[i - 1]:
            continue  # same first value, same triplets

        # Sorted Two Sum on the rest, looking for -s[i], collecting every pair.
        left, right = i + 1, len(s) - 1
        while left < right:
            total = s[i] + s[left] + s[right]
            if total < 0:
                left += 1
            elif total > 0:
                right -= 1
            else:
                result.append([s[i], s[left], s[right]])
                lv, rv = s[left], s[right]
                while left < right and s[left] == lv:
                    left += 1
                while left < right and s[right] == rv:
                    right -= 1
    return result
