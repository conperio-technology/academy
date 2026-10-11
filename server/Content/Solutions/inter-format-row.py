def format_row(name, qty, price):
    return f"{name:<10}|{qty:>5}|{price:>10.2f}|{qty * price:>12,.2f}"
