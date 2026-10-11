def passing_names(names, scores, pass_mark):
    passed = [(name, score) for name, score in zip(names, scores) if score >= pass_mark]
    passed.sort(key=lambda p: (-p[1], p[0]))   # high score first, then name
    return [name for name, _ in passed]
