import { src, type OpsLessonData } from "../types.ts";

export const emailAuth: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Email was designed in the early 1980s for a network where everyone trusted everyone. SMTP, the protocol that still moves every message, lets the sender write any From address it likes, and that is why phishing that appears to come from your bank or your CEO is so easy to send. SPF, DKIM and DMARC are three DNS-based additions that let a receiving server check whether a message really comes from the domain it claims.",
        "IT staff meet these when mail from a new marketing tool lands in spam, when a domain gets spoofed, or when setting up Microsoft 365 or Google Workspace. This lesson walks through how mail is delivered, what each record checks, and why spoofing still gets through when they are missing.",
      ],
    },
    {
      kind: "steps",
      title: "How a message travels",
      steps: [
        "Your mail client hands the message to your provider's submission server (SMTP on port 587 with a login, or an API).",
        "That server looks up the MX records of the recipient's domain in DNS to find which servers accept its mail.",
        "It connects to one of them on port 25 and speaks SMTP: EHLO, STARTTLS to encrypt the hop, MAIL FROM (the envelope sender), RCPT TO and DATA (the message, headers included).",
        "The receiving server runs its checks (SPF, DKIM, DMARC, reputation, spam filtering) and accepts, quarantines or rejects the message.",
        "The recipient's client fetches it from their mailbox with IMAP, or with the provider's own protocol.",
      ],
    },
    {
      kind: "code",
      title: "An SMTP conversation (simplified)",
      blocks: [
        {
          lang: "text",
          label: "S: server, C: client",
          code: src`
S: 220 mx.contoso.example ESMTP ready
C: EHLO mail.bank.example
S: 250-mx.contoso.example
S: 250 STARTTLS
C: STARTTLS
   (TLS handshake, then EHLO again inside the encrypted channel)
C: MAIL FROM:<bounces@bank.example>
S: 250 OK
C: RCPT TO:<sam@contoso.example>
S: 250 OK
C: DATA
S: 354 End data with <CR><LF>.<CR><LF>
C: From: "Bank Alerts" <alerts@bank.example>
C: To: sam@contoso.example
C: Subject: Your statement is ready
C:
C: Hello Sam, ...
C: .
S: 250 Queued as 4F2A91`,
        },
      ],
      notes: [
        "There are two sender addresses. The envelope sender in MAIL FROM is where bounces go, and the user never sees it. The From: header inside DATA is what the mail client displays. Plain SMTP checks neither, which is the gap that spoofing uses and that DMARC closes.",
      ],
    },
    {
      kind: "table",
      title: "SPF, DKIM and DMARC",
      head: ["", "SPF", "DKIM", "DMARC"],
      rows: [
        ["Checks", "is this server allowed to send for the envelope domain?", "was the message signed by a domain, and unchanged since?", "did SPF or DKIM pass for the domain in the visible From:, and what to do if not"],
        ["DNS record", "TXT at the domain: v=spf1 ...", "TXT at selector._domainkey.domain: the public key", "TXT at _dmarc.domain: v=DMARC1; p=..."],
        ["Survives forwarding", "no: the forwarder's IP isn't listed", "usually, unless the forwarder edits the message", "if DKIM survives"],
        ["Alone it stops spoofing of From:", "no", "no", "yes, together with the other two"],
      ],
    },
    {
      kind: "code",
      title: "The records for a domain",
      blocks: [
        {
          lang: "text",
          label: "DNS zone for bank.example",
          code: src`
bank.example.                    MX   10 mail.bank.example.
bank.example.                    TXT  "v=spf1 ip4:203.0.113.10 include:spf.protection.outlook.com -all"
sel1._domainkey.bank.example.    TXT  "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..."
_dmarc.bank.example.             TXT  "v=DMARC1; p=reject; rua=mailto:dmarc-reports@bank.example; adkim=r; aspf=r"`,
        },
      ],
      notes: [
        "SPF: the listed IP and Microsoft 365's servers may send; -all says fail everything else (~all is a softer fail). SPF allows at most 10 DNS lookups, so piling on include: for every SaaS tool eventually breaks it.",
        "DKIM: the sending server signs headers and body with a private key; receivers fetch the public key from the selector named in the signature. Rotating keys means publishing a new selector.",
        "DMARC: p=none (monitor only), p=quarantine (spam folder) or p=reject. rua asks receivers to send daily aggregate reports, which show every service sending as your domain. adkim and aspf set alignment: r (relaxed) accepts subdomains, s (strict) needs an exact match.",
      ],
    },
    {
      kind: "text",
      title: "Alignment: the part people miss",
      paragraphs: [
        "SPF checks the envelope domain, and DKIM checks whatever domain signed. Neither, on its own, says anything about the From: address the user sees. An attacker can register evil.example, publish a valid SPF record for it, send with MAIL FROM evil.example and From: alerts@bank.example, and pass SPF. DMARC adds alignment: SPF or DKIM must pass for the same domain as From: (or a subdomain of it, with relaxed alignment).",
        "This is also why legitimate mail from a third-party service fails DMARC until it's set up properly. A newsletter tool sends with its own bounce domain and signs with its own key, so both pass but neither aligns. The fix is to give the service a custom return path on a subdomain of yours, or to have it sign with your domain's DKIM key.",
      ],
    },
    {
      kind: "widget",
      widget: "emailAuth",
      title: "Try it: will this message get through?",
      intro: "Choose who sends the message, the envelope sender and the DKIM signature, and set bank.example's records. The checker runs SPF, DKIM and DMARC the way a receiving server does.",
    },
    {
      kind: "steps",
      title: "Rolling out DMARC without losing mail",
      steps: [
        "Publish SPF and turn on DKIM signing for every service that sends as your domain: the mail platform, the CRM, the ticketing system, the marketing tool.",
        "Publish DMARC with p=none and an rua address, and read the reports for a few weeks to find senders you missed.",
        "Fix each one: align it, or move it to a subdomain such as news.bank.example with its own records.",
        "Move to p=quarantine, optionally with pct to apply it to a share of failing mail, then to p=reject.",
        "Protect domains that never send mail too, with v=spf1 -all and p=reject, so attackers can't use them.",
      ],
    },
  ],
  quiz: [
    {
      question: "Which address does SPF check?",
      answer: "The envelope sender's domain (MAIL FROM), against the connecting server's IP",
      distractors: ["The From: header the user sees", "The recipient's domain", "The domain in the DKIM signature"],
      why: "SPF only answers whether this IP may send for the envelope domain. Linking that to the visible From: is DMARC's job.",
    },
    {
      question: "A phishing mail shows From: ceo@yourcompany.example, and SPF passed for attacker.example. What stops it?",
      answer: "DMARC on yourcompany.example with p=reject, because the passing domain isn't aligned with From:",
      distractors: ["SPF on yourcompany.example alone", "TLS between the mail servers", "An MX record for yourcompany.example"],
      why: "Without DMARC, nothing ties the passing SPF result to the From: domain. With it, an unaligned pass counts as a fail and the policy applies.",
    },
    {
      question: "What does DKIM prove?",
      answer: "The signing domain sent the message and the signed parts weren't changed",
      distractors: ["The message was encrypted in transit", "The sending IP is authorized", "The recipient exists"],
      why: "DKIM is a digital signature over headers and body, checked with a public key in the signer's DNS. It says nothing about encryption.",
    },
    {
      question: "Why start DMARC at p=none?",
      answer: "To collect reports and find every legitimate sender before enforcing",
      distractors: ["p=none blocks the most spoofing", "Receivers ignore stricter policies at first", "It makes SPF pass"],
      why: "Jumping straight to reject blocks the invoices, alerts and newsletters from services nobody remembered to align.",
    },
  ],
  pitfalls: [
    "Publishing two SPF records for one domain; receivers treat that as an error and SPF fails.",
    "Exceeding SPF's 10 DNS lookup limit with nested include: entries.",
    "Leaving DMARC at p=none forever, which reports spoofing but doesn't stop it.",
    "Onboarding a new SaaS tool that sends as your domain without aligning it.",
    "Assuming internal-looking mail is safe: display names are free to fake even when the address is right.",
  ],
  next: [
    { id: "dns-and-http", label: "DNS & HTTP: From a URL to a Web Page" },
    { id: "sec-phishing-social-engineering", label: "Phishing and Social Engineering" },
    { id: "sec-crypto-fundamentals", label: "Cryptography Fundamentals: Symmetric, Public-Key, Key Exchange and MACs" },
  ],
};
