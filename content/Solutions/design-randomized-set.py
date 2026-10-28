import random


class RandomizedSet:
    def __init__(self):
        self.values = []
        self.index_of = {}  # value -> its index in values

    def insert(self, val):
        if val in self.index_of:
            return False
        self.index_of[val] = len(self.values)
        self.values.append(val)
        return True

    def remove(self, val):
        if val not in self.index_of:
            return False
        i = self.index_of[val]
        last = self.values[-1]
        self.values[i] = last  # fill the hole with the last value instead of shifting
        self.index_of[last] = i
        self.values.pop()
        del self.index_of[val]  # after updating last, so removing the last value itself works
        return True

    def get_random(self):
        return random.choice(self.values)
