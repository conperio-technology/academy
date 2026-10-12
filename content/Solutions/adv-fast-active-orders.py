def active_orders(orders: list[str], cancelled: list[str]) -> str:
    gone = set(cancelled)
    return ",".join(order_id for order_id in orders if order_id not in gone)
