def greet(name, greeting="Hello"):
    trimmed = name.strip()
    if not trimmed:  # an empty string is falsy
        trimmed = "stranger"
    return f"{greeting}, {trimmed}!"
