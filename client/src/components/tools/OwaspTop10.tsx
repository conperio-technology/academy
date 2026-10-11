import { useState } from "react";
import { LessonLink, Quiz, type QuizItem } from "./netSecShared";

// The OWASP Top 10 as a browsable list in either edition, each entry with an everyday example,
// the fix, and the lesson here that goes deeper. Then a "which category is this?" quiz.

interface Risk {
  key: string;
  name2021: string | null;
  name2025: string | null;
  rank2021: number | null;
  rank2025: number | null;
  what: string;
  example: string;
  fix: string;
  lessons: { id: string; title: string }[];
}

const RISKS: Risk[] = [
  {
    key: "access",
    name2021: "Broken Access Control",
    name2025: "Broken Access Control",
    rank2021: 1,
    rank2025: 1,
    what: "Users can do or see things they shouldn't: other people's records, admin functions, or (in 2025, where SSRF was merged in) internal systems reached through the server.",
    example: "Changing /api/invoices/1043 to /api/invoices/1044 in the address bar shows another customer's invoice.",
    fix: "Check authorization on the server for every request and every object, deny by default, and never rely on hiding buttons in the UI.",
    lessons: [
      { id: "sec-access-control-ssrf-csrf", title: "Broken Access Control, IDOR, CSRF and SSRF" },
      { id: "security-authn-authz", title: "Authentication vs. Authorization" },
    ],
  },
  {
    key: "misconfig",
    name2021: "Security Misconfiguration",
    name2025: "Security Misconfiguration",
    rank2021: 5,
    rank2025: 2,
    what: "Insecure settings rather than insecure code: defaults left on, debug mode in production, open storage buckets, verbose errors, missing security headers.",
    example: "A production API returns full stack traces with file paths and the database server's name.",
    fix: "Hardened, repeatable configuration (infrastructure as code), a minimal install, and automated checks of every environment.",
    lessons: [{ id: "sec-deserialization-misconfig", title: "Insecure Deserialization and Security Misconfiguration" }],
  },
  {
    key: "supply",
    name2021: "Vulnerable and Outdated Components",
    name2025: "Software Supply Chain Failures",
    rank2021: 6,
    rank2025: 3,
    what: "Risk from everything you didn't write: libraries with known vulnerabilities, compromised packages, build systems and update channels. 2025 widened the 2021 \"outdated components\" entry to the whole supply chain.",
    example: "An app still ships a logging library version with a published remote code execution flaw (Log4Shell in Log4j, 2021).",
    fix: "Keep an inventory (an SBOM, software bill of materials), update dependencies routinely, scan them in the build, and protect the build pipeline itself.",
    lessons: [],
  },
  {
    key: "crypto",
    name2021: "Cryptographic Failures",
    name2025: "Cryptographic Failures",
    rank2021: 2,
    rank2025: 4,
    what: "Sensitive data exposed through missing or weak cryptography: plain HTTP, unsalted fast password hashes, home-made encryption, keys in source code.",
    example: "Passwords stored as unsalted MD5, cracked within hours after a database leak.",
    fix: "TLS everywhere, slow salted password hashing (bcrypt, scrypt, Argon2, PBKDF2), well-known libraries, and keys kept in a secrets manager.",
    lessons: [
      { id: "security-hashing-encryption", title: "Hashing vs. Encryption" },
      { id: "security-tls-certificates", title: "TLS Certificates" },
    ],
  },
  {
    key: "injection",
    name2021: "Injection",
    name2025: "Injection",
    rank2021: 3,
    rank2025: 5,
    what: "Untrusted input interpreted as code or commands: SQL injection, OS command injection, and cross-site scripting (XSS).",
    example: "A search box that builds SQL by gluing strings lets someone type ' OR '1'='1 and see every row.",
    fix: "Keep data and code apart: parameterized queries, encoding output for its context, and avoiding shells with user input.",
    lessons: [
      { id: "security-sql-injection", title: "SQL Injection" },
      { id: "security-xss", title: "Cross-Site Scripting (XSS)" },
    ],
  },
  {
    key: "design",
    name2021: "Insecure Design",
    name2025: "Insecure Design",
    rank2021: 4,
    rank2025: 6,
    what: "Flaws in the design itself, which perfect code can't fix: no rate limit on a password reset, a business rule that can be abused, trust placed in the wrong component.",
    example: "Gift card balance checks allow unlimited guesses, so card numbers can be enumerated.",
    fix: "Threat model during design, write abuse cases next to use cases, and reuse proven patterns.",
    lessons: [{ id: "sec-threat-modeling-stride", title: "Threat Modeling with STRIDE" }],
  },
  {
    key: "auth",
    name2021: "Identification and Authentication Failures",
    name2025: "Authentication Failures",
    rank2021: 7,
    rank2025: 7,
    what: "Weaknesses in proving who someone is: weak or reused passwords allowed, no protection against credential stuffing, broken session handling, no MFA.",
    example: "A login page with no rate limiting accepts millions of leaked email and password pairs from other breaches.",
    fix: "MFA (ideally phishing-resistant), checks against breached passwords, rate limiting, and secure session management.",
    lessons: [
      { id: "sec-passwords-mfa", title: "Passwords, MFA and Password Managers" },
      { id: "security-authn-authz", title: "Authentication vs. Authorization" },
    ],
  },
  {
    key: "integrity",
    name2021: "Software and Data Integrity Failures",
    name2025: "Software or Data Integrity Failures",
    rank2021: 8,
    rank2025: 8,
    what: "Trusting code or data without checking it hasn't been tampered with: unsigned updates, CI pipelines anyone can change, and insecure deserialization.",
    example: "An app deserializes a cookie with type information in it, letting an attacker choose which class gets created.",
    fix: "Verify signatures on updates and artifacts, protect the pipeline, and deserialize only to fixed, expected types.",
    lessons: [{ id: "sec-deserialization-misconfig", title: "Insecure Deserialization and Security Misconfiguration" }],
  },
  {
    key: "logging",
    name2021: "Security Logging and Monitoring Failures",
    name2025: "Security Logging and Alerting Failures",
    rank2021: 9,
    rank2025: 9,
    what: "Attacks go unnoticed because nothing useful is logged, nobody watches the logs, or alerts fire but nobody acts.",
    example: "Thousands of failed logins from one address over a weekend, logged but never alerted on.",
    fix: "Log security events with enough context, centralize them, alert on what matters, and rehearse the response.",
    lessons: [{ id: "sec-incident-response-logging", title: "Incident Response, Logging and Monitoring" }],
  },
  {
    key: "ssrf",
    name2021: "Server-Side Request Forgery (SSRF)",
    name2025: null,
    rank2021: 10,
    rank2025: null,
    what: "The server fetches a URL the user supplied, so the user can point it at internal systems the server can reach and they can't. Folded into Broken Access Control in 2025.",
    example: "A \"preview this link\" feature fetches http://169.254.169.254/ and returns the cloud server's credentials.",
    fix: "Allowlist destinations, block private and link-local ranges after resolving the name, and don't return raw responses.",
    lessons: [{ id: "sec-access-control-ssrf-csrf", title: "Broken Access Control, IDOR, CSRF and SSRF" }],
  },
  {
    key: "exceptions",
    name2021: null,
    name2025: "Mishandling of Exceptional Conditions",
    rank2021: null,
    rank2025: 10,
    what: "New in 2025: errors handled in ways that open holes, such as failing open (allowing access when a check throws), leaking details in error messages, or leaving half-finished state behind.",
    example: "If the permissions service times out, the code's catch block logs the error and lets the request through.",
    fix: "Fail closed, catch specific exceptions, return generic messages to users with details only in logs, and roll back partial work.",
    lessons: [],
  },
];

const QUIZ: QuizItem[] = [
  {
    q: "A support engineer finds that any logged-in user can call DELETE /api/users/{id} on any account.",
    options: ["Injection", "Broken Access Control", "Cryptographic Failures"],
    answer: 1,
    why: "The user is authenticated, but nothing checks whether they're allowed to delete that account. That's authorization, the top entry in both editions.",
  },
  {
    q: "The company website runs a JavaScript library version with a known, published vulnerability.",
    options: ["Insecure Design", "Vulnerable and Outdated Components (2021) / Software Supply Chain Failures (2025)", "Security Misconfiguration"],
    answer: 1,
    why: "Known vulnerabilities in third-party code. An inventory and routine updates fix it.",
  },
  {
    q: "A new web server was deployed with the default admin account and password still enabled.",
    options: ["Security Misconfiguration", "Injection", "Logging and Monitoring Failures"],
    answer: 0,
    why: "Nothing is wrong with the code; the setup is insecure. Default credentials are the classic misconfiguration.",
  },
  {
    q: "An HMI's web login sends the password over plain HTTP.",
    options: ["Cryptographic Failures", "Broken Access Control", "Insecure Design"],
    answer: 0,
    why: "Sensitive data in transit without encryption. Anyone on the network path can read it.",
  },
  {
    q: "A product search page builds its SQL query by concatenating what the user typed.",
    options: ["Injection", "Authentication Failures", "Integrity Failures"],
    answer: 0,
    why: "Input becomes part of the query's code. Parameterized queries fix it.",
  },
  {
    q: "Attackers spent three weeks inside the network before anyone noticed, though every step was in the logs.",
    options: ["Insecure Design", "Security Logging and Monitoring (2021) / Alerting (2025) Failures", "Security Misconfiguration"],
    answer: 1,
    why: "Logs no one reviews and no alerts to act on: the attack was visible but not seen.",
  },
];

export function OwaspTop10() {
  const [edition, setEdition] = useState<2021 | 2025>(2025);
  const [open, setOpen] = useState<string | null>("access");
  const list = RISKS.filter((r) => (edition === 2021 ? r.rank2021 : r.rank2025) !== null).sort(
    (a, b) => (edition === 2021 ? a.rank2021! - b.rank2021! : a.rank2025! - b.rank2025!),
  );

  return (
    <div className="tool-widget">
      <div className="sql-presets">
        {([2025, 2021] as const).map((e) => (
          <button key={e} className={e === edition ? "active" : ""} onClick={() => setEdition(e)}>
            {e} edition
          </button>
        ))}
      </div>
      <p className="gate-note">
        {edition === 2025
          ? "The 2025 update moved Security Misconfiguration to second, widened outdated components into the whole software supply chain, folded SSRF into Broken Access Control, and added Mishandling of Exceptional Conditions."
          : "The 2021 edition is still the one most training, scanners and audit checklists refer to."}{" "}
        Click an entry for an example and the fix.
      </p>
      <ol className="ns-owasp">
        {list.map((r) => {
          const rank = edition === 2021 ? r.rank2021! : r.rank2025!;
          const name = edition === 2021 ? r.name2021! : r.name2025!;
          const other = edition === 2021 ? r.rank2025 : r.rank2021;
          const isOpen = open === r.key;
          return (
            <li key={r.key} className={`ns-owasp-item ${isOpen ? "ns-owasp-open" : ""}`}>
              <button className="ns-owasp-head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : r.key)}>
                <span className="mono">
                  A{String(rank).padStart(2, "0")}:{edition}
                </span>{" "}
                <strong>{name}</strong>
                <span className="status-text ns-small">
                  {" "}
                  {other === null ? (edition === 2025 ? "new in 2025" : "merged into A01 in 2025") : `#${other} in ${edition === 2021 ? 2025 : 2021}`}
                </span>
              </button>
              {isOpen && (
                <div className="ns-owasp-body">
                  <p>{r.what}</p>
                  <p>
                    <strong>Example:</strong> {r.example}
                  </p>
                  <p>
                    <strong>Fix:</strong> {r.fix}
                  </p>
                  {r.lessons.length > 0 && (
                    <p className="gate-note">
                      Go deeper:{" "}
                      {r.lessons.map((l, i) => (
                        <span key={l.id}>
                          {i > 0 && ", "}
                          <LessonLink id={l.id}>{l.title}</LessonLink>
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <Quiz items={QUIZ} title="Which category is it?" />
    </div>
  );
}
