def largest_rectangle_area(heights):
    stack = []  # indices; their heights increase from bottom to top
    best = 0
    for i in range(len(heights) + 1):
        h = 0 if i == len(heights) else heights[i]  # a height-0 bar at the end flushes the stack
        while stack and heights[stack[-1]] > h:
            top = stack.pop()
            # Bar top spans from just after the new top (its first shorter bar on the left) to i - 1.
            width = i if not stack else i - stack[-1] - 1
            best = max(best, heights[top] * width)
        stack.append(i)
    return best
