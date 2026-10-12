def sum_fields(line: str) -> int:
    total = 0
    start = 0
    while start <= len(line):
        end = line.find(";", start)
        if end == -1:
            end = len(line)
        field = line[start:end]
        if field.strip():
            total += int(field)
        start = end + 1
    return total
