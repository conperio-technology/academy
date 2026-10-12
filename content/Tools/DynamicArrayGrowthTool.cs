namespace DsaAcademy.Content.Tools;

public class DynamicArrayGrowthTool : ITool
{
    public string Id => "dynamic-array-growth";
    public string Section => "Computer Fundamentals";
    public string Track => "hardware";
    public string Title => "Dynamic Arrays: How They Grow";
    public string OneLiner => "A resizable array (List<T>, ArrayList, Python's list) isn't magic -- it's a fixed-size array underneath that gets replaced with a bigger one when it fills up.";
    public string KeyTakeaway =>
        "Appending to a dynamic array is amortized O(1) (on average a constant cost per append) even though an individual resize is O(n) (cost proportional to the number of elements, n), " +
        "because capacity MULTIPLIES by a constant factor each time (this app doubles it) instead of growing by a fixed amount -- that makes " +
        "expensive resizes exponentially rarer as the array grows, so their cost averages out to a " +
        "small constant per append across many appends, even though any SINGLE append might trigger " +
        "an O(n) copy.";

    public ToolKind ToolKind => ToolKind.DynamicArrayGrowth;

    public string Explanation =>
        "An array is a numbered row of slots, side by side in memory, each " +
        "holding one value of the same type; slot numbers (indexes) start at 0. A plain array has a fixed size decided at creation, so it can't grow. (This lesson uses Big O shorthand: O(1) means the cost stays the same however many elements there are, O(n) means it grows in step with the number of elements n. Big O Notation in Data Structures & Algorithms covers it properly.) A dynamic array (C#'s List<T>, Python's list) wraps a " +
        "plain array (the \"backing array\") plus a COUNT of how many slots are actually used and a " +
        "CAPACITY of how many slots exist in total -- capacity is often bigger than count, leaving " +
        "room to grow into. Appending while count < capacity is just O(1): write into the next open " +
        "slot, increment count. Appending when count == capacity requires a RESIZE: allocate (reserve memory for) " +
        "a brand new, bigger backing array (this app doubles it, as C#'s List<T> does; other runtimes pick a different constant factor -- Java's ArrayList grows 1.5x, CPython's list about 1.125x -- and any constant factor above 1 gives the same amortized O(1)), copy " +
        "every existing element into it (O(n) -- the expensive part), then append into the new array. " +
        "The reason this doesn't make every append expensive is the multiplying (here, doubling): right after a resize, " +
        "there's now capacity for just as many MORE appends as it took to fill the array the first " +
        "time, so a resize this expensive can't happen again for a long while. Averaged over many " +
        "appends, the rare expensive resizes and the many cheap O(1) appends work out to a small " +
        "constant per append -- that's what \"amortized O(1)\" means, and it's a genuinely different " +
        "claim from \"every single append is O(1)\" (which is false -- watch the readout below for the " +
        "individual appends that trigger a resize and cost O(n) on the spot).";
}
