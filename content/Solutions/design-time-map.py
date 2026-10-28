class TimeMap:
    def __init__(self):
        self.versions = {}  # key -> list of (timestamp, value), in time order

    def set(self, key, value, timestamp):
        self.versions.setdefault(key, []).append((timestamp, value))  # stays sorted

    def get(self, key, timestamp):
        items = self.versions.get(key)
        if not items:
            return ""
        lo, hi = 0, len(items)  # find the first version newer than timestamp
        while lo < hi:
            mid = (lo + hi) // 2
            if items[mid][0] <= timestamp:
                lo = mid + 1
            else:
                hi = mid
        return items[lo - 1][1] if lo else ""  # the one before it was current then
