from collections.abc import Callable


def retry(action: Callable[[], int], max_attempts: int, base_delay_ms: int, max_delay_ms: int,
          sleep: Callable[[int], None]) -> int:
    for attempt in range(1, max_attempts + 1):
        try:
            return action()
        except TimeoutError:
            if attempt == max_attempts:
                raise
            sleep(min(max_delay_ms, base_delay_ms * 2 ** (attempt - 1)))
    raise AssertionError("unreachable")
