def knapsack(weights, values, capacity):
    dp = [0] * (capacity + 1)
    for wt, v in zip(weights, values):
        for w in range(capacity, wt - 1, -1):  # descending: each item used at most once
            dp[w] = max(dp[w], dp[w - wt] + v)
    return dp[capacity]
