def can_complete_circuit(gas, cost):
    total = tank = start = 0
    for i, (g, c) in enumerate(zip(gas, cost)):
        total += g - c
        tank += g - c
        if tank < 0:
            # Ran dry after station i: no station from start to i can work.
            start = i + 1
            tank = 0
    return start if total >= 0 else -1
