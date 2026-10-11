namespace DsaAcademy.Content.Tools;

public class PasswordsMfaTool : ITool
{
    public string Id => "sec-passwords-mfa";
    public string Section => "Security";
    public string Track => "identity & secrets";
    public string Title => "Passwords, MFA and Password Managers";
    public string OneLiner =>
        "Why length beats complexity, how long a password really lasts against online and offline attacks, " +
        "how to generate good ones, and which kinds of multi-factor authentication stop phishing.";
    public string KeyTakeaway =>
        "Use a password manager so every account gets a long, random, unique password, and remember only a " +
        "few passphrases of several random words. Turn on multi-factor authentication everywhere, and prefer " +
        "passkeys or security keys, which phishing can't relay. Never approve a sign-in prompt you didn't " +
        "start.";

    public ToolKind ToolKind => ToolKind.PasswordsMfa;

    public string Explanation =>
        "Attackers rarely guess passwords one at a time at a login page; that's slow and gets accounts " +
        "locked. They use lists. Credential stuffing tries email and password pairs leaked from other sites, " +
        "which works because people reuse passwords. Password spraying tries a few very common passwords " +
        "against many accounts. And when a site's password database is stolen, offline cracking tests " +
        "billions of guesses a second against the hashes, where a fast unsalted hash like MD5 falls quickly " +
        "and a slow, salted one like bcrypt holds out far longer.\n\nStrength comes from randomness and length," +
        " not from swapping a for @. A password's strength is measured in bits of entropy: each bit doubles " +
        "the number of guesses needed, but only if the choice was truly random. Summer2026! looks complex yet" +
        " follows the first pattern cracking tools try. Several random words, a passphrase, are long, random " +
        "and easy to type. A password manager goes further: it generates and remembers a different random " +
        "password for every site, and it won't fill one in on a lookalike domain, which quietly protects " +
        "against phishing.\n\nMulti-factor authentication (MFA) adds a second proof besides the password: " +
        "something you have (a phone, a security key) or something you are (a fingerprint). It stops " +
        "credential stuffing almost completely. Not all MFA is equal, though. SMS codes, authenticator app " +
        "codes (TOTP, time-based one-time passwords) and push approvals can be phished: a fake login page " +
        "asks for the code and relays it within seconds, and attackers spam push prompts hoping you'll tap " +
        "Approve (MFA fatigue). Passkeys and FIDO2 security keys are phishing-resistant because they're " +
        "cryptographically bound to the real site's domain. Test some passwords below, generate better ones, " +
        "and compare MFA methods.";
}
