def max_profit(prices):
    hold, sold, rest = float("-inf"), float("-inf"), 0
    for p in prices:
        # all three from yesterday's values; buying only from rest is the cooldown
        hold, sold, rest = max(hold, rest - p), hold + p, max(rest, sold)
    return max(sold, rest)
