import { src, type OpsLessonData } from "../types.ts";

export const adBasics: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Active Directory Domain Services (AD DS, usually just AD) is the directory most companies run their Windows estate on: one database of users, computers and groups, so a person has one account that works on every company PC, file share, printer and internal app, and IT can manage thousands of machines centrally.",
        "A domain (here `conperio.local`) is the unit of administration: one directory database and one set of policies. The database lives on domain controllers (DCs), servers that answer sign-in requests and replicate every change to each other; you always run at least two, because if they're all down nobody can sign in. A forest is one or more domains that trust each other; most companies have a single domain in a single forest.",
        "Inside a domain, objects (users, computers, groups) are organised into organizational units (OUs), folders you design yourself, usually by location or function. OUs are for administration: delegating who can manage which objects, and linking Group Policy. Groups are for access: who can open which share or app. Mixing those two up is the most common design mistake.",
      ],
    },
    {
      kind: "widget",
      widget: "adExplorer",
      title: "Try it: explore a small domain",
      intro: "Click through the tree to see each object's distinguished name and a few attributes. Then follow the group chain that gives Ana access to the finance share.",
    },
    {
      kind: "terms",
      title: "Names you'll see",
      terms: [
        { term: "Distinguished name (DN)", meaning: "an object's full path in the directory, read right to left: `CN=Ana Berg,OU=Users,OU=Oslo,DC=conperio,DC=local`. CN is common name, OU organizational unit, DC domain component." },
        { term: "sAMAccountName", meaning: "the short, pre-Windows-2000 logon name, written `CONPERIO\\ana`." },
        { term: "userPrincipalName (UPN)", meaning: "the email-style logon name, `ana@conperio.com`; usually matches the email address so people have one name to remember." },
        { term: "SID", meaning: "the security identifier, the permanent unique ID behind every user, group and computer; permissions point at it." },
        { term: "LDAP", meaning: "Lightweight Directory Access Protocol, the standard protocol apps use to query and update the directory (port 389, or 636 for LDAPS)." },
      ],
    },
    {
      kind: "table",
      title: "Group types and scopes",
      head: ["", "Can contain", "Use it for"],
      rows: [
        ["Global group", "users and global groups from its own domain", "collecting people by role: GG-Finance-Oslo, GG-Engineering"],
        ["Domain local group", "users and groups from any trusted domain", "a permission on a resource: DL-FS01-Finance-Modify"],
        ["Universal group", "users and groups from any domain in the forest", "roles that span domains in a multi-domain forest"],
      ],
      notes: [
        "Groups also have a type: security groups can be put in ACLs; distribution groups are only email lists.",
        "The classic pattern is AGDLP: put Accounts in Global groups (by role), put those in Domain Local groups (by permission), and grant Permissions only to the domain local group. When someone joins Finance you add them to one group; when the share moves you change one ACL. Nobody ever appears on an ACL by name.",
      ],
    },
    {
      kind: "code",
      title: "AD from PowerShell",
      blocks: [
        {
          lang: "powershell",
          code: src`
# Needs the ActiveDirectory module (RSAT on a PC, already on domain controllers)
Get-ADUser ana -Properties Title, MemberOf, LastLogonDate, LockedOut
Get-ADGroupMember GG-Finance-Oslo -Recursive | Select-Object Name, SamAccountName
Search-ADAccount -AccountInactive -TimeSpan 90.00:00:00 -UsersOnly |
    Select-Object Name, LastLogonDate, DistinguishedName

New-ADUser -Name 'Cy Diaz' -SamAccountName cy -UserPrincipalName cy@conperio.com ${"`"}
    -Path 'OU=Users,OU=Oslo,DC=conperio,DC=local' -Enabled $true ${"`"}
    -AccountPassword (Read-Host -AsSecureString 'Initial password') -ChangePasswordAtLogon $true
Add-ADGroupMember GG-Finance-Oslo -Members cy
Unlock-ADAccount ana
`,
        },
      ],
      notes: [
        "The backtick at the end of a line continues a command on the next line. (Splatting, putting parameters in a hashtable and passing `@params`, is the tidier way for long commands.)",
        "`-Recursive` follows nested groups, which is what you want when asking \"who really has access?\". `LastLogonDate` is replicated only roughly (within about two weeks), which is fine for finding stale accounts but not for exact times.",
      ],
    },
  ],
  quiz: [
    {
      question: "Ana moves from Finance to Engineering. Following AGDLP, what do you change?",
      answer: "Her group memberships: remove her from GG-Finance-Oslo and add her to GG-Engineering",
      distractors: ["The ACLs on every Finance folder", "Her OU, which removes her access automatically", "Her user account's SID"],
      why: "With AGDLP, people only ever appear in role groups. Access changes by membership; ACLs stay untouched. Moving her OU changes which Group Policies apply, not what she can access.",
    },
    {
      question: "What are OUs for?",
      answer: "Organising objects so you can delegate administration and link Group Policy",
      distractors: ["Granting access to file shares", "Replicating the directory between sites", "Holding email distribution lists"],
      why: "OUs aren't security principals, so they can't be put on an ACL. Groups grant access.",
    },
    {
      question: "Why does every domain need at least two domain controllers?",
      answer: "If the only DC is down, nobody can sign in or get policies, so a second one keeps the domain running",
      distractors: ["One handles users and the other computers", "Two are needed for Kerberos to work at all", "Licensing requires it"],
      why: "DCs replicate the whole directory to each other and any of them can answer sign-ins. Losing your only one stops authentication for the whole company.",
    },
    {
      question: "Which is the distinguished name of Bo Li in OU Users inside OU Oslo of conperio.local?",
      answer: "CN=Bo Li,OU=Users,OU=Oslo,DC=conperio,DC=local",
      distractors: ["DC=local,DC=conperio,OU=Oslo,OU=Users,CN=Bo Li", "conperio.local/Oslo/Users/Bo Li", "CN=Bo Li,CN=Users,DC=conperio,DC=local"],
      why: "A DN starts with the object itself and walks up to the domain. The third option is the built-in Users container, a different place from the Oslo OU's Users OU. (The slash form is how some tools display a canonical name, not a DN.)",
    },
  ],
  pitfalls: [
    "Granting permissions to individual users, or putting users straight into domain local groups. It works until the day you need to audit it.",
    "Leaving objects in the built-in Users and Computers containers. You can't link Group Policy to them; create your own OUs.",
    "Using the same name for the internal AD domain and your public website's domain without planning DNS for it. Many companies use a subdomain such as `ad.conperio.com`.",
    "Never cleaning up: disabled accounts of leavers and stale computers pile up. Review inactive accounts regularly.",
  ],
  next: [
    { id: "ad-gpo-kerberos", label: "Group Policy, Kerberos, NTLM and DNS" },
    { id: "win-ntfs-permissions", label: "NTFS Permissions, Inheritance and Shares" },
  ],
};
