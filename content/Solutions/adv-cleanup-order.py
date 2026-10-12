from contextlib import ExitStack


def run_steps(names: list[str], fail_on: str, log: list[str]) -> None:
    with ExitStack() as stack:
        for name in names:
            stack.enter_context(Resource(name, fail_on, log))
        log.append("work")
        if fail_on == "work":
            raise RuntimeError("work failed")
