def fizz_buzz(n):
    result = []
    for i in range(1, n + 1):
        word = ""
        if i % 3 == 0:
            word += "Fizz"
        if i % 5 == 0:
            word += "Buzz"
        result.append(word or str(i))  # empty string is falsy, so fall back to the number
    return result
