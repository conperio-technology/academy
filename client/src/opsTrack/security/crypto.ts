import { src, type OpsLessonData } from "../types.ts";

export const secCrypto: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Cryptography gives you four guarantees, and each comes from a different tool. Confidentiality (nobody else can read it) comes from encryption. Integrity (nobody changed it) and authenticity (it really came from who you think) come from MACs and digital signatures. Non-repudiation (the sender can't later deny it) comes only from signatures. Key exchange is how two strangers agree on a secret key in the first place.",
        "You will almost never implement any of this yourself, and you shouldn't. What you need is to know which tool does which job, so you pick the right library call and spot when a design is missing one. HTTPS, JWTs, SSH, code signing, password storage and disk encryption are all combinations of the pieces on this page.",
      ],
    },
    {
      kind: "terms",
      title: "The vocabulary",
      terms: [
        { term: "Plaintext and ciphertext", meaning: "the readable message and its encrypted form. A cipher turns one into the other using a key." },
        { term: "Symmetric encryption", meaning: "one shared key both encrypts and decrypts. Fast enough for gigabytes. AES and ChaCha20 are the standards." },
        { term: "Asymmetric (public-key) cryptography", meaning: "a key pair: a public key you can give anyone and a private key you never share. What one key does, only the other can undo. RSA and elliptic-curve cryptography (ECC) are the families in use." },
        { term: "Key exchange", meaning: "a protocol that lets two parties agree on a shared secret over a channel an eavesdropper can read. Diffie-Hellman, usually on elliptic curves (ECDHE), is what TLS uses." },
        { term: "Hash", meaning: "a one-way fingerprint of any data, such as SHA-256. Anyone can compute it, so a hash alone proves nothing about who sent the data." },
        { term: "MAC (message authentication code)", meaning: "a fingerprint computed with a secret key, such as HMAC-SHA256. Only someone holding the key can produce or check it, so it proves integrity and that the sender has the key." },
        { term: "Digital signature", meaning: "made with a private key and checked with the matching public key, such as RSA or ECDSA and Ed25519 signatures. Anyone can verify; only the key holder can sign." },
        { term: "Nonce or IV", meaning: "a number used once, fed into encryption so that encrypting the same message twice gives different ciphertext. It isn't secret, but reusing one with the same key can break the encryption completely." },
        { term: "Authenticated encryption (AEAD)", meaning: "encryption that also produces a tag, so any change to the ciphertext is detected on decryption. AES-GCM and ChaCha20-Poly1305 are the ones to use." },
      ],
    },
    {
      kind: "table",
      title: "Which tool gives which guarantee",
      head: ["Tool", "Keys", "Confidentiality", "Integrity", "Proves who sent it", "Typical use"],
      rows: [
        ["Hash (SHA-256)", "none", "no", "only against accidents", "no", "checksums, content addressing, inside the others"],
        ["MAC (HMAC)", "one shared secret", "no", "yes", "someone with the key", "API request signing, session cookies, HS256 JWTs"],
        ["Symmetric AEAD (AES-GCM)", "one shared secret", "yes", "yes", "someone with the key", "TLS records, disk and database encryption"],
        ["Public-key encryption (RSA-OAEP)", "receiver's public key", "yes", "no", "no", "wrapping a symmetric key, rarely data itself"],
        ["Digital signature (Ed25519, ECDSA, RSA-PSS)", "sender's private key", "no", "yes", "yes, and they can't deny it", "certificates, code signing, RS256 and ES256 JWTs"],
      ],
      notes: ["A MAC can't give non-repudiation: both sides hold the key, so either could have made the tag. A signature can, because only one party holds the private key."],
    },
    {
      kind: "text",
      title: "Symmetric encryption: fast, but who has the key?",
      paragraphs: [
        "AES is a block cipher: it scrambles 16-byte blocks with a 128 or 256-bit key. On its own it only handles one block, so it runs in a mode. Use GCM, which encrypts and authenticates in one step. Never use ECB, which encrypts identical blocks to identical ciphertext and leaks the shape of the data; CBC without a separate MAC is also out, since it allows tampering and padding-oracle attacks.",
        "The weakness of symmetric crypto is distribution: both sides need the same key, and you can't just send it, because the channel is what you're protecting. Two answers exist: key exchange, and public-key encryption of a fresh symmetric key. Real systems use symmetric encryption for the bulk data and asymmetric crypto only to set up the key. That is hybrid encryption, and it is what TLS does.",
      ],
    },
    {
      kind: "code",
      title: "Authenticated encryption in C#",
      blocks: [
        {
          lang: "csharp",
          label: "Program.cs",
          code: src`
using System.Security.Cryptography;
using System.Text;

var key = RandomNumberGenerator.GetBytes(32);    // a 256-bit AES key
var nonce = RandomNumberGenerator.GetBytes(12);  // never reuse a nonce with the same key
var plaintext = Encoding.UTF8.GetBytes("transfer 10 to Bob");
var ciphertext = new byte[plaintext.Length];
var tag = new byte[16];

using var aes = new AesGcm(key, tagSizeInBytes: 16);
aes.Encrypt(nonce, plaintext, ciphertext, tag);

var decrypted = new byte[ciphertext.Length];
aes.Decrypt(nonce, ciphertext, tag, decrypted);
Console.WriteLine(Encoding.UTF8.GetString(decrypted));

ciphertext[0] ^= 1; // flip one bit in transit
try { aes.Decrypt(nonce, ciphertext, tag, decrypted); }
catch (AuthenticationTagMismatchException) { Console.WriteLine("tampered: rejected"); }`,
          output: src`
transfer 10 to Bob
tampered: rejected`,
        },
      ],
      notes: [
        "The key and nonce come from `RandomNumberGenerator`, a cryptographically secure generator. `System.Random` is predictable and must never produce keys, tokens or nonces. Python's equivalent is the `secrets` module, not `random`.",
        "The nonce and tag are stored next to the ciphertext; they aren't secret. The key is the only secret, and keeping it out of the code and out of the database is the real work (see Secrets Management and Least Privilege).",
      ],
    },
    {
      kind: "text",
      title: "Key exchange: agreeing on a secret in public",
      paragraphs: [
        "Diffie-Hellman lets two parties who have never met build a shared secret while an eavesdropper watches every message. Each picks a private number, sends a public value derived from it, and combines the other's public value with their own private number. Both arrive at the same result; the eavesdropper would have to solve the discrete logarithm problem to get there, which is infeasible at real key sizes.",
        "TLS 1.3 always uses an ephemeral exchange (ECDHE): fresh private numbers for every connection, thrown away afterwards. That gives forward secrecy: even if the server's long-term private key is stolen later, recorded traffic can't be decrypted, because the session keys were never derived from it. Diffie-Hellman alone doesn't tell you who you're talking to, though; a man in the middle could run one exchange with each side. That is what the server's signature and certificate are for.",
      ],
    },
    {
      kind: "widget",
      widget: "diffieHellman",
      title: "Try it: Diffie-Hellman with small numbers",
      intro: "Change Alice's and Bob's secrets. Both always end with the same shared number, and nothing Eve sees lets her compute it without solving for a secret.",
    },
    {
      kind: "text",
      title: "Public-key cryptography: RSA step by step",
      paragraphs: [
        "RSA rests on one asymmetry: multiplying two large primes is instant, but factoring the product back into them is, as far as anyone knows, infeasible for numbers of 2,048 bits or more. The public key is the product n and an exponent e. The private key d is computed from the primes, so only someone who knows them can find it.",
        "Encrypting raises the message to the power e mod n; decrypting raises the result to the power d mod n and gets the message back. Signing is the reverse direction: raise a hash of the message to d with the private key, and anyone can check it by raising the signature to e with the public key and comparing with their own hash of the message. Real RSA also pads messages (OAEP for encryption, PSS for signatures); textbook RSA as shown here is insecure, which is one more reason to use a library.",
      ],
    },
    {
      kind: "widget",
      widget: "toyRsa",
      title: "Try it: a toy RSA you can follow by hand",
      intro: "Pick two primes and watch the key pair being built, then encrypt a number and sign a message. Tick the tampering box to see a signature check fail.",
    },
    {
      kind: "text",
      title: "Elliptic curves, and what comes next",
      paragraphs: [
        "Elliptic-curve cryptography does the same jobs as RSA with much smaller keys: a 256-bit curve key is about as strong as a 3,072-bit RSA key, and the operations are faster. ECDHE for key exchange and ECDSA or Ed25519 for signatures are now the default in TLS, SSH and most new systems.",
        "A large quantum computer would break both RSA and elliptic curves, because Shor's algorithm factors and solves discrete logarithms efficiently. None exists yet, but recorded traffic could be decrypted later, so post-quantum algorithms are being deployed now: NIST standardized ML-KEM for key exchange and ML-DSA for signatures in 2024, and browsers already combine ML-KEM with classic ECDHE in TLS. Symmetric ciphers and hashes are only mildly affected; AES-256 stays safe.",
      ],
    },
    {
      kind: "text",
      title: "MACs: integrity with a shared key",
      paragraphs: [
        "When both sides already share a key, a MAC is the cheap way to detect tampering. HMAC-SHA256 mixes the key into a SHA-256 hash in a way that resists the length-extension tricks a plain hash(key + message) falls to. Servers use it to sign session cookies and webhooks, and HS256 JWTs are HMACs.",
        "Check a MAC with a constant-time comparison. An ordinary == stops at the first differing character, and the time it takes can reveal how much of a forged tag was right, one byte at a time.",
      ],
    },
    {
      kind: "code",
      title: "HMAC in Python",
      blocks: [
        {
          lang: "python",
          label: "hmac_demo.py",
          code: src`
import hmac, hashlib

key = b"server-only-secret"
message = b"user=1042&role=user"
tag = hmac.new(key, message, hashlib.sha256).hexdigest()
print(tag)

# Verify in constant time; == can leak how many leading characters matched.
received = hmac.new(key, b"user=1042&role=admin", hashlib.sha256).hexdigest()
print(hmac.compare_digest(tag, received))`,
          output: src`
73bb893343ae034e618508454f1b3f1f32fff6390e9c4de6357e9287aea63737
False`,
        },
      ],
      notes: ["In C#, `HMACSHA256.HashData(key, message)` computes the tag and `CryptographicOperations.FixedTimeEquals` compares two tags in constant time."],
    },
    {
      kind: "steps",
      title: "How HTTPS puts it all together",
      steps: [
        "Client and server run an ECDHE key exchange inside the TLS handshake, so both derive the same fresh session keys.",
        "The server signs the handshake with its certificate's private key, proving it holds the key for that name; the client checks the signature and the certificate chain up to a trusted CA (see HTTPS, TLS & Certificates).",
        "Every record after that is encrypted and authenticated with AES-GCM or ChaCha20-Poly1305 using the session keys.",
        "When the connection closes, the ephemeral keys are gone: forward secrecy.",
      ],
    },
    {
      kind: "steps",
      title: "Rules for application code",
      steps: [
        "Don't invent a scheme or implement a primitive. Use the platform's high-level APIs (AesGcm, the Data Protection API in ASP.NET Core, libsodium or the cryptography package in Python) and TLS for data in transit.",
        "Use authenticated encryption, never a bare cipher mode, and never reuse a nonce with the same key.",
        "Generate keys, tokens and nonces with a cryptographically secure random generator.",
        "Hash passwords with a slow, salted password hash, not a fast hash and never encryption (see Hashing vs. Encryption).",
        "Plan for key rotation and keep keys in a key vault or HSM, not in code or config files.",
      ],
    },
  ],
  quiz: [
    {
      question: "A partner sends you webhooks and you want to be sure each one came from them and wasn't changed. You share a secret. What should they attach?",
      answer: "An HMAC-SHA256 of the body, computed with the shared secret",
      distractors: ["A SHA-256 hash of the body", "The body encrypted with AES-ECB", "Their RSA public key"],
      why: "A plain hash can be recomputed by anyone who changes the body. A MAC needs the secret, so a valid tag proves the sender holds it and the body is intact.",
    },
    {
      question: "Why does TLS encrypt the actual traffic with AES rather than with the server's RSA or elliptic-curve key?",
      answer: "Symmetric encryption is far faster; the public-key part only sets up the shared key",
      distractors: ["RSA can't encrypt binary data", "AES keys are longer, so they're stronger", "Public keys expire too quickly"],
      why: "This is hybrid encryption: asymmetric crypto solves key distribution, symmetric crypto moves the bulk data.",
    },
    {
      question: "Which guarantee does a digital signature give that a MAC can't?",
      answer: "Non-repudiation: only the private key holder could have signed it",
      distractors: ["Confidentiality", "Integrity", "Faster verification"],
      why: "Both sides of a MAC hold the same key, so either could have produced the tag. A signature can only come from the holder of the private key, and anyone can verify it.",
    },
    {
      question: "A server's long-term private key leaks. With TLS 1.3, can an attacker decrypt traffic they recorded last year?",
      answer: "No, because each session's keys came from an ephemeral key exchange",
      distractors: ["Yes, the private key decrypts all past sessions", "Only sessions that used RSA certificates", "Only if they also have the CA's key"],
      why: "That is forward secrecy. The leaked key lets them impersonate the server from now on (until it is revoked), but past session keys were never derived from it.",
    },
    {
      question: "Two messages were encrypted with AES-GCM using the same key and the same nonce. How bad is it?",
      answer: "Very bad: it can reveal the XOR of the plaintexts and lets an attacker forge tags",
      distractors: ["Harmless, the nonce isn't secret", "Only a problem if the messages are identical", "It just makes the ciphertext longer"],
      why: "Nonces need not be secret, but they must be unique per key. GCM fails badly on reuse, which is why libraries generate them randomly or from a counter.",
    },
  ],
  pitfalls: [
    "Using a plain hash where a MAC or signature is needed: anyone who can change the data can also recompute its SHA-256.",
    "Comparing MACs or tokens with == instead of a constant-time comparison.",
    "Choosing AES in ECB mode, or CBC without authentication, because an example online used it.",
    "Generating keys or reset tokens with System.Random or Python's random module.",
    "Hard-coding keys in source code, where they end up in every clone and backup of the repository.",
  ],
  next: [
    { id: "security-tls-certificates", label: "HTTPS, TLS & Certificates" },
    { id: "security-hashing-encryption", label: "Hashing vs. Encryption (and Storing Passwords)" },
    { id: "sec-web-sessions-identity", label: "Web Sessions and Identity: Cookies, JWT, OAuth, SAML and CORS" },
  ],
};
