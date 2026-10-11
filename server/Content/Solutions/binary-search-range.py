def search_range(nums, target):
    return [find_edge(nums, target, True), find_edge(nums, target, False)]

def find_edge(nums, target, first):
    left, right, found = 0, len(nums) - 1, -1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            found = mid  # remember it, but keep looking
            if first:
                right = mid - 1
            else:
                left = mid + 1
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return found
