def is_whole_number(text: str) -> bool:
    digits = text[1:] if text.startswith("-") else text
    return digits.isascii() and digits.isdigit()


def route(words: list[str]) -> str:
    match words:
        case []:
            return "empty"
        case ["start", tag]:
            return f"starting {tag}"
        case ["stop"]:
            return "stopping all"
        case ["stop", tag]:
            return f"stopping {tag}"
        case ["set", tag, value] if is_whole_number(value):
            return f"set {tag} to {value}"
        case ["set", _, value]:
            return f"bad value: {value}"
        case ["alarm", "ack"]:
            return "nothing to acknowledge"
        case ["alarm", "ack", *ids]:
            return f"acknowledged {len(ids)} alarms"
        case _:
            return "unknown: " + " ".join(words)
