def reservoir_sample(stream, k, draws):
    reservoir = list(stream[:k])
    for i in range(k, len(stream)):
        j = draws[i]  # real code: random.randint(0, i), uniform from 0 to i
        if j < k:  # item i gets in with probability k / (i + 1)
            reservoir[j] = stream[i]
    return reservoir
