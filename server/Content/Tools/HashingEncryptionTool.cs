namespace DsaAcademy.Content.Tools;

public class HashingEncryptionTool : ITool
{
    public string Id => "security-hashing-encryption";
    public string Section => "Security";
    public string Track => "identity & secrets";
    public string Title => "Hashing vs. Encryption (and Storing Passwords)";
    public string OneLiner => "A hash is a one-way fingerprint; encryption is a lock with a key. Using the wrong one is how passwords leak.";
    public string KeyTakeaway =>
        "Encrypt data you'll need to read back (with a key you protect). Hash data you only ever need to " +
        "compare. For passwords, never store them in plain text, never encrypt them, and never use a fast " +
        "hash: use a salted, deliberately slow password hash -- PBKDF2, bcrypt, scrypt or Argon2 -- " +
        "through your framework's built-in support.";

    public ToolKind ToolKind => ToolKind.HashingEncryption;

    public string Explanation =>
        "A hash function like SHA-256 turns any input into a fixed-size fingerprint. The same input " +
        "always gives the same hash, a tiny change gives a completely different one, and there is no " +
        "way to run it backwards. That makes hashes good for checking integrity (did this download " +
        "arrive intact?) and for comparing secrets without storing them. (It's the same idea as the " +
        "hash function behind a hash map, with much stronger guarantees.)\n\n" +
        "Encryption is reversible on purpose. AES turns a message into ciphertext with a key, and the " +
        "same key turns it back. Without the key the ciphertext is noise. Use it for data you must read " +
        "again: files at rest, backups, anything sent over a network (that's what TLS does -- see the " +
        "next lesson). The hard part is never the algorithm; it's keeping the key somewhere safer than " +
        "next to the data.\n\n" +
        "Passwords are where people get this wrong. Stored in plain text, one leaked backup exposes " +
        "everyone. Encrypted, they're one stolen key away from the same. Hashed with SHA-256, they look " +
        "safe, but SHA-256 is built to be fast: an attacker with a stolen table can try billions of " +
        "guesses per second, and two users with the same password get the same hash. The fix is a " +
        "password hash: a random salt per user (so identical passwords store differently and " +
        "precomputed tables are useless) and a deliberately slow algorithm with a work factor you can " +
        "raise as hardware gets faster.\n\n" +
        "In practice you rarely write this yourself. ASP.NET Core Identity's PasswordHasher uses salted " +
        "PBKDF2 already; most frameworks have an equivalent. Better still, let the company's single " +
        "sign-on handle passwords so your app never sees one (see Authentication vs. Authorization).";
}
