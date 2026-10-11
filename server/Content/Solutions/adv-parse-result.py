def parse_endpoint(text: str) -> "Ok | Err":
    host, colon, port_text = text.rpartition(":")
    if not colon:
        return Err("missing port")
    if not host:
        return Err("empty host")
    if not (port_text.isascii() and port_text.isdigit()):
        return Err("port is not a number")
    port = int(port_text)
    if not 1 <= port <= 65535:
        return Err("port out of range")
    return Ok(Endpoint(host, port))


def parse_all(lines: list[str]) -> "Ok | Err":
    endpoints = []
    errors = []
    for number, line in enumerate(lines, start=1):
        match parse_endpoint(line):
            case Ok(endpoint):
                endpoints.append(endpoint)
            case Err(error):
                errors.append(f"line {number}: {error}")
    return Err("; ".join(errors)) if errors else Ok(endpoints)
