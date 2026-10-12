def shipping_cents(parcel: "Parcel") -> int:
    match parcel:
        case Parcel(grams=g) if g <= 0:
            base = -1
        case Parcel(grams=g, zone="local"):
            base = 500 if g < 1000 else 900 if g < 5000 else 1500
        case Parcel(grams=g, zone="national") if g < 20000:
            base = 800 if g < 1000 else 1400 if g < 5000 else 2500
        case Parcel(grams=g, zone="international") if g < 10000:
            base = 2000 if g < 2000 else 4500
        case _:
            base = -1

    match (parcel.service, parcel.zone, base):
        case (_, _, -1):
            return -1
        case ("standard", _, price):
            return price
        case ("express", zone, price) if zone != "international":
            return price * 2
        case _:
            return -1
