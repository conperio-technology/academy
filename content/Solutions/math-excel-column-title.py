def convert_to_title(column_number):
    letters = []
    while column_number > 0:
        column_number -= 1  # letters are 1..26, so shift to 0..25 before % and //
        letters.append(chr(ord('A') + column_number % 26))
        column_number //= 26
    return ''.join(reversed(letters))  # built right to left
