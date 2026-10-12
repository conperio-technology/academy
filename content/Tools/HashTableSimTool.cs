namespace DsaAcademy.Content.Tools;

public class HashTableSimTool : ITool
{
    public string Id => "hash-table-internals";
    public string Section => "Data Structures & Algorithms";
    public string Track => "hashing";

    // Belongs right after Hash Maps: Two Sum, not trailing behind every DSA concept
    // (a Tool otherwise always sorts after same-or-lower-Order concepts within a
    // section -- see ContentExport.NavItems). fundamentals track = Order 50,
    // everything from Trees onward stays at the default 100, so 60 lands this here.
    public int Order => 60;

    public string Title => "Hashing: How a Hash Map Actually Works";
    public string OneLiner => "A hash map isn't magic O(1) lookup -- it's an array of buckets, a function that turns any key into an index, and a plan for when two keys land on the same bucket.";
    public string KeyTakeaway =>
        "A good hash function spreads keys evenly across buckets, so most lookups touch exactly one " +
        "bucket -- average O(1). But it's only AVERAGE: a bad hash function (or enough collisions) " +
        "degrades to checking every key in a bucket one by one, O(n) worst case, which is why Hash " +
        "Maps: Two Sum's hash map isn't a magic guarantee, just a very good bet.";

    public ToolKind ToolKind => ToolKind.HashTableSim;

    public string Explanation =>
        "Hash Maps: Two Sum (already in this app) leans on a hash map's near-O(1) lookup without " +
        "showing HOW that's achieved -- this lesson is the \"how.\" A hash map wraps a plain array of " +
        "\"buckets\" (this app starts with 8), plus a HASH FUNCTION that turns any key (a string, a " +
        "number, anything) into a deterministic (same input, same output, every time) bucket index -- the same key always hashes to the same " +
        "index, so looking a key up means computing its hash once and going straight to that one bucket, " +
        "instead of scanning every entry the way a plain array search would have to.\n\n" +
        "Two different keys can hash to the SAME bucket -- a collision -- and it's not a bug, it's " +
        "guaranteed to happen eventually for any hash function with more possible keys than buckets " +
        "(the pigeonhole principle). This table handles it with CHAINING: each bucket holds a small " +
        "list, and a colliding key just gets appended to whichever bucket it landed in -- looking that " +
        "key up now means hashing to the bucket, then scanning its (hopefully short) chain. The other " +
        "common strategy, open addressing/probing, tries a different bucket instead of chaining -- not " +
        "implemented here, but worth knowing the name exists.\n\n" +
        "Just like a dynamic array (see Dynamic Arrays: How They Grow), a hash table tracks a LOAD " +
        "FACTOR -- entries stored divided by bucket count -- and resizes when it gets too full (this " +
        "table resizes past 0.75), doubling the bucket count and rehashing every existing key into its " +
        "new bucket, because a key's hash depends on the capacity. That resize is the expensive O(n) " +
        "operation hiding underneath \"hash map insert is O(1)\" -- amortized across many inserts, same " +
        "idea as the dynamic array's amortized O(1) append, and the actual reason both operations get " +
        "quoted as O(1) despite neither ALWAYS being O(1) on any single call.";
}
