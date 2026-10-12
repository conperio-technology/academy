def coin_change_ways(coins, amount):
    ways = [0] * (amount + 1)
    ways[0] = 1  # the empty combination
    for c in coins:  # coins outside: each combination in one coin order
        for x in range(c, amount + 1):  # upward: the same coin may be used again
            ways[x] += ways[x - c]
    return ways[amount]
