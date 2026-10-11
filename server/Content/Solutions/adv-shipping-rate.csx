public class Solution
{
    public static int ShippingCents(Parcel parcel)
    {
        int basePrice = parcel switch
        {
            { Grams: <= 0 } => -1,
            { Zone: "local", Grams: < 1000 } => 500,
            { Zone: "local", Grams: < 5000 } => 900,
            { Zone: "local" } => 1500,
            { Zone: "national", Grams: < 1000 } => 800,
            { Zone: "national", Grams: < 5000 } => 1400,
            { Zone: "national", Grams: < 20000 } => 2500,
            { Zone: "international", Grams: < 2000 } => 2000,
            { Zone: "international", Grams: < 10000 } => 4500,
            _ => -1,
        };

        return (parcel.Service, parcel.Zone, basePrice) switch
        {
            (_, _, -1) => -1,
            ("standard", _, var price) => price,
            ("express", not "international", var price) => price * 2,
            _ => -1,
        };
    }
}
