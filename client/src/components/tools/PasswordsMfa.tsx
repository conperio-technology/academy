import { useState } from "react";
import { LessonLink, Quiz, type QuizItem } from "./netSecShared";

// Part 1: a rough password strength meter that shows guessing time against three kinds of
// attacker. Part 2: generators that use the browser's cryptographic random numbers. Part 3:
// MFA methods compared. Nothing typed here leaves the page.

// 256 words, so each randomly chosen word adds exactly 8 bits.
const WORDS = "acid acorn actor adapt agent alarm album alert alley amber anchor angle ankle apple april apron arena armor arrow atlas attic audio autumn avoid award bacon badge bagel baker bamboo banjo barn basil beach beard beaver berry bike bison blade blank blaze blender bloom blue board boat bonus book boost boots bottle brain brass bread brick bridge brook broom bucket buddy bugle bunny cabin cable cactus camel camera candle canoe canvas carbon cargo carpet carrot castle cedar chalk cheese cherry chess chimney cider cinema circle citrus clay cliff clock cloud clover coach cobra cocoa comet copper coral cotton cougar cousin crane crater cricket crown cubic cupcake curtain daisy dancer delta denim desert diesel dingo dolphin donkey dragon drum eagle easel echo eclipse elbow elder ember engine falcon fern ferry fiddle fig flame flannel flute focus forest fossil fox frost galaxy garden garlic gecko giant ginger glacier globe goose granite grape gravel guitar hammer harbor harp hazel helmet heron hiker honey hornet husky igloo index iris island ivory jacket jaguar jasmine jelly jigsaw jungle kayak kettle kitten koala ladder lagoon lantern laptop lemon lily linen lizard lobster locket magnet mango maple marble meadow melon meteor mint mirror mitten monkey moose mosaic motor muffin nectar needle nickel noodle nutmeg oasis ocean olive onion orbit orchid otter owl oyster paddle panda paper parrot peach pebble pepper piano pickle pigeon pillow pilot pine pirate planet plum pocket polar pony poppy potato pretzel prism puffin pumpkin puzzle quartz quilt rabbit radar radish raven reef ribbon river robin rocket rose ruby saddle".split(" ");

// A few of the most common passwords from public breach lists, lower-cased.
const COMMON = [
  "123456", "password", "123456789", "12345678", "12345", "qwerty", "abc123", "password1", "111111", "123123", "admin", "letmein",
  "welcome", "monkey", "dragon", "iloveyou", "football", "baseball", "sunshine", "princess", "qwerty123", "1q2w3e4r", "passw0rd",
  "master", "shadow", "trustno1", "superman", "000000", "654321", "michael",
];

const ATTACKERS = [
  { label: "Online, rate-limited login", rate: 10, note: "about 10 guesses a second before lockouts and throttling" },
  { label: "Offline, fast hash (unsalted MD5 or SHA-1)", rate: 1e11, note: "about 100 billion guesses a second on a rig of GPUs" },
  { label: "Offline, slow hash (bcrypt, cost 12)", rate: 1e4, note: "about 10,000 guesses a second on the same rig" },
];

function humanTime(seconds: number): string {
  if (seconds < 1) return "instantly";
  const units: [number, string][] = [
    [60, "seconds"],
    [60, "minutes"],
    [24, "hours"],
    [365, "days"],
    [1000, "years"],
    [1000, "thousand years"],
    [1000, "million years"],
  ];
  let v = seconds;
  for (const [size, name] of units) {
    if (v < size) return `${Math.round(v)} ${name}`;
    v /= size;
  }
  return "longer than the universe has existed";
}

function analyse(pw: string) {
  const lower = /[a-z]/.test(pw);
  const upper = /[A-Z]/.test(pw);
  const digit = /\d/.test(pw);
  const symbol = /[^A-Za-z0-9]/.test(pw);
  const pool = (lower ? 26 : 0) + (upper ? 26 : 0) + (digit ? 10 : 0) + (symbol ? 33 : 0);
  let bits = pw.length === 0 ? 0 : pw.length * Math.log2(Math.max(pool, 1));
  const warnings: string[] = [];
  const base = pw.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (COMMON.includes(pw.toLowerCase()) || COMMON.includes(base)) {
    bits = Math.min(bits, 5);
    warnings.push("This is on lists of the most common passwords. Attackers try those first, so it falls in the first few guesses.");
  } else if (/^[A-Za-z]+\d{1,4}[^A-Za-z0-9]?$/.test(pw)) {
    bits = Math.min(bits, 30);
    warnings.push("A word, then digits, then maybe a symbol (Summer2026!) is the first pattern cracking tools try. Real strength is far below the character count.");
  }
  if (/(.)\1\1/.test(pw)) warnings.push("Repeated characters add almost nothing.");
  return { pool, bits, warnings };
}

function randomInt(n: number): number {
  // Rejection sampling avoids the bias of `random % n`.
  const limit = Math.floor(0x100000000 / n) * n;
  const buf = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) return buf[0] % n;
  }
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&*+-=?@^_~";

const QUIZ: QuizItem[] = [
  {
    q: "Which is stronger against guessing?",
    options: ["P@ssw0rd!", "correct-horse-battery-staple-lamp (five random words)", "They're about the same"],
    answer: 1,
    why: "P@ssw0rd! is a common word with predictable substitutions; cracking tools try it early. Five words chosen at random from a big list are long and genuinely random.",
  },
  {
    q: "Which MFA method resists phishing?",
    options: ["SMS codes", "An authenticator app's 6-digit code", "A passkey or FIDO2 security key"],
    answer: 2,
    why: "A fake login page can ask you for an SMS or app code and pass it on in real time. A passkey is tied to the real site's domain, so it won't sign in to a lookalike.",
  },
  {
    q: "Your phone shows ten MFA push prompts you didn't trigger. What do you do?",
    options: ["Approve one to make them stop", "Deny them and report it to IT: someone has your password", "Ignore them"],
    answer: 1,
    why: "That's MFA fatigue: the attacker hopes you'll tap Approve. Number matching (typing the number shown on the login screen) defeats it, and your password needs changing.",
  },
  {
    q: "Why use a password manager?",
    options: ["It makes one strong unique password per site practical, and it won't autofill on a lookalike domain", "It stops all hacking", "So you can reuse one password safely"],
    answer: 0,
    why: "Reuse is what makes credential stuffing work: one leaked site unlocks the rest. Protect the manager itself with a long passphrase and MFA.",
  },
];

export function PasswordsMfa() {
  const [pw, setPw] = useState("Summer2026!");
  const [show, setShow] = useState(false);
  const [phrase, setPhrase] = useState<string[]>([]);
  const [random, setRandom] = useState("");
  const [nWords, setNWords] = useState(7);
  const a = analyse(pw);

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>How long would it take to guess?</h3>
        <div className="tool-single-input ns-wide-input">
          Try a password (it stays in this page)
          <input type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="off" spellCheck={false} aria-label="Password to test" />
        </div>
        <label className="tool-checkbox">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show it
        </label>
        <div className="tool-readout">
          <div className="readout-cell">
            <span className="readout-label">Length</span>
            <span className="readout-value">{pw.length}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Character pool</span>
            <span className="readout-value">{a.pool}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Estimated strength</span>
            <span className="readout-value">{Math.round(a.bits)} bits</span>
          </div>
        </div>
        {a.warnings.map((w) => (
          <p key={w} className="constraint-fail">
            {w}
          </p>
        ))}
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Attacker</th>
                <th>Average time to guess</th>
              </tr>
            </thead>
            <tbody>
              {ATTACKERS.map((t) => (
                <tr key={t.label}>
                  <td>
                    {t.label}
                    <div className="status-text ns-small">{t.note}</div>
                  </td>
                  <td className="mono">{a.bits === 0 ? "" : humanTime(2 ** (a.bits - 1) / t.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="gate-note">
          A rough estimate: bits = length × log2(pool size), which assumes every character was picked at random. Human-chosen passwords are far weaker than that, so
          treat the numbers as an upper bound. The real lessons: length beats complexity, never reuse a password, and the site&apos;s choice of hash matters as much
          as your choice of password (see <LessonLink id="security-hashing-encryption">Hashing vs. Encryption</LessonLink>).
        </p>
      </div>

      <div className="crypto-section">
        <h3>Generate one properly</h3>
        <label className="tool-checkbox">
          Words:{" "}
          <input type="range" min={4} max={10} value={nWords} onChange={(e) => setNWords(Number(e.target.value))} aria-label="Number of words" /> {nWords} ({nWords * 8}{" "}
          bits)
        </label>
        <div className="darr-actions">
          <button onClick={() => setPhrase(Array.from({ length: nWords }, () => WORDS[randomInt(WORDS.length)]))}>Passphrase</button>
          <button onClick={() => setRandom(Array.from({ length: 20 }, () => CHARS[randomInt(CHARS.length)]).join(""))}>20 random characters</button>
        </div>
        {phrase.length > 0 && (
          <p className="mono ns-gen">
            {phrase.join("-")} <span className="status-text ns-small">({phrase.length} words from a list of {WORDS.length}: {phrase.length * 8} bits)</span>
          </p>
        )}
        {random && (
          <p className="mono ns-gen">
            {random}{" "}
            <span className="status-text ns-small">
              (20 characters from {CHARS.length}: {Math.round(20 * Math.log2(CHARS.length))} bits; let the password manager remember it)
            </span>
          </p>
        )}
        <p className="gate-note">
          Both use the browser&apos;s cryptographic random number generator (crypto.getRandomValues), never Math.random. This demo&apos;s list has only 256 words, so
          each adds 8 bits; real passphrase lists such as the EFF&apos;s 7,776 words add about 12.9 bits per word, so six words reach 77 bits. Use a passphrase for
          the few things you must type from memory (your computer login, your password manager) and generated passwords for everything else.
        </p>
      </div>

      <div className="crypto-section">
        <h3>Multi-factor authentication, compared</h3>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Second factor</th>
                <th>Stops password reuse</th>
                <th>Stops real-time phishing</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>SMS code</td>
                <td className="constraint-ok">yes</td>
                <td className="constraint-fail">no</td>
                <td>SIM swapping can steal the number. Better than nothing.</td>
              </tr>
              <tr>
                <td>Authenticator app code (TOTP)</td>
                <td className="constraint-ok">yes</td>
                <td className="constraint-fail">no</td>
                <td>A fake page can relay the code within its 30 seconds.</td>
              </tr>
              <tr>
                <td>Push approval with number matching</td>
                <td className="constraint-ok">yes</td>
                <td className="constraint-fail">mostly no</td>
                <td>Number matching stops MFA fatigue, but a relayed login can still show you the right number.</td>
              </tr>
              <tr>
                <td>Passkey or FIDO2 security key</td>
                <td className="constraint-ok">yes</td>
                <td className="constraint-ok">yes</td>
                <td>Bound to the real domain; nothing to type or read out. The strongest option.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Quiz items={QUIZ} title="Check yourself" />
    </div>
  );
}
