from collections.abc import Iterator


class StepRange:
    def __init__(self, start: int, stop: int, step: int) -> None:
        self.start, self.stop, self.step = start, stop, step

    def __len__(self) -> int:
        return 0 if self.stop < self.start else (self.stop - self.start) // self.step + 1

    def __getitem__(self, i: int) -> int:
        if not 0 <= i < len(self):
            raise IndexError("StepRange index out of range")
        return self.start + i * self.step

    def __contains__(self, x: int) -> bool:
        return self.start <= x <= self.stop and (x - self.start) % self.step == 0

    def __iter__(self) -> Iterator[int]:
        value = self.start
        while value <= self.stop:
            yield value
            value += self.step
