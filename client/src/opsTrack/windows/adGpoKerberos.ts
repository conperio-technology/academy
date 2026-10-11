import { src, type OpsLessonData } from "../types.ts";

export const adGpoKerberos: OpsLessonData = {
  parts: [
    {
      kind: "text",
      title: "Group Policy",
      paragraphs: [
        "Group Policy is how AD pushes settings to computers and users: password rules, screen lock, mapped drives, installed software, firewall rules, which updates to install, and thousands more. A Group Policy Object (GPO) is a bundle of settings in two halves: Computer Configuration (applied at boot and every 90 minutes or so, whoever signs in) and User Configuration (applied at sign-in, whichever PC).",
        "A GPO does nothing until it's linked to a site, the domain, or an OU, and then it applies to the computers and users inside. When several GPOs set the same thing they're applied in a fixed order, LSDOU: Local policy, then Site, then Domain, then OUs from the top down to the one the object sits in. Later wins, so the GPO linked closest to the object usually has the last word.",
        "Two switches change that. Block Inheritance on an OU stops GPOs from above being applied to it. Enforced on a link makes that GPO apply even through a block, and win over conflicting GPOs linked further down. Use both sparingly: every one makes \"why is this setting what it is?\" harder to answer.",
      ],
    },
    {
      kind: "widget",
      widget: "gpoPrecedence",
      title: "Try it: which GPO wins?",
      intro: "Five GPOs set the same screen lock timeout. Change values, unlink GPOs, enforce some, and block inheritance to see which one wins.",
    },
    {
      kind: "code",
      title: "Checking what applied",
      blocks: [
        {
          lang: "cmd",
          code: src`
gpupdate /force          :: fetch and apply policy now instead of waiting
gpresult /r              :: summary: which GPOs applied to this computer and user, and which were filtered out
gpresult /h report.html  :: the full report, with the winning GPO for every setting
`,
        },
      ],
      notes: [
        "When a setting isn't what you expected, `gpresult /h` answers it: it lists every setting with the GPO that won. GPOs can also be filtered by security group or by a WMI query, which is the other common reason one \"doesn't apply\". The Group Policy Management console (`gpmc.msc`) shows links, enforcement and inheritance per OU.",
      ],
    },
    {
      kind: "text",
      title: "How signing in actually works",
      paragraphs: [
        "When you sign in to a domain PC or open a file share, Windows has to prove who you are without sending your password across the network. It has two protocols for that. Kerberos is the modern default inside a domain. NTLM is the older challenge-response protocol, still used as a fallback when Kerberos can't be (connecting by IP address instead of name, machines outside the domain, some old apps). Companies are steadily turning NTLM off, because it's weaker against relay and password-cracking attacks; Microsoft has announced its removal from future Windows versions.",
      ],
    },
    {
      kind: "walkthrough",
      title: "Kerberos: tickets from a trusted third party",
      intro: "Three parties: Ana's PC, the Key Distribution Center (KDC, a role every domain controller plays) and the file server FS01.",
      steps: [
        { title: "Ana signs in", body: "Ana's PC turns her password into a key (a hash) and uses it to encrypt a timestamp. It sends that to the KDC's Authentication Service with her name: an AS-REQ. The password itself never leaves the PC." },
        { title: "The KDC checks and issues a TGT", body: "The KDC holds the same key for Ana, decrypts the timestamp, and if it's recent, replies (AS-REP) with a ticket-granting ticket (TGT): proof that she authenticated, valid for 10 hours by default. The TGT is encrypted with a key only the KDC knows (the krbtgt account's), so the PC can't read or forge it. It includes her group memberships." },
        { title: "Ana opens \\\\FS01\\Finance", body: "Her PC sends the TGT back to the KDC's Ticket Granting Service asking for a ticket for the service `cifs/fs01.conperio.local` (a TGS-REQ). Services are identified by a service principal name (SPN) like this one, which is why Kerberos needs the server's name, not its IP address." },
        { title: "A service ticket", body: "The KDC replies (TGS-REP) with a service ticket encrypted with FS01's own key, plus a session key for Ana's PC. Ana's PC can't read the ticket, only pass it on." },
        { title: "FS01 checks the ticket itself", body: "The PC presents the service ticket to FS01 (AP-REQ). FS01 decrypts it with its own key, sees who Ana is and which groups she's in, and checks the folder's ACL. FS01 didn't need to contact a domain controller at all, which is part of why Kerberos scales." },
        { title: "Time and names matter", body: "Tickets carry timestamps, and by default a clock more than 5 minutes off makes authentication fail, which is why domain machines sync time from the DCs. And because tickets are tied to SPNs, a wrong or duplicate SPN, or connecting by IP, makes Windows fall back to NTLM or fail." },
      ],
    },
    {
      kind: "walkthrough",
      title: "NTLM: challenge and response",
      steps: [
        { title: "Negotiate", body: "Ana's PC tells FS01 it wants to authenticate with NTLM." },
        { title: "Challenge", body: "FS01 sends back a random number, the challenge." },
        { title: "Response", body: "Ana's PC combines the challenge with a hash of her password and sends the result, with her user name. The password isn't sent, but the response can be captured and attacked offline, or relayed to another server in real time." },
        { title: "FS01 asks a domain controller", body: "FS01 doesn't know Ana's password hash, so it forwards the challenge and response to a DC (pass-through authentication), which checks them and answers yes or no. Every NTLM sign-in to every server costs a round trip to a DC, and there's no ticket to reuse." },
        { title: "No mutual authentication", body: "Nothing in NTLM proves to Ana's PC that it's really talking to FS01. Kerberos does that too: only the real FS01 can decrypt the service ticket." },
      ],
    },
    {
      kind: "code",
      title: "DNS holds the domain together",
      blocks: [
        {
          lang: "cmd",
          code: "nslookup -type=SRV _ldap._tcp.dc._msdcs.conperio.local",
          unverified: true,
          output: src`
Server:  dc01.conperio.local
Address:  10.20.0.10

_ldap._tcp.dc._msdcs.conperio.local     SRV service location:
          priority       = 0
          weight         = 100
          port           = 389
          svr hostname   = dc01.conperio.local
_ldap._tcp.dc._msdcs.conperio.local     SRV service location:
          priority       = 0
          weight         = 100
          port           = 389
          svr hostname   = dc02.conperio.local
`,
        },
        {
          lang: "powershell",
          code: src`
Resolve-DnsName _kerberos._tcp.conperio.local -Type SRV
nltest /dsgetdc:conperio.local
klist          # the Kerberos tickets your session holds right now
`,
        },
      ],
      notes: [
        "Domain-joined machines find domain controllers by asking DNS for SRV records (records that say \"this service is on that host and port\"), which the DCs register automatically. That's why domain machines must use the DCs (or DNS servers that forward to them) as their DNS servers: point a PC at a public DNS server and it can no longer find its domain, and sign-ins, Group Policy and Kerberos all break.",
        "In cloud-first companies the same ideas appear in Microsoft Entra ID (formerly Azure AD): users, groups and policies, but over web protocols (OAuth 2.0, OpenID Connect, SAML) instead of Kerberos and LDAP. Many companies run both, synchronised.",
      ],
    },
  ],
  quiz: [
    {
      question: "A GPO linked to the domain sets screen lock to 15 minutes; a GPO linked to OU Oslo sets 10. Neither is enforced and nothing is blocked. What applies to a PC in OU Oslo?",
      answer: "10 minutes",
      distractors: ["15 minutes", "Whichever GPO was created last", "The lower of the two, always"],
      why: "Processing is Local, Site, Domain, OU, and later wins, so the OU's GPO overrides the domain's.",
    },
    {
      question: "Same as before, but the domain GPO's link is Enforced. What applies now?",
      answer: "15 minutes",
      distractors: ["10 minutes", "Neither: they conflict, so Windows' default applies", "10 minutes, unless Block Inheritance is on"],
      why: "An enforced link wins over conflicting non-enforced GPOs linked lower down, and even Block Inheritance can't stop it.",
    },
    {
      question: "Users connecting to \\\\10.20.0.31\\Finance by IP address authenticate with NTLM, while \\\\fs01\\Finance uses Kerberos. Why?",
      answer: "Kerberos tickets are issued for a service principal name, which is based on the server's name, so an IP address gives the KDC nothing to issue a ticket for",
      distractors: ["Kerberos only works over IPv6", "IP addresses bypass the domain controller", "The file server only supports NTLM"],
      why: "The client asks for a ticket for cifs/<name>. Without a matching name (or an SPN registered for the IP), Windows falls back to NTLM.",
    },
    {
      question: "Several PCs suddenly can't sign in to the domain, with errors about time. What's the likely cause?",
      answer: "Their clocks differ from the domain controllers' by more than the allowed 5 minutes",
      distractors: ["Their TGTs are still valid", "DNS is too fast", "The krbtgt password was rotated an hour ago"],
      why: "Kerberos relies on timestamps to stop replayed messages; by default more than 5 minutes of clock skew fails authentication. Domain machines sync time from the DC hierarchy.",
    },
    {
      question: "A new PC was given 8.8.8.8 as its only DNS server. What breaks?",
      answer: "It can't find any domain controller, so domain join, sign-in and Group Policy fail",
      distractors: ["Only internet browsing", "Nothing; DNS isn't used inside a domain", "Only email"],
      why: "Clients find DCs through SRV records in the domain's own DNS zone, which public DNS doesn't have.",
    },
  ],
  pitfalls: [
    "Editing the Default Domain Policy for everything. Keep it to the domain-wide account policies and create separate, well-named GPOs.",
    "Enforcing and blocking until nobody can predict the result. Use `gpresult /h` before and after a change.",
    "Treating NTLM as harmless. Audit where it's still used (NTLM auditing events) before turning it off, then turn it off.",
    "Pointing domain machines at anything other than the domain's DNS.",
  ],
  next: [
    { id: "bash-vs-powershell", label: "Bash vs PowerShell Side by Side" },
    { id: "security-authn-authz", label: "Authentication vs Authorization (Security)" },
  ],
};
