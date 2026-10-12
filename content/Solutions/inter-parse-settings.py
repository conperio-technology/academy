def parse_settings(text):
    settings = {}
    for raw_line in text.split("\n"):
        line = raw_line.strip()              # also removes a Windows \r
        if not line or line.startswith("#"):
            continue
        key, sep, value = line.partition("=")   # split at the first "=" only
        key = key.strip()
        if not sep or not key:
            continue
        settings[key] = value.strip()        # a later line wins
    return settings
