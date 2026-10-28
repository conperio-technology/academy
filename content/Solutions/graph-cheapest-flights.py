def find_cheapest_price(n, flights, src, dst, k):
    INF = float("inf")
    price = [INF] * n
    price[src] = 0
    for _ in range(k + 1):  # k stops = at most k + 1 flights
        nxt = price[:]  # relax from last round's prices only
        for u, v, w in flights:
            if price[u] + w < nxt[v]:
                nxt[v] = price[u] + w
        price = nxt
    return -1 if price[dst] == INF else price[dst]
