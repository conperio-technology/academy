import re


def extract_error_codes(log):
    # \b: word boundaries on both sides; [0-9]{4}: exactly four ASCII digits.
    return re.findall(r"\bERR-[0-9]{4}\b", log)
